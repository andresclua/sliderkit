import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/core/vitest.config.ts',
  'packages/plugins/vitest.config.ts',
  'packages/effects/vitest.config.ts',
  'packages/webgl/vitest.config.ts',
])
