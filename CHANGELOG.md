# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Docs: `/docs/options` Responsive section now has one table of every option showing whether it works inside `responsive` (yes, load only, or no). Skill updated to match

## [2.4.1] - 2026-11-24

`@andresclua/sliderkit-plugins` 2.4.1.

### Fixed
- `arrows()` and `smooth()` read the effective `slider.loop`, so `loop` / `rewind` inside `responsive` disable the prev arrow and the wrap-around at the right widths. With a core older than 2.4.0 they fall back to `options.loop`

## [2.4.0] - 2026-11-24

`@andresclua/sliderkit` 2.4.0.

### Added
- `loop` and `rewind` can be set inside `responsive`, e.g. `responsive: { 1024: { items: 3, loop: false } }`. Crossing the breakpoint adds or removes the clones and keeps the same card, without animation; if that card does not exist without the loop the slider goes to the last valid position and emits `indexChanged`. Ignored with `edgePadding`, `fixedWidth`, `autoWidth` and effect or WebGL plugins (a warning is logged)
- Responsive demo: Loop by breakpoint

### Fixed
- `rewind: true` in the base options no longer forces `loop: false` for every breakpoint
- The base `transition-duration` of the track no longer takes the speed of whichever breakpoint was active when the stylesheet was built
- `loop` / `rewind` per breakpoint are also ignored at load with `edgePadding`, `fixedWidth`, `autoWidth` or an effect plugin, not only when crossing

### Changed
- New public `slider.loop` (effective loop at the current width, `rewind` forces `false`). `arrows()` and `smooth()` read it, falling back to `options.loop` with an older core. Needs a plugins release that depends on core 2.4.0
- Docs: `/docs/options` now lists what can and can't change per breakpoint (`plugins`, `overflow` and `peek` can't) with recipes; skill updated

## [2.3.0] - 2026-11-23

`@andresclua/sliderkit` 2.3.0.

### Added
- `peek` option (e.g. `peek: '20%'`) for `items: 1` sliders where the next card shows beside the active one. It narrows the outer, sets `overflow: 'visible'` and clips the slider's wrapper (restored on `destroy()`). Documented in options, styling, the skill and the homepage guide. New Peek Option demo

## [2.2.0] - 2026-11-23

`@andresclua/sliderkit` 2.2.0.

### Added
- `overflow: 'hidden' | 'visible'` option (default `'hidden'`). `'visible'` lets neighbouring cards show outside the slider for peek / centered layouts, without the `.sliderkit__overflow { overflow: visible }` CSS override. The Scaled Peek demos use it

## [2.1.8] - 2026-11-23

`@andresclua/sliderkit` 2.1.8.

### Fixed
- Loop: 2.1.7 only fixed the first step of the loop. The silent jump from a clone back to the real slides happened on the last clone, which has no card after it, so a card peeking beside the active one still popped in on the second step. The jump now happens one step earlier (like `edgePadding` already did) and the core makes enough clones for it (2 per side with `items: 1`). Only for loop sliders sized by `items`: `edgePadding`, `fixedWidth` and `autoWidth` keep their behaviour

### Changed
- Demos: `mouseDrag: true` in the two Scaled Peek examples, so they can be dragged on desktop

## [2.1.7] - 2026-11-20

`@andresclua/sliderkit` 2.1.7.

### Fixed
- Loop: with `items: 1` the core made a single clone per side, so a card peeking beside the active one (`overflow: visible`) had no neighbour while the slider sat on a clone, and appeared suddenly at the silent loop jump. The core now makes one more clone per side (2 with `items: 1`, always `items + 1` at least). Sliders with a peek, centred or scaled cards now wrap from the last card to the first without a pop

## [2.1.6] - 2026-11-20

`@andresclua/sliderkit` 2.1.6 (skill update only).

### Added
- Homepage: "Which setup do I need?" guide (what you want to build, what to use, which options) and the Claude Code skill download
- Skill: when to use `hooks()` vs `slider.on()`, peek and centred cards without a plugin (and why not `edgePadding`), arrows in their own row, and a "Scaled cards with arrows below" recipe

## [2.1.5] - 2026-11-20

`@andresclua/sliderkit` 2.1.5.

### Fixed
- Loop: a clone and its original card now share `sliderkit__item--active`. Before, going from the last card to the first one landed on the clone, then jumped silently to the original, which only then got the class. Any CSS transition on the active class (scale, opacity) ran twice. `aria-hidden`, `tabindex` and `inert` work as before

### Added
- Demos: "Centered Cards + Arrows" in `/demos/scaled-peek` (arrows in their own row below the slider) and "Fade & Rise + Arrows" at `/demos/fade-rise-arrows`

