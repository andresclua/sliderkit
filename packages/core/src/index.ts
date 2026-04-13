// Main class
export { Slider } from './Slider'

// Version
export { VERSION } from './version'

// Types
export type { SliderOptions, BreakpointOptions, A11yOptions, Direction, PreventScrollOnTouch } from './types/options'
export type {
  SliderEventMap,
  SliderInstance,
  BeforeSlideChangePayload,
  AfterSlideChangePayload,
  ProgressPayload,
  BreakpointPayload,
  TouchPayload,
  TouchMovePayload,
  DragPayload,
  DragMovePayload,
  ResizePayload,
  DestroyPayload,
  InitPayload,
} from './types/events'
export type { SliderPlugin, PluginFactory } from './types/plugin'

// Utils (public)
export { logger } from './logger/Logger'
export { isBrowser, safeWindow, safeDocument, prefersReducedMotion } from './ssr/guards'
export { clamp, lerp, normalize } from './utils/math'
