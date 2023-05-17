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
varying vec3 vNormal;

uniform sampler2D normalMap;
uniform vec2 normalScale;

uniform vec3 lightPosition;
uniform vec3 lightDirection;

vec3 computeIllumination_1() {
    // Material definition
    float shininess = 0.1;
    vec3 materialColor = vec3(0.6, 0.6, 0.6);
    vec3 specularColor = vec3(1.0, 1.0, 1.0);

    // Transform the  =light direction to camera space
    vec3 lightDirectionCamera = normalize((viewMatrix * vec4(lightDirection, 0.0)).xyz);

    // Calculamos la dirección desde el fragmento hacia la luz
    vec3 l = normalize(-lightDirection);

    // Calculamos la normal del fragmento (puede ser un varying proveniente del vertex shader)
    vec3 mapN = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    vec3 n = normalize(mapN);

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

float shininessVal = 12.0; // Shininess
float Ka = 0.0;   // Ambient reflection coefficient
float Kd = 0.7;   // Diffuse reflection coefficient
float Ks = 0.35;   // Specular reflection coefficient
vec3 ambientColor = vec3(0.0f, 0.0f, 0.0f);
vec3 diffuseColor = vec3(0.55f);
vec3 specularColor = vec3(1.0f);

void main() {
    vec3 normal = vec3(0.0);
    normal = vNormal;
    vec3 normalRGB = texture2D(normalMap, vUv).xyz;
    // Expand into -1.0 .. 1.0 range
    vec3 normalMap = normalRGB * 2.0 - 1.0;  

    // Get surface normal and camera-space position
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPosition);

    // Perturb the normal
    //normal = perturb(normalMap, N, V, vUv);
    normal = normalMap;

    //gl_FragColor = vec4(normal.xyz, 1.0);

    vec3 L = normalize(lightPosition - (-vViewPosition));


    float lambertian = max(dot(normal, L), 0.0);
    float specular = 0.0;

    if(lambertian > 0.0) {
        vec3 R = reflect(-L, normal);      // Reflected light vector
        vec3 V = normalize(vViewPosition); // Vector to viewer
        // Compute the specular term
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, shininessVal);
    }

    vec3 a = Ka * ambientColor;
    vec3 d = Kd * lambertian * diffuseColor;
    vec3 s = Ks * specular * specularColor;

    gl_FragColor = vec4(a +  d + s, 1.0);
}
