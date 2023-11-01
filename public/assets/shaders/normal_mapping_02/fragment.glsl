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

//--------------------------------------------------------------------------------------------------------------------------------
// MISC
//--------------------------------------------------------------------------------------------------------------------------------

// http://www.thetenthplanet.de/archives/1180
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

//--------------------------------------------------------------------------------------------------------------------------------
// LIGHT ATTENUATION
//--------------------------------------------------------------------------------------------------------------------------------
float attenuation_1_5(float r, float f, float d) {
    float denom = d / r + 1.0;
    float attenuation = 1.0 / (denom * denom);
    float t = (attenuation - f) / (1.0 - f);
    return max(t, 0.0);
}
//--------------------------------------------------------------------------------------------------------------------------------
// GAMMA CORRECTION
//--------------------------------------------------------------------------------------------------------------------------------
const float gamma_2_6 = 2.2;
float toLinear_2_7(float v) {
    return pow(v, gamma_2_6);
}
vec2 toLinear_2_7(vec2 v) {
    return pow(v, vec2(gamma_2_6));
}
vec3 toLinear_2_7(vec3 v) {
    return pow(v, vec3(gamma_2_6));
}
vec4 toLinear_2_7(vec4 v) {
    return vec4(toLinear_2_7(v.rgb), v.a);
}
const float gamma_3_8 = 2.2;
float toGamma_3_9(float v) {
    return pow(v, 1.0 / gamma_3_8);
}
vec2 toGamma_3_9(vec2 v) {
    return pow(v, vec2(1.0 / gamma_3_8));
}
vec3 toGamma_3_9(vec3 v) {
    return pow(v, vec3(1.0 / gamma_3_8));
}
vec4 toGamma_3_9(vec4 v) {
    return vec4(toGamma_3_9(v.rgb), v.a);
}
// Account for gamma-corrected images
vec4 textureLinear(sampler2D uTex, vec2 uv) {
    return toLinear_2_7(texture2D(uTex, uv));
}
//--------------------------------------------------------------------------------------------------------------------------------
// SHADING
//--------------------------------------------------------------------------------------------------------------------------------
float orenNayarDiffuse_7_3(vec3 lightDirection, vec3 viewDirection, vec3 surfaceNormal, float roughness, float albedo) {
    float LdotV = dot(lightDirection, viewDirection);
    float NdotL = dot(lightDirection, surfaceNormal);
    float NdotV = dot(surfaceNormal, viewDirection);
    float s = LdotV - NdotL * NdotV;
    float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));
    float sigma2 = roughness * roughness;
    float A = 1.0 + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));
    float B = 0.45 * sigma2 / (sigma2 + 0.09);
    return albedo * max(0.0, NdotL) * (A + B * s / t) / 3.14159265;
}
float phongSpecular_6_4(vec3 lightDirection, vec3 viewDirection, vec3 surfaceNormal, float shininess) {  
    // Calculate Phong power  
    vec3 R = -reflect(lightDirection, surfaceNormal);
    return pow(max(0.0, dot(viewDirection, R)), shininess);
}

varying vec3 vNormal;           // Fragment normal (interpolated per-vertex)
varying vec2 vUv;               // Fragment UV coordinates (interpolated per-vertex)
varying vec3 vViewPosition;     // Fragment position in camera view space, with inverted coordinates (interpolated per-vertex)

varying vec3 vLightDir;          //

// Custom uniforms
uniform mat4 view;

uniform vec3 lightPosition;     // Position of the light source
uniform vec3 lightColor;        // Color of the light source
uniform vec3 lightAmbient;      // Ambient color of the light source
uniform float lightFalloff;     // Fallof of the light source
uniform float lightRadius;      // Radius of the light source
uniform sampler2D texDiffuse;   // Diffuse texture
uniform sampler2D texNormal;    // Normal texture

uniform vec2 iResolution;       // Window size pixels
uniform float iTime;
uniform float iTimeDelta;

const float specularScale = 4.65;
const float shininess = 30.0;
const float roughness = 1.0;
const float albedo = 0.95;

