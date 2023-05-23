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

varying vec3 vNormal;           // Fragment normal (interpolated per-vertex)
varying vec2 vUv;               // Fragment UV coordinates (interpolated per-vertex)
varying vec3 vViewPosition;     // Fragment position in camera view space, with inverted coordinates (interpolated per-vertex)
varying vec3 vLightRay;

uniform vec2 iResolution;    // Window size pixels
uniform float iTime;
uniform float iTimeDelta;

uniform vec3 lightColor;        // Color of the light source
uniform vec3 lightAmbient;      // Ambient color of the light source
uniform float lightFalloff;     // Fallof of the light source
uniform float lightRadius;      // Radius of the light source

uniform sampler2D texDiffuse;   // Diffuse texture
uniform sampler2D texNormal;    // Normal texture

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
void main() {
    /*
    vec3 lightDirection = normalize(vLightRay);
    float lambertian = max(dot(vNormal, lightDirection), 0.0);
    vec3 color = vec3(0.2f, 0.4f, 0.65f);
    gl_FragColor = vec4(color * lambertian, 1.0);
    */

    vec3 normal = vNormal;

    // Get lightVector, it is surface to light direction
    vec3 lightVector = normalize(vLightRay);
    vec3 color = vec3(0.0);

    // Calculate attenuation  
    float lightDistance = length(lightVector);
    float falloff = attenuation_1_5(lightRadius, lightFalloff, lightDistance);

    // Now sample our texture. Assume its in sRGB, so we need to correct for gamma  
    vec2 uv = vUv;
    vec3 diffuseColor = textureLinear(texDiffuse, uv).rgb;
    vec3 normalMap = textureLinear(texNormal, uv).rgb * 2.0 - 1.0;
    float specularStrength = 0.5; //textureLinear(texSpecular, uv).r;

    //gl_FragColor = vec4(normalMap.xyz, 1.0);

    vec3 L = normalize(lightVector);                 // Light direction 
    vec3 V = normalize(vViewPosition);               // Eye direction  

    gl_FragColor = vec4(normalMap.xyz, 1.0);

    /*
    vec3 N = perturb_4_2(normalMap, normal,  -V, uv);  // Surface normal  
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
    */
}
