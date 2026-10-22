---
name: sliderkit
description: How to build sliders and carousels with SliderKit (@andresclua/sliderkit, -plugins, -effects, -webgl), a small TypeScript slider library with a plugin system. Use this skill whenever the user wants a slider, carousel, swiper, gallery, testimonial rotator or hero slideshow in a project that uses or could use SliderKit, mentions `new Slider(`, `@andresclua/sliderkit`, `sliderkit__` classes, or asks for fade/flip/clip-path transitions, WebGL slide transitions, smooth drag with inertia, arrows, pagination dots, autoplay, thumbnails or keyboard/a11y support for a slider. Also use it when migrating from Tiny Slider, since SliderKit ports its engine but renames the API.
---

# SliderKit

SliderKit is a slider engine: a small core that does the sliding (a faithful TypeScript port of Tiny Slider 2.9.4) plus separate packages for everything optional. Knowing which package owns what is most of the job, because the options that older carousel libraries put in one big config object (arrows, dots, autoplay) are **plugins** here.

| Package | Owns |
|---|---|
| `@andresclua/sliderkit` | `Slider`, layout, loop/rewind, responsive breakpoints, touch, events |
| `@andresclua/sliderkit-plugins` | `arrows`, `pagination`, `autoplay`, `a11y`, `keyboard`, `mouseWheel`, `progress`, `thumbs`, `hooks`, `smooth` |
| `@andresclua/sliderkit-effects` | `fadeEffect`, `flipEffect`, `clipPathEffect` |
| `@andresclua/sliderkit-webgl` | `webgl` + `preloadWebGL` (GPU transitions) |

Install only what the task needs. `plugins`, `effects` and `webgl` all have the core as a peer dependency.

## Minimal setup

```html
<div id="my-slider">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>
```

```ts
import { Slider } from '@andresclua/sliderkit'
import { arrows, pagination } from '@andresclua/sliderkit-plugins'

const slider = new Slider('#my-slider', {
  items: 1,
  loop: true,
  speed: 300,
  plugins: [arrows(), pagination({ type: 'dots', clickable: true })],
})
```

Slides are the direct children of the container. The library wraps them in `.sliderkit__outer > .sliderkit__overflow` and adds `sliderkit`, `sliderkit--horizontal` (or `--vertical`) and `sliderkit__item` classes itself. It writes widths, gutters and transitions at runtime but **does not ship a theme**.

## The CSS is not optional

The slider will look broken without a few structural rules. Either import the Sass (`@andresclua/sliderkit/scss/slider.scss`, plus `@andresclua/sliderkit-plugins/scss/plugins.scss` for arrows/dots) or paste this:

```css
.sliderkit__outer { position: relative; box-sizing: border-box; }
.sliderkit__outer *, .sliderkit__outer *::before, .sliderkit__outer *::after { box-sizing: inherit; }
.sliderkit__overflow { overflow: hidden; position: relative; }
.sliderkit--horizontal { display: flex; touch-action: pan-y; }
.sliderkit--vertical   { display: flex; flex-direction: column; touch-action: pan-x; }
.sliderkit__item { flex-shrink: 0; position: relative; }
.sliderkit--vertical .sliderkit__item { width: 100%; }
/* aria-live announcements: without this the text shows on screen */
.sliderkit__live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0,0,0,0); border: 0; }
```

When a user says "my slider is stacked / not sliding / shows odd text", check this CSS first.

## Choosing the right tool

- **Plain sliding** (default) – core only.
- **Fade, flip or clip-path reveal** – an effect from `-effects`, passed in `plugins`. Use `items: 1`.
- **Image transitions with shaders** – `-webgl`. Requires `items: 1` and `speed: 0` because the plugin owns the animation, and images must be preloaded with `preloadWebGL()` first.
- **Draggable with lerp and inertia, trackpad scroll, skew while moving** – `smooth()`. Pass `touch: false, mouseDrag: false` so the core's own drag doesn't fight it. Horizontal only.
- **Run your own code on slide changes (GSAP, analytics)** – `hooks()` for lifecycle callbacks, or `slider.on('indexChanged', ...)`.
- **Drive visuals from drag velocity** – `smooth({ onUpdate })`, which runs every frame with `velocity`, `position`, `progress` and `positions[]`.

## Things that commonly go wrong

- **Options that don't exist.** There is no `nav`, `controls`, `autoplay` or `autoplayTimeout` option. Use `pagination()`, `arrows()` and `autoplay({ delay })`. Unknown options are silently ignored, so a wrong name just does nothing.
- **Defaults differ from what people expect.** `loop` is `true`, `touch` is `true`, `mouseDrag` is `false` (turn it on for desktop drag), `speed` is `300`, `items` is `1`.
- **Loop clones.** With `loop: true` the core clones slides, so `slider.slides` contains clones (class `sliderkit__item--clone`). Index by `slider.activeIndex` or `getInfo().displayIndex`, not by array position of `slides`.
- **Responsive** is an object keyed by min-width in px: `responsive: { 700: { items: 2 }, 1100: { items: 3 } }`. Values are partial options.
- **Rapid clicks are ignored** while a slide is moving (`preventActionWhenRunning`, default true). Set it to `false` only if the user explicitly wants queued input.
- **Cleanup.** Call `slider.destroy()` when the element is removed (SPA route change, framework unmount). Plugins are destroyed with it.
- **Frameworks.** Create the slider after the element is mounted (`useEffect`, `onMounted`, `onMount`) and destroy it on unmount. The library has no framework wrappers.

## Reading and controlling a slider

```ts
slider.next(); slider.prev(); slider.goTo(2)            // or 'first' | 'last'
slider.activeIndex; slider.slideCount; slider.isBeginning; slider.isEnd
slider.on('indexChanged', info => console.log(info.displayIndex))
```

Events: `beforeInit`, `afterInit`, `indexChanged`, `transitionStart`, `transitionEnd`, `resize`, `newBreakpointStart`, `newBreakpointEnd`, `beforeDestroy`, `afterDestroy`. Handlers receive a `SliderInfo` object.

## Where to look for details

- `references/api.md` – every option with its default and type, every plugin and effect option, WebGL options, smooth presets. Read it when you need an exact option name, a default, or a plugin's signature.
- `references/recipes.md` – complete working examples: responsive cards, thumbs gallery, fade hero with autoplay, WebGL image slider, smooth drag with skew, custom GSAP animation with `hooks`, and Tiny Slider migration. Read it when you're assembling a slider for a specific scenario.

If something in these files disagrees with the installed package's `.d.ts` types, trust the types: they are the source of truth for the version the user has.
