# Contributing to ACSlider

Thank you for your interest in contributing!

## Setup

```bash
git clone https://github.com/andresclua/acslider
cd acslider
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
| @acslider/core | <8kb |
| @acslider/plugins (all) | <12kb |
| @acslider/effects (each) | <1kb |
| @acslider/webgl | <20kb |
