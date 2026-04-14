import { EventBus } from './events/EventBus'
import { PluginManager } from './plugin/PluginManager'
import { SlideEngine } from './engine/SlideEngine'
import { TouchHandler } from './engine/TouchHandler'
import { DragHandler } from './engine/DragHandler'
import { KeyboardNav } from './engine/KeyboardNav'
import { LoopManager } from './engine/LoopManager'
import { ResponsiveManager } from './engine/ResponsiveManager'
import { AriaManager } from './a11y/AriaManager'
import { ReducedMotion } from './a11y/ReducedMotion'
import { logger } from './logger/Logger'
import { isBrowser } from './ssr/guards'
import { setStyle, clearStyle, setTranslate, setTransition } from './utils/css'
import { addClass, removeClass, getChildren } from './utils/dom'
import { VERSION } from './version'

import type { SliderOptions } from './types/options'
import type { SliderEventMap, SliderInstance } from './types/events'
import type { SliderPlugin } from './types/plugin'
import type { GoToTarget } from './engine/SlideEngine'
import { DEFAULT_OPTIONS } from './types/options'

export class Slider implements SliderInstance {
  // ── Public state ──
  activeIndex: number
  previousIndex: number
  slides: HTMLElement[]
  isDestroyed: boolean = false
  readonly version: string = VERSION
  readonly container: HTMLElement
  readonly wrapper: HTMLElement

  // ── Private modules ──
  private eventBus: EventBus<SliderEventMap>
  private pluginManager: PluginManager
  private slideEngine: SlideEngine
  private touchHandler: TouchHandler
  private dragHandler: DragHandler
  private keyboardNav: KeyboardNav
  private loopManager: LoopManager
  private responsiveManager: ResponsiveManager
  private ariaManager: AriaManager
  private reducedMotion: ReducedMotion

  private options: SliderOptions
  private mergedOptions: SliderOptions
  private frozen: boolean = false
  private disabled: boolean = false
  private originalContainer: HTMLElement
  private loopEndListener: ((e: TransitionEvent) => void) | null = null

