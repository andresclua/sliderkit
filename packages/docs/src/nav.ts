import { DEMOS, GROUP_LABELS, type DemoEntry } from './demos-catalog'

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

const DEMO_GROUP_ORDER: DemoEntry['group'][] = ['core', 'plugins', 'effects', 'lifecycle', 'webgl']

export const demosNav: NavGroup[] = DEMO_GROUP_ORDER.map(group => ({
  title: GROUP_LABELS[group],
  items: DEMOS
    .filter(d => d.group === group)
    .map(d => ({ label: d.label, href: `/demos/${d.slug}` })),
}))
