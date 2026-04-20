import type { BuiltinEffect } from '../types'

export const VERT = `
attribute vec2 a_pos;
varying vec2 vUv;
void main() {
  vUv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

// object-fit:cover UV mapping; IMAGE_AR = 1.6 (1200×750 assets)
const COVER_FN = `
vec2 cover(vec2 uv, float ar) {
  const float IA = 1.6;
  vec2 r = vec2(min(ar / IA, 1.0), min(IA / ar, 1.0));
  return uv * r + (1.0 - r) * 0.5;
}`

const FRAG_DISPLACEMENT = (intensity: number) => `
precision mediump float;
varying vec2 vUv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform sampler2D u_disp;
uniform float u_progress;
uniform float u_ar;
${COVER_FN}
void main() {
  float t = u_progress;
  vec2  d = texture2D(u_disp, vUv).rg * 2.0 - 1.0;
  float s = sin(t * 3.14159265) * ${intensity.toFixed(4)};
  vec4  a = texture2D(u_from, cover(vUv + d * s, u_ar));
  vec4  b = texture2D(u_to,   cover(vUv - d * s, u_ar));
  gl_FragColor = mix(a, b, smoothstep(0.0, 1.0, t));
}`

const FRAG_RGB_SHIFT = (intensity: number) => `
precision mediump float;
varying vec2 vUv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform float u_ar;
${COVER_FN}
void main() {
  float t  = u_progress;
  float sh = sin(t * 3.14159265) * ${intensity.toFixed(4)};
  vec2 base = cover(vUv,                   u_ar);
  vec2 rv   = cover(vUv + vec2( sh, 0.0),  u_ar);
  vec2 bv   = cover(vUv + vec2(-sh, 0.0),  u_ar);
  gl_FragColor = vec4(
    mix(texture2D(u_from, rv  ).r, texture2D(u_to, rv  ).r, t),
    mix(texture2D(u_from, base).g, texture2D(u_to, base).g, t),
    mix(texture2D(u_from, bv  ).b, texture2D(u_to, bv  ).b, t),
    1.0
  );
}`

const FRAG_RADIAL = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform float u_ar;
${COVER_FN}
void main() {
  float t    = u_progress;
  vec2  c    = vUv - 0.5;
  float dist = length(vec2(c.x * u_ar, c.y));
  float maxD = length(vec2(0.5 * u_ar, 0.5));
  float norm = dist / maxD;
  float rad  = t * 1.15;
  float mask = 1.0 - smoothstep(rad - 0.18, rad + 0.06, norm);
  vec2  uv   = cover(vUv, u_ar);
  gl_FragColor = mix(texture2D(u_from, uv), texture2D(u_to, uv), mask);
}`

export function getFragSrc(effect: BuiltinEffect, intensity: number): string {
  switch (effect) {
    case 'displacement': return FRAG_DISPLACEMENT(intensity)
    case 'rgb-shift':    return FRAG_RGB_SHIFT(intensity)
    case 'radial':       return FRAG_RADIAL
  }
}
