# @andresclua/sliderkit-plugins

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-plugins?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit-plugins)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-plugins?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Plugins for **SliderKit** — arrows, pagination, autoplay, thumbs, progress, mouse wheel, keyboard, accessibility, and hooks.

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
import { arrows, pagination, autoplay } from '@andresclua/sliderkit-plugins'

new Slider('#my-slider', {
  items: 1,
  loop:  true,
  plugins: [
    arrows(),
    pagination({ type: 'dots' }),
    autoplay({ delay: 3000 }),
  ],
})
```

## Available plugins

### `arrows()`
Previous / next navigation buttons injected into `.sliderkit__outer`.

```typescript
arrows()
```

### `pagination()`
Dots, fraction, or progress-bar style pagination.

```typescript
pagination({
  type: 'dots',       // 'dots' | 'fraction' | 'progress'
  clickable: true,
})
```

### `autoplay()`
Auto-advance slides on a timer.

```typescript
autoplay({
  delay:          3000,
  pauseOnHover:   true,
  stopOnLastSlide: false,
})
```

### `thumbs()`
Thumbnail strip that syncs with the main slider.

```typescript
thumbs({ el: '#thumbs-container' })
```

### `progress()`
Animated progress bar that fills across the autoplay interval.

```typescript
progress({ el: '#progress-bar' })
```

### `mouseWheel()`
Navigate with the scroll wheel.

```typescript
mouseWheel()
```

### `keyboard()`
Navigate with arrow keys when the slider is focused.

```typescript
keyboard()
```

### `a11y()`
ARIA roles, live regions, and keyboard-accessible markup.

```typescript
a11y({
  prevSlideMessage: 'Previous slide',
  nextSlideMessage: 'Next slide',
})
```

### `hooks()`
Lifecycle callbacks: `beforeChange`, `afterChange`.

```typescript
hooks({
  beforeChange: ({ from, to }) => { /* … */ },
  afterChange:  ({ index })    => { /* … */ },
})
```

---

[Documentation](https://sliderkit.andresclua.com/docs/plugins) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
