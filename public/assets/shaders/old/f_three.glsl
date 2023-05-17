#version 300 es
#define varying in
out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define texture2D texture
precision highp float;
precision highp int;

#define SHADER_NAME MeshPhongMaterial
#define USE_MAP

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying vec2 vUv;

#ifdef USE_MAP
uniform sampler2D map;
#endif

varying vec3 vViewPosition;
varying vec3 vNormal;

#ifdef USE_NORMALMAP
uniform sampler2D normalMap;
uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
vec3 perturbNormal2Arb(vec3 eye_pos, vec3 surf_norm, vec3 mapN) {
    vec3 q0 = vec3(dFdx(eye_pos.x), dFdx(eye_pos.y), dFdx(eye_pos.z));
    vec3 q1 = vec3(dFdy(eye_pos.x), dFdy(eye_pos.y), dFdy(eye_pos.z));
    vec2 st0 = dFdx(vUv.st);
    vec2 st1 = dFdy(vUv.st);
    float scale = sign(st1.t * st0.s - st0.t * st1.s);
    vec3 S = normalize((q0 * st1.t - q1 * st0.t) * scale);
    vec3 T = normalize((-q0 * st1.s + q1 * st0.s) * scale);
    vec3 N = normalize(surf_norm);
    mat3 tsn = mat3(S, T, N);
    mapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);
    return normalize(tsn * mapN);
}
#endif

void main() {

    vec4 diffuseColor = vec4(diffuse, opacity);
#ifdef USE_MAP
    vec4 texelColor = texture2D(map, vUv);
    texelColor = mapTexelToLinear(texelColor);
    diffuseColor *= texelColor;
#endif

    diffuseColor.rgb *= vColor;

    float specularStrength;

    specularStrength = 1.0;

    vec3 normal = normalize(vNormal);

	#ifdef USE_TANGENT
    vec3 tangent = normalize(vTangent);
    vec3 bitangent = normalize(vBitangent);
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
    mat3 vTBN = mat3(tangent, bitangent, normal);
		#endif
	#endif

    vec3 geometryNormal = normal;
#ifdef OBJECTSPACE_NORMALMAP
    normal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
    normal = -normal;
	#endif
	#ifdef DOUBLE_SIDED
    normal = normal * (float(gl_FrontFacing) * 2.0 - 1.0);
	#endif
    normal = normalize(normalMatrix * normal);
#elif defined( TANGENTSPACE_NORMALMAP )
    vec3 mapN = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale;
	#ifdef USE_TANGENT
    normal = normalize(vTBN * mapN);
	#else
    normal = perturbNormal2Arb(-vViewPosition, normal, mapN);
	#endif
#elif defined( USE_BUMPMAP )
    normal = perturbNormalArb(-vViewPosition, normal, dHdxy_fwd());
#endif

    gl_FragColor = vec4(outgoingLight, diffuseColor.a);

    gl_FragColor = linearToOutputTexel(gl_FragColor);

}