precision highp float;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uDisplacementMap;
uniform float uProgress;
uniform float uIntensity;

varying vec2 vUv;

void main() {
  vec4 displacement = texture2D(uDisplacementMap, vUv);
  float theta = displacement.r * 2.0 * 3.14159265;

  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 uv1 = vUv + dir * uIntensity * uProgress;
  vec2 uv2 = vUv + dir * uIntensity * (1.0 - uProgress);

  vec4 t1 = texture2D(uTexture1, uv1);
  vec4 t2 = texture2D(uTexture2, uv2);

  gl_FragColor = mix(t1, t2, uProgress);
}
