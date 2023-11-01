// -----------------------------------------------------------------------------------------------------------------------------
// Built-in uniforms and attributes
// More information: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// -----------------------------------------------------------------------------------------------------------------------------
// uniform mat4 viewMatrix;         = camera.matrixWorldInverse
//                                  The transformation matrix that converts vertices from world space to camera view space, 
//                                  representing the position and orientation of the camera.
//
// uniform vec3 cameraPosition;     Camera position in world space
//
// -----------------------------------------------------------------------------------------------------------------------------
precision highp float;

mat3 cotangentFrame_8_1(vec3 N, vec3 p, vec2 uv) {  
    // get edge vectors of the pixel triangle 
    vec3 dp1 = dFdx(p);
    vec3 dp2 = dFdy(p);
    vec2 duv1 = dFdx(uv);
    vec2 duv2 = dFdy(uv);  
    // solve the linear system  
    vec3 dp2perp = cross(dp2, N);
    vec3 dp1perp = cross(N, dp1);
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;  
    // construct a scale-invariant frame   
    float invmax = 1.0 / sqrt(max(dot(T, T), dot(B, B)));
    return mat3(T * invmax, B * invmax, N);
}
vec3 perturb_4_2(vec3 map, vec3 N, vec3 V, vec2 texcoord) {
    mat3 TBN = cotangentFrame_8_1(N, -V, texcoord);
    return normalize(TBN * map);
}

vec4 getTexture(sampler2D uTex, vec2 uv) {
    return texture2D(uTex, uv);
}

varying vec3 vNormal;           // Fragment normal (interpolated per-vertex)
varying vec2 vUv;               // Fragment UV coordinates (interpolated per-vertex)
varying vec3 vViewPosition;     // Fragment position in camera view space, with inverted coordinates (interpolated per-vertex)
varying vec3 vLightRay;

uniform vec2 iResolution;    // Window size pixels
uniform float iTime;
uniform float iTimeDelta;

uniform vec3 lightColor;        // Color of the light source
uniform vec3 ambientColor;      // Ambient color of the light source
uniform float lightFalloff;     // Fallof of the light source
uniform float lightRadius;      // Radius of the light source

uniform sampler2D texDiffuse;   // Diffuse texture
uniform sampler2D texNormal;    // Normal texture

uniform bool useDiffuseTexture;

uniform float material_param_0;
uniform float material_param_1;
uniform float material_param_2;
uniform float material_param_3;

uniform float material_param_4;

uniform float param_2;// 1.0 - 0 a 10
uniform float param_3;// 0.09 - 1.0
uniform float param_4;// 0.032 - 
uniform float param_5;
uniform float param_6;
uniform float param_7;

varying vec3 vVertexPosition;   // Vertex position in camera space
varying vec3 vLightPosition;    // Light position in camera space

float calculateLambertian(vec3 normalDir, vec3 lightDir) {
    return max(dot(normalDir, normalize(lightDir)), 0.0);
}

float calculateSpecular(vec3 lightDir, vec3 viewDir, vec3 normal, float shininess) {
    vec3 reflectDir = reflect(-lightDir, normal);
    float specularIntensity = max(dot(reflectDir, viewDir), 0.0);
    specularIntensity = pow(specularIntensity, shininess);
    return specularIntensity;
}

//--------------------------------------------------------------------------------------------------------------------------------
// LIGHT ATTENUATION
//--------------------------------------------------------------------------------------------------------------------------------
float attenuation_1_5(float radius, float falloff, float distance) {
    float denom = distance / radius + 1.0;
    float attenuation = 1.0 / (denom * denom);
    float t = (attenuation - falloff) / (1.0 - falloff);
    return max(t, 0.0);
}

float calculateSimpleAttenuation(float distance, float dmax) {
    return (1.0 - min(distance / dmax, 1.0)) * (1.0 - min(distance / dmax, 1.0));
}

float calculateLinearAttenuation(float distance, float constant, float linear, float quadratic) {
    // Compute the attenuation factor using the linear attenuation formula
    float attenuation = 1.0 / (constant + linear * distance + quadratic * distance * distance);

    // Clamp the attenuation factor to [0, 1] range
    attenuation = clamp(attenuation, 0.0, 1.0);

    return attenuation;
}

void main() {
    float shininess = material_param_1;
    float specularScale = material_param_2;
    float specularStrength = material_param_3;

    // Set colors
    vec3 diffuseColor = vec3(0.6, 0.6f, 0.6f);
    vec3 specularColor = vec3(1.0f);

    // Setup light direction and eye direction
    vec3 L = normalize(vLightRay);
    vec3 V = normalize(vViewPosition);

    // Get vertex normal
    vec3 normal = vNormal;

    // Get textures
    vec2 uv = vUv;
    if(useDiffuseTexture)
        diffuseColor = getTexture(texDiffuse, uv).rgb;

    vec3 normalMap = getTexture(texNormal, uv).rgb;
    normalMap = normalMap * 2.0 - 1.0;

    normalMap = normalize(normalMap);
    normalMap.x *= material_param_4;
    normalMap.y *= material_param_4;

    normalMap = normalize(normalMap);

    // Compute final normal (vertex + normal map)
    vec3 N = perturb_4_2(normalMap, normal, -V, uv);  // Surface normal  

    // Compute diffuse and specular values
    float diff = calculateLambertian(N, L);
    float spec = calculateSpecular(L, V, N, shininess);

    // Compute light attenuation (linear eq.)
    float distance = length(vLightRay);   // Distance from light to fragment
    float constant = param_2;   // 1.0 - 0 a 10
    float linear = param_3;     // 0.09 - 1.0
    float quadratic = param_4;    // 0.032 - 
    float falloff = calculateLinearAttenuation(distance, constant, linear, quadratic);

    /*
    // Compute light attenuation (two-params version)
    float distance = length(vLightRay);
    float lRadius = param_5;
    float lFalloff = param_6;
    float falloff = attenuation_1_5(lRadius, lFalloff, distance);

    
    // Compute light attenuation (one-param version)
    float distance = length(vLightRay);
    float maxDistance = param_7;
    float falloff = calculateSimpleAttenuation(distance, maxDistance);
     */   

    // Compute new diffuse and specular values with attenuation
    float specAtten = specularStrength * spec * specularScale * falloff;  // specularStrength could be defined using a map
    float diffAtten = diff * falloff;

    vec3 ambient = ambientColor;
    vec3 diffuse = lightColor * diffAtten;

    // Add the lighting 
    vec3 color = vec3(0);
    color += diffuseColor * (diffuse + ambient) + specAtten;

    gl_FragColor.rgb = vec3(color);
    //gl_FragColor.r = uv.x;
    gl_FragColor.a = 1.0;
}


/*
    float Ka = 0.0;   // Ambient reflection coefficient
    float Kd = 0.7;   // Diffuse reflection coefficient
    float Ks = 0.35;   // Specular reflection coefficient
    vec3 ambientColor = vec3(0.0f, 0.0f, 0.0f);
    vec3 diffuseColor = vec3(0.55f);
    vec3 specularColor = vec3(1.0f);
    vec3 a = Ka * ambientColor;
    vec3 d = Kd * lambertian * diffuseColor;
    vec3 s = Ks * specular * specularColor;
*/
