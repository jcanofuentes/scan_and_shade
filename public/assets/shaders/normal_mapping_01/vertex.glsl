// -----------------------------------------------------------------------------------------------------------------------------
// Built-in uniforms and attributes
// More information: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// -----------------------------------------------------------------------------------------------------------------------------
// uniform mat4 modelMatrix;        = object.matrixWorld
//                                  The transformation matrix that converts vertices from local space to world space. 
//
// uniform mat4 modelViewMatrix;    = camera.matrixWorldInverse * object.matrixWorld
//                                  = viewMatrix * modelMatrix
//                                  The combined transformation matrix that converts vertices from local space to camera space, 
//                                  taking into account both the model and view transformations.
//
// uniform mat4 projectionMatrix;   = camera.projectionMatrix
//                                  Transform the 3D coordinates of an object in camera space to 2D screen coordinates. 
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
// -----------------------------------------------------------------------------------------------------------------------------
precision highp float;

varying vec3 vNormal;           // TODO
varying vec2 vUv;               // UV coordinates for texturing
varying vec3 vViewPosition;     // Vertex position in camera view space with inverted coordinates

uniform vec3 lightDirection;

void main() {
    // We directly pass the UV coordinates to the fragment shader.
    // These coordinates will be interpolated for each fragment.
    vUv = uv;

    // We convert the vertex position to a 3D vector.
    vec3 transformed = vec3(position);

    // We convert the 3D position to a 4D position, assuming that the W component is 1.0.
    vec4 viewModelPosition = vec4(transformed, 1.0);

    // We multiply the vertex position by the model-view matrix.
    // This matrix transforms the vertex position to camera space.
    viewModelPosition = modelViewMatrix * viewModelPosition;

    // This space is suitable for further transformations so we apply the projectionMatrix 
    vec4 perspectiveSpace = projectionMatrix * viewModelPosition;

    // The final position of the vertex for the rasterizer is obtained by multiplying
    // the position in camera space by the projection matrix.
    gl_Position = perspectiveSpace;

    // We calculate the vertex position in camera space, but with inverted coordinates.
    // This is useful for calculations in the fragment shader, for example, to calculate the direction from the camera to the vertex.
    vViewPosition = -viewModelPosition.xyz;

    vNormal = normal;

    // Rotate the object normals by a 3x3 normal matrix.
    // We could also do this CPU-side to avoid doing it per-vertex
    //vNormal = normalize(normalMatrix * normal);
}