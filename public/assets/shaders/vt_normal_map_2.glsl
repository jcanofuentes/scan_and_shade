uniform vec3 lightPos;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vLightPosition;

void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vLightPosition = (viewMatrix * vec4(lightPos, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}