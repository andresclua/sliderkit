# @andresclua/sliderkit

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

The core engine for **SliderKit** — a modern, accessible, TypeScript-first slider library with touch support, responsive breakpoints, loop cloning, and a plugin system.

**[Full documentation & demos →](https://sliderkit.andresclua.com)**

---

## Installation

```bash
npm install @andresclua/sliderkit
# or
pnpm add @andresclua/sliderkit
# or
yarn add @andresclua/sliderkit
```

## Quick start

```html
<div class="c--slider-a" id="my-slider">
  <div class="c--slider-a__wrapper">
    <div class="c--slider-a__item" data-slide>Slide 1</div>
    <div class="c--slider-a__item" data-slide>Slide 2</div>
    <div class="c--slider-a__item" data-slide>Slide 3</div>
  </div>
</div>
```

```css
.c--slider-a          { position: relative; width: 100%; overflow: hidden; }
.c--slider-a__wrapper { display: flex; will-change: transform; }
.c--slider-a__item    { flex-shrink: 0; }
```

```typescript
import { Slider } from '@andresclua/sliderkit'

const slider = new Slider('#my-slider', {
  slidesPerPage: 1,
  loop: true,
  speed: 400,
})
```

## Key options

| Option | Type | Default | Description |
|---|---|---|---|
| `slidesPerPage` | `number` | `1` | Slides visible at once |
| `loop` | `boolean` | `false` | Infinite seamless loop |
| `speed` | `number` | `300` | Transition duration in ms |
| `gutter` | `number` | `0` | Gap between slides in px |
| `edgePadding` | `number` | `0` | Peek amount on each side |
| `autoWidth` | `boolean` | `false` | Use each slide's natural width |
| `fixedWidth` | `number\|false` | `false` | Fixed pixel width per slide |
| `touch` | `boolean` | `true` | Enable touch swipe |
| `mouseDrag` | `boolean` | `false` | Enable mouse drag |
| `breakpoints` | `object` | `{}` | Responsive option overrides |

## Methods

```typescript
slider.goTo(2)         // go to index
slider.next()
slider.prev()
slider.update()        // recalculate layout
slider.getInfo()       // { index, slidesPerPage, slideCount, … }
slider.destroy()
slider.rebuild({ slidesPerPage: 2 })
```

## Events

```typescript
slider.on('afterSlideChange', ({ index }) => { /* … */ })
slider.on('resize', ({ width, slidesPerPage }) => { /* … */ })
slider.on('afterInit', ({ slider }) => { /* … */ })
```

## Optional packages

| Package | Description |
|---|---|
| [`@andresclua/sliderkit-plugins`](https://www.npmjs.com/package/@andresclua/sliderkit-plugins) | Arrows, pagination, autoplay, thumbnails, and more |
| [`@andresclua/sliderkit-effects`](https://www.npmjs.com/package/@andresclua/sliderkit-effects) | CSS transition effects (fade, cube, flip, cards…) |
| [`@andresclua/sliderkit-webgl`](https://www.npmjs.com/package/@andresclua/sliderkit-webgl) | WebGL effects via OGL (displacement, rgb-shift…) |

---

[Documentation](https://sliderkit.andresclua.com) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
