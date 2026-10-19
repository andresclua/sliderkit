# @andresclua/sliderkit-plugins

[![npm version](https://img.shields.io/npm/v/@andresclua/sliderkit-plugins?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@andresclua/sliderkit-plugins)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@andresclua/sliderkit-plugins?style=flat-square&label=gzip)](https://bundlephobia.com/package/@andresclua/sliderkit-plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Plugins for **SliderKit** — arrows, pagination, autoplay, thumbs, progress, smooth drag, mouse wheel, keyboard, accessibility, and hooks.

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
  delay:        3000,
  pauseOnHover: true,
  pauseOnFocus: true,
  direction:    'forward',   // 'forward' | 'backward'
})
```

### `thumbs()`
Thumbnail strip that syncs with the main slider.

```typescript
thumbs({ container: '#thumbs-container' })
```

### `progress()`
Progress bar that fills as you advance through the slides.

```typescript
progress({ container: '#progress-bar' })
```

### `smooth()`
Smooth drag with lerp and inertia, horizontal trackpad scroll, presets, optional skew and an `onUpdate` hook for your own effects. Replaces the core drag, so set `touch: false, mouseDrag: false`.

```typescript
smooth({ preset: 'snappy' })                       // 'smooth' | 'snappy' | 'floaty' | 'free'
smooth({ preset: 'floaty', inertia: 1200, skew: true })

smooth({
  onUpdate(sm) {                                   // every frame it moves, and once more at rest
    sm.velocity     // slides/second, signed
    sm.position     // in slides
    sm.progress     // 0–1
    sm.positions[i] // per real slide: 0 = start of the viewport
    sm.dragging
  },
})
```

Options: `preset`, `lerp`, `inertia`, `snap`, `maxFling`, `dragSpeed`, `wheel`, `wheelSpeed`, `snapDelay`, `dragThreshold`, `skew`, `onUpdate`, `raf`. [Full reference →](https://sliderkit.andresclua.com/docs/plugins/smooth)

### `mouseWheel()`
Navigate with the scroll wheel, one slide per gesture. For smooth, continuous trackpad scroll see `smooth()`.

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
  containerLabel: 'Image carousel',
  slideLabel:     '{{index}} of {{total}}',
})
```

### `hooks()`
Lifecycle callbacks for custom animations (GSAP and friends).

```typescript
hooks({
  beforeChange: ({ outgoing, incoming, direction }) => { /* … */ },
  afterChange:  ({ slide, direction })              => { /* … */ },
})
```

---

[Documentation](https://sliderkit.andresclua.com/docs/plugins) · [GitHub](https://github.com/andresclua/sliderkit) · [MIT License](https://opensource.org/licenses/MIT)