// vec4 lightPosition = view * vec4(light.position, 1.0);
// vec3 lightVector = vViewPosition -  lightPos.xyz ;
// vec3 N = perturb_4_2(normalMap, normal, V, uv);  // Surface normal  
void main() {
    
    //gl_FragColor = vec4(vNormal.xyz, 1.0);

    // Phong shading from http://stack.gl/glsl-lighting-walkthrough/
    vec3 normal = vNormal;

    // Determine surface to light direction  
    vec4 lightPos = view * vec4(lightPosition, 1.0);
    vec3 lightVector = lightPos.xyz - vViewPosition;
    vec3 color = vec3(0.0);

    // Calculate attenuation  
    float lightDistance = length(lightVector);
    float falloff = attenuation_1_5(lightRadius, lightFalloff, lightDistance);

    // Now sample our texture. Assume its in sRGB, so we need to correct for gamma  
    vec2 uv = vUv;
    vec3 diffuseColor = textureLinear(texDiffuse, uv).rgb;
    vec3 normalMap = textureLinear(texNormal, uv).rgb * 2.0 - 1.0;
    //float specularStrength = textureLinear(texSpecular, uv).r;
    float specularStrength = 0.5; //textureLinear(texSpecular, uv).r;

    //gl_FragColor = vec4(normalMap.xyz, 1.0);

    vec3 L = normalize(lightVector);                 // Light direction 
    vec3 V = normalize(vViewPosition);               // Eye direction  
    vec3 N = perturb_4_2(normalMap, normal, -V, uv);  // Surface normal  
    //N = normalMap;
    float specular = specularStrength * phongSpecular_6_4(L, V, N, shininess) * specularScale * falloff;
    float diffValue = orenNayarDiffuse_7_3(L, V, N, roughness, albedo);
    float diffValueWithFalloff = diffValue * falloff;
    gl_FragColor.rgb = vec3(diffValue);

    vec3 diffuse = lightColor * diffValueWithFalloff;
    vec3 ambient = lightAmbient;  

    // Add the lighting 
    color += diffuseColor * (diffuse + ambient) + specular;  

    // Re-apply gamma to output buffer 
    color = toGamma_3_9(color);
    gl_FragColor.rgb = vec3(color);
    gl_FragColor.a = 1.0;
}

//--------------------------------------------------------------------------------------------------
// 
// References:
// https://shdr.bkcore.com/
// https://github.com/glslify
// https://github.com/glslify/glsl-diffuse-lambert
// https://github.com/glslify/glsl-specular-phong
//
//vec3 rim(vec3 color, float start, float end, float coef) {
//    vec3 normal = normalize(vNormal);
//    vec3 eye = normalize(-fPosition.xyz);
//    float rim = smoothstep(start, end, 1.0 - dot(normal, eye));
//    return clamp(rim, 0.0, 1.0) * coef * color;
//}
//  main...
//      vec3 c = rim(vec3(1.0, 0.0, 0.0), 0.0, 1.0, 1.0);
//      gl_FragColor = vec4(c, 1.0);
//
//vec2 blinnPhongDir(vec3 lightDir, float lightInt, float Ka, float Kd, float Ks, float shininess) {
//
//    vec3 s = normalize(lightDir);
//    vec3 v = normalize(-fPosition);
//    vec3 n = normalize(vNormal);
//    vec3 h = normalize(v + s);
//    float diffuse = Ka + Kd * lightInt * max(0.0, dot(n, s));
//    float spec = Ks * pow(max(0.0, dot(n, h)), shininess);
//    return vec2(diffuse, spec);
//}
//
//  main...
//
//    vec3 lighPos = lightPosition;
//    vec3 lightDir = normalize( lighPos );
//    float lightInt = 1.0;
//    float Ka = 0.1;
//   float Kd = 1.0;
//    float Ks = 0.3;
//    float shininess = 4.0;
//    vec2 c = blinnPhongDir(lightDir, lightInt, Ka, Kd, Ks, shininess);
//    gl_FragColor = vec4(c.x, c.x, c.x, 1.0);
//
//--------------------------------------------------------------------------------------------------
