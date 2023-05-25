// -----------------------------------------------------------------------------------------------------------------------------
// Built-in uniforms and attributes
// More information: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// -----------------------------------------------------------------------------------------------------------------------------
// uniform mat4 modelMatrix;        = object.matrixWorld
//                                  The transformation matrix that converts vertices from local/model space to world space. 
//
// uniform mat4 modelViewMatrix;    = camera.matrixWorldInverse * object.matrixWorld
//                                  = viewMatrix * modelMatrix
//                                  The combined transformation matrix that converts vertices from local/model space to view/eye/camera space, 
//                                  taking into account both the model and view transformations.
//
// uniform mat4 projectionMatrix;   = camera.projectionMatrix
//                                  Transform the 3D coordinates of an object in view/eye/camera space to 2D screen coordinates. 
//
// uniform mat4 viewMatrix;         = camera.matrixWorldInverse
//                                  The transformation matrix that converts vertices from world space to camera view space, 
//                                  representing the position and orientation of the camera.
//
// uniform mat3 normalMatrix;       = inverse transpose of modelViewMatrix
//                                  The inverse transpose of the modelViewMatrix, used for transforming surface normals from 
//                                  object space to eye space while accounting for non-uniform scaling and rotation of the object.
//
// uniform vec3 cameraPosition;     Camera position in world space
//
// uniform bool isOrthographic;     A boolean value indicating whether the camera is using an orthographic projection (true)
//                                  or a perspective projection (false).
//
// -----------------------------------------------------------------------------------------------------------------------------
// default vertex attributes
// -----------------------------------------------------------------------------------------------------------------------------
// attribute vec3 position;         The attribute representing the position of a vertex in 3D space (provided by BufferGeometry)
// attribute vec3 normal;           The attribute representing the normal vector of a vertex, which defines its orientation in
//                                  3D space (provided by BufferGeometry)
// attribute vec2 uv;               The attribute representing the texture coordinates (UV coordinates) of a vertex, used for
//                                  mapping textures onto the surface of a 3D model (provided by BufferGeometry)
//
//
// Chain of transformations while working with normal mapping
//
// Tangent Space <-> Model (local) Space <-> World Space <-> View Space (eye or camera space) <-> Clip Space
//
// -----------------------------------------------------------------------------------------------------------------------------
precision highp float;

uniform vec3 lightPosition; // Position of the light in world space. This is a uniform, so its value is constant across all vertices.

varying vec2 vUv;           // UV coordinates for texturing. These are 2D coordinates that are used for mapping textures onto geometry.
varying vec3 vNormal;       // Vertex normal vector, transformed to camera space using the normalMatrix.
varying vec3 vViewPosition; // Vertex position in camera view space with inverted coordinates. This is the vertex position transformed by the modelViewMatrix, and then inverted.
varying vec3 vLightRay;     // Vector from the vertex position to the light position, both in camera space.

void main() {
    vNormal = normalize(normalMatrix * normal);
    // Transforms the vertex position to camera space
    vec4 vertexPositionCameraSpace = modelViewMatrix * vec4(position, 1.0);
    // Transforms the light position to camera space
    vec4 lightPositionCameraSpace = modelViewMatrix * vec4(lightPosition, 1.0);
   // Calculates the vector from the vertex to the light in camera space. This will be interpolated in the fragment shader to approximate the direction from each fragment to the light.
    vLightRay = lightPositionCameraSpace.xyz - vertexPositionCameraSpace.xyz;
    gl_Position = projectionMatrix * vertexPositionCameraSpace;
    vUv = uv;
    vViewPosition = -vertexPositionCameraSpace.xyz;
}
