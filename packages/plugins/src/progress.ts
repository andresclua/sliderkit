import type { SliderPlugin, SliderInstance } from '@andresclua/sliderkit'

export interface ProgressOptions {
  container?: string | HTMLElement
}

export function progress(opts: ProgressOptions = {}): SliderPlugin {
  let slider:  SliderInstance
  let track:   HTMLElement
  let bar:     HTMLElement

  const update = (_info?: unknown) => {
    const total = slider.slideCount
    const pct   = total <= 1 ? 100 : ((slider.activeIndex + 1) / total) * 100
    bar.style.width = pct + '%'
  }

  return {
    name: 'progress',

    install(s: SliderInstance): void {
      slider = s

      track = document.createElement('div')
      bar   = document.createElement('div')

      track.className = 'sliderkit__progress'
      bar.className   = 'sliderkit__progress-bar'

      // structural styles inline so they work regardless of external CSS
      Object.assign(track.style, {
        position:     'relative',
        height:       '4px',
        background:   '#e2e8f0',
        borderRadius: '2px',
        marginTop:    '12px',
        overflow:     'hidden',
      })
      Object.assign(bar.style, {
        position:     'absolute',
        top:          '0',
        left:         '0',
        height:       '100%',
        width:        '0%',
        background:   '#6C2BD9',
        borderRadius: '2px',
        transition:   'width 0.3s ease',
      })

      track.appendChild(bar)

      const mountEl = opts.container
        ? (typeof opts.container === 'string'
            ? document.querySelector<HTMLElement>(opts.container)
            : opts.container)
        : null

      if (mountEl) {
        mountEl.appendChild(track)
      } else {
        s.outerWrapper.insertAdjacentElement('afterend', track)
      }

      update()
      s.on('indexChanged', update)
    },

    destroy(): void {
      slider.off('indexChanged', update)
      track.parentNode?.removeChild(track)
    },
  }
}
