precision highp float;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uPixelSize;
uniform vec2 uResolution;

varying vec2 vUv;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 pixelUv = floor(vUv * uResolution / uPixelSize) * uPixelSize / uResolution;
  float r = random(pixelUv);

  float threshold = uProgress;
  float edge = 0.02;

  if (r < threshold - edge) {
    gl_FragColor = texture2D(uTexture2, vUv);
  } else if (r < threshold + edge) {
    float t = (r - (threshold - edge)) / (edge * 2.0);
    gl_FragColor = mix(texture2D(uTexture1, vUv), texture2D(uTexture2, vUv), t);
  } else {
    gl_FragColor = texture2D(uTexture1, vUv);
  }
}
