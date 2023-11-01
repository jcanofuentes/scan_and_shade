// Standard
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

// Custom
uniform vec3 lightPosition;
varying vec3 vLightDirection;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 transformed = vec3(position);
    vec4 mvPosition = vec4(transformed, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;

    // Transforms the vertex position to camera space
    vec4 vertexPositionCameraSpace = modelViewMatrix * vec4(position, 1.0);
    // Transforms the light position to camera space

    // WRONG!!
    //vec4 lightPositionCameraSpace = modelViewMatrix * vec4(lightPosition, 1.0);

    // GOOD!
    vec4 lightPositionCameraSpace = viewMatrix * vec4(lightPosition, 1.0);


    // Calculates the vector from the vertex to the light in camera space. This will be interpolated in the fragment shader to approximate the direction from each fragment to the light.
    vLightDirection = lightPositionCameraSpace.xyz - vertexPositionCameraSpace.xyz;
}