import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Slider } from '@andresclua/sliderkit'
import { arrows } from '../src/arrows'
import { hooks } from '../src/hooks'

function make(n: number): HTMLElement {
  const el = document.createElement('div')
  for (let i = 0; i < n; i++) el.appendChild(document.createElement('div'))
  document.body.appendChild(el)
  return el
}

describe('arrows', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  it('hides arrows when all slides fit', () => {
    const s = new Slider(make(2), { items: 2, loop: false, plugins: [arrows()] })
    const wrap = s.outerWrapper.querySelector<HTMLElement>('.sliderkit__arrows')!
    expect(wrap.style.display).toBe('none')
    s.destroy()
  })

  it('shows arrows when there are more slides than items', () => {
    const s = new Slider(make(5), { items: 1, loop: false, plugins: [arrows()] })
    const wrap = s.outerWrapper.querySelector<HTMLElement>('.sliderkit__arrows')!
    expect(wrap.style.display).toBe('')
    s.destroy()
  })

  it('wrapper:false appends buttons directly and destroy removes them', () => {
    const s = new Slider(make(5), { loop: false, plugins: [arrows({ wrapper: false })] })
    expect(s.outerWrapper.querySelector('.sliderkit__arrows')).toBeNull()
    expect(s.outerWrapper.querySelectorAll('button').length).toBe(2)
    s.destroy()
    expect(document.querySelectorAll('button').length).toBe(0)
  })
})

describe('hooks', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  it('beforeChange gets the previous slide as outgoing', () => {
    const beforeChange = vi.fn()
    const s = new Slider(make(5), { loop: false, speed: 0, plugins: [hooks({ beforeChange })] })
    s.goTo(2)
    const { outgoing, incoming, direction } = beforeChange.mock.calls[0]![0]
    expect(outgoing).toBe(s.slides[0])
    expect(incoming).toBe(s.slides[2])
    expect(direction).toBe('forward')
    s.destroy()
  })
})
