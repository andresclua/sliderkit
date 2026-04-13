export interface NavItem {
  label: string
  href: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const docsNav: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs/getting-started' },
      { label: 'Installation', href: '/docs/installation' },
      { label: 'Styling', href: '/docs/styling' },
    ],
  },
  {
    title: 'Core API',
    items: [
      { label: 'Options', href: '/docs/options' },
      { label: 'Methods', href: '/docs/methods' },
      { label: 'Events', href: '/docs/events' },
      { label: 'Breakpoints', href: '/docs/breakpoints' },
      { label: 'Accessibility', href: '/docs/accessibility' },
      { label: 'SSR', href: '/docs/ssr' },
    ],
  },
  {
    title: 'Plugins',
    items: [
      { label: 'Overview', href: '/docs/plugins' },
      { label: 'Autoplay', href: '/docs/plugins/autoplay' },
      { label: 'Arrows', href: '/docs/plugins/arrows' },
      { label: 'Pagination', href: '/docs/plugins/pagination' },
      { label: 'Thumbnails', href: '/docs/plugins/thumbnails' },
      { label: 'Progress Bar', href: '/docs/plugins/progress-bar' },
      { label: 'Slide Counter', href: '/docs/plugins/slide-counter' },
      { label: 'Mouse Wheel', href: '/docs/plugins/mouse-wheel' },
      { label: 'Lazy Load', href: '/docs/plugins/lazy-load' },
      { label: 'Parallax', href: '/docs/plugins/parallax' },
      { label: 'Auto Height', href: '/docs/plugins/auto-height' },
      { label: 'Virtual Slides', href: '/docs/plugins/virtual-slides' },
      { label: 'Center Mode', href: '/docs/plugins/center-mode' },
      { label: 'Variable Width', href: '/docs/plugins/variable-width' },
    ],
  },
  {
    title: 'Effects',
    items: [
      { label: 'Overview', href: '/docs/effects' },
      { label: 'Fade', href: '/docs/effects/fade' },
      { label: 'Cube', href: '/docs/effects/cube' },
      { label: 'Coverflow', href: '/docs/effects/coverflow' },
      { label: 'Flip', href: '/docs/effects/flip' },
      { label: 'Cards', href: '/docs/effects/cards' },
      { label: 'Creative', href: '/docs/effects/creative' },
    ],
  },
  {
    title: 'WebGL',
    items: [
      { label: 'Overview', href: '/docs/webgl' },
      { label: 'Custom Shaders', href: '/docs/custom-shaders' },
      { label: 'GSAP Integration', href: '/docs/gsap' },
    ],
  },
  {
    title: 'Lifecycle',
    items: [
      { label: 'Destroy & Rebuild', href: '/docs/destroy' },
      { label: 'Sponsor', href: '/docs/sponsor' },
    ],
  },
]

export const demosNav: NavGroup[] = [
  {
    title: 'Core',
    items: [
      { label: 'Base', href: '/demos/base' },
      { label: 'Non-loop', href: '/demos/non-loop' },
      { label: 'Rewind', href: '/demos/rewind' },
      { label: 'Start Index', href: '/demos/start-index' },
      { label: 'Vertical', href: '/demos/vertical' },
      { label: 'Mouse Drag', href: '/demos/mouse-drag' },
      { label: 'Gutter & Edge Padding', href: '/demos/gutter-edgepadding' },
      { label: 'Responsive', href: '/demos/responsive' },
      { label: 'Auto Height', href: '/demos/auto-height' },
      { label: 'Freeze / Disable', href: '/demos/freeze-disable' },
    ],
  },
  {
    title: 'Plugins',
    items: [
      { label: 'Arrows', href: '/demos/arrows' },
      { label: 'Pagination — Dots', href: '/demos/pagination-dots' },
      { label: 'Pagination — Fraction', href: '/demos/pagination-fraction' },
      { label: 'Pagination — Progress', href: '/demos/pagination-progress' },
      { label: 'Pagination — Dynamic', href: '/demos/pagination-dynamic' },
      { label: 'Pagination — Custom', href: '/demos/pagination-custom' },
      { label: 'Autoplay', href: '/demos/autoplay' },
      { label: 'Thumbnails', href: '/demos/thumbnails' },
      { label: 'Progress Bar', href: '/demos/progress-bar' },
      { label: 'Slide Counter', href: '/demos/slide-counter' },
      { label: 'Mouse Wheel', href: '/demos/mousewheel' },
      { label: 'Lazy Load', href: '/demos/lazy-load' },
      { label: 'Parallax CSS', href: '/demos/parallax-css' },
      { label: 'Virtual Slides', href: '/demos/virtual-slides' },
    ],
  },
  {
    title: 'Effects CSS',
    items: [
      { label: 'Fade', href: '/demos/effect-fade' },
      { label: 'Cube', href: '/demos/effect-cube' },
      { label: 'Coverflow', href: '/demos/effect-coverflow' },
      { label: 'Flip', href: '/demos/effect-flip' },
      { label: 'Cards', href: '/demos/effect-cards' },
      { label: 'Creative', href: '/demos/effect-creative' },
    ],
  },
  {
    title: 'Lifecycle',
    items: [
      { label: 'Destroy & Rebuild', href: '/demos/destroy-rebuild' },
      { label: 'getInfo()', href: '/demos/get-info' },
      { label: 'Events on/off', href: '/demos/events-on-off' },
    ],
  },
  {
    title: 'WebGL',
    items: [
      { label: 'Displacement', href: '/demos/webgl-displacement' },
      { label: 'RGB Shift', href: '/demos/webgl-rgbshift' },
      { label: 'Pixel Dissolve', href: '/demos/webgl-pixeldissolve' },
      { label: 'Parallax Hover', href: '/demos/webgl-parallax-hover' },
      { label: 'Custom Shader', href: '/demos/webgl-custom-shader' },
    ],
  },
]
