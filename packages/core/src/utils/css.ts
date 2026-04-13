export function setStyle(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(el.style, styles)
}

export function clearStyle(el: HTMLElement, ...props: (keyof CSSStyleDeclaration)[]): void {
  props.forEach((prop) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(el.style as any)[prop] = ''
  })
}

export function getTranslateX(el: HTMLElement): number {
  const transform = window.getComputedStyle(el).transform
  if (!transform || transform === 'none') return 0
  const matrix = new DOMMatrix(transform)
  return matrix.m41
}

export function getTranslateY(el: HTMLElement): number {
  const transform = window.getComputedStyle(el).transform
  if (!transform || transform === 'none') return 0
  const matrix = new DOMMatrix(transform)
  return matrix.m42
}

export function setTranslate(el: HTMLElement, x: number, y: number): void {
  el.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

export function setTransition(el: HTMLElement, duration: number, easing = 'ease'): void {
  el.style.transition = duration > 0 ? `transform ${duration}ms ${easing}` : ''
}
