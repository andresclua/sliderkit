# SliderKit API reference

Contents: core options · instance API · plugins · effects · WebGL · smooth

## Core options (`new Slider(target, options)`)

`target` is a CSS selector or an element. Defaults below come from the source.

| Option | Type | Default | Notes |
|---|---|---|---|
| `axis` | `'horizontal' \| 'vertical'` | `'horizontal'` |  |
| `items` | `number` | `1` | Slides visible at once |
| `gutter` | `number` | `0` | px between slides |
| `edgePadding` | `number` | `0` | px of the neighbours peeking in at the edges |
| `fixedWidth` | `number \| false` | `false` | px width per slide, replaces `items` |
| `autoWidth` | `boolean` | `false` | Slides keep their own width |
| `viewportMax` | `number \| false` | `false` | Caps the viewport width used for sizing |
| `slideBy` | `number \| 'page'` | `1` | Slides moved per step |
| `center` | `boolean` | `false` | Centre the active slide |
| `loop` | `boolean` | `true` | Infinite loop (clones slides) |
| `rewind` | `boolean` | `false` | Jump back at the ends; use with `loop: false` |
| `autoHeight` | `boolean` | `false` | Container height follows the visible slides |
| `responsive` | `Record<number, Partial<SliderOptions>>` | `{}` | Keyed by min viewport width in px |
| `lazyload` | `boolean` | `false` | Lazy-load images |
| `touch` | `boolean` | `true` | Swipe on touch devices |
| `mouseDrag` | `boolean` | `false` | Drag with the mouse |
| `swipeAngle` | `number \| false` | `15` | Max angle (deg) for a swipe to count |
| `preventActionWhenRunning` | `boolean` | `true` | Ignore input while a transition runs |
| `preventScrollOnTouch` | `'auto' \| 'force' \| false` | `false` | |
| `freezable` | `boolean` | `true` | Disable the slider when all slides fit |
| `speed` | `number` | `300` | Transition ms |
| `arrowKeys` | `boolean` | `false` | Built-in document arrow-key navigation (prefer the `keyboard()` plugin) |
| `startIndex` | `number` | `0` | |
| `onInit` | `(info) => void \| false` | `false` | |
| `plugins` | `SliderPlugin[]` | `[]` | Plugins, effects and `webgl()` all go here |

## Instance (`SliderInstance`)

Properties: `container`, `outerWrapper`, `innerWrapper`, `slides` (includes loop clones), `activeIndex`, `slideCount`, `currentItems`, `isBeginning`, `isEnd`, `options`.

Methods: `goTo(n | 'next' | 'prev' | 'first' | 'last')`, `next()`, `prev()`, `getInfo()`, `destroy()`, `on(event, fn)`, `off(event, fn)`, `emit(event, data?)`.

`SliderInfo`: `container`, `slideItems`, `navContainer`, `items`, `slideBy`, `index`, `indexCached`, `displayIndex`, `slideCount`, `slideCountNew`, `cloneCount`, `isOn`, `event`.

Events: `beforeInit`, `afterInit`, `indexChanged`, `transitionStart`, `transitionEnd`, `resize`, `newBreakpointStart`, `newBreakpointEnd`, `beforeDestroy`, `afterDestroy`.

Custom plugin shape: `{ name: string, install(slider), destroy() }`, usually returned by a factory function.

## Plugins (`@andresclua/sliderkit-plugins`)

| Plugin | Options (default) |
|---|---|
| `arrows()` | `prevText`, `nextText` (inner HTML of the buttons, default SVG chevrons), `container` (element or selector to mount into), `wrapper` (default `true`, wraps both in `.sliderkit__arrows`) |
| `pagination()` | `type: 'dots' \| 'fraction' \| 'progress'` (`'dots'`), `clickable` (`true`), `container` |
| `autoplay()` | `delay` (`3000` ms), `pauseOnHover` (`true`), `pauseOnFocus` (`true`), `direction: 'forward' \| 'backward'` (`'forward'`) |
| `a11y()` | `containerLabel` (`'Image carousel'`), `slideLabel` template with `{{index}}` and `{{total}}` (`'{{index}} of {{total}}'`) |
| `keyboard()` | `focusable` (`true`, adds `tabindex="0"` to the wrapper) |
| `mouseWheel()` | `threshold` (`120`, accumulated deltaY per slide), `invert` (`false`) |
| `progress()` | `container` (selector or element) |
| `thumbs()` | `container` (required: element whose children are the thumbs), `activeClass` (`'sliderkit__thumb--active'`) |
| `hooks({...})` | `onInit({slides, slider})`, `beforeChange({outgoing, incoming, direction})`, `afterChange({slide, direction})`, `onDragStart`, `onDragEnd`, `onResize({breakpoint, items})`, `beforeDestroy` |
| `smooth()` | see below |

