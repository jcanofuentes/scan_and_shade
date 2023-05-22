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


varying vec2 vUv;               // UV coordinates for texturing
varying vec3 vViewPosition;     // Vertex position in camera view space with inverted coordinates
varying vec3 fPosition;         // Vertex position in camera view space

/*
varying vec3 vNormal;           // Vertex normal
void main() {

    vUv = uv;

    vec4 pos = modelViewMatrix * vec4(position, 1.0);
    fPosition = pos.xyz;

    vec3 transformed = vec3(position);
    vec4 viewModelPosition = vec4(transformed, 1.0);
    viewModelPosition = modelViewMatrix * viewModelPosition;
    gl_Position = projectionMatrix * viewModelPosition;
    vViewPosition = -viewModelPosition.xyz;
    fPosition = viewModelPosition.xyz;

    vNormal = normal * normalMatrix;
    //vNormal = normal;
}
*/
uniform vec3 lightPosition;

varying vec3 vNormal;
varying vec3 vLightRay;

void main() {
    //vNormal = normalize(normalMatrix * normal);
    vNormal = normalize(normal);

    vec4 posWorldSpace = (modelMatrix) * vec4(position, 1.0) ;
    vLightRay = lightPosition - posWorldSpace.xyz;

    vec4 vertexPositionCameraSpace = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * vertexPositionCameraSpace;
}



