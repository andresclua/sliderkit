precision highp float;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uAmount;
uniform float uAngle;

varying vec2 vUv;

void main() {
  float amount = uAmount * uProgress * (1.0 - uProgress) * 4.0;
  vec2 offset = amount * vec2(cos(uAngle), sin(uAngle));

  vec4 r1 = texture2D(uTexture1, vUv + offset);
  vec4 g1 = texture2D(uTexture1, vUv);
  vec4 b1 = texture2D(uTexture1, vUv - offset);

  vec4 t1 = vec4(r1.r, g1.g, b1.b, 1.0);
  vec4 t2 = texture2D(uTexture2, vUv);

  gl_FragColor = mix(t1, t2, uProgress);
}