## [2.4.0] - 2026-11-02

`@andresclua/sliderkit-plugins` 2.4.0 · `@andresclua/sliderkit` 2.1.4 (skill update only).

### Added
- `marquee()`: `scrollBoost` option. It adds speed while the page scrolls (px/s per px/s of scroll, capped), then eases back. Off by default
- Demos: "Speeds up when you scroll" in `/demos/marquee` and "Scaled Peek" (active card full size, the next one smaller, all aligned to the base)

## [2.3.0] - 2026-10-26

`@andresclua/sliderkit-plugins` 2.3.0 · `@andresclua/sliderkit` 2.1.3 (skill update only).

### Added
- `marquee()` plugin: an endless strip that never stops, like the old `<marquee>` tag. `speed` in px/s, `direction`, `pauseOnHover`, `hoverSpeed` (eased speed-up or slow-down under the cursor), `pauseOnFocus` and `draggable` (drag either way, keeps its momentum, eases back to its own speed). Works with `autoWidth: true` for slides of different widths. Pauses off screen and does not start under `prefers-reduced-motion`
- Demos at `/demos/marquee` (pause, speed up on hover, draggable, images, images of different widths, wide and narrow slides, text ticker, logos, right to left) and docs at `/docs/plugins/marquee`
- The Claude Code skill covers `marquee()`

## [2.2.1] - 2026-10-22

`@andresclua/sliderkit` 2.1.2 (adds the Claude Code skill) · `-effects` and `-webgl` 2.0.1 (metadata only).

### Added
- Claude Code skill for SliderKit, shipped in `@andresclua/sliderkit` under `skills/sliderkit`.

### Fixed
- `-effects` README documented four effects that are not exported yet (`cube`, `coverflow`, `cards`, `creative`) and a class table that did not match the code.
- Removed `exports` and `files` entries pointing to folders that are never built (`./css/*` in all packages, `textures` and `src/scss` in `-webgl`).

## [2.2.0] - 2026-10-20

`@andresclua/sliderkit` 2.1.2 · `@andresclua/sliderkit-plugins` 2.2.0 (`-effects` and `-webgl` are unchanged).

### Added
- `smooth()` plugin: lerped drag with inertia, horizontal trackpad scroll, four presets (`smooth`, `snappy`, `floaty`, `free`), optional velocity skew, and an `onUpdate` hook with the live state (`velocity`, `position`, `progress`, `positions`, `dragging`). Exports `smoothPresets`
- Demos: `/demos/smooth` (basic, skew boilerplate, custom effect with `onUpdate`, presets) and docs at `/docs/plugins/smooth`
- Home page: smooth page scroll with Lenis (a dependency of the docs site only, not of the packages; off with `prefers-reduced-motion`)
- Home page: draggable slider with eight 3D characters (OBJ/MTL, raw WebGL, no dependencies) in a single canvas, layered between the DOM cards and a title layer. Hover wakes a character, a click makes it pop
- Initial monorepo setup
- `@andresclua/sliderkit` — slider engine with full TypeScript types
- `@andresclua/sliderkit-plugins` — pagination, autoplay, arrows, thumbnails, and more
- `@andresclua/sliderkit-effects` — CSS transition effects (fade, cube, coverflow, flip, cards, creative)
- `@andresclua/sliderkit-webgl` — WebGL renderer with displacement, rgb-shift, pixel-dissolve, parallax effects
- GSAP integration via event hooks
- Accessible by default (ARIA, keyboard nav, prefers-reduced-motion)
- SSR-safe (guards for window/document)
- pnpm monorepo with GitHub Actions CI/CD

### Fixed
- Docs: the production build failed in the sitemap step (`@astrojs/sitemap` 3.7 needs Astro 5); pinned to 3.2.1, which works with the Astro 4 the site uses
- Core: slider froze after the first move when a plugin disabled the track's CSS transition (all CSS effects), because `preventActionWhenRunning` never saw a `transitionend`
- Core/docs: vertical axis stacked slides in a row; the track is now a flex column
- `arrows`: visibility is recomputed on breakpoint change and uses the current item count
- `hooks`: `beforeChange` reports the real outgoing slide and `onResize` the active breakpoint

### Changed
- Docs site look: Space Grotesk (headlines) and DM Sans (body), self-hosted via fontsource; palette of dark green text, teal primary and dark-teal accent; Lucide line icons on the home feature cards. The eight home characters sit on cards from that palette. All docs-site dependencies: nothing changes in the published packages
- README and docs rewritten against the real API (`axis`, `responsive`, `loop` default `true`, flex layout, plugin options)
- Tests replaced: removed suites for modules that no longer exist, added `Events`, `arrows`, `hooks` and `smooth`
