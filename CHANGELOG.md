# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `smooth()` plugin: lerped drag with inertia, horizontal trackpad scroll, four presets (`smooth`, `snappy`, `floaty`, `free`), optional velocity skew, and an `onUpdate` hook with the live state (`velocity`, `position`, `progress`, `positions`, `dragging`). Exports `smoothPresets`
- Demos: `/demos/smooth` (basic, skew boilerplate, custom effect with `onUpdate`, presets) and docs at `/docs/plugins/smooth`
- Home page: draggable slider with WebGL shapes in a single canvas, layered between the DOM cards and a text layer
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
- Core: slider froze after the first move when a plugin disabled the track's CSS transition (all CSS effects), because `preventActionWhenRunning` never saw a `transitionend`
- Core/docs: vertical axis stacked slides in a row; the track is now a flex column
- `arrows`: visibility is recomputed on breakpoint change and uses the current item count
- `hooks`: `beforeChange` reports the real outgoing slide and `onResize` the active breakpoint

### Changed
- README and docs rewritten against the real API (`axis`, `responsive`, `loop` default `true`, flex layout, plugin options)
- Tests replaced: removed suites for modules that no longer exist, added `Events`, `arrows`, `hooks` and `smooth`
