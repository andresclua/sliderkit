/**
 * preloadImages — optional helper to await image decoding before
 * initializing a WebGL slider. WebGL textures require images to be
 * fully decoded before upload to the GPU; without this, the first
 * rendered frame may appear blank.
 *
 * @param target  CSS selector, HTMLElement, or array of elements to search within
 * @param selector  CSS selector for images inside each slide (default: 'img')
 */
export async function preloadImages(
  target: string | Element | Element[],
  selector = 'img',
): Promise<void> {
  const roots: Element[] = Array.isArray(target)
    ? target
    : [typeof target === 'string' ? document.querySelector(target)! : target]

  const imgs = roots
    .flatMap(root => [...root.querySelectorAll<HTMLImageElement>(selector)])
    .filter(img => img && img.src && !img.complete)

  await Promise.all(
    imgs.map(
      img =>
        new Promise<void>(resolve => {
          img.onload  = () => resolve()
          img.onerror = () => resolve() // fail silently — don't block the slider
        }),
    ),
  )
}
