import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export type PaginationType = 'dots' | 'fraction' | 'progress'

export interface PaginationOptions {
  type?:      PaginationType
  clickable?: boolean
  container?: HTMLElement | string | null
}

const CLS_WRAP     = 'sliderkit__pagination'
const CLS_BULLET   = 'sliderkit__pagination-bullet'
const CLS_ACTIVE   = 'sliderkit__pagination-bullet--active'
const CLS_FRACTION = 'sliderkit__pagination-fraction'
const CLS_PROGRESS = 'sliderkit__pagination-progress'
const CLS_FILL     = 'sliderkit__pagination-progress-fill'

export function pagination(opts: PaginationOptions = {}): SliderPlugin {
  const type      = opts.type ?? 'dots'
  const clickable = opts.clickable ?? true
  let slider: SliderInstance
  let wrap: HTMLElement
  let bullets: HTMLButtonElement[] = []
  let fillEl: HTMLElement | null = null

  function getItems(): number {
    return Math.max(1, slider.currentItems)
  }

  function currentPage(): number {
    return Math.floor(slider.activeIndex / getItems())
  }

  function totalPages(): number {
    return Math.ceil(slider.slideCount / getItems())
  }

  function buildDots(): void {
    // clear old
    bullets.forEach(b => b.remove())
    bullets = []

    const total = totalPages()
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = CLS_BULLET
      btn.setAttribute('aria-label', `Go to slide ${i * getItems() + 1}`)
      if (clickable) {
        btn.addEventListener('click', () => slider.goTo(i * slider.currentItems))
      }
      wrap.appendChild(btn)
      bullets.push(btn)
    }
  }

  function update(): void {
    const page  = currentPage()
    const total = totalPages()

    if (type === 'dots') {
      bullets.forEach((b, i) => {
        if (i === page) b.classList.add(CLS_ACTIVE)
        else b.classList.remove(CLS_ACTIVE)
      })
    } else if (type === 'fraction') {
      wrap.textContent = `${slider.activeIndex + 1} / ${slider.slideCount}`
    } else if (type === 'progress') {
      const pct = total > 1 ? (page / (total - 1)) * 100 : 100
      if (fillEl) fillEl.style.width = pct + '%'
    }
  }

  function onBreakpoint(): void {
    if (type === 'dots') {
      buildDots()
    }
    update()
  }

  return {
    name: 'pagination',

    install(s: SliderInstance): void {
      slider = s

      wrap = document.createElement('div')
      wrap.className = CLS_WRAP

      if (type === 'progress') {
        const bar = document.createElement('div')
        bar.className = CLS_PROGRESS
        fillEl = document.createElement('div')
        fillEl.className = CLS_FILL
        bar.appendChild(fillEl)
        wrap.appendChild(bar)
      } else if (type === 'fraction') {
        wrap.classList.add(CLS_FRACTION)
      } else {
        buildDots()
      }

      const target = opts.container
        ? (typeof opts.container === 'string' ? document.querySelector<HTMLElement>(opts.container) : opts.container)
        : s.outerWrapper
      if (!target) return
      target.appendChild(wrap)

      update()
      s.on('indexChanged', update as (d: SliderInfo) => void)
      s.on('transitionEnd', update as (d: SliderInfo) => void)
      s.on('newBreakpointEnd', onBreakpoint as (d: SliderInfo) => void)
    },

    destroy(): void {
      wrap?.remove()
      bullets = []
      fillEl  = null
    },
  }
}
