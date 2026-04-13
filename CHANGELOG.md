# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo setup
- `@acslider/core` — slider engine with full TypeScript types
- `@acslider/plugins` — pagination, autoplay, arrows, thumbnails, and more
- `@acslider/effects` — CSS transition effects (fade, cube, coverflow, flip, cards, creative)
- `@acslider/webgl` — WebGL renderer with displacement, rgb-shift, pixel-dissolve, parallax effects
- GSAP integration via event hooks
- Accessible by default (ARIA, keyboard nav, prefers-reduced-motion)
- SSR-safe (guards for window/document)
- pnpm monorepo with GitHub Actions CI/CD
