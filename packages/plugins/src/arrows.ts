import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export interface ArrowsOptions {
  prevText?: string
  nextText?: string
  container?: HTMLElement | string | null
}

const SVG_PREV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
const SVG_NEXT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`

const CLS_ARROW    = 'sliderkit__arrow'
const CLS_PREV     = 'sliderkit__arrow--prev'
const CLS_NEXT     = 'sliderkit__arrow--next'
const CLS_DISABLED = 'sliderkit__arrow--disabled'

export function arrows(opts: ArrowsOptions = {}): SliderPlugin {
  let slider: SliderInstance
  let prevBtn: HTMLButtonElement
  let nextBtn: HTMLButtonElement

  function updateDisabled(): void {
    if (slider.options.loop) {
      prevBtn.classList.remove(CLS_DISABLED)
      nextBtn.classList.remove(CLS_DISABLED)
      return
    }
    if (slider.isBeginning) prevBtn.classList.add(CLS_DISABLED)
    else prevBtn.classList.remove(CLS_DISABLED)
    if (slider.isEnd) nextBtn.classList.add(CLS_DISABLED)
    else nextBtn.classList.remove(CLS_DISABLED)
  }

  const onPrev = () => slider.prev()
  const onNext = () => slider.next()

  return {
    name: 'arrows',

    install(s: SliderInstance): void {
      slider = s

      prevBtn = document.createElement('button')
      prevBtn.type = 'button'
      prevBtn.className = `${CLS_ARROW} ${CLS_PREV}`
      prevBtn.setAttribute('aria-label', 'Previous slide')
      prevBtn.innerHTML = opts.prevText ?? SVG_PREV

      nextBtn = document.createElement('button')
      nextBtn.type = 'button'
      nextBtn.className = `${CLS_ARROW} ${CLS_NEXT}`
      nextBtn.setAttribute('aria-label', 'Next slide')
      nextBtn.innerHTML = opts.nextText ?? SVG_NEXT

      const target = opts.container
        ? (typeof opts.container === 'string' ? document.querySelector<HTMLElement>(opts.container) : opts.container)
        : s.outerWrapper
      if (!target) return

      target.appendChild(prevBtn)
      target.appendChild(nextBtn)

      prevBtn.addEventListener('click', onPrev)
      nextBtn.addEventListener('click', onNext)

      updateDisabled()
      s.on('indexChanged', updateDisabled as (d: SliderInfo) => void)
      s.on('transitionEnd', updateDisabled as (d: SliderInfo) => void)
    },

    destroy(): void {
      prevBtn?.removeEventListener('click', onPrev)
      nextBtn?.removeEventListener('click', onNext)
      prevBtn?.remove()
      nextBtn?.remove()
    },
  }
}
