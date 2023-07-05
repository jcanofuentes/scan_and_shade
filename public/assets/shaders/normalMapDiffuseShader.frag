varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vLightDirection;

uniform sampler2D normalMap;
uniform vec2 normalScale;
uniform vec3 backgroundColour;

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
    vec3 mapN = texture(normalMap, vUv).xyz * 2.0 - 1.0;
    mapN.y = -1.0 * mapN.y;
    mapN.xy *= normalScale;
    mapN = normalize(mapN);
    normal = perturbNormal2Arb(-vViewPosition, normal, mapN);
    vec3 l_dir = vLightDirection;
    vec3 n = normalize(normal);
    vec3 e = normalize(vViewPosition);
    vec3 l = normalize(l_dir);
    float intensity = max(dot(normal, l), 0.0);
    //gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
    gl_FragColor = vec4(backgroundColour.rgb, 1.0);
}