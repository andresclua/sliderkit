# @andresclua/sliderkit-webgl

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-webgl?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit-webgl)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-webgl?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-webgl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

WebGL transition effects for **SliderKit**, powered by [OGL](https://github.com/oframe/ogl). Displacement, RGB shift, pixel dissolve, and parallax depth — all GPU-accelerated with automatic canvas management and fallback detection.

**[Full documentation & demos →](https://sliderkit.andresclua.com/docs/webgl)**

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
import { webglRenderer, displacementEffect, preloadImages } from '@andresclua/sliderkit-webgl'

// Preload images so the first frame renders correctly
await preloadImages('#my-slider')

new Slider('#my-slider', {
  plugins: [
    webglRenderer({
      effect: displacementEffect({
        texture: '/textures/displacement.png',
        intensity: 1.2,
      }),
    }),
  ],
})
```

## Available effects

### `displacementEffect()`
Distorts pixels using a displacement map texture during transitions.

```typescript
import { displacementEffect } from '@andresclua/sliderkit-webgl'

displacementEffect({
  texture: '/textures/displacement.png', // displacement map
  intensity: 1.2,                        // warp strength
})
```

### `rgbShiftEffect()`
Splits the RGB channels apart for a chromatic aberration look.

```typescript
import { rgbShiftEffect } from '@andresclua/sliderkit-webgl'

rgbShiftEffect({
  amount: 0.02, // channel separation amount
})
```

### `pixelDissolveEffect()`
Dissolves the outgoing slide into pixels before revealing the next.

```typescript
import { pixelDissolveEffect } from '@andresclua/sliderkit-webgl'

pixelDissolveEffect({
  pixelSize: 20, // pixel block size
})
```

### `parallaxDepthEffect()`
Moves slide layers at different depths creating a parallax illusion on swipe.

```typescript
import { parallaxDepthEffect } from '@andresclua/sliderkit-webgl'

parallaxDepthEffect({
  depth: 0.15, // parallax intensity (0–1)
})
```

## `preloadImages(selector)`

WebGL requires images to be fully decoded before the first render. Call this helper and `await` it before initialising the slider:

```typescript
import { preloadImages } from '@andresclua/sliderkit-webgl'

await preloadImages('#my-slider') // decodes all img elements inside the container
```

## Notes

- WebGL rendering requires slide content to be `<img>` elements (or elements with a `background-image`).
- A canvas element is injected over the slider automatically — no extra markup needed.
- If WebGL is unavailable (old browser / privacy mode), the renderer falls back gracefully to a plain CSS transition.

---

[Documentation](https://sliderkit.andresclua.com/docs/webgl) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
