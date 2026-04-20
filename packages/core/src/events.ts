type Handler = (...args: unknown[]) => void

export class Events {
  private _topics: Record<string, Handler[]> = {}

  on(name: string, fn: Handler): void {
    if (!this._topics[name]) this._topics[name] = []
    this._topics[name]!.push(fn)
  }

  off(name: string, fn: Handler): void {
    const list = this._topics[name]
    if (list) this._topics[name] = list.filter(f => f !== fn)
  }

  emit(name: string, ...args: unknown[]): void {
    const list = this._topics[name]
    if (list) list.slice().forEach(fn => fn(...args))
  }

  removeAll(): void {
    this._topics = {}
  }
}
