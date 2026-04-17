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
| [`@andresclua/sliderkit-plugins`](packages/plugins) | Arrows, pagination, autoplay, thumbnails… | ~4 KB gzip |
| [`@andresclua/sliderkit-effects`](packages/effects) | CSS transition effects (fade, cube, coverflow…) | ~2 KB gzip |
| [`@andresclua/sliderkit-webgl`](packages/webgl) | WebGL renderer via OGL + shader effects | ~4 KB gzip |

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
<div class="c--slider-a" id="my-slider">
  <div class="c--slider-a__wrapper">
    <div class="c--slider-a__item" data-slide>Slide 1</div>
    <div class="c--slider-a__item" data-slide>Slide 2</div>
    <div class="c--slider-a__item" data-slide>Slide 3</div>
  </div>
</div>
```

```typescript
import { Slider } from '@andresclua/sliderkit'

const slider = new Slider('#my-slider', {
  slidesPerPage: 1,
  loop: true,
  speed: 400,
})
```

---

## Options

### Layout

| Option | Type | Default | Description |
|---|---|---|---|
| `slidesPerPage` | `number` | `1` | Number of slides visible at once |
| `gutter` | `number` | `0` | Space between slides in px |
| `edgePadding` | `number` | `0` | Space on the outer edges in px — makes adjacent slides peek |
| `fixedWidth` | `number \| false` | `false` | Fixed pixel width per slide, ignores `slidesPerPage` |
| `autoWidth` | `boolean` | `false` | Each slide uses its natural CSS width |
| `centered` | `boolean` | `false` | Centers the active slide in the viewport |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slide axis |

### Behaviour

| Option | Type | Default | Description |
|---|---|---|---|
| `loop` | `boolean` | `false` | Seamless infinite loop using DOM clones |
| `rewind` | `boolean` | `false` | Jump to first/last slide at the edges |
| `speed` | `number` | `300` | Transition duration in ms |
| `slideBy` | `number \| 'page'` | `1` | Slides advanced per next/prev click. `'page'` equals `slidesPerPage` |
| `startIndex` | `number` | `0` | Initial active slide index |
| `freezable` | `boolean` | `true` | Freezes interaction when all slides fit in the viewport |
| `disabled` | `boolean` | `false` | Disables all interaction on init |

### Touch & Drag

| Option | Type | Default | Description |
|---|---|---|---|
| `touch` | `boolean` | `true` | Enable touch swipe |
| `mouseDrag` | `boolean` | `false` | Enable mouse drag |
| `swipeThreshold` | `number` | `50` | Minimum swipe distance in px to trigger navigation |
| `swipeAngle` | `number` | `15` | Maximum angle (degrees) off-axis before swipe is ignored |
| `resistance` | `boolean` | `true` | Elastic resistance at the edges |
| `resistanceRatio` | `number` | `0.85` | Resistance strength (0–1) |
| `preventScrollOnTouch` | `'auto' \| 'force' \| false` | `'auto'` | Prevent page scroll while swiping |
| `grabCursor` | `boolean` | `true` | Show grab cursor on hover |

### Accessibility

| Option | Type | Default | Description |
|---|---|---|---|
| `a11y.enabled` | `boolean` | `true` | ARIA roles, live regions, roledescription |
| `a11y.prevSlideMessage` | `string` | `'Previous slide'` | ARIA label for prev button |
| `a11y.nextSlideMessage` | `string` | `'Next slide'` | ARIA label for next button |
| `a11y.slideLabel` | `string` | `'Slide'` | Prefix for slide ARIA labels |

### Responsive

```typescript
new Slider('#my-slider', {
  slidesPerPage: 1,
  gutter: 8,
  breakpoints: {
    640:  { slidesPerPage: 2, gutter: 12 },
    1024: { slidesPerPage: 3, gutter: 20 },
  },
})
```

Any option available at the root level can be overridden per breakpoint.

---

## Plugins

```bash
pnpm add @andresclua/sliderkit-plugins
```

```typescript
import { Slider } from '@andresclua/sliderkit'
import {
  arrows,
  pagination,
  autoplay,
  thumbnails,
  progressBar,
  slideCounter,
  mouseWheel,
  lazyLoad,
  autoHeight,
  virtualSlides,
  centerMode,
  variableWidth,
} from '@andresclua/sliderkit-plugins'