## Effects (`@andresclua/sliderkit-effects`)

Only three are exported: `fadeEffect`, `flipEffect`, `clipPathEffect`. The files for `cubeEffect`, `coverflowEffect`, `cardsEffect` and `creativeEffect` exist in the repo but are not exported yet, so don't suggest them. Effects inject their own CSS at runtime; use `items: 1`.

| Effect | Options (default) |
|---|---|
| `fadeEffect()` | `crossFade` (`true`), `duration` (slider `speed`), `easing` (`'ease'`), `adaptiveHeight` (set `true` only if you animate the container height yourself) |
| `flipEffect()` | `duration` (slider `speed`), `easing` (`'ease-in-out'`), `perspective` (`800` px) |
| `clipPathEffect()` | `shape`, `duration`, `easing`, `directionAware`. `shape` is a preset `'wipe-right' \| 'wipe-left' \| 'wipe-down' \| 'wipe-up' \| 'circle' \| 'diamond'`, a custom `{ hidden, visible, hiddenReverse? }` of `clip-path` values, or `{ forward, backward }` each being a preset or custom |

## WebGL (`@andresclua/sliderkit-webgl`)

```ts
const assets = await preloadWebGL({ slides: ['/a.jpg', '/b.jpg'], displacement: '/map.png' })
new Slider('#s', { items: 1, speed: 0, plugins: [webgl({ effect: 'displacement', assets })] })
```

`preloadWebGL({ slides: string[], displacement?: string })` returns `WebGLAssets` (`{ images, displacement? }`). `slides` are image URLs in DOM order.

`webgl()` options: `effect` (`'displacement' | 'rgb-shift' | 'radial' | 'custom'`, required), `assets` (required), `duration` (`900` ms), `intensity` (`0.08`), `easing` (`(t) => number`, cubic ease-in-out), `frag` (GLSL fragment source, required for `'custom'`), `uniforms` (`Record<string, number | number[] | () => unknown>`, injected each frame).

`displacement` needs a greyscale map; `rgb-shift` and `radial` do not. Keep `items: 1` and `speed: 0`.

## smooth()

Replaces the core's drag with a lerped position plus inertia. Always pass `touch: false, mouseDrag: false` to the slider. Horizontal only, no rubber-band at the ends.

Options: `preset` (`'smooth'` default, `'snappy'`, `'floaty'`, `'free'`), `lerp` (0–1 of the remaining distance per 60 fps frame), `inertia` (ms of release velocity projected forward, 0 = none), `snap` (settle on a slide), `maxFling` (max slides per fling), `dragSpeed` (1), `wheel` (`true`, horizontal wheel/trackpad), `wheelSpeed` (1), `snapDelay` (`140` ms), `dragThreshold` (`5` px; beyond it a drag doesn't produce a click), `skew` (`true` or `{ target, perSecond: 2.5, max: 14, ease: 0.2 }`), `onUpdate(plugin)`, `raf` (`false` to drive it with `plugin.tick(now)` from your own rAF loop).

Presets: `smooth` = lerp 0.1, inertia 350, snap; `snappy` = lerp 0.22, inertia 120, snap, maxFling 1; `floaty` = lerp 0.05, inertia 700, snap; `free` = lerp 0.08, inertia 900, no snap, maxFling 8. Explicit options override the preset. `smoothPresets` is exported.

The returned plugin also exposes `tick(now)`, `velocity` (eased, decays to 0), `position`, `progress`, `positions` (per-slide offsets; for slide `i`, `positions[i]` is about 0 when it is the current slide and wraps within `[-1, n-1)`), and `dragging`.
