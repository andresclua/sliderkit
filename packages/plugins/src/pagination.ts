import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export type PaginationType = 'dots' | 'fraction' | 'progress' | 'dynamic' | 'custom'

export interface PaginationOptions {
  type?: PaginationType
  el?: string | HTMLElement
  clickable?: boolean
  dynamicBullets?: boolean
  renderCustom?: (payload: { current: number; total: number }) => string
}

export function pagination(options: PaginationOptions = {}): SliderPlugin {
  const { type = 'dots', clickable = true, dynamicBullets = false } = options

  let slider: SliderInstance | null = null
  let container: HTMLElement | null = null
  let autoCreated = false

  function getOrCreateContainer(sliderInstance: SliderInstance): HTMLElement {
    if (options.el) {
      const el =
        typeof options.el === 'string'
          ? sliderInstance.container.querySelector<HTMLElement>(options.el)
          : options.el
      if (el) return el
    }
    // Auto-create
    autoCreated = true
    const el = document.createElement('div')
    el.className = 'c--slider-a__pagination'
    sliderInstance.container.appendChild(el)
    return el
  }

  function render(): void {
    if (!slider || !container) return
    const { activeIndex, slideCount } = slider

    container.innerHTML = ''

    switch (type) {
      case 'dots':
      case 'dynamic': {
        for (let i = 0; i < slideCount; i++) {
          const bullet = document.createElement('button')
          bullet.className = 'c--slider-a__pagination-bullet'
          bullet.setAttribute('aria-label', `Go to slide ${i + 1}`)
          if (i === activeIndex) {
            bullet.classList.add('c--slider-a__pagination-bullet--active')
            bullet.setAttribute('aria-current', 'true')
          }
          if (dynamicBullets) {
            const distance = Math.abs(i - activeIndex)
            const scale = distance === 0 ? 1 : distance === 1 ? 0.7 : 0.4
            bullet.style.transform = `scale(${scale})`
          }
          if (clickable) {
            bullet.addEventListener('click', () => slider?.goTo(i))
          }
          container!.appendChild(bullet)
        }
        break
      }
      case 'fraction': {
        const span = document.createElement('span')
        span.className = 'c--slider-a__pagination-fraction'
        span.textContent = `${activeIndex + 1} / ${slideCount}`
        container.appendChild(span)
        break
      }
      case 'progress': {
        const bar = document.createElement('div')
        bar.className = 'c--slider-a__pagination-progress'
        const fill = document.createElement('div')
        fill.className = 'c--slider-a__pagination-progress-fill'
        fill.style.width = `${slider.progress * 100}%`
        bar.appendChild(fill)
        container.appendChild(bar)
        break
      }
      case 'custom': {
        if (options.renderCustom) {
          container.innerHTML = options.renderCustom({
            current: activeIndex + 1,
            total: slideCount,
          })
        }
        break
      }
    }
  }

  return {
    name: 'pagination',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      container = getOrCreateContainer(sliderInstance)
      render()

      slider.on('afterSlideChange', render as () => void)
    },

    destroy() {
      slider?.off('afterSlideChange', render as () => void)
      if (autoCreated && container) {
        container.remove()
      }
      slider = null
      container = null
    },
  }
}
