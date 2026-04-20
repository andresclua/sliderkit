// DOM helpers — faithful port of Tiny Slider helpers

export function addClass(el: Element, cls: string): void {
  el.classList.add(cls)
}

export function removeClass(el: Element, cls: string): void {
  el.classList.remove(cls)
}

export function hasClass(el: Element, cls: string): boolean {
  return el.classList.contains(cls)
}

export function setAttrs(el: Element | Element[], attrs: Record<string, string>): void {
  const els = Array.isArray(el) ? el : [el]
  els.forEach(e => Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)))
}

export function removeAttrs(el: Element, attrs: string | string[]): void {
  const list = Array.isArray(attrs) ? attrs : [attrs]
  list.forEach(a => el.removeAttribute(a))
}

export function hasAttr(el: Element, attr: string): boolean {
  return el.hasAttribute(attr)
}

export function getAttr(el: Element, attr: string): string | null {
  return el.getAttribute(attr)
}

export function addEvents(
  el: Element | Document | Window,
  events: Record<string, EventListenerOrEventListenerObject>,
  passive?: 'auto' | 'force' | false
): void {
  const opts: AddEventListenerOptions = {}
  if (passive === 'force') opts.passive = false
  Object.entries(events).forEach(([ev, fn]) =>
    el.addEventListener(ev, fn, Object.keys(opts).length ? opts : undefined)
  )
}

export function removeEvents(
  el: Element | Document | Window,
  events: Record<string, EventListenerOrEventListenerObject>
): void {
  Object.entries(events).forEach(([ev, fn]) => el.removeEventListener(ev, fn))
}

export function isVisible(el: HTMLElement): boolean {
  return !!el.offsetParent
}

export function getClientWidth(el: HTMLElement | null): number {
  if (!el) return 0
  const div = document.createElement('div')
  el.appendChild(div)
  const rect = div.getBoundingClientRect()
  const width = rect.right - rect.left
  div.remove()
  return width || getClientWidth(el.parentElement)
}

export function getWindowWidth(): number {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
}

let _idCounter = 0
export function getSlideId(): string {
  return 'sk-' + (++_idCounter)
}

export function toDegree(y: number, x: number): number {
  return Math.atan2(y, x) * (180 / Math.PI)
}

export function getTouchDirection(angle: number, range: number): string {
  const gap = Math.abs(90 - Math.abs(angle))
  if (gap >= 90 - range) return 'horizontal'
  if (gap <= range) return 'vertical'
  return ''
}

export const raf = window.requestAnimationFrame.bind(window)
export const caf = window.cancelAnimationFrame.bind(window)

export function extend<T extends object>(a: T, b: Partial<T>): T {
  const result = { ...a }
  Object.keys(b).forEach(k => {
    if ((b as Record<string, unknown>)[k] !== undefined)
      (result as Record<string, unknown>)[k] = (b as Record<string, unknown>)[k]
  })
  return result
}
