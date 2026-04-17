/**
 * SliderKit — faithful TypeScript port of Tiny Slider 2.9.4
 * Carousel mode only. BEM class names. Modern browsers (no IE).
 *
 * Hardcoded modern-browser constants:
 *   TRANSFORM            = 'transform'
 *   HAS3DTRANSFORMS      = true
 *   PERCENTAGELAYOUT     = true
 *   CSSMQ                = true
 *   TRANSITIONDURATION   = 'transitionDuration'
 *   CALC                 = 'calc'
 */

import { Events } from './events'
import {
  addClass, removeClass, hasClass,
  setAttrs, removeAttrs,
  addEvents, removeEvents,
  getClientWidth, getWindowWidth, getSlideId,
  toDegree, getTouchDirection, raf, caf,
  isVisible,
} from './utils'
import type { SliderOptions, SliderInfo, SliderPlugin, SliderInstance } from './types'

// ── Hardcoded modern-browser feature flags ───────────────────────────────────
const TRANSFORM           = 'transform'
const HAS3DTRANSFORMS     = true
// PERCENTAGELAYOUT = true — slides are inline-block (used in initSheet logic)
const CSSMQ               = true
const TRANSITIONDURATION  = 'transitionDuration'
const CALC                = 'calc'

// ── CSS class constants ──────────────────────────────────────────────────────
const CLS = {
  OUTER:      'c--slider-a__outer',
  OVERFLOW:   'c--slider-a__overflow',
  INNER:      'c--slider-a__inner',
  SLIDER:     'c--slider-a',
  HORIZONTAL: 'c--slider-a--horizontal',
  VERTICAL:   'c--slider-a--vertical',
  ITEM:       'c--slider-a__item',
  ACTIVE:     'c--slider-a__item--active',
  CLONE:      'c--slider-a__item--clone',
  LIVE:       'c--slider-a__live',
  VHIDE:      'c--slider-a__visually-hidden',
  FROZEN:     'c--slider-a--frozen',
  AUTOHEIGHT: 'c--slider-a--ah',
  VPFIX:      'c--slider-a--vpfix',
} as const

// ── Defaults — mirror Tiny Slider defaults ───────────────────────────────────
const DEFAULTS: Required<SliderOptions> = {
  container:                '.slider',
  mode:                     'carousel',
  axis:                     'horizontal',
  items:                    1,
  gutter:                   0,
  edgePadding:              0,
  fixedWidth:               false,
  autoWidth:                false,
  viewportMax:              false,
  slideBy:                  1,
  center:                   false,
  loop:                     true,
  rewind:                   false,
  autoHeight:               false,
  responsive:               {},
  lazyload:                 false,
  touch:                    true,
  mouseDrag:                false,
  swipeAngle:               15,
  preventActionWhenRunning: false,
  preventScrollOnTouch:     false,
  freezable:                true,
  speed:                    300,
  arrowKeys:                false,
  startIndex:               0,
  onInit:                   false,
  plugins:                  [],
}

// ════════════════════════════════════════════════════════════════════════════
export class Slider implements SliderInstance {

  // ── Public (SliderInstance) ──────────────────────────────────────────────
  container!:    HTMLElement
  outerWrapper!: HTMLElement
  innerWrapper!: HTMLElement
  slides!:       HTMLElement[]
  activeIndex:   number = 0
  slideCount!:   number
  isBeginning:   boolean = true
  isEnd:         boolean = false
  options!:      Required<SliderOptions>

  // ── Private DOM ──────────────────────────────────────────────────────────
  private middleWrapper: HTMLElement | null = null
  private _liveregionCurrent: HTMLElement | null = null

  // ── Private state — direct ports of tns() vars ───────────────────────────
  private horizontal!:                boolean
  private containerParent!:           HTMLElement | null
  private slideItems!:                HTMLCollectionOf<Element>
  private slideCount_!:               number        // alias — same as this.slideCount
  private breakpointZone:             number = 0
  private windowWidth:                number = 0
  private isOn:                       boolean = false

  private autoWidth:                  boolean = false
  private fixedWidth:                 number | false = false
  private edgePadding:                number = 0
  private gutter:                     number = 0
  private viewport:                   number = 0
  private center:                     boolean = false
  private items:                      number = 1
  private slideBy:                    number | 'page' = 1
  private viewportMax:                number | false = false
  private arrowKeys:                  boolean = false
  private speed:                      number = 300
  private rewind:                     boolean = false
  private loop:                       boolean = true
  private autoHeight:                 boolean = false
  private touch:                      boolean = true
  private mouseDrag:                  boolean = false
  private swipeAngle:                 number | false = 15
  private preventScrollOnTouch:       'auto' | 'force' | false = false
  private preventActionWhenRunning:   boolean = false
  private freezable:                  boolean = true

  // ── Transform strings (hardcoded for 3D) ─────────────────────────────────
  private transformAttr:   string = 'left'
  private transformPrefix: string = ''
  private transformPostfix: string = ''

  // ── Index/count ──────────────────────────────────────────────────────────
  private cloneCount:               number = 0
  private slideCountNew:            number = 0
  private hasRightDeadZone:         boolean = false
  private rightBoundary:            number = 0
  private updateIndexBeforeTransform: boolean = true
  private index!:                   number
  private indexCached!:             number
  private indexMin:                 number = 0
  private indexMax:                 number = 0
  private slidePositions:           number[] = []

  // ── CSS sheet ────────────────────────────────────────────────────────────
  private sheet!:                   CSSStyleSheet
  private slideId!:                 string
  private newContainerClasses:      string = ''

  // ── State flags ──────────────────────────────────────────────────────────
  private running:                  boolean = false
  private freeze:                   boolean = false
  private frozen:                   boolean = false
  private disable:                  boolean = false
  private disabled:                 boolean = false
  private lazyload:                 boolean = false
  private imgsComplete:             boolean = false

  // ── Touch/drag state ─────────────────────────────────────────────────────
  private initPosition:             { x: number; y: number } = { x: 0, y: 0 }
  private lastPosition:             { x: number; y: number } = { x: 0, y: 0 }
  private translateInit:            number = 0
  private panStart:                 boolean = false
  private rafIndex:                 number | null = null
  private moveDirectionExpected:    boolean | '?' = '?'
  private preventScroll:            boolean = false

  // ── Responsive ───────────────────────────────────────────────────────────
  private responsive!: Record<number, Partial<SliderOptions>>

  // ── Event bus / plugins ──────────────────────────────────────────────────
  private events!:   Events
  private _plugins!: SliderPlugin[]

  // ── Event handler maps for removal ───────────────────────────────────────
  private touchEvents:   Record<string, EventListenerOrEventListenerObject> = {}
  private dragEvents:    Record<string, EventListenerOrEventListenerObject> = {}
  private docmentKeydownEvent: Record<string, EventListenerOrEventListenerObject> = {}
  private resizeEvent:   Record<string, EventListenerOrEventListenerObject> = {}
  private transitionEvent: Record<string, EventListenerOrEventListenerObject> = {}

