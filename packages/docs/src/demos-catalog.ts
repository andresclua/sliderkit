export interface DemoEntry {
  slug: string
  /** Short label used in the sidebar */
  label: string
  /** Full title shown inside the demo page */
  title: string
  /** One-sentence description of what the demo covers */
  description: string
  /** Searchable tags */
  tags: string[]
  /** Nav group key */
  group: 'core' | 'plugins' | 'effects' | 'lifecycle' | 'webgl'
}

export const DEMOS: DemoEntry[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  {
    slug: 'base',
    label: 'Base',
    title: 'Base slider',
    description: 'The minimal slider setup — one slide at a time, loop enabled, touch and keyboard navigation out of the box. Start here if you\'re new to the library; every other demo builds on top of this.',
    tags: ['core', 'basic', 'loop', 'touch', 'keyboard'],
    group: 'core',
  },
  {
    slug: 'non-loop',
    label: 'Non-loop',
    title: 'Non-loop',
    description: 'Linear slider that stops at the first and last slide. Arrows auto-disable at the boundaries. Use this when the sequence has a clear start and end — e.g. a step-by-step wizard, an onboarding flow, or a product gallery where wrapping around would be confusing.',
    tags: ['core', 'no-loop', 'linear', 'boundaries', 'arrows'],
    group: 'core',
  },
  {
    slug: 'rewind',
    label: 'Rewind',
    title: 'Rewind',
    description: 'Like non-loop but with a twist: reaching the last slide and pressing Next jumps back to the first (and vice versa) in a single animated step — no clones, no infinite loop. Good for carousels that feel bounded but still allow continuous browsing.',
    tags: ['core', 'rewind', 'no-loop', 'wrap'],
    group: 'core',
  },
  {
    slug: 'infinite-loop',
    label: 'Infinite Loop',
    title: 'Infinite Loop',
    description: 'Enable seamless infinite navigation with loop: true. Boundary slides are cloned in the DOM so every transition — including last→first and first→last — looks continuous with no visible jump.',
    tags: ['core', 'loop', 'infinite', 'clones', 'seamless', 'wrap'],
    group: 'core',
  },
  {
    slug: 'start-index',
    label: 'Start Index',
    title: 'Start Index',
    description: 'Open the slider at any slide index with `startIndex` (0-based). Useful for deep-linking to a specific item, restoring a saved position, or showing a "featured" slide on load without user interaction.',
    tags: ['core', 'start-index', 'initial-slide', 'api'],
    group: 'core',
  },
  {
    slug: 'vertical',
    label: 'Vertical',
    title: 'Vertical slider',
    description: 'Top-to-bottom track instead of the default horizontal one. Set `direction: "vertical"` and give the container a fixed height. Supports touch swipe up/down, arrow keys, and the arrows plugin. Ideal for full-page scroll experiences or timeline layouts.',
    tags: ['core', 'vertical', 'direction', 'touch', 'keyboard'],
    group: 'core',
  },
  {
    slug: 'mouse-drag',
    label: 'Mouse Drag',
    title: 'Mouse Drag',
    description: 'Enable `mouseDrag: true` to let desktop users click and drag the slider just like a touch swipe. Add `grabCursor: true` to show a grab cursor on hover. Great for image galleries or any slider where mouse users expect the same feel as touch.',
    tags: ['core', 'drag', 'mouse', 'desktop', 'grab-cursor'],
    group: 'core',
  },
  {
    slug: 'gutter-edgepadding',
    label: 'Gutter & Edge Padding',
    title: 'Gutter & Edge Padding',
    description: '`gutter` sets a fixed pixel gap between slides. `edgePadding` shrinks each slide so adjacent ones peek in from the sides, hinting that there is more to scroll. Use together for card-style multi-slide layouts.',
    tags: ['core', 'multi-slide', 'gutter', 'edge-padding', 'peek', 'gap'],
    group: 'core',
  },
  {
    slug: 'responsive',
    label: 'Responsive',
    title: 'Responsive / Breakpoints',
    description: 'Pass a `breakpoints` map to change any option at specific container widths — `slidesPerPage`, `gutter`, `loop`, and more. The slider watches its own width via ResizeObserver, so it reacts to container resizes too, not just window resizes.',
    tags: ['core', 'responsive', 'breakpoints', 'multi-slide', 'resize'],
    group: 'core',
  },
  {
    slug: 'auto-height',
    label: 'Auto Height',
    title: 'Auto Height',
    description: 'The container animates its height to match each slide\'s natural height on every slide change. Use this when slides contain variable-length content like text blocks, accordions, or dynamic data — no need to set a fixed height.',
    tags: ['core', 'height', 'animation', 'variable-height', 'auto-height'],
    group: 'core',
  },
  {
    slug: 'freeze-disable',
    label: 'Freeze / Disable',
    title: 'Freeze & Disable',
    description: 'Set `freezable: true` and the slider automatically disables itself when all slides fit on one page at once — arrows, pagination, and drag all disappear because there is nothing to scroll. The classic use case is a responsive card row: on desktop you show 4 cards per page and only have 4 items, so the slider freezes; on mobile you show 1 per page, so it wakes back up. You can also call `disable()` and `enable()` manually for conditional cases like a loading state or a locked step in a wizard.',
    tags: ['core', 'freeze', 'disable', 'enable', 'api', 'conditional'],
    group: 'core',
  },

  // ── Plugins ───────────────────────────────────────────────────────────────
  {
    slug: 'arrows',
    label: 'Arrows',
    title: 'Arrows',
    description: 'Adds prev/next buttons. By default they are auto-created and injected inside the container. Pass `prevEl` / `nextEl` selectors to use your own buttons anywhere in the DOM — useful when the design places arrows outside the slide area.',
    tags: ['plugin', 'arrows', 'navigation', 'buttons', 'prev', 'next'],
    group: 'plugins',
  },
  {
    slug: 'pagination-dots',
    label: 'Pagination — Dots',
    title: 'Pagination — Dots',
    description: 'The classic dot row. Each dot maps to one slide (or one page when `slidesPerPage > 1`). Set `clickable: true` to let users jump directly to any slide. The active dot scales up and changes colour.',
    tags: ['plugin', 'pagination', 'dots', 'bullets', 'navigation', 'clickable'],
    group: 'plugins',
  },
  {
    slug: 'pagination-fraction',
    label: 'Pagination — Fraction',
    title: 'Pagination — Fraction',
    description: 'Shows a plain-text "2 / 5" counter. With `slidesPerPage > 1` the numerator tracks pages rather than individual slides. Useful when you want position context without the visual weight of dots — common in fullscreen heroes or image lightboxes.',
    tags: ['plugin', 'pagination', 'fraction', 'counter', 'text', 'navigation'],
    group: 'plugins',
  },
  {
    slug: 'pagination-progress',
    label: 'Pagination — Progress',
    title: 'Pagination — Progress Bar',
    description: 'A horizontal bar below the slider that fills proportionally as you advance. Communicates progress at a glance without taking up per-slide space. Works best in linear (non-loop) sliders with a clear start and end.',
    tags: ['plugin', 'pagination', 'progress', 'bar', 'navigation'],
    group: 'plugins',
  },
  {
    slug: 'pagination-dynamic',
    label: 'Pagination — Dynamic',
    title: 'Pagination — Dynamic bullets',
    description: 'Like dots, but nearby bullets shrink progressively by distance from the active one. Keeps the pagination compact when there are many slides — dots don\'t overflow the container. Enable with `type: "dynamic"` and `dynamicBullets: true`.',
    tags: ['plugin', 'pagination', 'dots', 'dynamic', 'bullets', 'shrink', 'navigation'],
    group: 'plugins',
  },
  {
    slug: 'pagination-custom',
    label: 'Pagination — Custom',
    title: 'Pagination — Custom',
    description: 'Provide a `renderBullet` function to return any HTML string for each bullet. Use it to render slide thumbnails, numbers, or icons as navigation — complete control over markup while the active state is still managed for you.',
    tags: ['plugin', 'pagination', 'custom', 'render', 'html', 'navigation'],
    group: 'plugins',
  },
  {
    slug: 'autoplay',
    label: 'Autoplay',
    title: 'Autoplay',
    description: 'Auto-advances every N milliseconds. Set `pauseOnHover: true` to pause when the user moves over the slider. Call `slider.play()` and `slider.pause()` for manual control — handy for a play/pause button in hero banners or background slideshows.',
    tags: ['plugin', 'autoplay', 'timer', 'auto-advance', 'pause', 'hover'],
    group: 'plugins',
  },
  {
    slug: 'thumbnails',
    label: 'Thumbnails',
    title: 'Thumbnails',
    description: 'Renders a row of thumbnail previews below the main slider, always highlighting the active one. Click any thumbnail to jump directly to that slide. Ideal for photo galleries or product image carousels where users want to see all available images at a glance.',
    tags: ['plugin', 'thumbnails', 'preview', 'strip', 'navigation', 'images'],
    group: 'plugins',
  },
  {
    slug: 'progress-bar',
    label: 'Progress Bar',
    title: 'Progress Bar',
    description: 'A thin bar pinned to the top edge of the slider that fills proportionally as you advance. Less obtrusive than dot pagination — a good choice for hero sliders where you want minimal UI but still want to signal how many items remain.',
    tags: ['plugin', 'progress', 'bar', 'indicator', 'overlay'],
    group: 'plugins',
  },
  {
    slug: 'slide-counter',
    label: 'Slide Counter',
    title: 'Slide Counter',
    description: 'Injects an overlay badge in the top-right corner showing "current / total" (e.g. "2 / 5"). No extra HTML needed — the plugin creates and updates the element. Useful in fullscreen or edge-to-edge sliders where you need position context without a dot row.',
    tags: ['plugin', 'counter', 'overlay', 'badge', 'number'],
    group: 'plugins',
  },
  {
    slug: 'mousewheel',
    label: 'Mouse Wheel',
    title: 'Mouse Wheel',
    description: 'Lets users scroll through slides with the mouse wheel or trackpad. `forceToAxis: true` intercepts only horizontal (or vertical) scroll, so vertical page scroll still works normally outside the slider. A built-in debounce prevents accidentally skipping multiple slides.',
    tags: ['plugin', 'mouse', 'wheel', 'scroll', 'trackpad', 'desktop'],
    group: 'plugins',
  },
  {
    slug: 'lazy-load',
    label: 'Lazy Load',
    title: 'Lazy Load',
    description: 'Images use `data-src` instead of `src` and are only loaded when their slide is about to enter the viewport (via IntersectionObserver). Reduces initial page weight significantly for sliders with many images. Set `rootMargin` to start loading a slide or two ahead.',
    tags: ['plugin', 'lazy', 'images', 'performance', 'loading', 'intersection-observer'],
    group: 'plugins',
  },
  {
    slug: 'parallax-css',
    label: 'Parallax CSS',
    title: 'Parallax CSS',
    description: 'Any element inside a slide with `data-parallax` moves at a fraction of the slide\'s speed, creating a sense of depth. Set the `depth` factor (0–1) to control intensity. Pure CSS transforms — no canvas, no WebGL required.',
    tags: ['plugin', 'parallax', 'depth', 'css', 'effect', 'transform'],
    group: 'plugins',
  },
  {
    slug: 'virtual-slides',
    label: 'Virtual Slides',
    title: 'Virtual Slides',
    description: 'Only the active slide ± N neighbours are rendered in the DOM; the rest are placeholders. Essential for large datasets (hundreds of slides) or dynamically generated content where mounting everything at once would hurt performance.',
    tags: ['plugin', 'virtual', 'performance', 'large', 'dataset', 'dom'],
    group: 'plugins',
  },

  // ── Effects ───────────────────────────────────────────────────────────────
  {
    slug: 'effect-fade',
    label: 'Fade',
    title: 'CSS Effect — Fade',
    description: 'Slides stack absolutely on top of each other and cross-fade with an opacity transition instead of scrolling sideways. Works best with `slidesPerPage: 1`. A clean, minimal choice for hero banners or testimonial sliders.',
    tags: ['effect', 'fade', 'opacity', 'cross-fade', 'css', 'transition'],
    group: 'effects',
  },
  {
    slug: 'effect-cube',
    label: 'Cube',
    title: 'CSS Effect — Cube',
    description: 'Slides become the six faces of a 3D cube that rotates on each transition. Eye-catching but deliberate — works best with bold, full-bleed visuals and a slow `speed`. Pure CSS perspective, no WebGL.',
    tags: ['effect', 'cube', '3d', 'rotate', 'css', 'perspective'],
    group: 'effects',
  },
  {
    slug: 'effect-coverflow',
    label: 'Coverflow',
    title: 'CSS Effect — Coverflow',
    description: 'Renders multiple slides simultaneously with depth and 3D rotation around the Y axis, mimicking the iTunes coverflow. Combine with `slidesPerPage: 3` and `edgePadding` for the best result. Controlled via `rotate` and `depth` options.',
    tags: ['effect', 'coverflow', '3d', 'depth', 'rotate', 'css', 'itunes'],
    group: 'effects',
  },
  {
    slug: 'effect-flip',
    label: 'Flip',
    title: 'CSS Effect — Flip',
    description: 'Each slide transition looks like flipping a physical card along the horizontal axis. Works with `slidesPerPage: 1`. Good for "before / after" comparisons or flashcard-style UIs.',
    tags: ['effect', 'flip', '3d', 'card', 'rotate', 'css'],
    group: 'effects',
  },
  {
    slug: 'effect-cards',
    label: 'Cards',
    title: 'CSS Effect — Cards',
    description: 'Slides stack like a physical deck of cards with slight rotation offsets. The top card sweeps away on each transition to reveal the next one. Great for testimonials, pricing tiers, or any content that benefits from a "stack" metaphor.',
    tags: ['effect', 'cards', 'stack', 'deck', 'css'],
    group: 'effects',
  },
  {
    slug: 'effect-creative',
    label: 'Creative',
    title: 'CSS Effect — Creative',
    description: 'Defines a custom transform (translate, rotate, scale, opacity) for each slide position relative to the active one — previous, active, and next can each animate differently. Use this to build any transition that the other effects don\'t cover.',
    tags: ['effect', 'creative', 'custom', 'transform', 'css', 'translate', 'scale'],
    group: 'effects',
  },

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  {
    slug: 'gsap-scroll-lazy',
    label: 'Boostify + GSAP',
    title: 'boostify.scroll() — Lazy Load + GSAP',
    description: 'boostify.scroll({ distance: 300 }) fires once the user scrolls 300 px. @andresclua/sliderkit, @andresclua/sliderkit-plugins and gsap are all absent from the initial bundle — fetched in parallel inside the async callback. Two animations: staggered entrance on arrival, side-slide on navigation.',
    tags: ['gsap', 'lazy', 'dynamic-import', 'scroll', 'boostify', 'performance', 'animation'],
    group: 'lifecycle',
  },
  {
    slug: 'gsap-hooks',
    label: 'GSAP Hooks',
    title: 'GSAP — Text & Image Hooks',
    description: 'Use beforeSlideChange and afterSlideChange to drive GSAP animations — staggered text reveals on a hero image slider, and per-element card entrances on a multi-slide layout.',
    tags: ['gsap', 'animation', 'hooks', 'events', 'text', 'images', 'stagger'],
    group: 'lifecycle',
  },
  {
    slug: 'destroy-rebuild',
    label: 'Destroy & Rebuild',
    title: 'Destroy & Rebuild',
    description: '`destroy()` removes all DOM mutations, event listeners, and plugin state — the HTML returns to its original form. `rebuild()` re-initializes the instance, optionally with a new config object. Useful for framework unmount/remount cycles or switching between mobile and desktop layouts.',
    tags: ['lifecycle', 'destroy', 'rebuild', 'api', 'cleanup'],
    group: 'lifecycle',
  },
  {
    slug: 'get-info',
    label: 'getInfo()',
    title: 'getInfo()',
    description: 'Returns a live snapshot of the slider state: current index, total slides, `isBeginning`, `isEnd`, active breakpoint, and more. Call it at any time or listen for events and call it in the handler to drive external UI — counters, breadcrumbs, custom progress bars.',
    tags: ['lifecycle', 'api', 'state', 'debug', 'info', 'index'],
    group: 'lifecycle',
  },
  {
    slug: 'events-on-off',
    label: 'Events on/off',
    title: 'Events on / off',
    description: 'Subscribe to slider events with `slider.on(eventName, handler)` and unsubscribe with `slider.off(eventName, handler)` — at any point after initialization, not just in the options object. Useful for conditionally listening based on app state without rebuilding the slider.',
    tags: ['lifecycle', 'events', 'api', 'callback', 'listener'],
    group: 'lifecycle',
  },

  // ── WebGL ─────────────────────────────────────────────────────────────────
  {
    slug: 'webgl-displacement',
    label: 'Displacement',
    title: 'WebGL — Displacement',
    description: 'A greyscale displacement map texture distorts the slide image on transition using a GLSL fragment shader. The intensity and direction of the warp follow the map\'s luminance values — swap the texture to completely change the feel of the transition.',
    tags: ['webgl', 'displacement', 'shader', 'glsl', 'texture', 'warp'],
    group: 'webgl',
  },
  {
    slug: 'webgl-rgbshift',
    label: 'RGB Shift',
    title: 'WebGL — RGB Shift',
    description: 'Separates the red, green, and blue channels and offsets them in different directions, producing a chromatic aberration or glitch aesthetic on transition. Subtle at low values, intense at high ones — control it via the `amount` uniform.',
    tags: ['webgl', 'rgb', 'shift', 'glitch', 'chromatic', 'shader'],
    group: 'webgl',
  },
  {
    slug: 'webgl-pixeldissolve',
    label: 'Pixel Dissolve',
    title: 'WebGL — Pixel Dissolve',
    description: 'Uses a noise function to dissolve the outgoing slide into random pixels before the incoming one materialises. The threshold sweeps across the noise field over time, creating a organic, non-linear dissolve without any pre-baked textures.',
    tags: ['webgl', 'dissolve', 'noise', 'pixel', 'shader', 'transition'],
    group: 'webgl',
  },
  {
    slug: 'webgl-parallax-hover',
    label: 'Parallax Hover',
    title: 'WebGL — Parallax Hover',
    description: 'Mouse position is passed as a uniform to a shader that displaces depth layers at different rates, creating a parallax illusion without moving the camera. Each slide can define its own layer configuration. No slide transition needed — the effect runs continuously on mouse move.',
    tags: ['webgl', 'parallax', 'hover', 'mouse', 'depth', 'shader'],
    group: 'webgl',
  },
  {
    slug: 'webgl-custom-shader',
    label: 'Custom Shader',
    title: 'WebGL — Custom Shader',
    description: 'A minimal boilerplate for writing your own GLSL transition shader from scratch. The setup handles canvas sizing, texture binding, and the progress uniform — you only need to write the fragment shader logic that blends `uTexture0` and `uTexture1` based on `uProgress`.',
    tags: ['webgl', 'shader', 'glsl', 'custom', 'example'],
    group: 'webgl',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export const GROUP_LABELS: Record<DemoEntry['group'], string> = {
  core:      'Core',
  plugins:   'Plugins',
  effects:   'Effects CSS',
  lifecycle: 'Lifecycle',
  webgl:     'WebGL',
}

/** Returns demos ordered as they appear in each nav group. */
export function getDemosByGroup(group: DemoEntry['group']): DemoEntry[] {
  return DEMOS.filter(d => d.group === group)
}

/** Full-text + tag search. Returns matching demos ranked by relevance. */
export function searchDemos(query: string): DemoEntry[] {
  const q = query.toLowerCase().trim()
  if (!q) return DEMOS

  return DEMOS.filter(d => {
    return (
      d.title.toLowerCase().includes(q) ||
      d.label.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.tags.some(t => t.includes(q))
    )
  })
}