  constructor(container: HTMLElement | string, options: SliderOptions = {}) {
    if (!isBrowser()) {
      // SSR: create stub
      this.container = null as unknown as HTMLElement
      this.wrapper = null as unknown as HTMLElement
      this.slides = []
      this.activeIndex = 0
      this.previousIndex = 0
      this.options = options
      this.mergedOptions = options
      this.eventBus = new EventBus()
      this.pluginManager = new PluginManager(this)
      this.slideEngine = new SlideEngine({ activeIndex: 0, previousIndex: 0, slideCount: 0, slidesPerPage: 1, loop: false, rewind: false })
      this.touchHandler = null as unknown as TouchHandler
      this.dragHandler = null as unknown as DragHandler
      this.keyboardNav = null as unknown as KeyboardNav
      this.loopManager = null as unknown as LoopManager
      this.responsiveManager = null as unknown as ResponsiveManager
      this.ariaManager = null as unknown as AriaManager
      this.reducedMotion = new ReducedMotion()
      this.originalContainer = null as unknown as HTMLElement
      return
    }

    // Resolve container
    const el =
      typeof container === 'string'
        ? document.querySelector<HTMLElement>(container)
        : container

    if (!el) {
      logger.error(`Container element not found: "${String(container)}"`)
      throw new Error(`ACSlider: container not found`)
    }

    this.originalContainer = el
    this.container = el

    // Merge options with defaults
    this.options = options
    this.mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    this.disabled = this.mergedOptions.disabled ?? false

    this.eventBus = new EventBus<SliderEventMap>()

    // Resolve slides
    let wrapperEl = el.querySelector<HTMLElement>('.c--slider-a__wrapper')
    if (!wrapperEl) {
      // Auto-wrap direct children
      wrapperEl = document.createElement('div')
      wrapperEl.className = 'c--slider-a__wrapper'
      while (el.firstChild) {
        wrapperEl.appendChild(el.firstChild)
      }
      el.appendChild(wrapperEl)
    }
    this.wrapper = wrapperEl

    this.slides = getChildren(wrapperEl).filter((child) =>
      child.classList.contains('c--slider-a__slide') || child.hasAttribute('data-slide')
    )

    if (this.slides.length === 0) {
      logger.warn('No slides found in container. Slider not initialized.')
    }

    this.activeIndex = this.mergedOptions.startIndex ?? 0
    this.previousIndex = this.activeIndex

    // Init engine
    const slidesPerPage = (this.mergedOptions.slidesPerPage as number) || 1
    this.slideEngine = new SlideEngine({
      activeIndex: this.activeIndex,
      previousIndex: this.previousIndex,
      slideCount: this.slides.length,
      slidesPerPage,
      loop: this.mergedOptions.loop ?? false,
      rewind: this.mergedOptions.rewind ?? false,
    })

    // Init plugin manager
    this.pluginManager = new PluginManager(this)

    // Init loop
    this.loopManager = new LoopManager(this.wrapper, this.slides, this.mergedOptions)
    this.loopManager.init()

    // Init touch
    this.touchHandler = new TouchHandler(
      el,
      this.mergedOptions,
      this.eventBus,
      this,
      (dir) => this.goTo(dir)
    )
    this.touchHandler.init()

    // Init drag
    this.dragHandler = new DragHandler(
      el,
      this.mergedOptions,
      this.eventBus,
      this,
      (dir) => this.goTo(dir)
    )
    this.dragHandler.init()

    // Init keyboard
    this.keyboardNav = new KeyboardNav(
      el,
      this.mergedOptions,
      () => this.goTo('next'),
      () => this.goTo('prev')
    )
    this.keyboardNav.init()

    // Init reduced motion (must be before responsiveManager — applyLayout reads it)
    this.reducedMotion = new ReducedMotion()
    this.reducedMotion.init()

    // Init responsive
    this.responsiveManager = new ResponsiveManager(
      el,
      this.mergedOptions,
      this.eventBus,
      this,
      (merged) => this.applyBreakpoint(merged)
    )
    this.responsiveManager.init()

    // Init A11y
    this.ariaManager = new AriaManager(
      el,
      this.wrapper,
      this.slides,
      this.mergedOptions.a11y
    )
    this.ariaManager.init()

    // Add CSS classes
    addClass(el, 'c--slider-a--initialized')
    if (this.mergedOptions.direction === 'vertical') {
      addClass(el, 'c--slider-a--vertical')
    }

    // Register init-time event listeners
    if (options.on) {
      Object.entries(options.on).forEach(([event, handler]) => {
        if (handler) {
          this.eventBus.on(
            event as keyof SliderEventMap,
            handler as (payload: SliderEventMap[keyof SliderEventMap]) => void
          )
        }
      })
    }

    // Register plugins
    if (options.plugins) {
      options.plugins.forEach((plugin) => this.pluginManager.use(plugin))
    }

    // Check freeze
    this.checkFreeze()

    this.eventBus.emit('beforeInit', { slider: this })
    this.applyLayout()
    this.ariaManager.update(this.activeIndex)
    this.eventBus.emit('afterInit', { slider: this })

    logger.info(
      `Slider initialized. ${this.slides.length} slides, ${slidesPerPage} per page.`
    )
  }

  // ═══════════════════════════
  //  GETTERS
  // ═══════════════════════════

  get slideCount(): number {
    return this.slides.length
  }

  get isBeginning(): boolean {
    return this.slideEngine.isBeginning
  }

  get isEnd(): boolean {
    return this.slideEngine.isEnd
  }

  get progress(): number {
    return this.slideEngine.progress
  }

  get isOn(): boolean {
    return !this.isDestroyed && !this.frozen && !this.disabled
  }

  // ═══════════════════════════
  //  NAVIGATION
  // ═══════════════════════════

