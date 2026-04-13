import type { SliderInstance } from './events'

export type SliderPlugin = {
  name: string
  install(slider: SliderInstance): void
  destroy(): void
}

export type PluginFactory<T = Record<string, unknown>> = (options?: T) => SliderPlugin
