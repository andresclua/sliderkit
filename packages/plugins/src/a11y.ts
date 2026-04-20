import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'

export interface A11yOptions {
  // aria-label for the carousel region — describes what the carousel contains
  containerLabel?: string
  // Template for each slide's aria-label. Use {{index}} and {{total}}.
  slideLabel?: string
}

export function a11y(opts: A11yOptions = {}): SliderPlugin {
  const containerLabel = opts.containerLabel ?? 'Image carousel'
  const slideTemplate  = opts.slideLabel    ?? '{{index}} of {{total}}'

  let slider:     SliderInstance
  let realSlides: HTMLElement[] = []

  function slideLabel(index: number, total: number): string {
    return slideTemplate
      .replace('{{index}}', String(index))
      .replace('{{total}}', String(total))
  }

  function updateSlideLabels(): void {
    const total = slider.slideCount
    realSlides.forEach((slide, i) => {
      slide.setAttribute('aria-label', slideLabel(i + 1, total))
    })
  }

  return {
    name: 'a11y',

    install(s: SliderInstance): void {
      slider = s

      // ── Carousel region ──────────────────────────────────────────────────
      s.outerWrapper.setAttribute('role', 'region')
      s.outerWrapper.setAttribute('aria-label', containerLabel)
      s.outerWrapper.setAttribute('aria-roledescription', 'carousel')

      // ── Container: mark as the live rotating element ─────────────────────
      s.container.setAttribute('aria-live', 'off')   // announce via live region, not here

      // ── Slides: role="group" + roledescription + label ───────────────────
      // s.slides includes clones — filter to real slides only
      const cloneCount = (s.slides.length - s.slideCount) / 2
      realSlides = s.slides.slice(cloneCount, cloneCount + s.slideCount)

      realSlides.forEach((slide, i) => {
        slide.setAttribute('role', 'group')
        slide.setAttribute('aria-roledescription', 'slide')
        slide.setAttribute('aria-label', slideLabel(i + 1, s.slideCount))
      })

      // keep labels in sync when index changes (displayIndex updates)
      s.on('indexChanged', updateSlideLabels as (d: SliderInfo) => void)
    },

    destroy(): void {
      slider.outerWrapper.removeAttribute('role')
      slider.outerWrapper.removeAttribute('aria-label')
      slider.outerWrapper.removeAttribute('aria-roledescription')
      slider.container.removeAttribute('aria-live')

      realSlides.forEach(slide => {
        slide.removeAttribute('role')
        slide.removeAttribute('aria-roledescription')
        slide.removeAttribute('aria-label')
      })

      realSlides = []
    },
  }
}
