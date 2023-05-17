varying vec2 vUv;

varying vec3 vViewPosition;
varying vec3 vNormal;

uniform sampler2D normalMap;
uniform vec2 normalScale;

varying vec3 vLightPosition;
varying vec3 vWorldPosition;
varying vec3 modelSpacePosition;
vec3 perturbNormal2Arb(vec3 eye_pos, vec3 surf_norm, vec3 mapN) {
    vec3 q0 = vec3(dFdx(eye_pos.x), dFdx(eye_pos.y), dFdx(eye_pos.z));
    vec3 q1 = vec3(dFdy(eye_pos.x), dFdy(eye_pos.y), dFdy(eye_pos.z));
    vec2 st0 = dFdx(vUv.st);
    vec2 st1 = dFdy(vUv.st);
    float scale = sign(st1.t * st0.s - st0.t * st1.s);
    vec3 S = normalize((q0 * st1.t - q1 * st0.t) * scale);
    vec3 T = normalize((-q0 * st1.s + q1 * st0.s) * scale);
    vec3 N = normalize(surf_norm);
    mat3 tsn = mat3(S, T, N);
    mapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);
    return normalize(tsn * mapN);
}

void main() {

    vec3 normal = normalize(vNormal);
    vec3 geometryNormal = normal;

    vec3 mapN = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale;
    normal = perturbNormal2Arb(-vViewPosition, normal, mapN);

    //gl_FragColor = vec4(normal.xyz,1.0);


    vec3 l_dir = vLightPosition - modelSpacePosition;

    // set the specular term to black
    vec4 spec = vec4(0.2);
    // normalize both input vectors
    vec3 n = normalize(normal);
    vec3 e = normalize(vViewPosition);
    vec3 l = normalize(l_dir);
    float intensity = max(dot(normal,l), 0.0);
 

   gl_FragColor = vec4(intensity,intensity,intensity,1.0);
}