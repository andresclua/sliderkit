# Contributing to SliderKit

Thank you for your interest in contributing!

## Reporting a bug

Found something broken? [Open a bug report](https://github.com/andresclua/sliderkit/issues/new/choose) — the form will guide you through the details we need to reproduce and fix it quickly.

## Setup

```bash
git clone https://github.com/andresclua/sliderkit
cd sliderkit
pnpm install
```

## Development workflow

```bash
pnpm dev        # Start playground
pnpm test       # Run all tests
pnpm lint       # Lint all packages
pnpm typecheck  # Type-check all packages
pnpm build      # Build all packages
```

## Pull Request guidelines

- Target the `main` branch
- Include tests for new features
- Run `pnpm lint && pnpm typecheck && pnpm test` before submitting
- Follow the existing code style (Prettier + ESLint)
- Keep bundle size in mind — check targets in the plan

## Commit convention

```
feat: add new feature
fix: fix a bug
docs: documentation changes
test: add or update tests
refactor: code refactoring without feature changes
chore: build process or auxiliary tool changes
```

## Bundle size targets

| Package | Target (gzipped) |
|---|---|
| @andresclua/sliderkit | <8kb |
| @andresclua/sliderkit-plugins (all) | <12kb |
| @andresclua/sliderkit-effects (each) | <1kb |
| @andresclua/sliderkit-webgl | <20kb |
