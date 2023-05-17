#define attribute in
#define varying out
#define texture2D texture
precision highp float;
precision highp int;

/*
#define SHADER_NAME ARCHIOxCustomMaterial
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
*/



// Standard
varying vec3 vViewPosition; // 
varying vec3 vNormal;
varying vec2 vUv;


// Custom
uniform vec3 lightPosition;
varying vec3 vLightPosition;
varying vec3 vWorldPosition;

varying vec3 modelSpacePosition;
void main() {
    vUv = uv;


    vec3 objectNormal = vec3(normal);
    //vec3 transformedNormal = objectNormal;
    //transformedNormal = normalMatrix * transformedNormal;
    vNormal = normalize( objectNormal );

    vec3 transformed = vec3(position);
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = - mvPosition.xyz;

    
    //gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));

    vLightPosition = (inverse( modelViewMatrix) * vec4(lightPosition.xyz,1.0)).xyz;
    modelSpacePosition = position;
}