  // ════════════════════════════════════════════════════════════════════════
  constructor(target: string | HTMLElement, userOptions: SliderOptions = {}) {
    // ── Resolve + merge options ────────────────────────────────────────────
    const rawOptions: SliderOptions = { ...DEFAULTS, ...userOptions }

    // resolve container selector
    let containerEl: HTMLElement | null
    if (typeof rawOptions.container === 'string') {
      containerEl = document.querySelector<HTMLElement>(rawOptions.container)
    } else {
      containerEl = (rawOptions.container as HTMLElement) || null
    }

    // Allow target override
    if (typeof target === 'string') {
      containerEl = document.querySelector<HTMLElement>(target) ?? containerEl
    } else if (target instanceof HTMLElement) {
      containerEl = target
    }

    if (!containerEl || containerEl.children.length < 1) {
      console.warn('SliderKit: container not found or has no children')
      return
    }

    this.options = rawOptions as Required<SliderOptions>

    // rewind implies no loop
    if (this.options.rewind) this.options.loop = false

    this.events   = new Events()
    this._plugins = this.options.plugins ?? []

    const doc = document

    // ── Core vars (mirrors Tiny Slider) ───────────────────────────────────
    this.horizontal = this.options.axis === 'horizontal'
    const outerWrapper = doc.createElement('div')
    const innerWrapper = doc.createElement('div')
    this.container       = containerEl
    this.containerParent = containerEl.parentNode as HTMLElement | null
    this.slideItems      = containerEl.children as HTMLCollectionOf<Element>
    this.slideCount_     = this.slideItems.length
    this.slideCount      = this.slideCount_
    this.windowWidth     = getWindowWidth()

    // Process responsive: merge breakpoint 0 into base options
    let responsive = this.options.responsive ?? {}
    if (responsive && 0 in responsive) {
      Object.assign(this.options, responsive[0])
      delete (responsive as Record<number, unknown>)[0]
    }
    // Normalize responsive values: allow `300: 2` => `300: { items: 2 }`
    const responsiveTem: Record<number, Partial<SliderOptions>> = {}
    for (const bp in responsive) {
      const val = (responsive as Record<string, unknown>)[bp]
      responsiveTem[parseInt(bp)] = typeof val === 'number' ? { items: val as number } : (val as Partial<SliderOptions>)
    }
    this.responsive = responsiveTem

    if (this.responsive) { this.setBreakpointZone() }

    // add vpfix (removed after structure init)
    addClass(this.container, CLS.VPFIX)

    // ── Compute current responsive values ─────────────────────────────────
    this.autoWidth    = this.options.autoWidth
    this.fixedWidth   = this.getOption('fixedWidth') as number | false
    this.edgePadding  = this.getOption('edgePadding') as number
    this.gutter       = this.getOption('gutter') as number
    this.viewport     = this.getViewportWidth()
    this.center       = this.getOption('center') as boolean
    this.items        = !this.autoWidth
      ? Math.floor(this.getOption('items') as number)
      : 1
    this.slideBy      = this.getOption('slideBy') as number | 'page'
    this.viewportMax  = this.options.viewportMax || false
    this.arrowKeys    = this.getOption('arrowKeys') as boolean
    this.speed        = this.getOption('speed') as number
    this.rewind       = this.options.rewind
    this.loop         = this.rewind ? false : this.options.loop
    this.autoHeight   = this.getOption('autoHeight') as boolean
    this.touch        = this.getOption('touch') as boolean
    this.mouseDrag    = this.getOption('mouseDrag') as boolean
    this.lazyload     = this.options.lazyload
    this.freezable    = this.options.freezable
    this.swipeAngle   = this.options.swipeAngle
    this.moveDirectionExpected = this.swipeAngle ? '?' : true
    this.preventScrollOnTouch = this.options.preventScrollOnTouch
    this.preventActionWhenRunning = this.options.preventActionWhenRunning
    this.preventScroll = this.options.preventScrollOnTouch === 'force' ? true : false

    // ── Stylesheet ────────────────────────────────────────────────────────
    const styleEl = doc.createElement('style')
    doc.head.appendChild(styleEl)
    this.sheet = styleEl.sheet as CSSStyleSheet

    // ── Clone count ───────────────────────────────────────────────────────
    this.cloneCount    = this.loop ? this.getCloneCountForLoop() : 0
    // carousel: cloneCount slides prepended + appended
    this.slideCountNew = this.slideCount_ + this.cloneCount * 2

    this.hasRightDeadZone = (!!this.fixedWidth || this.autoWidth) && !this.loop ? true : false
    this.rightBoundary    = this.fixedWidth ? this.getRightBoundary() : 0

    this.updateIndexBeforeTransform = !this.loop   // carousel + loop => false

    // ── Transform strings ─────────────────────────────────────────────────
    // TRANSFORM is hardcoded = 'transform', HAS3DTRANSFORMS = true
    this.transformAttr = TRANSFORM
    if (HAS3DTRANSFORMS) {
      this.transformPrefix  = this.horizontal ? 'translate3d(' : 'translate3d(0px, '
      this.transformPostfix = this.horizontal ? ', 0px, 0px)' : ', 0px)'
    } else {
      this.transformPrefix  = this.horizontal ? 'translateX(' : 'translateY('
      this.transformPostfix = ')'
    }

    // ── Index ─────────────────────────────────────────────────────────────
    this.index       = this.getStartIndex(this.getOption('startIndex') as number)
    this.indexCached = this.index
    this.indexMin    = 0
    this.indexMax    = !this.autoWidth ? this.getIndexMax() : 0

    // ── disable when freeze ───────────────────────────────────────────────
    this.disable = false
    this.freeze  = this.freezable && !this.autoWidth ? this.getFreeze() : false
    if (!this.autoWidth) { this.resetVariblesWhenDisable(this.disable || this.freeze) }

    // ── Slide ID ──────────────────────────────────────────────────────────
    this.slideId           = this.container.id || getSlideId()
    this.newContainerClasses = ' ' + CLS.SLIDER

    // ── DOM wrappers ──────────────────────────────────────────────────────
    this.outerWrapper = outerWrapper
    this.innerWrapper = innerWrapper

    // remove vpfix
    removeClass(this.container, CLS.VPFIX)

    // sync public activeIndex with the resolved startIndex
    this.activeIndex = this.getAbsIndex(this.index)
    this.isBeginning = this.activeIndex === 0
    this.isEnd       = this.activeIndex === this.slideCount_ - 1

    this.initStructure()
    this.initSheet()
    this.initSliderTransform()
  }

  // ════════════════════════════════════════════════════════════════════════
  //  UTILITY / FORMULA FUNCTIONS (mirrors Tiny Slider)
  // ════════════════════════════════════════════════════════════════════════

  private resetVariblesWhenDisable(condition: boolean): void {
    if (condition) {
      this.touch = this.mouseDrag = this.arrowKeys = false
    }
  }

  private getCurrentSlide(): number {
    let tem = this.index - this.cloneCount
    while (tem < 0) { tem += this.slideCount_ }
    return tem % this.slideCount_ + 1
  }

  private getStartIndex(ind: number): number {
    ind = ind
      ? Math.max(0, Math.min(
          this.loop ? this.slideCount_ - 1 : this.slideCount_ - this.items,
          ind
        ))
      : 0
    return ind + this.cloneCount
  }

  private getAbsIndex(i?: number): number {
    if (i == null) { i = this.index }
    i -= this.cloneCount
    while (i < 0) { i += this.slideCount_ }
    return Math.floor(i % this.slideCount_)
  }

  private getItemsMax(): number {
    if (this.autoWidth || (this.fixedWidth && !this.viewportMax)) {
      return this.slideCount_ - 1
    }
    const key = this.fixedWidth ? 'fixedWidth' : 'items'
    const arr: number[] = []
    const baseVal = this.options[key as keyof SliderOptions] as number
    if (this.fixedWidth || baseVal < this.slideCount_) arr.push(baseVal)
    if (this.responsive) {
      for (const bp in this.responsive) {
        const bpOpts = this.responsive[bp as unknown as number] as Record<string, unknown>
        const v = bpOpts[key] as number | undefined
        if (v != null && (this.fixedWidth || v < this.slideCount_)) arr.push(v)
      }
    }
    if (!arr.length) arr.push(0)
    return this.fixedWidth
      ? Math.ceil(
          (this.viewportMax as number) / Math.min(...arr)
        )
      : Math.ceil(Math.max(...arr))
  }

  private getCloneCountForLoop(): number {
    const itemsMax = this.getItemsMax()
    // carousel: ceil((itemsMax*5 - slideCount)/2)
    let result = Math.ceil((itemsMax * 5 - this.slideCount_) / 2)
    result = Math.max(itemsMax, result)
    return this.edgePadding ? result + 1 : result
  }

  private getViewportWidth(): number {
    const gap = this.edgePadding ? this.edgePadding * 2 - this.gutter : 0
    return (getClientWidth(this.containerParent) || 0) - gap
  }

