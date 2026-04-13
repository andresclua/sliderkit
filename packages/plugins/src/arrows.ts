import type { SliderPlugin } from '@acslider/core'
import type { SliderInstance } from '@acslider/core'

export interface ArrowsOptions {
  prevEl?: string | HTMLElement
  nextEl?: string | HTMLElement
  prevLabel?: string
  nextLabel?: string
}

const SVG_PREV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`
const SVG_NEXT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`

export function arrows(options: ArrowsOptions = {}): SliderPlugin {
  const { prevLabel = 'Previous slide', nextLabel = 'Next slide' } = options

  let slider: SliderInstance | null = null
  let prevEl: HTMLElement | null = null
  let nextEl: HTMLElement | null = null
  let autoCreated = false

  function update(): void {
    if (!slider || !prevEl || !nextEl) return
    const info = slider.getInfo() as Record<string, unknown>
    const wraps = Boolean(info.loop) || Boolean(info.rewind)
    prevEl.classList.toggle('c--slider-a__arrow--disabled', slider.isBeginning && !wraps)
    nextEl.classList.toggle('c--slider-a__arrow--disabled', slider.isEnd && !wraps)
    ;(prevEl as HTMLButtonElement).disabled = slider.isBeginning && !wraps
    ;(nextEl as HTMLButtonElement).disabled = slider.isEnd && !wraps
  }

  function getOrCreate(
    opt: string | HTMLElement | undefined,
    dir: 'prev' | 'next',
    container: HTMLElement
  ): HTMLElement {
    if (opt) {
      const el = typeof opt === 'string' ? document.querySelector<HTMLElement>(opt) : opt
      if (el) return el
    }
    autoCreated = true
    const btn = document.createElement('button') as HTMLButtonElement
    btn.className = `c--slider-a__arrow c--slider-a__arrow--${dir}`
    btn.setAttribute('aria-label', dir === 'prev' ? prevLabel : nextLabel)
    btn.innerHTML = dir === 'prev' ? SVG_PREV : SVG_NEXT
    container.appendChild(btn)
    return btn
  }

  return {
    name: 'arrows',

    install(sliderInstance: SliderInstance) {
      slider = sliderInstance
      prevEl = getOrCreate(options.prevEl, 'prev', sliderInstance.container)
      nextEl = getOrCreate(options.nextEl, 'next', sliderInstance.container)

      prevEl.addEventListener('click', () => slider?.prev())
      nextEl.addEventListener('click', () => slider?.next())

      update()
      slider.on('afterSlideChange', update as () => void)
    },

    destroy() {
      slider?.off('afterSlideChange', update as () => void)
      if (autoCreated) {
        prevEl?.remove()
        nextEl?.remove()
      }
      slider = null
      prevEl = null
      nextEl = null
    },
  }
}
