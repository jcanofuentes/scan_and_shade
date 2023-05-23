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

void main() {
    vec3 lightDirection = normalize(vLightRay);
    float lambertian = max(dot(vNormal, lightDirection), 0.0);
    vec3 color = vec3(0.29f, 0.65f, 0.2f);
    gl_FragColor = vec4(color * lambertian, 1.0);
}