  goTo(target: GoToTarget): void {
    if (this.guardDestroyed('goTo')) return
    if (!this.isOn) return

    // Seamless infinite loop: animate through clone then silently jump to real slide
    if (this.mergedOptions.loop && this.slides.length > 1) {
      const slidesPerPage = (this.mergedOptions.slidesPerPage as number) || 1
      const last = Math.max(this.slides.length - slidesPerPage, 0)
      if (last > 0) {
        if (target === 'next' && this.activeIndex >= last) {
          this.handleLoopBoundary(this.slides.length, 0, 'next')
          return
        }
        if (target === 'prev' && this.activeIndex <= 0) {
          this.handleLoopBoundary(-1, last, 'prev')
          return
        }
      }
    }

    const index = this.slideEngine.resolve(target)
    if (index === null) return

    const direction = index > this.activeIndex ? 'next' : 'prev'

    this.eventBus.emit('beforeSlideChange', {
      from: this.activeIndex,
      to: index,
      direction,
      slider: this,
    })
    this.eventBus.emit('beforeTransitionStart', {
      from: this.activeIndex,
      to: index,
      direction,
      slider: this,
    })

    this.slideEngine.commit(index)
    this.activeIndex = this.slideEngine.activeIndex
    this.previousIndex = this.slideEngine.previousIndex

    this.applyLayout()
    this.updateSlideClasses()
    this.ariaManager.update(this.activeIndex)

    this.eventBus.emit('afterSlideChange', {
      index: this.activeIndex,
      previousIndex: this.previousIndex,
      slide: this.slides[this.activeIndex],
      slider: this,
    })
    this.eventBus.emit('afterTransitionEnd', {
      index: this.activeIndex,
      previousIndex: this.previousIndex,
      slide: this.slides[this.activeIndex],
      slider: this,
    })
    this.eventBus.emit('progress', {
      progress: this.progress,
      activeIndex: this.activeIndex,
      slider: this,
    })
  }

  next(): void {
    this.goTo('next')
  }

  prev(): void {
    this.goTo('prev')
  }

  // ═══════════════════════════
  //  AUTOPLAY PROXY
  // ═══════════════════════════

