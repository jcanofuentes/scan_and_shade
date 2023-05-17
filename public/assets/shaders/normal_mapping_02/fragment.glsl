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
varying vec3 fPosition;         // Fragment position in camera view space (interpolated per-vertex)

uniform mat4 view;

uniform vec3 lightPosition;     // Position of the light source
uniform vec3 lightDirection;    // Direction of the light source

uniform vec2 iResolution;    // Window size pixels

uniform float iTime;
uniform float iTimeDelta;

vec3 ambientColor = vec3(0.0f, 0.0f, 0.0f);
vec3 diffuseColor = vec3(0.55f);

vec3 rim(vec3 color, float start, float end, float coef) {
    vec3 normal = normalize(vNormal);
    vec3 eye = normalize(-fPosition.xyz);
    float rim = smoothstep(start, end, 1.0 - dot(normal, eye));
    return clamp(rim, 0.0, 1.0) * coef * color;
}

// References:
// 
// https://github.com/glslify
// https://github.com/glslify/glsl-diffuse-lambert
// https://github.com/glslify/glsl-specular-phong
vec2 blinnPhongDir(vec3 lightDir, float lightInt, float Ka, float Kd, float Ks, float shininess) {

    vec3 s = normalize(lightDir);
    vec3 v = normalize(-fPosition);
    vec3 n = normalize(vNormal);
    vec3 h = normalize(v + s);
    float diffuse = Ka + Kd * lightInt * max(0.0, dot(n, s));
    float spec = Ks * pow(max(0.0, dot(n, h)), shininess);
    return vec2(diffuse, spec);
}

void main() {

    //gl_FragColor = vec4(vNormal.xyz, 1.0);
    //vec3 c = rim(vec3(1.0, 0.0, 0.0), 0.0, 1.0, 1.0);
    //gl_FragColor = vec4(c, 1.0);

    vec3 lighPos = lightPosition;
    vec3 lightDir = normalize( lighPos );
    float lightInt = 1.0;
    float Ka = 0.1;
    float Kd = 1.0;
    float Ks = 0.3;
    float shininess = 4.0;
    vec2 c = blinnPhongDir(lightDir, lightInt, Ka, Kd, Ks, shininess);
    gl_FragColor = vec4(c.x, c.x, c.x, 1.0);

    
    //
    vec3 normal = vNormal;

    // Determine surface to light direction  
    vec4 lPosition = view * vec4(lightPosition, 1.0);
    vec3 lightVector = lPosition.xyz - vViewPosition;
    vec3 color = vec3(0.0);

}
