export interface SliderOptions {
  container?:                 string | HTMLElement
  mode?:                      'carousel'
  axis?:                      'horizontal' | 'vertical'
  items?:                     number
  gutter?:                    number
  edgePadding?:               number
  fixedWidth?:                number | false
  autoWidth?:                 boolean
  viewportMax?:               number | false
  slideBy?:                   number | 'page'
  center?:                    boolean
  loop?:                      boolean
  rewind?:                    boolean
  autoHeight?:                boolean
  responsive?:                Record<number, Partial<SliderOptions>>
  lazyload?:                  boolean
  touch?:                     boolean
  mouseDrag?:                 boolean
  overflow?:                  'hidden' | 'visible'
  peek?:                      string  // e.g. '20%': width kept free on the right for the next card to show
  swipeAngle?:                number | false
  preventActionWhenRunning?:  boolean
  preventScrollOnTouch?:      'auto' | 'force' | false
  freezable?:                 boolean
  speed?:                     number
  arrowKeys?:                 boolean
  startIndex?:                number
  onInit?:                    ((info: SliderInfo) => void) | false
  plugins?:                   SliderPlugin[]
}

export interface SliderInfo {
  container:      HTMLElement
  slideItems:     HTMLCollectionOf<Element>
  navContainer?:  HTMLElement | null
  items:          number
  slideBy:        number | 'page'
  index:          number
  indexCached:    number
  displayIndex:   number
  slideCount:     number
  slideCountNew:  number
  cloneCount:     number
  isOn:           boolean
  event?:         Event | Record<string, unknown> | undefined
}

export interface SliderPlugin {
  name:       string
  install(slider: SliderInstance): void
  destroy():  void
}

export type PluginFactory<T = Record<string, unknown>> = (options?: T) => SliderPlugin

export interface SliderInstance {
  container:    HTMLElement
  outerWrapper: HTMLElement
  innerWrapper: HTMLElement
  slides:       HTMLElement[]
  activeIndex:  number
  slideCount:   number
  currentItems: number
  isBeginning:  boolean
  isEnd:        boolean
  loop:         boolean   // effective loop at the current width (rewind forces false)
  options:      Required<SliderOptions>
  goTo(target: number | 'next' | 'prev' | 'first' | 'last'): void
  next():       void
  prev():       void
  getInfo():    SliderInfo
  destroy():    void
  on(event: string, fn: (data: SliderInfo) => void): void
  off(event: string, fn: (data: SliderInfo) => void): void
  emit(event: string, data?: SliderInfo): void
}

export type EventHandler = (data: SliderInfo) => void