  play(): void {
    if (this.guardDestroyed('play')) return
    const plugin = this.pluginManager.get('autoplay')
    if (!plugin) {
      logger.warn('play() called but autoplay plugin is not registered.')
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(plugin as any).start?.()
  }

  pause(): void {
    if (this.guardDestroyed('pause')) return
    const plugin = this.pluginManager.get('autoplay')
    if (!plugin) {
      logger.warn('pause() called but autoplay plugin is not registered.')
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(plugin as any).stop?.()
  }

  // ═══════════════════════════
  //  STATE
  // ═══════════════════════════

  update(): void {
    if (this.guardDestroyed('update')) return
    this.applyLayout()
    this.checkFreeze()
  }

  updateSliderHeight(): void {
    if (this.guardDestroyed('updateSliderHeight')) return
    const activeSlide = this.slides[this.activeIndex]
    if (activeSlide) {
      setStyle(this.wrapper, { height: `${activeSlide.offsetHeight}px` })
    }
  }

  getInfo(): Record<string, unknown> {
    return {
      container: this.container,
      wrapper: this.wrapper,
      slides: this.slides,
      slideCount: this.slides.length,
      cloneCount: this.loopManager?.cloneCount ?? 0,
      slidesPerPage: (this.mergedOptions.slidesPerPage as number) || 1,
      activeIndex: this.activeIndex,
      previousIndex: this.previousIndex,
      isBeginning: this.isBeginning,
      isEnd: this.isEnd,
      isOn: this.isOn,
      isDestroyed: this.isDestroyed,
      progress: this.progress,
      direction: this.mergedOptions.direction ?? 'horizontal',
      loop: this.mergedOptions.loop ?? false,
      rewind: this.mergedOptions.rewind ?? false,
      gutter: this.mergedOptions.gutter ?? 0,
      edgePadding: this.mergedOptions.edgePadding ?? 0,
      speed: this.mergedOptions.speed ?? 300,
      breakpoint: this.responsiveManager?.currentBreakpoint ?? null,
      plugins: this.pluginManager.getNames(),
      version: this.version,
    }
  }

  enable(): void {
    this.disabled = false
    this.frozen = false
    removeClass(this.container, 'c--slider-a--disabled', 'c--slider-a--frozen')
  }

  disable(): void {
    this.disabled = true
    addClass(this.container, 'c--slider-a--disabled')
  }

  // ═══════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════

  destroy(): void {
    if (this.isDestroyed) {
      logger.warn('Slider already destroyed.')
      return
    }

    this.eventBus.emit('beforeDestroy', { slider: this })

    // 1. Plugins
    this.pluginManager.destroyAll()

    // 2. Core handlers
    this.touchHandler?.destroy()
    this.dragHandler?.destroy()
    this.keyboardNav?.destroy()
    this.responsiveManager?.destroy()
    this.reducedMotion?.destroy()

    // 3. A11y
    this.ariaManager?.destroy()

    // 4. Loop clones & pending loop transition
    if (this.loopEndListener) {
      this.wrapper?.removeEventListener('transitionend', this.loopEndListener)
      this.loopEndListener = null
    }
    this.loopManager?.destroy()

    // 5. DOM restoration
    this.slides.forEach((slide) => {
      clearStyle(slide, 'transform', 'transition', 'width', 'height')
    })
    clearStyle(this.wrapper, 'transform', 'transition')
    clearStyle(this.container, 'cursor')

    // Remove init classes
    removeClass(
      this.container,
      'c--slider-a--initialized',
      'c--slider-a--vertical',
      'c--slider-a--frozen',
      'c--slider-a--disabled'
    )

    this.isDestroyed = true

    this.eventBus.emit('afterDestroy', { slider: this })
    this.eventBus.removeAll()
  }

  rebuild(newOptions?: Partial<SliderOptions>): Slider {
    const opts = { ...this.options, ...newOptions }
    const container = this.originalContainer
    this.destroy()
    return new Slider(container, opts)
  }

  // ═══════════════════════════
  //  EVENTS POST-INIT
  // ═══════════════════════════

  on<K extends keyof SliderEventMap>(
    event: K,
    handler: (payload: SliderEventMap[K]) => void
  ): void {
    this.eventBus.on(event, handler)
  }

  off<K extends keyof SliderEventMap>(
    event: K,
    handler: (payload: SliderEventMap[K]) => void
  ): void {
    this.eventBus.off(event, handler)
  }

  // ═══════════════════════════
  //  PLUGIN ACCESS
  // ═══════════════════════════

  use(plugin: SliderPlugin): void {
    this.pluginManager.use(plugin)
  }

  // ═══════════════════════════
  //  PRIVATE
  // ═══════════════════════════

  private applyLayout(overrides: { virtualIndex?: number; instant?: boolean } = {}): void {
    const isHorizontal = this.mergedOptions.direction !== 'vertical'
    const slidesPerPage = (this.mergedOptions.slidesPerPage as number) || 1
    const gutter = this.mergedOptions.gutter ?? 0
    const edgePadding = this.mergedOptions.edgePadding ?? 0
    const baseSpeed = this.reducedMotion.isReduced() ? 0 : (this.mergedOptions.speed ?? 300)
    const speed = overrides.instant ? 0 : baseSpeed
    const activeIndex = overrides.virtualIndex ?? this.activeIndex

    const containerSize = isHorizontal
      ? this.container.offsetWidth - edgePadding * 2
      : this.container.offsetHeight - edgePadding * 2

    const slideSize = (containerSize - gutter * (slidesPerPage - 1)) / slidesPerPage

    // Apply width/height to ALL wrapper children (original slides + loop clones)
    const allChildren = getChildren(this.wrapper)
    allChildren.forEach((child, i) => {
      if (isHorizontal) {
        setStyle(child, {
          width: `${slideSize}px`,
          marginRight: i < allChildren.length - 1 ? `${gutter}px` : '0',
        })
      } else {
        setStyle(child, {
          height: `${slideSize}px`,
          marginBottom: i < allChildren.length - 1 ? `${gutter}px` : '0',
        })
      }
    })

    // Account for prepended loop clones in the translate offset
    const clonesBeforeCount = this.loopManager?.clonesBefore ?? 0
    const offset = -((activeIndex + clonesBeforeCount) * (slideSize + gutter)) + edgePadding
    setTransition(this.wrapper, speed)

    if (isHorizontal) {
      setTranslate(this.wrapper, offset, 0)
    } else {
      setTranslate(this.wrapper, 0, offset)
    }
  }

  /** Animate to a clone position then silently jump back to the real slide */
  private handleLoopBoundary(virtualIndex: number, targetIndex: number, direction: 'next' | 'prev'): void {
    const fromIndex = this.activeIndex

    // Clean up any pending listener from a previous interrupted transition
    if (this.loopEndListener) {
      this.wrapper.removeEventListener('transitionend', this.loopEndListener)
      this.loopEndListener = null
    }

    this.eventBus.emit('beforeSlideChange', { from: fromIndex, to: targetIndex, direction, slider: this })
    this.eventBus.emit('beforeTransitionStart', { from: fromIndex, to: targetIndex, direction, slider: this })

    const speed = this.reducedMotion.isReduced() ? 0 : (this.mergedOptions.speed ?? 300)

    if (speed === 0) {
      // No animation — jump directly to the real slide
      this.commitLoopJump(targetIndex, fromIndex)
      return
    }

    // Animate to the clone position
    this.applyLayout({ virtualIndex })

    // Fire after the wrapper.style.transform is already set to the clone-zone target.
    // Listeners can read wrapper.style.transform to snap GSAP effects (rotation, blur, etc.)
    // so clones look correct as they animate into view.
    this.eventBus.emit('beforeLoopBoundary', { direction, targetIndex, slider: this })

    // After the CSS transition ends, silently teleport to the real slide position
    this.loopEndListener = (e: TransitionEvent) => {
      if (e.target !== this.wrapper || e.propertyName !== 'transform') return
      this.wrapper.removeEventListener('transitionend', this.loopEndListener!)
      this.loopEndListener = null
      this.commitLoopJump(targetIndex, fromIndex)
    }
    this.wrapper.addEventListener('transitionend', this.loopEndListener)
  }

  /** Silently commit the real slide index after a loop boundary animation */
  private commitLoopJump(targetIndex: number, fromIndex: number): void {
    this.slideEngine.commit(targetIndex)
    this.activeIndex = targetIndex
    this.previousIndex = fromIndex

    // Instant jump — no transition
    this.applyLayout({ instant: true })
    this.updateSlideClasses()
    this.ariaManager.update(this.activeIndex)

    this.eventBus.emit('afterSlideChange', {
      index: this.activeIndex,
      previousIndex: this.previousIndex,
      slide: this.slides[this.activeIndex],
      slider: this,
    })
    this.eventBus.emit('afterTransitionEnd', {
      index: this.activeIndex,
      previousIndex: this.previousIndex,
      slide: this.slides[this.activeIndex],
      slider: this,
    })
    this.eventBus.emit('progress', {
      progress: this.progress,
      activeIndex: this.activeIndex,
      slider: this,
    })
  }

  private updateSlideClasses(): void {
    this.slides.forEach((slide, i) => {
      removeClass(
        slide,
        'c--slider-a__slide--active',
        'c--slider-a__slide--prev',
        'c--slider-a__slide--next',
        'c--slider-a__slide--visible'
      )
      if (i === this.activeIndex) {
        addClass(slide, 'c--slider-a__slide--active')
      } else if (i === this.activeIndex - 1) {
        addClass(slide, 'c--slider-a__slide--prev')
      } else if (i === this.activeIndex + 1) {
        addClass(slide, 'c--slider-a__slide--next')
      }
    })
  }

  private checkFreeze(): void {
    if (!this.mergedOptions.freezable) return
    const slidesPerPage = (this.mergedOptions.slidesPerPage as number) || 1
    if (this.slides.length <= slidesPerPage) {
      this.frozen = true
      addClass(this.container, 'c--slider-a--frozen')
    } else {
      this.frozen = false
      removeClass(this.container, 'c--slider-a--frozen')
    }
  }

  private applyBreakpoint(merged: SliderOptions): void {
    this.mergedOptions = merged
    this.slideEngine.update((merged.slidesPerPage as number) || 1)
    this.applyLayout()
    this.checkFreeze()
  }

  private guardDestroyed(method: string): boolean {
    if (this.isDestroyed) {
      logger.error(`Cannot call ${method}() on a destroyed slider instance.`)
      return true
    }
    return false
  }
}
