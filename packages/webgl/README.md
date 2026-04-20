# @andresclua/sliderkit-webgl

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-webgl?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit-webgl)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-webgl?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-webgl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

GPU-powered slide transitions for **SliderKit** via raw WebGL. Three built-in effects (displacement, RGB-shift, radial) and a `custom` mode where you supply your own GLSL fragment shader.

> **Experimental** — API may change in minor versions.

**[Full documentation & demos →](https://sliderkit.andresclua.com/docs/plugins/webgl)**

---

## Installation

```bash
npm install @andresclua/sliderkit @andresclua/sliderkit-webgl
# or
pnpm add @andresclua/sliderkit @andresclua/sliderkit-webgl
```

## Usage

```typescript
import { Slider } from '@andresclua/sliderkit'
import { arrows } from '@andresclua/sliderkit-plugins'
import { webgl, preloadWebGL } from '@andresclua/sliderkit-webgl'

const assets = await preloadWebGL({
  slides:       [1,2,3,4,5].map(i => `/images/slide-${i}.jpg`),
  displacement: '/images/displacement.png',
})

new Slider('#my-slider', {
  items:   1,
  loop:    true,
  speed:   0,
  plugins: [arrows(), webgl({ effect: 'displacement', assets })],
})
```

> Always set `items: 1` and `speed: 0` — the plugin owns the animation.

## `preloadWebGL()` options

| Option | Type | Description |
|---|---|---|
| `slides` | `string[]` | Image URLs, one per slide in DOM order. |
| `displacement` | `string` | Optional. Greyscale displacement map. Required only for `effect: 'displacement'`. |

## `webgl()` options

| Option | Type | Default | Description |
|---|---|---|---|
| `effect` | `'displacement' \| 'rgb-shift' \| 'radial' \| 'custom'` | — | Required. Transition shader to use. |
| `assets` | `WebGLAssets` | — | Required. Returned by `preloadWebGL()`. |
| `duration` | `number` | `900` | Transition length in milliseconds. |
| `intensity` | `number` | `0.08` | Effect strength. |
| `easing` | `(t: number) => number` | cubic ease-in-out | Maps progress `[0,1]` to eased value. |
| `frag` | `string` | — | Required when `effect: 'custom'`. Raw GLSL fragment shader source. |
| `uniforms` | `Record<string, number \| number[] \| (() => unknown)>` | `{}` | Extra uniforms injected into the shader each frame. |

## Built-in effects

| Effect | Description | Needs displacement map |
|---|---|---|
| `displacement` | A greyscale map warps both frames, producing a fluid ink-wipe. | Yes |
| `rgb-shift` | Splits R and B channels horizontally (chromatic aberration). | No |
| `radial` | Incoming image grows from the centre outward with a soft edge. | No |

## Custom shaders

Set `effect: 'custom'` and provide a GLSL fragment shader via `frag`. Always-available uniforms:

| Name | Type | Description |
|---|---|---|
| `vUv` | `varying vec2` | UV coordinates `[0,1]`. |
| `u_from` | `sampler2D` | Outgoing slide texture. |
| `u_to` | `sampler2D` | Incoming slide texture. |
| `u_progress` | `float` | Eased progress `[0,1]`. |
| `u_ar` | `float` | Canvas aspect ratio (`width / height`). |
| `u_disp` | `sampler2D` | Displacement map (bound when `assets.displacement` exists). |

```typescript
webgl({
  effect: 'custom',
  assets,
  frag: `precision mediump float;
varying vec2 vUv;
uniform sampler2D u_from, u_to;
uniform float u_progress;
void main() {
  float t = smoothstep(0.45, 0.55, vUv.x - u_progress + 0.5);
  gl_FragColor = mix(texture2D(u_from, vUv), texture2D(u_to, vUv), t);
}`,
})
```

## TypeScript types

```typescript
import type { WebGLOptions, WebGLAssets, PreloadConfig, BuiltinEffect } from '@andresclua/sliderkit-webgl'
```

---

[Documentation](https://sliderkit.andresclua.com/docs/plugins/webgl) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
