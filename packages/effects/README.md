# @andresclua/sliderkit-effects

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-effects?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit-effects)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-effects?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-effects)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

CSS transition effects for **SliderKit** — fade, cube, coverflow, flip, cards, and creative.

**[Full documentation & demos →](https://sliderkit.andresclua.com/docs/effects)**

---

## Installation

```bash
npm install @andresclua/sliderkit @andresclua/sliderkit-effects
# or
pnpm add @andresclua/sliderkit @andresclua/sliderkit-effects
```

## Usage

```typescript
import { Slider } from '@andresclua/sliderkit'
import { fadeEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', {
  plugins: [fadeEffect()],
})
```

## Available effects

### `fadeEffect()`
Cross-fade between slides.

```typescript
import { fadeEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', { plugins: [fadeEffect()] })
```

### `cubeEffect()`
3D cube rotation between slides.

```typescript
import { cubeEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', { plugins: [cubeEffect()] })
```

### `coverflowEffect()`
iTunes-style coverflow perspective.

```typescript
import { coverflowEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', { plugins: [coverflowEffect()] })
```

### `flipEffect()`
Card flip transition.

```typescript
import { flipEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', { plugins: [flipEffect()] })
```

### `cardsEffect()`
Stacked card deck with depth offset.

```typescript
import { cardsEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', { plugins: [cardsEffect()] })
```

### `creativeEffect()`
Fully customisable — define `prev` and `next` transforms.

```typescript
import { creativeEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', {
  plugins: [
    creativeEffect({
      prev: { translate: ['-100%', 0, 0] },
      next: { translate: ['100%', 0, 0] },
    }),
  ],
})
```

## CSS class added per effect

When an effect is active, a modifier class is added to the slider container so you can scope your own transition CSS:

| Effect | Class |
|---|---|
| `fadeEffect` | `.c--slider-effect-fade` |
| `cubeEffect` | `.c--slider-effect-cube` |
| `coverflowEffect` | `.c--slider-effect-coverflow` |
| `flipEffect` | `.c--slider-effect-flip` |
| `cardsEffect` | `.c--slider-effect-cards` |
| `creativeEffect` | `.c--slider-effect-creative` |

---

[Documentation](https://sliderkit.andresclua.com/docs/effects) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
