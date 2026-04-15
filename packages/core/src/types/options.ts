import type { SliderPlugin } from './plugin'
import type { SliderEventMap } from './events'

export type Direction = 'horizontal' | 'vertical'
export type PreventScrollOnTouch = 'auto' | 'force' | false

export interface BreakpointOptions {
  slidesPerPage?: number | 'auto'
  gutter?: number
  edgePadding?: number
  direction?: Direction
  centered?: boolean
  loop?: boolean
  rewind?: boolean
  speed?: number
  grabCursor?: boolean
  touch?: boolean
  mouseDrag?: boolean
  swipeThreshold?: number
  swipeAngle?: number
  resistance?: boolean
  resistanceRatio?: number
  preventScrollOnTouch?: PreventScrollOnTouch
  disabled?: boolean
}

export interface A11yOptions {
  enabled?: boolean
  prevSlideMessage?: string
  nextSlideMessage?: string
  slideLabel?: string
}

export interface SliderOptions extends BreakpointOptions {
  // Layout
  slidesPerPage?: number | 'auto'
  gutter?: number
  edgePadding?: number
  direction?: Direction
  centered?: boolean
  fixedWidth?: number | false
  autoWidth?: boolean

  // Behavior
  loop?: boolean
  rewind?: boolean
  speed?: number
  slideBy?: number | 'page'
  grabCursor?: boolean
  startIndex?: number
  freezable?: boolean
  disabled?: boolean

  // Touch
  touch?: boolean
  mouseDrag?: boolean
  swipeThreshold?: number
  swipeAngle?: number
  resistance?: boolean
  resistanceRatio?: number
  preventScrollOnTouch?: PreventScrollOnTouch

  // Responsive
  breakpoints?: Record<number, BreakpointOptions>

  // A11y
  a11y?: A11yOptions

  // Plugins
  plugins?: SliderPlugin[]

  // Events on init
  on?: Partial<{
    [K in keyof SliderEventMap]: (payload: SliderEventMap[K]) => void
  }>
}

export const DEFAULT_OPTIONS: Required<
  Omit<SliderOptions, 'breakpoints' | 'a11y' | 'plugins' | 'on'>
> = {
  slidesPerPage: 1,
  gutter: 0,
  edgePadding: 0,
  direction: 'horizontal',
  centered: false,
  fixedWidth: false,
  autoWidth: false,
  loop: false,
  rewind: false,
  speed: 300,
  slideBy: 1,
  grabCursor: true,
  startIndex: 0,
  freezable: true,
  disabled: false,
  touch: true,
  mouseDrag: false,
  swipeThreshold: 50,
  swipeAngle: 15,
  resistance: true,
  resistanceRatio: 0.85,
  preventScrollOnTouch: 'auto',
}
