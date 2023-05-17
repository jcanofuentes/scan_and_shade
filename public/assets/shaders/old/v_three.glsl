#version 300 es
#define attribute in
#define varying out
#define texture2D texture
precision highp float;
precision highp int;

#define SHADER_NAME MeshPhongMaterial

// = object.matrixWorld
uniform mat4 modelMatrix;
// = camera.matrixWorldInverse * object.matrixWorld
uniform mat4 modelViewMatrix;
// = camera.projectionMatrix
uniform mat4 projectionMatrix;
// = camera.matrixWorldInverse
uniform mat4 viewMatrix;
// = inverse transpose of modelViewMatrix
uniform mat3 normalMatrix;
// = camera position in world space
uniform vec3 cameraPosition;
uniform bool isOrthographic;

// default vertex attributes provided by BufferGeometry
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

#ifdef USE_TANGENT
    attribute vec4 tangent;
#endif

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {

    vUv = uv;

    vec3 objectNormal = vec3(normal);

// https://discourse.threejs.org/t/meshstandardmaterial-vertextangents-appears-to-have-no-effect/27011
#ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
#endif

    vec3 transformedNormal = objectNormal;
    transformedNormal = normalMatrix * transformedNormal;

#ifdef USE_TANGENT
    vec3 transformedTangent = (modelViewMatrix * vec4(objectTangent, 0.0)).xyz;
	#ifdef FLIP_SIDED
    transformedTangent = -transformedTangent;
	#endif
#endif

    vec3 transformed = vec3(position);
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
}