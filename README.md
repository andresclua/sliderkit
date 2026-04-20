# SliderKit

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit)](https://www.npmjs.com/package/@andresclua/sliderkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red)](https://github.com/sponsors/andresclua)

A modern, accessible, TypeScript-first slider library with WebGL effects, CSS transitions, and a rich plugin system.

**[Documentation & Demos →](https://sliderkit.andresclua.com)**

---

## Packages

| Package | Description | Size |
|---|---|---|
| [`@andresclua/sliderkit`](packages/core) | Core slider engine | ~7 KB gzip |
| [`@andresclua/sliderkit-plugins`](packages/plugins) | Arrows, pagination, autoplay, thumbs… | ~4 KB gzip |
| [`@andresclua/sliderkit-effects`](packages/effects) | CSS transition effects (fade, flip, clip-path…) | ~2 KB gzip |
| [`@andresclua/sliderkit-webgl`](packages/webgl) | GPU WebGL transitions (displacement, rgb-shift, radial) | ~4 KB gzip |

---

## Installation

```bash
# npm
npm install @andresclua/sliderkit

# pnpm
pnpm add @andresclua/sliderkit

# yarn
yarn add @andresclua/sliderkit
```

---

## Quick Start

```html
<div class="sliderkit__outer">
  <div class="sliderkit__overflow">
    <div class="sliderkit" id="my-slider">
      <div class="sliderkit__item">Slide 1</div>
      <div class="sliderkit__item">Slide 2</div>
      <div class="sliderkit__item">Slide 3</div>
    </div>
  </div>
</div>
```

```typescript
import { Slider } from '@andresclua/sliderkit'

const slider = new Slider('#my-slider', {
  items: 1,
  loop:  true,
  speed: 400,
})

slider.on('indexChanged', ({ displayIndex }) => {
  console.log('Slide:', displayIndex)
})
```

---

## Options

### Layout

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | `number` | `1` | Number of slides visible at once |
| `gutter` | `number` | `0` | Space between slides in px |
| `edgePadding` | `number` | `0` | Space on the outer edges in px — makes adjacent slides peek |
| `fixedWidth` | `number \| false` | `false` | Fixed pixel width per slide, ignores `items` |
| `autoWidth` | `boolean` | `false` | Each slide uses its natural CSS width |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slide axis |

### Behaviour

| Option | Type | Default | Description |
|---|---|---|---|
| `loop` | `boolean` | `false` | Seamless infinite loop using DOM clones |
| `rewind` | `boolean` | `false` | Jump to first/last slide at the edges |
| `speed` | `number` | `300` | Transition duration in ms |
| `slideBy` | `number \| 'page'` | `1` | Slides advanced per next/prev click |
| `startIndex` | `number` | `0` | Initial active slide index |
| `freezable` | `boolean` | `true` | Freezes interaction when all slides fit in the viewport |

### Touch & Drag

| Option | Type | Default | Description |
|---|---|---|---|
| `touch` | `boolean` | `true` | Enable touch swipe |
| `mouseDrag` | `boolean` | `false` | Enable mouse drag |
| `swipeThreshold` | `number` | `50` | Minimum swipe distance in px to trigger navigation |
| `resistance` | `boolean` | `true` | Elastic resistance at the edges |

### Responsive

```typescript
new Slider('#my-slider', {
  items: 1,
  gutter: 8,
  breakpoints: {
    640:  { items: 2, gutter: 12 },
    1024: { items: 3, gutter: 20 },
  },
})
```

---

## Plugins

```bash
pnpm add @andresclua/sliderkit-plugins
```

```typescript
import { Slider } from '@andresclua/sliderkit'
import { arrows, pagination, autoplay, thumbs, progress, mouseWheel, keyboard, a11y, hooks } from '@andresclua/sliderkit-plugins'

new Slider('#my-slider', {
  loop: true,
  plugins: [
    arrows(),
    pagination({ type: 'dots' }),
    autoplay({ delay: 3000, pauseOnHover: true }),
  ],
})
```

### `arrows()`
Previous / next navigation buttons injected into `.sliderkit__outer`.

### `pagination()`
```typescript
pagination({
  type: 'dots',       // 'dots' | 'fraction' | 'progress'
  clickable: true,
})
```

### `autoplay()`
```typescript
autoplay({
  delay:        3000,
  pauseOnHover: true,
})
```

### `thumbs()`
```typescript
thumbs({ el: '#thumbs-container' })
```

### `progress()`
```typescript
progress({ el: '#progress-bar' })
```

### `mouseWheel()` · `keyboard()` · `a11y()`
Drop-in behaviour enhancements — no required options.

### `hooks()`
```typescript
hooks({
  beforeChange: ({ from, to }) => { /* … */ },
  afterChange:  ({ index })    => { /* … */ },
})
```

---

## Events

```typescript
slider.on('indexChanged',    ({ displayIndex }) => { })
slider.on('transitionStart', ({ displayIndex }) => { })
slider.on('transitionEnd',   ({ displayIndex }) => { })
slider.on('touchStart',      info => { })
slider.on('touchMove',       info => { })
slider.on('touchEnd',        info => { })
slider.on('dragStart',       info => { })
slider.on('dragMove',        info => { })
slider.on('dragEnd',         info => { })
slider.on('resize',          info => { })
slider.on('newBreakpointStart', info => { })
slider.on('newBreakpointEnd',   info => { })
slider.on('afterInit',       info => { })
slider.on('beforeDestroy',   info => { })
slider.on('afterDestroy',    info => { })
```

---

## Methods

```typescript
slider.goTo(2)
slider.goTo('next')
slider.goTo('prev')
slider.next()
slider.prev()

slider.update()        // recalculate layout (call after DOM changes)
slider.getInfo()       // returns SliderInfo

slider.on('event', handler)
slider.off('event', handler)

slider.destroy()
```

---

## CSS Effects

```bash
pnpm add @andresclua/sliderkit-effects
```

```typescript
import { Slider } from '@andresclua/sliderkit'
import { fade } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', {
  items: 1,
  plugins: [fade()],
})
```

Available effects: `fade`, `flip`, `clipPath`.

---

## WebGL

```bash
pnpm add @andresclua/sliderkit-webgl
```

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

Available effects: `displacement`, `rgb-shift`, `radial`, `custom` (bring your own GLSL).

> **Note:** Always set `items: 1` and `speed: 0` when using the WebGL plugin. The plugin silently no-ops when WebGL is unavailable.

---

## GSAP Integration

SliderKit events wire directly into GSAP — no adapter needed:

```typescript
import { Slider } from '@andresclua/sliderkit'
import { gsap } from 'gsap'

const slider = new Slider('#my-slider', { loop: true })

slider.on('indexChanged', ({ displayIndex }) => {
  const slide = slider.getInfo().slideItems[displayIndex - 1]
  gsap.fromTo(slide, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 })
})
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start playground dev server
pnpm dev

# Start docs dev server
pnpm docs
# then open http://localhost:4321
```

---

## Support this project

If SliderKit is useful to you, consider [sponsoring the development](https://github.com/sponsors/andresclua).

## Author

**Andrés Clúa** — frontend developer based in Barcelona.

- GitHub: [@andresclua](https://github.com/andresclua)
- Web: [andresclua.com](https://andresclua.com)

## License

MIT © [Andres Clua](https://github.com/andresclua)
