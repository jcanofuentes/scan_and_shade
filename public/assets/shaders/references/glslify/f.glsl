
// From: http://stack.gl/glsl-lighting-walkthrough/
#define GLSLIFY 1
#extension GL_OES_standard_derivatives : enable
precision highp float;

struct Light {
    vec3 position;
    vec3 color;
    vec3 ambient;
    float falloff;
    float radius;
};

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

//--------------------------------------------------------------------------------------------------------------------------------
// MISC
//--------------------------------------------------------------------------------------------------------------------------------
vec3 normals_5_0(vec3 pos) {
    vec3 fdx = dFdx(pos);
    vec3 fdy = dFdy(pos);
    return normalize(cross(fdx, fdy));
}
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
//--------------------------------------------------------------------------------------------------------------------------------
// LIGHT ATTENUATION
//--------------------------------------------------------------------------------------------------------------------------------
// by Tom Madams
// Simple:
// https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation
// 
// Improved
// https://imdoingitwrong.wordpress.com/2011/02/10/improved-light-attenuation/
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
// Some settings for the look and feel of the materialconst 
//--------------------------------------------------------------------------------------------------------------------------------
vec2 UV_SCALE = vec2(8.0, 1.0);
const float specularScale = 0.65;
const float shininess = 20.0;
const float roughness = 1.0;
const float albedo = 0.95;
uniform sampler2D texDiffuse;
uniform sampler2D texNormal;
uniform sampler2D texSpecular;
uniform int flatShading;
uniform mat4 model;
uniform mat4 view;
uniform Light light;

//--------------------------------------------------------------------------------------------------------------------------------
// main()
//--------------------------------------------------------------------------------------------------------------------------------
void main() {  

    // Determine the type of normals for lighting  
    vec3 normal = vec3(0.0);
    if(flatShading == 1) {
        normal = normals_5_0(vViewPosition);
    } else {
        normal = vNormal;
    }  

    // Determine surface to light direction  
    vec4 lightPosition = view * vec4(light.position, 1.0);
    vec3 lightVector = lightPosition.xyz - vViewPosition;
    vec3 color = vec3(0.0);

    // Calculate attenuation  
    float lightDistance = length(lightVector);
    float falloff = attenuation_1_5(light.radius, light.falloff, lightDistance);
    
    // Now sample from our repeating brick texture  
    // Assume its in sRGB, so we need to correct for gamma  
    vec2 uv = vUv * UV_SCALE;
    vec3 diffuseColor = textureLinear(texDiffuse, uv).rgb;
    vec3 normalMap = textureLinear(texNormal, uv).rgb * 2.0 - 1.0;
    float specularStrength = textureLinear(texSpecular, uv).r;

    // Our normal map has an inverted green channel  
    normalMap.y *= -1.0;

    vec3 L = normalize(lightVector);                                    // Light direction 
    vec3 V = normalize(vViewPosition);                                  // Eye direction  
    vec3 N = perturb_4_2(normalMap, normal, -V, vUv);   // Surface normal  
    // Compute our diffuse & specular terms 
    float specular = specularStrength * phongSpecular_6_4(L, V, N, shininess) * specularScale * falloff;
    vec3 diffuse = light.color * orenNayarDiffuse_7_3(L, V, N, roughness, albedo) * falloff;
    vec3 ambient = light.ambient;  

    // Add the lighting 
    color += diffuseColor * (diffuse + ambient) + specular;  

    // Re-apply gamma to output buffer 
    color = toGamma_3_9(color);
    gl_FragColor.rgb = vec3(color);
    gl_FragColor.a = 1.0;
};