new Slider('#my-slider', {
  loop: true,
  plugins: [
    arrows(),
    pagination({ type: 'dots', clickable: true }),
    autoplay({ delay: 3000, pauseOnHover: true }),
  ],
})
```

### `arrows()`
```typescript
arrows({
  prevEl: '.my-prev', // custom prev button selector or element
  nextEl: '.my-next', // custom next button selector or element
})
```

### `pagination()`
```typescript
pagination({
  el: '#my-pag',          // custom container (optional)
  type: 'dots',           // 'dots' | 'fraction' | 'progress' | 'dynamic' | 'custom'
  clickable: true,
  renderBullet: (i, cls) => `<span class="${cls}">${i + 1}</span>`, // custom render
})
```

### `autoplay()`
```typescript
autoplay({
  delay: 3000,
  pauseOnHover: true,
  pauseOnInteraction: true,
  disableOnInteraction: false,
})
```

### `thumbnails()`
```typescript
thumbnails({
  el: '#thumbs',        // thumbnail container
  slideEl: '.thumb',    // individual thumb selector
})
```

### `progressBar()`
```typescript
progressBar({ el: '#progress' })
```

### `slideCounter()`
```typescript
slideCounter({ el: '#counter', separator: ' / ' })
```

### `mouseWheel()`
```typescript
mouseWheel({ sensitivity: 1, releaseOnEdges: true })
```

### `lazyLoad()`
```typescript
lazyLoad({ selector: '.lazy', preloadPrev: 1, preloadNext: 2 })
```

### `autoHeight()`
```typescript
autoHeight({ transition: 300 })
```

---

## Events

Listen with `on` in options or call `.on()` / `.off()` at any time:

```typescript
const slider = new Slider('#my-slider', {
  on: {
    afterSlideChange: ({ index, previousIndex, slide }) => {
      console.log(`Moved from ${previousIndex} → ${index}`)
    },
  },
})

// Or imperatively
slider.on('beforeSlideChange', ({ from, to, direction }) => { })
slider.on('afterSlideChange',  ({ index, previousIndex, slide }) => { })
slider.on('beforeTransitionStart', ({ from, to }) => { })
slider.on('afterTransitionEnd',    ({ index }) => { })
slider.on('beforeLoopBoundary',    ({ direction, targetIndex }) => { })
slider.on('progress',              ({ progress }) => { })
slider.on('beforeInit',  ({ slider }) => { })
slider.on('afterInit',   ({ slider }) => { })
slider.on('beforeDestroy', ({ slider }) => { })
slider.on('afterDestroy',  ({ slider }) => { })
slider.on('touchStart', ({ event }) => { })
slider.on('touchMove',  ({ event, delta, direction }) => { })
slider.on('touchEnd',   ({ event }) => { })
slider.on('dragStart',  ({ event }) => { })
slider.on('dragMove',   ({ event, delta, direction }) => { })
slider.on('dragEnd',    ({ event }) => { })
slider.on('resize',     ({ width, slidesPerPage }) => { })
slider.on('newBreakpointStart', ({ currentBreakpoint, options }) => { })
slider.on('newBreakpointEnd',   ({ currentBreakpoint }) => { })
```

### `beforeLoopBoundary`
Fires after the wrapper is moved to the clone position but before the CSS transition plays. Use it to snap visual effects so clones look correct as they animate in:

```typescript
slider.on('beforeLoopBoundary', ({ direction, targetIndex }) => {
  applyRotation(targetIndex, true) // instant, no transition
})
```

---

## Methods

```typescript
slider.goTo(2)         // go to index
slider.goTo('next')
slider.goTo('prev')
slider.goTo('first')
slider.goTo('last')
slider.next()
slider.prev()

slider.play()          // start autoplay
slider.pause()         // pause autoplay

slider.enable()        // re-enable after disable()
slider.disable()

slider.update()        // recalculate layout (call after DOM changes)
slider.updateSliderHeight()

slider.getInfo()       // returns { index, slidesPerPage, slideCount, ... }

