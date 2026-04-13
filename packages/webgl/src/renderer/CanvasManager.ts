export class CanvasManager {
  canvas: HTMLCanvasElement
  private container: HTMLElement
  private autoCreated: boolean = false

  constructor(container: HTMLElement, existingCanvas?: HTMLCanvasElement | null) {
    this.container = container

    if (existingCanvas) {
      this.canvas = existingCanvas
    } else {
      this.autoCreated = true
      this.canvas = document.createElement('canvas')
      this.canvas.className = 'c--slider-a__canvas'
      container.insertBefore(this.canvas, container.firstChild)
    }
  }

  resize(dpr = 1): void {
    const { offsetWidth: w, offsetHeight: h } = this.container
    this.canvas.width = w * dpr
    this.canvas.height = h * dpr
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
  }

  destroy(): void {
    if (this.autoCreated) {
      this.canvas.remove()
    }
  }
}
