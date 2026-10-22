# SliderKit recipes

Contents: responsive cards · thumbnails gallery · fade hero with autoplay · GSAP text on slide change · smooth drag with skew · custom visuals with onUpdate · WebGL image slider · React · Tiny Slider migration

All snippets assume the structural CSS from SKILL.md is already on the page.

## Responsive cards with arrows and dots

```ts
import { Slider } from '@andresclua/sliderkit'
import { arrows, pagination } from '@andresclua/sliderkit-plugins'

new Slider('#cards', {
  items: 1,
  gutter: 16,
  loop: false,
  mouseDrag: true,
  responsive: { 700: { items: 2 }, 1100: { items: 3 } },
  plugins: [arrows(), pagination({ type: 'dots' })],
})
```

## Gallery with a thumbnail strip

The thumbs plugin takes a container whose children are the thumbnails, one per slide.

```html
<div id="gallery"><div>…</div><div>…</div><div>…</div></div>
<div id="gallery-thumbs"><img src="a-small.jpg"><img src="b-small.jpg"><img src="c-small.jpg"></div>
```

```ts
import { thumbs } from '@andresclua/sliderkit-plugins'

new Slider('#gallery', {
  items: 1, loop: false, speed: 300,
  plugins: [thumbs({ container: '#gallery-thumbs' })],
})
```

Style the active thumb with `.sliderkit__thumb--active`. Keep `loop: false` here so thumb index and slide index stay aligned.

## Fade hero with autoplay and accessibility

```ts
import { arrows, pagination, autoplay, a11y, keyboard } from '@andresclua/sliderkit-plugins'
import { fadeEffect } from '@andresclua/sliderkit-effects'

new Slider('#hero', {
  items: 1, loop: true, speed: 600,
  plugins: [
    fadeEffect({ duration: 600, easing: 'ease-in-out' }),
    autoplay({ delay: 5000 }),
    arrows(),
    pagination({ type: 'dots', clickable: true }),
    a11y({ containerLabel: 'Featured stories', slideLabel: 'Story {{index}} of {{total}}' }),
    keyboard(),
  ],
})
```

Autoplay pauses on hover and focus by default. Keep `a11y()` and `keyboard()` in anything user-facing: they supply labels and arrow-key control.

## Animate text with GSAP when the slide changes

`beforeChange` fires with the incoming slide, which is the right moment to start an entrance animation. Pair it with `delay` so it begins as the fade does.

```ts
import gsap from 'gsap'
import { hooks } from '@andresclua/sliderkit-plugins'

hooks({
  onInit({ slides }) {
    gsap.from(slides[0].querySelectorAll('.title, .sub'), { y: 28, autoAlpha: 0, stagger: 0.1, clearProps: 'all' })
  },
  beforeChange({ incoming }) {
    gsap.from(incoming.querySelectorAll('.title, .sub'), { y: 28, autoAlpha: 0, stagger: 0.1, delay: 0.25, clearProps: 'all' })
  },
})
```

## Draggable with inertia and skew

```ts
import { arrows, smooth } from '@andresclua/sliderkit-plugins'

new Slider('#drag', {
  items: 1, loop: true,
  touch: false, mouseDrag: false,          // smooth() owns dragging
  responsive: { 700: { items: 2 }, 1100: { items: 3 } },
  plugins: [smooth({ preset: 'smooth', skew: { target: '.card' } }), arrows()],
})
```

Pick a feel with `preset`: `'snappy'` for tight, `'floaty'` for long glides, `'free'` for no snapping. Override any single value on top (`smooth({ preset: 'floaty', inertia: 400 })`).

## Your own visuals driven by the drag

`onUpdate` runs every frame while the slider moves and once more at rest. `velocity` is in slides per second and eases back to 0, so effects that read it never jump.

```ts
smooth({
  onUpdate(sm) {
    sm.positions.forEach((p, i) => {
      const el = cards[i]            // slides without the loop clones
      el.style.transform = `translateY(${Math.abs(p) * 24}px)`
    })
    title.style.letterSpacing = `${Math.min(Math.abs(sm.velocity), 3)}px`
  },
})
```

To draw on a `<canvas>` in the same frame, use `smooth({ raf: false })` and call `sm.tick(now)` at the top of your own `requestAnimationFrame` loop.

## WebGL image slider

```ts
import { arrows } from '@andresclua/sliderkit-plugins'
import { webgl, preloadWebGL } from '@andresclua/sliderkit-webgl'

const assets = await preloadWebGL({
  slides: ['/img/1.jpg', '/img/2.jpg', '/img/3.jpg'],
  displacement: '/img/displacement.png',      // only for effect: 'displacement'
})

new Slider('#gl', {
  items: 1, loop: true, speed: 0,             // the plugin owns the animation
  plugins: [arrows(), webgl({ effect: 'displacement', assets, duration: 900 })],
})
```

Use `'rgb-shift'` or `'radial'` when there is no displacement map. The slides in the DOM should be in the same order as the preloaded images.

## React

```tsx
import { useEffect, useRef } from 'react'
import { Slider } from '@andresclua/sliderkit'
import { arrows } from '@andresclua/sliderkit-plugins'

export function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const slider = new Slider(ref.current!, { items: 1, plugins: [arrows()] })
    return () => slider.destroy()
  }, [])
  return <div ref={ref}>{children}</div>
}
```

The library moves and clones DOM nodes, so render the slides once and don't let React re-render the children after init. Mount a fresh slider (change the component `key`) when the slide list changes.

## Migrating from Tiny Slider

SliderKit keeps Tiny Slider's engine, so layout options carry over by name: `items`, `gutter`, `edgePadding`, `fixedWidth`, `autoWidth`, `slideBy`, `center`, `loop`, `rewind`, `autoHeight`, `responsive`, `speed`, `startIndex`, `mouseDrag`, `touch`.

What changes:
- `tns({ container })` becomes `new Slider(selector, options)`.
- `controls` becomes the `arrows()` plugin, `nav` becomes `pagination()`, `autoplay` becomes the `autoplay()` plugin, `mode: 'gallery'` becomes a fade/flip/clip-path effect.
- `slider.goTo()`, `getInfo()`, `destroy()` exist with the same meaning. Events are `slider.on('indexChanged', fn)`.
- Classes are BEM: `sliderkit__outer`, `sliderkit__item`, `sliderkit__item--active`, not `tns-*`.
- `loop` defaults to `true`.
