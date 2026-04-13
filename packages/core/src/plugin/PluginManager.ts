import type { SliderPlugin } from '../types/plugin'
import type { SliderInstance } from '../types/events'
import { logger } from '../logger/Logger'

export class PluginManager {
  private plugins: Map<string, SliderPlugin> = new Map()
  private slider: SliderInstance

  constructor(slider: SliderInstance) {
    this.slider = slider
  }

  use(plugin: SliderPlugin): void {
    if (this.plugins.has(plugin.name)) {
      logger.warn(`Plugin "${plugin.name}" already registered. Skipping.`)
      return
    }
    this.plugins.set(plugin.name, plugin)
    plugin.install(this.slider)
  }

  get(name: string): SliderPlugin | undefined {
    return this.plugins.get(name)
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  getAll(): SliderPlugin[] {
    return Array.from(this.plugins.values())
  }

  getNames(): string[] {
    return Array.from(this.plugins.keys())
  }

  destroyAll(): void {
    this.plugins.forEach((plugin) => {
      try {
        plugin.destroy()
      } catch (err) {
        logger.warn(`Error destroying plugin "${plugin.name}".`, err)
      }
    })
    this.plugins.clear()
  }
}