  private hasOption(item: string): boolean {
    if ((this.options as Record<string, unknown>)[item]) return true
    if (this.responsive) {
      for (const bp in this.responsive) {
        const bpOpts = this.responsive[bp as unknown as number] as Record<string, unknown>
        if (bpOpts[item]) return true
      }
    }
    return false
  }

  // get option: window width => variables; fixed width: viewport + fixedWidth + gutter => items
  private getOption(item: string, ww?: number): unknown {
    if (ww == null) { ww = this.windowWidth }

    if (item === 'items' && this.fixedWidth) {
      return Math.floor((this.viewport + this.gutter) / (this.fixedWidth + this.gutter)) || 1
    }

    let result: unknown = (this.options as Record<string, unknown>)[item]

    if (this.responsive) {
      for (const bp in this.responsive) {
        if (ww >= parseInt(bp)) {
          const bpOpts = this.responsive[parseInt(bp)] as Record<string, unknown>
          if (item in bpOpts) { result = bpOpts[item] }
        }
      }
    }

    if (item === 'slideBy' && result === 'page') { result = this.getOption('items') }

    return result
  }

  // ── CSS string builders ──────────────────────────────────────────────────

  private getInnerWrapperStyles(
    edgePaddingTem: number | undefined,
    gutterTem: number,
    fixedWidthTem: number | false,
    _speedTem: number,
    _autoHeightBP?: boolean
  ): string {
    let str = ''
    if (edgePaddingTem !== undefined) {
      let gap = edgePaddingTem
      if (gutterTem) { gap -= gutterTem }
      str = this.horizontal
        ? 'margin: 0 ' + gap + 'px 0 ' + edgePaddingTem + 'px;'
        : 'margin: ' + edgePaddingTem + 'px 0 ' + gap + 'px 0;'
    } else if (gutterTem && !fixedWidthTem) {
      const gutterTemUnit = '-' + gutterTem + 'px'
      const dir = this.horizontal ? gutterTemUnit + ' 0 0' : '0 ' + gutterTemUnit + ' 0'
      str = 'margin: 0 ' + dir + ';'
    }
    return str
  }

  private getContainerWidth(fixedWidthTem: number | false, gutterTem: number, _itemsTem: number): string {
    if (fixedWidthTem) {
      return (fixedWidthTem + gutterTem) * this.slideCountNew + 'px'
    } else {
      // For carousel mode: container width = slideCountNew * 100% / items
      // We use slideCountNew (not items) because percentage is relative to parent
      return CALC
        ? CALC + '(' + this.slideCountNew * 100 + '% / ' + this.items + ')'
        : this.slideCountNew * 100 / this.items + '%'
    }
  }

  private getSlideWidthStyle(fixedWidthTem: number | false, gutterTem: number, _itemsTem: number): string {
    let width: string
    if (fixedWidthTem) {
      width = (fixedWidthTem + gutterTem) + 'px'
    } else {
      const dividend = this.slideCountNew  // carousel mode
      width = CALC
        ? CALC + '(100% / ' + dividend + ')'
        : 100 / dividend + '%'
    }
    return 'width:' + width + ';'
  }

  private getSlideGutterStyle(gutterTem: number): string {
    if (gutterTem === 0) return ''   // gutter can be 0
    const prop = this.horizontal ? 'padding-' : 'margin-'
    const dir  = this.horizontal ? 'right' : 'bottom'
    return prop + dir + ': ' + gutterTem + 'px;'
  }

  private getTransitionDurationStyle(speed: number): string {
    return 'transition-duration:' + speed / 1000 + 's;'
  }

