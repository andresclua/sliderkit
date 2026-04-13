# ACSlider

[![CI](https://github.com/andresclua/acslider/actions/workflows/ci.yml/badge.svg)](https://github.com/andresclua/acslider/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@acslider/core)](https://www.npmjs.com/package/@acslider/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red)](https://github.com/sponsors/andresclua)

A modern, accessible, TypeScript-first slider library with WebGL effects, CSS transitions, and a rich plugin system.

## Packages

| Package | Description | Size |
|---|---|---|
| [`@acslider/core`](packages/core) | Core slider engine | <8kb gzipped |
| [`@acslider/plugins`](packages/plugins) | UI plugins (pagination, arrows, autoplay…) | <12kb gzipped |
| [`@acslider/effects`](packages/effects) | CSS transition effects | <1kb each |
| [`@acslider/webgl`](packages/webgl) | WebGL renderer (OGL) + effects | <20kb gzipped |

## Quick Start

```bash
npm install @acslider/core @acslider/plugins
```

```typescript
import { Slider } from '@acslider/core'
import { pagination, autoplay, arrows } from '@acslider/plugins'
import '@acslider/core/css/slider.css'
import '@acslider/plugins/css/plugins.css'

const slider = new Slider(document.querySelector('[data-slider]'), {
  slidesPerPage: 3,
  gutter: 16,
  loop: true,
  plugins: [
    pagination({ type: 'dots' }),
    autoplay({ delay: 3000 }),
    arrows(),
  ],
})
```

## Documentation

Visit [slider.andresclua.com](https://slider.andresclua.com) for full documentation and demos.

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start playground
pnpm dev
```

## Support this project

If ACSlider is useful to you, consider [sponsoring the development](https://github.com/sponsors/andresclua).

## License

MIT © [Andres Clua](https://github.com/andresclua)
