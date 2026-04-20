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
```

## Key options

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | `number` | `1` | Slides visible at once |
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
slider.getInfo()       // { index, displayIndex, slideCount, … }
slider.destroy()
```

## Events

```typescript
slider.on('indexChanged',    ({ displayIndex }) => { /* … */ })
slider.on('transitionStart', ({ displayIndex }) => { /* … */ })
slider.on('transitionEnd',   ({ displayIndex }) => { /* … */ })
slider.on('resize',          info => { /* … */ })
slider.on('afterInit',       info => { /* … */ })
slider.on('beforeDestroy',   info => { /* … */ })
```

## Optional packages

| Package | Description |
|---|---|
| [`@andresclua/sliderkit-plugins`](https://www.npmjs.com/package/@andresclua/sliderkit-plugins) | Arrows, pagination, autoplay, thumbs, and more |
| [`@andresclua/sliderkit-effects`](https://www.npmjs.com/package/@andresclua/sliderkit-effects) | CSS transition effects (fade, flip, clip-path…) |
| [`@andresclua/sliderkit-webgl`](https://www.npmjs.com/package/@andresclua/sliderkit-webgl) | GPU-powered WebGL transitions (displacement, rgb-shift, radial) |

---

[Documentation](https://sliderkit.andresclua.com) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