  private addCSSRule(str: string, index?: number): void {
    const i = index ?? this.sheet.cssRules.length
    try {
      this.sheet.insertRule(str, i)
    } catch (_e) {
      // ignore invalid rules
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DOM STRUCTURE
  // ════════════════════════════════════════════════════════════════════════

  private initStructure(): void {
    const doc        = document
    const container  = this.container
    const parentNode = container.parentNode as HTMLElement

    // outer wrapper
    this.outerWrapper.className = CLS.OUTER
    this.outerWrapper.id        = this.slideId + '-ow'

    // inner wrapper
    this.innerWrapper.className = CLS.INNER
    this.innerWrapper.id        = this.slideId + '-iw'

    // container props
    if (container.id === '') { container.id = this.slideId }

    // PERCENTAGELAYOUT = true
    this.newContainerClasses += ' ' + CLS.SLIDER

    // add horizontal/vertical class — use calc class string like tiny slider
    this.newContainerClasses += ' tns-subpixel'   // PERCENTAGELAYOUT = true
    this.newContainerClasses += ' tns-calc'        // CALC = true
    this.newContainerClasses += ' ' + (this.horizontal ? CLS.HORIZONTAL : CLS.VERTICAL)
    container.className += this.newContainerClasses

    // middle wrapper (carousel mode always)
    this.middleWrapper    = doc.createElement('div')
    this.middleWrapper.id = this.slideId + '-mw'
    this.middleWrapper.className = CLS.OVERFLOW

    if (this.autoHeight) {
      this.middleWrapper.className += ' ' + CLS.AUTOHEIGHT
    }

    this.outerWrapper.appendChild(this.middleWrapper)
    this.middleWrapper.appendChild(this.innerWrapper)

    parentNode.insertBefore(this.outerWrapper, container)
    this.innerWrapper.appendChild(container)

    // tag slides
    const slideArr = Array.from(this.slideItems)
    slideArr.forEach((item, i) => {
      addClass(item, CLS.ITEM)
      if (!item.id) { item.id = this.slideId + '-item' + i }
      setAttrs(item, { 'aria-hidden': 'true', 'tabindex': '-1' })
    })

    // clone slides: carousel => n + slides + n
    if (this.cloneCount) {
      const fragmentBefore = doc.createDocumentFragment()
      const fragmentAfter  = doc.createDocumentFragment()

      for (let j = this.cloneCount; j--;) {
        const num = j % this.slideCount_

        const cloneFirst = this.slideItems[num].cloneNode(true) as Element
        addClass(cloneFirst, CLS.CLONE)
        removeAttrs(cloneFirst, 'id')
        fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild)

        const cloneLast = this.slideItems[this.slideCount_ - 1 - num].cloneNode(true) as Element
        addClass(cloneLast, CLS.CLONE)
        removeAttrs(cloneLast, 'id')
        fragmentBefore.appendChild(cloneLast)
      }

      container.insertBefore(fragmentBefore, container.firstChild)
      container.appendChild(fragmentAfter)
    }

    // after cloning, slideItems now includes clones
    this.slides = Array.from(this.slideItems) as HTMLElement[]
  }

  // ════════════════════════════════════════════════════════════════════════
  //  STYLESHEET INJECTION (mirrors Tiny Slider initSheet)
  // ════════════════════════════════════════════════════════════════════════

  private initSheet(): void {
    const id = this.slideId

    // ── LAYOUT ─────────────────────────────────────────────────────────────
    // PERCENTAGELAYOUT = true, so slides are inline-block
    if (this.horizontal) {
      // font-size reset for inline-block gap removal
      const computedFontSize = window.getComputedStyle(this.slideItems[0] as Element).fontSize
      this.addCSSRule('#' + id + ' > .' + CLS.ITEM + ' { font-size:' + computedFontSize + '; }')
      this.addCSSRule('#' + id + ' { font-size:0; }')
    }

    // ── BASIC STYLES (CSSMQ = true) ──────────────────────────────────────
    // middle wrapper (carousel autoHeight)
    if (TRANSITIONDURATION && this.middleWrapper) {
      const mwStr = this.autoHeight ? this.getTransitionDurationStyle(this.options.speed) : ''
      this.addCSSRule('#' + id + '-mw { ' + mwStr + ' }')
    }

    // inner wrapper styles
    const iwStr = this.getInnerWrapperStyles(
      this.options.edgePadding,
      this.options.gutter,
      this.options.fixedWidth,
      this.options.speed,
      this.options.autoHeight
    )
    this.addCSSRule('#' + id + '-iw { ' + iwStr + ' }')

    // container styles (carousel)
    let containerStr = this.horizontal && !this.autoWidth
      ? 'width:' + this.getContainerWidth(this.options.fixedWidth, this.options.gutter, this.options.items as number) + ';'
      : ''
    if (TRANSITIONDURATION) { containerStr += this.getTransitionDurationStyle(this.speed) }
    this.addCSSRule('#' + id + ' { ' + containerStr + ' }')

    // slide styles
    let slideStr = this.horizontal && !this.autoWidth
      ? this.getSlideWidthStyle(this.options.fixedWidth, this.options.gutter, this.options.items as number)
      : ''
    if (this.options.gutter) { slideStr += this.getSlideGutterStyle(this.options.gutter) }
    if (slideStr) { this.addCSSRule('#' + id + ' > .' + CLS.ITEM + ' { ' + slideStr + ' }') }

    // ── RESPONSIVE @MEDIA QUERIES ─────────────────────────────────────────
    if (this.responsive && CSSMQ) {
      for (const bpKey in this.responsive) {
        const bp = parseInt(bpKey)
        const opts = this.responsive[bp] as Record<string, unknown>
        let str = ''
        let middleWrapperStr = ''
        let innerWrapperStr  = ''
        let containerStr2    = ''
        let slideStr2        = ''

        const itemsBP       = !this.autoWidth ? this.getOption('items', bp) as number : null
        const fixedWidthBP  = this.getOption('fixedWidth', bp) as number | false
        const speedBP       = this.getOption('speed', bp) as number
        const edgePaddingBP = this.getOption('edgePadding', bp) as number
        const autoHeightBP  = this.getOption('autoHeight', bp) as boolean
        const gutterBP      = this.getOption('gutter', bp) as number

        // middle wrapper
        if (TRANSITIONDURATION && this.middleWrapper && autoHeightBP && 'speed' in opts) {
          middleWrapperStr = '#' + id + '-mw{' + this.getTransitionDurationStyle(speedBP) + '}'
        }

        // inner wrapper
        if ('edgePadding' in opts || 'gutter' in opts) {
          innerWrapperStr = '#' + id + '-iw{' + this.getInnerWrapperStyles(edgePaddingBP, gutterBP, fixedWidthBP, speedBP, autoHeightBP) + '}'
        }

        // container
        if (this.horizontal && !this.autoWidth &&
            ('fixedWidth' in opts || 'items' in opts || (this.fixedWidth && 'gutter' in opts))) {
          containerStr2 = 'width:' + this.getContainerWidth(fixedWidthBP, gutterBP, itemsBP!) + ';'
        }
        if (TRANSITIONDURATION && 'speed' in opts) {
          containerStr2 += this.getTransitionDurationStyle(speedBP)
        }
        if (containerStr2) {
          containerStr2 = '#' + id + '{' + containerStr2 + '}'
        }

        // slide
        if ('fixedWidth' in opts || (this.fixedWidth && 'gutter' in opts) || 'items' in opts) {
          slideStr2 += this.getSlideWidthStyle(fixedWidthBP, gutterBP, itemsBP!)
        }
        if ('gutter' in opts) {
          slideStr2 += this.getSlideGutterStyle(gutterBP)
        }
        if (slideStr2) { slideStr2 = '#' + id + ' > .' + CLS.ITEM + '{' + slideStr2 + '}' }

        str = middleWrapperStr + innerWrapperStr + containerStr2 + slideStr2

        if (str) {
          this.sheet.insertRule(
            '@media (min-width: ' + bp / 16 + 'em) {' + str + '}',
            this.sheet.cssRules.length
          )
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SLIDER TRANSFORM INIT
  // ════════════════════════════════════════════════════════════════════════

  private initSliderTransform(): void {
    if (this.hasOption('autoHeight') || this.autoWidth || !this.horizontal) {
      const imgs = this.container.querySelectorAll('img')
      // For modern: directly check images
      raf(() => {
        this.imgsLoadedCheck(Array.from(imgs) as HTMLImageElement[], () => {
          this.imgsComplete = true
        })
      })

      if (this.lazyload) {
        this.initSliderTransformStyleCheck()
      } else {
        raf(() => {
          this.imgsLoadedCheck(Array.from(imgs) as HTMLImageElement[], () => {
            this.initSliderTransformStyleCheck()
          })
        })
      }
    } else {
      // set container transform
      this.doContainerTransformSilent()
      this.initTools()
      this.initEvents()
    }
  }

  private initSliderTransformStyleCheck(): void {
    if (this.autoWidth && this.slideCount_ > 1) {
      const num = this.loop ? this.index : this.slideCount_ - 1
      const check = () => {
        const left  = (this.slideItems[num] as Element).getBoundingClientRect().left
        const right = (this.slideItems[num - 1] as Element).getBoundingClientRect().right
        if (Math.abs(left - right) <= 1) {
          this.initSliderTransformCore()
        } else {
          setTimeout(check, 16)
        }
      }
      check()
    } else {
      this.initSliderTransformCore()
    }
  }

  private initSliderTransformCore(): void {
    if (!this.horizontal || this.autoWidth) {
      this.setSlidePositions()
      if (this.autoWidth) {
        this.rightBoundary = this.getRightBoundary()
        if (this.freezable) { this.freeze = this.getFreeze() }
        this.indexMax = this.getIndexMax()
        this.resetVariblesWhenDisable(this.disable || this.freeze)
      } else {
        this.updateContentWrapperHeight()
      }
    }

    this.doContainerTransformSilent()
    this.initTools()
    this.initEvents()
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TOOLS INIT (a11y, live region)
  // ════════════════════════════════════════════════════════════════════════

  private initTools(): void {
    this.updateSlideStatus()

    // live region
    this.outerWrapper.insertAdjacentHTML(
      'afterbegin',
      '<div class="' + CLS.LIVE + ' ' + CLS.VHIDE + '" aria-live="polite" aria-atomic="true">' +
      'slide <span class="current">' + this.getLiveRegionStr() + '</span> of ' + this.slideCount_ + '</div>'
    )
    this._liveregionCurrent = this.outerWrapper.querySelector('.' + CLS.LIVE + ' .current')

    if (this.disable) { this.disableSlider() } else if (this.freeze) { this.freezeSlider() }

    this.events.on('indexChanged', () => this.additionalUpdates())
  }

  // ════════════════════════════════════════════════════════════════════════
  //  EVENTS INIT
  // ════════════════════════════════════════════════════════════════════════

  private initEvents(): void {
    // transitionend on container
    this.transitionEvent = { transitionend: this.onTransitionEnd }
    addEvents(this.container, this.transitionEvent)

    if (this.touch) {
      this.touchEvents = {
        touchstart:  this.onPanStart,
        touchmove:   this.onPanMove,
        touchend:    this.onPanEnd,
        touchcancel: this.onPanEnd,
      }
      addEvents(this.container, this.touchEvents, this.preventScrollOnTouch)
    }

    if (this.mouseDrag) {
      this.dragEvents = {
        mousedown:  this.onPanStart,
        mousemove:  this.onPanMove,
        mouseup:    this.onPanEnd,
        mouseleave: this.onPanEnd,
      }
      addEvents(this.container, this.dragEvents)
    }

    if (this.arrowKeys) {
      this.docmentKeydownEvent = { keydown: this.onDocumentKeydown }
      addEvents(document, this.docmentKeydownEvent)
    }

    // resize: only when responsive || fixedWidth || autoWidth || autoHeight || !horizontal
    if (this.responsive || this.fixedWidth || this.autoWidth || this.autoHeight || !this.horizontal) {
      this.resizeEvent = { resize: this.onResize }
      addEvents(window, this.resizeEvent)
    }

    if (this.autoHeight) {
      if (!this.disable) { this.doAutoHeight() }
    }

    if (typeof this.options.onInit === 'function') {
      this.options.onInit(this.info())
    }
    this.isOn = true

    // install plugins
    this._plugins.forEach(p => p.install(this))
  }

  // ════════════════════════════════════════════════════════════════════════
  //  FREEZE / DISABLE
  // ════════════════════════════════════════════════════════════════════════

  private getFreeze(): boolean {
    if (!this.fixedWidth && !this.autoWidth) {
      const a = this.center ? this.items - (this.items - 1) / 2 : this.items
      return this.slideCount_ <= a
    }
    const width = this.fixedWidth
      ? (this.fixedWidth + this.gutter) * this.slideCount_
      : this.slidePositions[this.slideCount_] ?? 0
    let vp = this.edgePadding
      ? this.viewport + this.edgePadding * 2
      : this.viewport + this.gutter
    if (this.center) {
      vp -= this.fixedWidth
        ? (this.viewport - this.fixedWidth) / 2
        : (this.viewport - ((this.slidePositions[this.index + 1] ?? 0) - (this.slidePositions[this.index] ?? 0) - this.gutter)) / 2
    }
    return width <= vp
  }

  private freezeSlider(): void {
    if (this.frozen) return
    if (this.edgePadding) { this.innerWrapper.style.margin = '0px' }
    // make clones transparent
    if (this.cloneCount) {
      for (let i = this.cloneCount; i--;) {
        addClass(this.slideItems[i], 'tns-transparent')
        addClass(this.slideItems[this.slideCountNew - i - 1], 'tns-transparent')
      }
    }
    addClass(this.outerWrapper, CLS.FROZEN)
    this.frozen = true
  }

  private unfreezeSlider(): void {
    if (!this.frozen) return
    if (this.edgePadding && CSSMQ) { this.innerWrapper.style.margin = '' }
    if (this.cloneCount) {
      for (let i = this.cloneCount; i--;) {
        removeClass(this.slideItems[i], 'tns-transparent')
        removeClass(this.slideItems[this.slideCountNew - i - 1], 'tns-transparent')
      }
    }
    removeClass(this.outerWrapper, CLS.FROZEN)
    this.frozen = false
  }

  private disableSlider(): void {
    if (this.disabled) return
    this.sheet.disabled = true
    this.container.className = this.container.className.replace(this.newContainerClasses.substring(1), '')
    removeAttrs(this.container, ['style'])
    if (this.loop) {
      for (let j = this.cloneCount; j--;) {
        this.hideElement(this.slideItems[j] as HTMLElement)
        this.hideElement(this.slideItems[this.slideCountNew - j - 1] as HTMLElement)
      }
    }
    if (!this.horizontal) { removeAttrs(this.innerWrapper, ['style']) }
    this.disabled = true
  }

  private enableSlider(): void {
    if (!this.disabled) return
    this.sheet.disabled = false
    this.container.className += this.newContainerClasses
    this.doContainerTransformSilent()
    if (this.loop) {
      for (let j = this.cloneCount; j--;) {
        this.showElement(this.slideItems[j] as HTMLElement)
        this.showElement(this.slideItems[this.slideCountNew - j - 1] as HTMLElement)
      }
    }
    this.disabled = false
  }

  private hideElement(el: HTMLElement): void {
    el.style.display = 'none'
  }

  private showElement(el: HTMLElement): void {
    el.style.display = ''
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INDEX MANAGEMENT
  // ════════════════════════════════════════════════════════════════════════

  private setBreakpointZone(): void {
    this.breakpointZone = 0
    for (const bp in this.responsive) {
      const bpInt = parseInt(bp)
      if (this.windowWidth >= bpInt) { this.breakpointZone = bpInt }
    }
  }

  // updateIndex — loop + carousel version (faithful port)
  private updateIndex(): void {
    if (this.loop) {
      // loop + carousel
      let leftEdge  = this.indexMin
      let rightEdge = this.indexMax

      leftEdge  += this.getSlideByResolved()
      rightEdge -= this.getSlideByResolved()

      if (this.edgePadding) {
        leftEdge  += 1
        rightEdge -= 1
      } else if (this.fixedWidth) {
        if ((this.viewport + this.gutter) % (this.fixedWidth + this.gutter)) { rightEdge -= 1 }
      }

      if (this.cloneCount) {
        if (this.index > rightEdge) {
          this.index -= this.slideCount_
        } else if (this.index < leftEdge) {
          this.index += this.slideCount_
        }
      }
    } else {
      // non-loop: clamp
      this.index = Math.max(this.indexMin, Math.min(this.indexMax, this.index))
    }
  }

  private getSlideByResolved(): number {
    return this.slideBy === 'page' ? this.items : this.slideBy as number
  }

  private getIndexMax(): number {
    if (this.fixedWidth) {
      return this.center && !this.loop
        ? this.slideCount_ - 1
        : Math.ceil(-this.rightBoundary / (this.fixedWidth + this.gutter))
    }
    if (this.autoWidth) {
      for (let i = 0; i < this.slideCountNew; i++) {
        if ((this.slidePositions[i] ?? 0) >= -this.rightBoundary) return i
      }
      return this.slideCountNew - 1
    }
    if (this.center && !this.loop) return this.slideCount_ - 1
    return Math.max(0, this.slideCountNew - Math.ceil(this.items))
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TRANSFORM / POSITION CALCULATIONS
  // ════════════════════════════════════════════════════════════════════════

  private getRightBoundary(): number {
    const gap    = this.edgePadding ? this.gutter : 0
    const sliderWidth = this.fixedWidth
      ? (this.fixedWidth + this.gutter) * this.slideCountNew
      : (this.slidePositions[this.slideCountNew] ?? 0)
    let result = (this.viewport + gap) - sliderWidth

    if (this.center && !this.loop) {
      result = this.fixedWidth
        ? -(this.fixedWidth + this.gutter) * (this.slideCountNew - 1) - this.getCenterGap()
        : this.getCenterGap(this.slideCountNew - 1) - (this.slidePositions[this.slideCountNew - 1] ?? 0)
    }
    if (result > 0) { result = 0 }
    return result
  }

  private getCenterGap(num?: number): number {
    if (num == null) { num = this.index }
    const gap = this.edgePadding ? this.gutter : 0
    return this.autoWidth
      ? ((this.viewport - gap) - ((this.slidePositions[num + 1] ?? 0) - (this.slidePositions[num] ?? 0) - this.gutter)) / 2
      : this.fixedWidth
        ? (this.viewport - (this.fixedWidth as number)) / 2
        : (this.items - 1) / 2
  }

  // The main transform value formula — mirrors Tiny Slider getContainerTransformValue
  private getContainerTransformValue(num?: number): string {
    if (num == null) { num = this.index }

    let val: number
    if (this.horizontal && !this.autoWidth) {
      if (this.fixedWidth) {
        val = -(this.fixedWidth + this.gutter) * num
        if (this.center) { val += this.getCenterGap() }
      } else {
        // TRANSFORM = 'transform', so denominator = slideCountNew
        const denominator = this.slideCountNew
        let numAdj = num
        if (this.center) { numAdj -= this.getCenterGap() }
        val = -numAdj * 100 / denominator
      }
    } else {
      val = -(this.slidePositions[num] ?? 0)
      if (this.center && this.autoWidth) {
        val += this.getCenterGap()
      }
    }

    if (this.hasRightDeadZone) { val = Math.max(val, this.rightBoundary) }

    // horizontal non-fixed non-autoWidth => percentage; else => px
    const unit = (this.horizontal && !this.autoWidth && !this.fixedWidth) ? '%' : 'px'

    return val + unit
  }

  private doContainerTransformSilent(val?: string): void {
    this.resetDuration(this.container, '0s')
    this.doContainerTransform(val)
  }

  private doContainerTransform(val?: string): void {
    if (val == null) { val = this.getContainerTransformValue() }
    this.container.style[this.transformAttr as any] = this.transformPrefix + val + this.transformPostfix
  }

  private resetDuration(el: HTMLElement, str: string): void {
    el.style[TRANSITIONDURATION as any] = str
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SLIDE POSITIONS (for vertical / autoWidth)
  // ════════════════════════════════════════════════════════════════════════

  private setSlidePositions(): void {
    this.slidePositions = [0]
    const attr  = this.horizontal ? 'left' : 'top'
    const attr2 = this.horizontal ? 'right' : 'bottom'
    const base  = (this.slideItems[0] as Element).getBoundingClientRect()[attr]

    Array.from(this.slideItems).forEach((item, i) => {
      if (i) {
        this.slidePositions.push((item as Element).getBoundingClientRect()[attr] - base)
      }
      if (i === this.slideCountNew - 1) {
        this.slidePositions.push((item as Element).getBoundingClientRect()[attr2] - base)
      }
    })
  }

  private updateContentWrapperHeight(): void {
    const wp = this.middleWrapper ?? this.innerWrapper
    wp.style.height = (this.slidePositions[this.index + this.items] ?? 0) -
                      (this.slidePositions[this.index] ?? 0) + 'px'
  }

  // ════════════════════════════════════════════════════════════════════════
  //  AUTO HEIGHT
  // ════════════════════════════════════════════════════════════════════════

  private getMaxSlideHeight(slideStart: number, slideRange: number): number {
    const heights: number[] = []
    const end = Math.min(slideStart + slideRange, this.slideCountNew)
    for (let i = slideStart; i < end; i++) {
      heights.push((this.slideItems[i] as HTMLElement).offsetHeight)
    }
    return Math.max(0, ...heights)
  }

  private updateInnerWrapperHeight(): void {
    const maxHeight = this.autoHeight
      ? this.getMaxSlideHeight(this.index, this.items)
      : this.getMaxSlideHeight(this.cloneCount, this.slideCount_)
    const wp = this.middleWrapper ?? this.innerWrapper
    const h  = maxHeight + 'px'
    if (wp.style.height !== h) { wp.style.height = h }
  }

  private imgsLoadedCheck(imgs: HTMLImageElement[], cb: () => void): void {
    if (this.imgsComplete) { return cb() }
    imgs = imgs.filter(img => {
      if (img.complete) { return false }
      return true
    })
    if (!imgs.length) { return cb() }
    raf(() => { this.imgsLoadedCheck(imgs, cb) })
  }

  private doAutoHeight(): void {
    const range = this.getVisibleSlideRange()
    const imgs  = this.getImageArray(range[0], range[1])
    raf(() => { this.imgsLoadedCheck(imgs, () => this.updateInnerWrapperHeight()) })
  }

  private getImageArray(start: number, end: number, selector?: string): HTMLImageElement[] {
    const imgs: HTMLImageElement[] = []
    if (!selector) selector = 'img'
    let s = start
    while (s <= end) {
      const item = this.slideItems[s]
      if (item) {
        item.querySelectorAll(selector).forEach(img => imgs.push(img as HTMLImageElement))
      }
      s++
    }
    return imgs
  }

  // ════════════════════════════════════════════════════════════════════════
  //  A11Y / SLIDE STATUS
  // ════════════════════════════════════════════════════════════════════════

  private getVisibleSlideRange(val?: string): [number, number] {
    if (val == null) { val = this.getContainerTransformValue() }
    let start = this.index
    let end: number

    if (this.autoWidth) {
      let rangestart = 0, rangeend = 0
      if (this.center || this.edgePadding) {
        rangestart = -(parseFloat(val) + this.edgePadding)
        rangeend   = rangestart + this.viewport + this.edgePadding * 2
      } else {
        rangestart = this.slidePositions[this.index] ?? 0
        rangeend   = rangestart + this.viewport
      }
      this.slidePositions.forEach((point, i) => {
        if (i < this.slideCountNew) {
          if ((this.center || this.edgePadding) && point <= rangestart + 0.5) { start = i }
          if (rangeend - point >= 0.5) { end = i }
        }
      })
    } else if (this.fixedWidth) {
      const cell = this.fixedWidth + this.gutter
      if (this.center || this.edgePadding) {
        const rangestart = -(parseFloat(val) + this.edgePadding)
        const rangeend   = rangestart + this.viewport + this.edgePadding * 2
        start = Math.floor(rangestart / cell)
        end   = Math.ceil(rangeend / cell - 1)
      } else {
        end = start + Math.ceil(this.viewport / cell) - 1
      }
    } else {
      if (this.center || this.edgePadding) {
        const a = this.items - 1
        if (this.center) {
          start = this.index - a / 2
          end   = this.index + a / 2
        } else {
          end = this.index + a
        }
        if (this.edgePadding) {
          const b = this.edgePadding * this.items / this.viewport
          start -= b
          end   += b
        }
        start = Math.floor(start)
        end   = Math.ceil(end!)
      } else {
        end = start + this.items - 1
      }
      start = Math.max(start, 0)
      end   = Math.min(end!, this.slideCountNew - 1)
    }

    return [start, end!]
  }

  private getLiveRegionStr(): string {
    const arr   = this.getVisibleSlideRange()
    const start = arr[0] + 1
    const end   = arr[1] + 1
    return start === end ? start + '' : start + ' to ' + end
  }

  private updateLiveRegion(): void {
    if (!this._liveregionCurrent) return
    const str = this.getLiveRegionStr()
    if (this._liveregionCurrent.innerHTML !== str) {
      this._liveregionCurrent.innerHTML = str
    }
  }

  private updateSlideStatus(): void {
    const range = this.getVisibleSlideRange()
    const start = range[0]
    const end   = range[1]

    Array.from(this.slideItems).forEach((item, i) => {
      const el = item as HTMLElement
      if (i >= start && i <= end) {
        if (el.hasAttribute('aria-hidden')) {
          el.removeAttribute('aria-hidden')
          el.removeAttribute('tabindex')
          addClass(el, CLS.ACTIVE)
        }
      } else {
        if (!el.hasAttribute('aria-hidden')) {
          setAttrs(el, { 'aria-hidden': 'true', 'tabindex': '-1' })
          removeClass(el, CLS.ACTIVE)
        }
      }
    })
  }

  private additionalUpdates(): void {
    this.activeIndex = this.getAbsIndex()
    this.isBeginning = this.activeIndex === 0
    this.isEnd       = this.activeIndex === this.slideCount_ - 1
    this.updateSlideStatus()
    this.updateLiveRegion()
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════════

  // mirrors Tiny Slider render() + transformCore() for carousel
  private render(_e: Event | null, sliderMoved?: number | boolean): void {
    if (this.updateIndexBeforeTransform) { this.updateIndex() }

    // render when slider was moved (touch/drag) even if index may not change
    if (this.index !== this.indexCached || sliderMoved) {
      this.events.emit('indexChanged', this.info())
      this.events.emit('transitionStart', this.info())

      if (this.autoHeight) { this.doAutoHeight() }

      this.running = true
      this.transformCore()
    }
  }

  // transformCore for carousel mode
  private transformCore(): void {
    this.resetDuration(this.container, '')
    // modern browser with transitionDuration support, or speed === 0
    this.doContainerTransform()
    // fallback: if speed=0 or container hidden, run onTransitionEnd manually
    if (!this.speed || !isVisible(this.container)) {
      this.onTransitionEnd()
    }

    if (!this.horizontal) { this.updateContentWrapperHeight() }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TRANSITION END
  // ════════════════════════════════════════════════════════════════════════

  private onTransitionEnd = (event?: Event): void => {
    // carousel: guard on target + propertyName
    if (this.running) {
      this.events.emit('transitionEnd', this.info(event))

      const strTrans = (str: string) => str.toLowerCase().replace(/-/g, '')

      if (!event ||
          (event.target === this.container &&
           strTrans((event as TransitionEvent).propertyName ?? '') === strTrans(this.transformAttr))
      ) {
        if (!this.updateIndexBeforeTransform) {
          const indexTem = this.index
          this.updateIndex()
          if (this.index !== indexTem) {
            this.events.emit('indexChanged', this.info())
            this.doContainerTransformSilent()
          }
        }

        this.running      = false
        this.indexCached  = this.index
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TOUCH / DRAG (faithful port of onPanStart/Move/End + panUpdate)
  // ════════════════════════════════════════════════════════════════════════

  private isTouchEvent(e: Event): boolean {
    return e.type.indexOf('touch') >= 0
  }

  private getEventPoint(e: Event): { clientX: number; clientY: number } {
    const te = e as TouchEvent
    if (this.isTouchEvent(e) && te.changedTouches) {
      return te.changedTouches[0] ?? { clientX: 0, clientY: 0 }
    }
    return e as unknown as { clientX: number; clientY: number }
  }

  private getMoveDirectionExpected(): boolean {
    return getTouchDirection(
      toDegree(
        this.lastPosition.y - this.initPosition.y,
        this.lastPosition.x - this.initPosition.x
      ),
      this.swipeAngle as number
    ) === this.options.axis
  }

  private getDist(): number {
    return this.horizontal
      ? this.lastPosition.x - this.initPosition.x
      : this.lastPosition.y - this.initPosition.y
  }

  private parseCurrentTranslate(): number {
    // extract the numeric part from e.g. "translate3d(-25%, 0px, 0px)"
    const style = this.container.style[this.transformAttr as any] as string
    if (!style) return 0
    // strip prefix
    const inner = style.replace(this.transformPrefix, '').replace(this.transformPostfix, '')
    return parseFloat(inner) || 0
  }

  private onPanStart = (e: Event): void => {
    if (this.running) {
      if (this.preventActionWhenRunning) { return }
      else { this.onTransitionEnd() }
    }

    this.panStart = true
    if (this.rafIndex != null) {
      caf(this.rafIndex)
      this.rafIndex = null
    }

    const pt = this.getEventPoint(e)
    this.events.emit(this.isTouchEvent(e) ? 'touchStart' : 'dragStart', this.info(e))

    if (!this.isTouchEvent(e)) {
      const tag = (e.target as HTMLElement).nodeName.toLowerCase()
      if (tag === 'img' || tag === 'a') { e.preventDefault() }
    }

    this.lastPosition.x = this.initPosition.x = pt.clientX
    this.lastPosition.y = this.initPosition.y = pt.clientY

    // carousel: capture current translate and reset duration
    this.translateInit = this.parseCurrentTranslate()
    this.resetDuration(this.container, '0s')
  }

  private onPanMove = (e: Event): void => {
    if (this.panStart) {
      const pt = this.getEventPoint(e)
      this.lastPosition.x = pt.clientX
      this.lastPosition.y = pt.clientY

      if (!this.rafIndex) {
        this.rafIndex = raf(() => { this.panUpdate(e) })
      }

      if (this.moveDirectionExpected === '?') {
        this.moveDirectionExpected = this.getMoveDirectionExpected()
      }
      if (this.moveDirectionExpected) { this.preventScroll = true }

      if ((typeof (e as TouchEvent).cancelable !== 'boolean' || (e as TouchEvent).cancelable) && this.preventScroll) {
        e.preventDefault()
      }
    }
  }

  private panUpdate(e: Event): void {
    if (!this.moveDirectionExpected) {
      this.panStart = false
      return
    }
    caf(this.rafIndex!)
    if (this.panStart) {
      this.rafIndex = raf(() => { this.panUpdate(e) })
    }

    if (this.moveDirectionExpected === '?') {
      this.moveDirectionExpected = this.getMoveDirectionExpected()
    }

    if (this.moveDirectionExpected) {
      if (!this.preventScroll && this.isTouchEvent(e)) { this.preventScroll = true }

      try {
        if ((e as Event).type) {
          this.events.emit(this.isTouchEvent(e) ? 'touchMove' : 'dragMove', this.info(e))
        }
      } catch (_err) {}

      let x = this.translateInit
      const dist = this.getDist()

      let xStr: string
      if (!this.horizontal || this.fixedWidth || this.autoWidth) {
        // pixel-based
        xStr = (x + dist) + 'px'
      } else {
        // percentage-based: dist * items * 100 / ((viewport + gutter) * slideCountNew)
        const percentageX = dist * this.items * 100 / ((this.viewport + this.gutter) * this.slideCountNew)
        xStr = (x + percentageX) + '%'
      }

      this.container.style[this.transformAttr as any] = this.transformPrefix + xStr + this.transformPostfix
    }
  }

  // onPanEnd: reset moveDirectionExpected BEFORE early return check (critical!)
  private onPanEnd = (e: Event): void => {
    if (this.panStart) {
      if (this.rafIndex != null) {
        caf(this.rafIndex)
        this.rafIndex = null
      }
      // carousel: restore duration
      this.resetDuration(this.container, '')
      this.panStart = false

      const pt = this.getEventPoint(e)
      this.lastPosition.x = pt.clientX
      this.lastPosition.y = pt.clientY
      const dist = this.getDist()

      if (Math.abs(dist)) {
        // drag vs click: prevent accidental click after drag
        if (!this.isTouchEvent(e)) {
          const target = e.target as EventTarget
          const preventClick = (ev: Event) => {
            ev.preventDefault()
            target.removeEventListener('click', preventClick)
          }
          target.addEventListener('click', preventClick)
        }

        // carousel path
        this.rafIndex = raf(() => {
          if (this.horizontal && !this.autoWidth) {
            const indexMoved = -dist * this.items / (this.viewport + this.gutter)
            this.index += dist > 0 ? Math.floor(indexMoved) : Math.ceil(indexMoved)
          } else {
            const moved = -(this.translateInit + dist)
            if (moved <= 0) {
              this.index = this.indexMin
            } else if (moved >= (this.slidePositions[this.slideCountNew - 1] ?? 0)) {
              this.index = this.indexMax
            } else {
              let i = 0
              while (i < this.slideCountNew && moved >= (this.slidePositions[i] ?? 0)) {
                this.index = i
                if (moved > (this.slidePositions[i] ?? 0) && dist < 0) { this.index += 1 }
                i++
              }
            }
          }

          this.render(e, dist)
          this.events.emit(this.isTouchEvent(e) ? 'touchEnd' : 'dragEnd', this.info(e))
        })
      }
    }

    // reset — ALWAYS, even if panStart was false (mirrors Tiny Slider)
    if (this.preventScrollOnTouch === 'auto') { this.preventScroll = false }
    if (this.swipeAngle) { this.moveDirectionExpected = '?' }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  KEYBOARD
  // ════════════════════════════════════════════════════════════════════════

  private onDocumentKeydown = (e: Event): void => {
    const ke = e as KeyboardEvent
    const keyIndex = [37, 39].indexOf(ke.keyCode)
    if (keyIndex >= 0) {
      this.onControlsClick(e, keyIndex === 0 ? -1 : 1)
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  CONTROLS CLICK (internal)
  // ════════════════════════════════════════════════════════════════════════

  private onControlsClick(e: Event | null, dir: number): void {
    if (this.running) {
      if (this.preventActionWhenRunning) { return }
      else { this.onTransitionEnd() }
    }

    if (this.rewind) {
      if (this.index === this.indexMin && dir === -1) {
        this.goTo('last', e ?? undefined)
        return
      } else if (this.index === this.indexMax && dir === 1) {
        this.goTo('first', e ?? undefined)
        return
      }
    }

    if (dir) {
      this.index += this.getSlideByResolved() * dir
      if (this.autoWidth) { this.index = Math.floor(this.index) }
      this.render(e)
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RESIZE
  // ════════════════════════════════════════════════════════════════════════

  private onResize = (e: Event): void => {
    raf(() => { this.resizeTasks(e) })
  }

  private resizeTasks(e?: Event): void {
    if (!this.isOn) return

    this.windowWidth = getWindowWidth()
    let bpChanged = false
    const breakpointZoneTem = this.breakpointZone
    let needContainerTransform = false

    if (this.responsive) {
      this.setBreakpointZone()
      bpChanged = breakpointZoneTem !== this.breakpointZone
      if (bpChanged) { this.events.emit('newBreakpointStart', this.info(e)) }
    }

    const itemsTem   = this.items
    const freezeTem  = this.freeze
    const disableTem = this.disable
    const indexTem   = this.index

    if (bpChanged) {
      // re-read bp-dependent options
      this.fixedWidth   = this.getOption('fixedWidth') as number | false
      this.speed        = this.getOption('speed') as number
      this.autoHeight   = this.getOption('autoHeight') as boolean
      this.center       = this.getOption('center') as boolean
      this.disable      = this.getOption('disable') as boolean ?? false
    }

    this.arrowKeys  = this.getOption('arrowKeys') as boolean
    this.touch      = this.getOption('touch') as boolean
    this.mouseDrag  = this.getOption('mouseDrag') as boolean

    this.resetVariblesWhenDisable(this.disable)

    this.viewport = this.getViewportWidth()

    if ((!this.horizontal || this.autoWidth) && !this.disable) {
      this.setSlidePositions()
      if (!this.horizontal) {
        this.updateContentWrapperHeight()
        needContainerTransform = true
      }
    }

    if (this.fixedWidth || this.autoWidth) {
      this.rightBoundary = this.getRightBoundary()
      this.indexMax      = this.getIndexMax()
    }

    if (bpChanged || this.fixedWidth) {
      this.items    = this.getOption('items') as number
      this.slideBy  = this.getOption('slideBy') as number | 'page'
      const itemsChanged = this.items !== itemsTem

      if (itemsChanged) {
        if (!this.fixedWidth && !this.autoWidth) { this.indexMax = this.getIndexMax() }
        this.updateIndex()
      }
    }

    if (bpChanged && this.disable !== disableTem) {
      if (this.disable) {
        this.disableSlider()
      } else {
        this.enableSlider()
      }
    }

    if (this.freezable && (bpChanged || this.fixedWidth || this.autoWidth)) {
      this.freeze = this.getFreeze()
      if (this.freeze !== freezeTem) {
        if (this.freeze) {
          this.doContainerTransform(this.getContainerTransformValue(this.getStartIndex(0)))
          this.freezeSlider()
        } else {
          this.unfreezeSlider()
          needContainerTransform = true
        }
      }
    }

    this.resetVariblesWhenDisable(this.disable || this.freeze)

    if (this.arrowKeys) {
      if (!Object.keys(this.docmentKeydownEvent).length) {
        this.docmentKeydownEvent = { keydown: this.onDocumentKeydown }
        addEvents(document, this.docmentKeydownEvent)
      }
    } else {
      if (Object.keys(this.docmentKeydownEvent).length) {
        removeEvents(document, this.docmentKeydownEvent)
        this.docmentKeydownEvent = {}
      }
    }

    if (bpChanged) {
      if (this.fixedWidth || this.center) { needContainerTransform = true }
      if (!this.autoHeight) { this.innerWrapper.style.height = '' }
    } else {
      if (this.center && (this.fixedWidth || this.autoWidth)) { needContainerTransform = true }
    }

    const indChanged = this.index !== indexTem
    if (indChanged) {
      this.events.emit('indexChanged', this.info())
      needContainerTransform = true
    } else if (this.items !== itemsTem) {
      this.additionalUpdates()
    } else if (this.fixedWidth || this.autoWidth) {
      this.updateSlideStatus()
      this.updateLiveRegion()
    }

    if (!this.disable && !this.freeze) {
      if (this.autoHeight) { this.doAutoHeight() }
      if (needContainerTransform) {
        this.doContainerTransformSilent()
        this.indexCached = this.index
      }
    }

    if (bpChanged) { this.events.emit('newBreakpointEnd', this.info(e)) }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ════════════════════════════════════════════════════════════════════════

  // mirrors Tiny Slider goTo
  goTo(targetIndex: number | 'next' | 'prev' | 'first' | 'last', e?: Event): void {
    if (this.freeze) return

    if (targetIndex === 'prev') {
      this.onControlsClick(e ?? null, -1)
      return
    }

    if (targetIndex === 'next') {
      this.onControlsClick(e ?? null, 1)
      return
    }

    // exact slide
    if (this.running) {
      if (this.preventActionWhenRunning) { return }
      else { this.onTransitionEnd() }
    }

    const absIndex = this.getAbsIndex()
    let indexGap = 0

    if (targetIndex === 'first') {
      indexGap = -absIndex
    } else if (targetIndex === 'last') {
      indexGap = this.slideCount_ - this.items - absIndex
    } else {
      let ti = typeof targetIndex !== 'number' ? parseInt(targetIndex as string) : targetIndex
      if (!isNaN(ti)) {
        // direct call: clamp to valid range
        if (!e) { ti = Math.max(0, Math.min(this.slideCount_ - 1, ti)) }
        indexGap = ti - absIndex
      }
    }

    this.index += indexGap

    // loop: keep index in bounds
    if (this.loop) {
      if (this.index < this.indexMin) { this.index += this.slideCount_ }
      if (this.index > this.indexMax) { this.index -= this.slideCount_ }
    }

    // only render if abs index actually changed
    if (this.getAbsIndex(this.index) !== this.getAbsIndex(this.indexCached)) {
      this.render(e ?? null)
    }
  }

  next(): void { this.goTo('next') }
  prev(): void { this.goTo('prev') }

  getInfo(e?: Event): SliderInfo {
    return this.info(e)
  }

  on(event: string, fn: (data: SliderInfo) => void): void {
    this.events.on(event, fn as (...args: unknown[]) => void)
  }

  off(event: string, fn: (data: SliderInfo) => void): void {
    this.events.off(event, fn as (...args: unknown[]) => void)
  }

  emit(event: string, data?: SliderInfo): void {
    this.events.emit(event, data)
  }

  destroy(): void {
    // sheet
    this.sheet.disabled = true
    const ownerNode = this.sheet.ownerNode as HTMLElement | null
    if (ownerNode) { ownerNode.remove() }

    // events
    removeEvents(window, this.resizeEvent)
    if (this.arrowKeys || Object.keys(this.docmentKeydownEvent).length) {
      removeEvents(document, this.docmentKeydownEvent)
    }
    removeEvents(this.container, this.transitionEvent)
    if (this.touch)     removeEvents(this.container, this.touchEvents)
    if (this.mouseDrag) removeEvents(this.container, this.dragEvents)

    // restore DOM
    const parent = this.outerWrapper.parentNode
    if (parent) {
      parent.insertBefore(this.container, this.outerWrapper)
      this.outerWrapper.remove()
    }

    // restore container classes + style
    this.container.removeAttribute('style')
    this.container.className = this.container.className
      .replace(this.newContainerClasses.substring(1), '')
      .trim()

    // remove cloned slides
    Array.from(this.slideItems).forEach(item => {
      if (hasClass(item as Element, CLS.CLONE)) (item as Element).remove()
    })

    // remove aria attrs from real slides
    const realSlides = Array.from(this.slideItems)
    realSlides.forEach(item => {
      const el = item as HTMLElement
      el.removeAttribute('aria-hidden')
      el.removeAttribute('tabindex')
      removeClass(el, CLS.ITEM)
      removeClass(el, CLS.ACTIVE)
    })

    // destroy plugins
    this._plugins.forEach(p => p.destroy())

    this.events.removeAll()
    this.isOn = false
  }

  // ── Info object (mirrors Tiny Slider info()) ────────────────────────────
  private info(e?: Event): SliderInfo {
    return {
      container:     this.container,
      slideItems:    this.slideItems,
      items:         this.items,
      slideBy:       this.slideBy,
      index:         this.index,
      indexCached:   this.indexCached,
      displayIndex:  this.getCurrentSlide(),
      slideCount:    this.slideCount_,
      slideCountNew: this.slideCountNew,
      cloneCount:    this.cloneCount,
      isOn:          this.isOn,
      event:         e,
    }
  }

  // ── Public computed props ─────────────────────────────────────────────
  get activeIndex_(): number { return this.getAbsIndex() }
  get currentItems(): number { return this.items }
}

// ── Convenience factory ──────────────────────────────────────────────────────
export function createSlider(target: string | HTMLElement, options?: SliderOptions): Slider {
  return new Slider(target, options)
}
