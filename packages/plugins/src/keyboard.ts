import type { SliderPlugin, SliderInstance } from '@andresclua/sliderkit'

export interface KeyboardOptions {
  focusable?: boolean  // add tabIndex="0" to the wrapper automatically (default true)
}

export function keyboard(opts: KeyboardOptions = {}): SliderPlugin {
  const focusable = opts.focusable ?? true

  let slider: SliderInstance

  const onKeydown = (e: Event): void => {
    const ke = e as KeyboardEvent
    const vertical = slider.options.axis === 'vertical'

    const prevKey = vertical ? 'ArrowUp'   : 'ArrowLeft'
    const nextKey = vertical ? 'ArrowDown'  : 'ArrowRight'

    if (ke.key === prevKey) { e.preventDefault(); slider.prev() }
    if (ke.key === nextKey) { e.preventDefault(); slider.next() }
  }

  return {
    name: 'keyboard',

    install(s: SliderInstance): void {
      slider = s
      if (focusable) s.outerWrapper.setAttribute('tabindex', '0')
      s.outerWrapper.addEventListener('keydown', onKeydown)
    },

    destroy(): void {
      slider.outerWrapper.removeAttribute('tabindex')
      slider.outerWrapper.removeEventListener('keydown', onKeydown)
    },
  }
}