slider.on('event', handler)
slider.off('event', handler)

slider.destroy()
slider.rebuild({ slidesPerPage: 2 })  // destroy + reinit with new options
```

---

## CSS Effects

```bash
pnpm add @andresclua/sliderkit-effects
```

```typescript
import { Slider } from '@andresclua/sliderkit'
import { fadeEffect } from '@andresclua/sliderkit-effects'

new Slider('#my-slider', {
  plugins: [fadeEffect()],
})
```

Available effects: `fadeEffect`, `cubeEffect`, `coverflowEffect`, `flipEffect`, `cardsEffect`, `creativeEffect`.

---

## WebGL

```bash
pnpm add @andresclua/sliderkit-webgl
```

```typescript
import { Slider } from '@andresclua/sliderkit'
import { webglRenderer, displacementEffect } from '@andresclua/sliderkit-webgl'

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

Available effects: `displacementEffect`, `rgbShiftEffect`, `pixelDissolveEffect`, `parallaxDepthEffect`.

> **Note — image preloading:** WebGL textures require images to be fully decoded before the first render. Use the optional `preloadImages` helper to avoid a blank first frame:
>
> ```typescript
> import { webglRenderer, preloadImages } from '@andresclua/sliderkit-webgl'
>
> await preloadImages('#my-slider')
>
> new Slider('#my-slider', {
>   plugins: [webglRenderer({ effect: displacementEffect(...) })],
> })
> ```

---

## GSAP Integration

SliderKit events wire directly into GSAP — no adapter needed:

```typescript
import { Slider } from '@andresclua/sliderkit'
import { gsap } from 'gsap'

const slider = new Slider('#my-slider', { loop: true })
const cards = [...slider.slides].map(s => s.querySelector('.card'))

// Entrance animation on init
slider.on('afterInit', () => {
  gsap.fromTo(cards[0], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
})

// Animate entering slide on navigation
slider.on('afterSlideChange', ({ index }) => {
  gsap.fromTo(cards[index], { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 })
})

// Snap effects before a loop boundary animates
slider.on('beforeLoopBoundary', ({ targetIndex }) => {
  applyEffect(targetIndex, true) // instant snap on clone
})
```

---

## Lazy Load with Boostify

Defer the entire slider + plugins until the user scrolls:

```typescript
import Boostify from 'boostify'

const bstf = new Boostify()
bstf.scroll({
  distance: 300,
  callback: async () => {
    const [{ Slider }, { arrows, pagination }, { gsap }] = await Promise.all([
      import('@andresclua/sliderkit'),
      import('@andresclua/sliderkit-plugins'),
      import('gsap'),
    ])

    const slider = new Slider('#my-slider', {
      slidesPerPage: 3,
      loop: true,
      plugins: [arrows(), pagination({ type: 'dots' })],
    })

    slider.on('afterSlideChange', ({ index }) => {
      gsap.fromTo(slider.slides[index], { x: 30, opacity: 0 }, { x: 0, opacity: 1 })
    })
  },
})
```

---

## Common Patterns

### Fixed-width slides
```typescript
new Slider('#my-slider', {
  fixedWidth: 280,
  gutter: 16,
  loop: true,
})
```

### Natural-width slides (mixed widths)
```typescript
new Slider('#my-slider', {
  autoWidth: true,
  gutter: 12,
})
```

### Advance multiple slides per click
```typescript
new Slider('#my-slider', {
  slidesPerPage: 3,
  slideBy: 'page', // advances 3 at a time
  // or slideBy: 2  — advances 2 at a time
})
```

### Edge padding (peek effect)
```typescript
new Slider('#my-slider', {
  slidesPerPage: 1,
  edgePadding: 48, // adjacent slides peek 48px from each edge
  loop: true,
})
```

### Destroy & rebuild
```typescript
slider.destroy()
const fresh = slider.rebuild({ slidesPerPage: 2, gutter: 20 })
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build a single package
pnpm --filter @andresclua/sliderkit build

# Start playground dev server
pnpm dev

# Start docs dev server
pnpm docs
# or directly:
pnpm --filter sliderkit-docs dev
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
