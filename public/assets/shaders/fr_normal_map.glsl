// https://github.com/delaneyj/three.net/blob/master/code/js/r68/src/renderers/shaders/ShaderChunk/normalmap_pars_fragment.glsl
// https://threejs.org/docs/#api/en/materials/MeshStandardMaterial.normalMap
// Params: .normalScale

precision highp float;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;

varying vec2 vUv;
varying mat3 vTbn;
varying vec3 vWorldPosition;
varying vec3 vLightPosition;

void main() {
    vec3 normalColor = texture2D(normalMap, vUv).xyz;
    vec3 normal = normalColor * 2.0 - 1.0;
    vec3 normal_2 = normalize(vTbn * normal); 


    //gl_FragColor = vec4(normal, 1.0);
    vec3 color = texture2D(diffuseMap, vUv).xyz;

    vec3 lightdir = vLightPosition - vWorldPosition;

    lightdir = -normalize(lightdir.xyz);

	float lighting = clamp(dot(lightdir, normal_2), 0.0, 1.0);

    lighting *= 0.2;
    gl_FragColor = vec4(lighting, lighting, lighting, 1.0);

	//float	ao = clamp(normal.z, 0.0, 1.0);
    //gl_FragColor = vec4(ao, ao, ao, 1.0);

    //vec3 lightDir = normalize(vLightPosition - vWorldPosition);
    //float dotProduct = max(dot(normal, lightDir), 0.0);
    //gl_FragColor = vec4(color * dotProduct, 1.0);

    //gl_FragColor = vec4(lightdir.x, lightdir.y, lightdir.z, 1.0);

    //gl_FragColor = vec4(normal.xyz, 1.0);

    //gl_FragColor = vec4(vWorldPosition.xyz, 1.0);

}