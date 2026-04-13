precision highp float;

uniform sampler2D uTexture;
uniform float uDepth;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  vec2 parallaxOffset = uMouse * uDepth * 0.05;
  vec2 uv = vUv + parallaxOffset;

  // Clamp to avoid edge artifacts
  uv = clamp(uv, 0.0, 1.0);

  gl_FragColor = texture2D(uTexture, uv);
}
