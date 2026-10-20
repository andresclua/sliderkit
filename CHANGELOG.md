# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
