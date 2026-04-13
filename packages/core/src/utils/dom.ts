export function qs<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T | null {
  return context.querySelector<T>(selector)
}

export function qsa<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T[] {
  return Array.from(context.querySelectorAll<T>(selector))
}

export function addClass(el: Element, ...classes: string[]): void {
  el.classList.add(...classes)
}

export function removeClass(el: Element, ...classes: string[]): void {
  el.classList.remove(...classes)
}

export function hasClass(el: Element, cls: string): boolean {
  return el.classList.contains(cls)
}

export function toggleClass(el: Element, cls: string, force?: boolean): void {
  el.classList.toggle(cls, force)
}

export function setAttr(el: Element, attr: string, value: string): void {
  el.setAttribute(attr, value)
}

export function removeAttr(el: Element, attr: string): void {
  el.removeAttribute(attr)
}

export function getAttr(el: Element, attr: string): string | null {
  return el.getAttribute(attr)
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  classes?: string[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (attrs) {
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  }
  if (classes?.length) {
    el.classList.add(...classes)
  }
  return el
}

export function insertAfter(newEl: Element, referenceEl: Element): void {
  referenceEl.parentNode?.insertBefore(newEl, referenceEl.nextSibling)
}

export function getChildren(parent: Element): HTMLElement[] {
  return Array.from(parent.children) as HTMLElement[]
}
