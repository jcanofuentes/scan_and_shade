uniform vec3 lightPosition; // World coordinates
uniform vec3 eyePosition;   // World coordinates

varying vec2 vUv; 
varying mat3 vTbn;
varying vec3 vWorldPosition;
varying vec3 vLightPosition;

void main()
{
    vUv = uv; 
    
    vec3 N = vec3(0.0, 0.0, 1.0);
    vec3 T = vec3(1.0, 0.0, 0.0);
    vec3 B = vec3(0.0, 1.0, 0.0);
    vTbn = mat3(T, B, N);
    
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vLightPosition = (viewMatrix * vec4(lightPosition, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}