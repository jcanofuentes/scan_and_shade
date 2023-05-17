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

varying vec2 vUv;
varying vec3 vViewPosition;         // The varying variable "vViewPosition" stores the position of each fragment in camera view space.
                                    // It is interpolated across the primitive and accessible in the fragment shader, allowing for 
                                    // view-dependent calculations and shading.

uniform sampler2D normalMap;
uniform vec2 normalScale;

uniform vec3 lightDirection;

vec3 computeIllumination_1()
{
    // Material definition
    float shininess = 0.5;
    vec3 materialColor = vec3(0.6,0.6,0.6);
    vec3 specularColor = vec3(1.0,1.0,1.0);

    // Transform the  =light direction to camera space
    vec3 lightDirectionCamera = normalize((viewMatrix * vec4(lightDirection, 0.0)).xyz);
    
    
    // Calculamos la dirección desde el fragmento hacia la luz
    vec3 l = normalize(-lightDirection);
    
    // Calculamos la normal del fragmento (puede ser un varying proveniente del vertex shader)
    vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	vec3 n = normalize( mapN );
    
    // Calculamos el factor de iluminación difusa
    float diffuse = max(dot(n, l), 0.0);
    
    // Calculamos el factor de iluminación especular
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 reflectDirection = reflect(-l, n);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), shininess);
    
    // Aplicamos el factor de iluminación difusa y especular al color del material
    vec3 finalColor = materialColor * diffuse + specular * specularColor;
    
    //vec3 finalColor = vec3(1.0,1.0,1.0);
    return finalColor;
}

void main() {

    vec3 finalColor = computeIllumination_1();
    // Asignamos el color resultante al fragmento
    gl_FragColor = vec4(finalColor, 1.0);
}

