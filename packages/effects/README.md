# @andresclua/sliderkit-effects

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-effects?style=flat-square&color=14B8A6)](https://www.npmjs.com/package/@andresclua/sliderkit-effects)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-effects?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-effects)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

CSS transition effects for **SliderKit** — fade, flip, and clip-path reveals.

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

Effects are plugins: pass them in `plugins`. Use `items: 1`. Each one injects its own CSS at runtime, so there is no stylesheet to import. `duration` defaults to the slider's `speed`.

### `fadeEffect(options?)`
Cross-fade between slides.

```typescript
new Slider('#my-slider', { items: 1, plugins: [fadeEffect({ duration: 600, easing: 'ease-in-out' })] })
```

| Option | Default | Description |
|---|---|---|
| `crossFade` | `true` | `true`: the others fade out. `false`: they stay visible underneath |
| `duration` | slider `speed` | ms |
| `easing` | `'ease'` | CSS easing |
| `adaptiveHeight` | `false` | Set `true` only if you animate the container height yourself (e.g. with GSAP) |

### `flipEffect(options?)`
Y-axis card flip, direction-aware.

```typescript
new Slider('#my-slider', { items: 1, plugins: [flipEffect({ perspective: 800 })] })
```

| Option | Default | Description |
|---|---|---|
| `duration` | slider `speed` | ms |
| `easing` | `'ease-in-out'` | CSS easing |
| `perspective` | `800` | px |

### `clipPathEffect(options?)`
Reveals the next slide with a `clip-path` animation.

```typescript
new Slider('#my-slider', { items: 1, plugins: [clipPathEffect({ shape: 'circle' })] })
```

| Option | Description |
|---|---|
| `shape` | A preset (`'wipe-right'`, `'wipe-left'`, `'wipe-down'`, `'wipe-up'`, `'circle'`, `'diamond'`), a custom `{ hidden, visible, hiddenReverse? }` of `clip-path` values, or `{ forward, backward }` with a preset or custom for each direction |
| `duration` | ms (default: slider `speed`) |
| `easing` | CSS easing |
| `directionAware` | Reveal differently when going backward |

## Coming soon

`cubeEffect`, `coverflowEffect`, `cardsEffect` and `creativeEffect` are in the repository but are **not exported yet**, so they can't be imported from this package.

---

[Documentation](https://sliderkit.andresclua.com/docs/effects) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
