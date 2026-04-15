# @andresclua/sliderkit-plugins

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-plugins?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit-plugins)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-plugins?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

UI plugins for **SliderKit** — arrows, pagination, autoplay, thumbnails, progress bar, lazy load, parallax, and more.

**[Full documentation & demos →](https://sliderkit.andresclua.com/docs/plugins)**

---

## Installation

```bash
npm install @andresclua/sliderkit @andresclua/sliderkit-plugins
# or
pnpm add @andresclua/sliderkit @andresclua/sliderkit-plugins
```

## Usage

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
  parallax,
  autoHeight,
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

## Available plugins

### `arrows()`
Previous / next navigation buttons.
```typescript
arrows({
  prevEl: '.my-prev', // custom selector or element
  nextEl: '.my-next',
})
```

### `pagination()`
Dots, fractions, progress bar, dynamic, or fully custom.
```typescript
pagination({
  type: 'dots',          // 'dots' | 'fraction' | 'progress' | 'dynamic' | 'custom'
  clickable: true,
  renderBullet: (i, cls) => `<span class="${cls}">${i + 1}</span>`,
})
```

### `autoplay()`
Auto-advance slides on a timer.
```typescript
autoplay({
  delay: 3000,
  pauseOnHover: true,
  pauseOnInteraction: true,
  disableOnInteraction: false,
})
```

### `thumbnails()`
Sync a secondary slider or thumbnail strip.
```typescript
thumbnails({ el: '#thumbs', slideEl: '.thumb' })
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
Navigate with the scroll wheel.
```typescript
mouseWheel({ sensitivity: 1, releaseOnEdges: true })
```

### `lazyLoad()`
Load images only when they enter the viewport.
```typescript
lazyLoad({ selector: '.lazy', preloadPrev: 1, preloadNext: 2 })
```

### `parallax()`
Move child elements at a different speed. Add `data-parallax-speed` to any child.
```typescript
parallax()
```

### `autoHeight()`
Animate the container height to match the active slide.
```typescript
autoHeight({ transition: 300 })
```

---

[Documentation](https://sliderkit.andresclua.com/docs/plugins) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
