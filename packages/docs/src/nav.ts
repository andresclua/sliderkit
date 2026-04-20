import { DEMOS, GROUP_LABELS, type DemoEntry } from './demos-catalog'

export interface NavItem {
  label: string
  href:  string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

const DEMO_GROUP_ORDER: DemoEntry['group'][] = ['core']

export const demosNav: NavGroup[] = DEMO_GROUP_ORDER.map(group => ({
  title: GROUP_LABELS[group],
  items: DEMOS
    .filter(d => d.group === group)
    .map(d => ({ label: d.label, href: `/demos/${d.slug}` })),
}))

export const docsNav: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Getting Started', href: '/docs/getting-started' },
      { label: 'Styling',         href: '/docs/styling' },
    ],
  },
  {
    title: 'Core API',
    items: [
      { label: 'Options', href: '/docs/options' },
      { label: 'Methods', href: '/docs/methods' },
      { label: 'Events',  href: '/docs/events' },
    ],
  },
  {
    title: 'Effects',
    items: [
      { label: 'Fade',      href: '/docs/effects/fade' },
      { label: 'Flip',      href: '/docs/effects/flip' },
      { label: 'Clip Path', href: '/docs/effects/clip-path' },
    ],
  },
  {
    title: 'Plugins — UI',
    items: [
      { label: 'Overview',      href: '/docs/plugins' },
      { label: 'Arrows',        href: '/docs/plugins/arrows' },
      { label: 'Pagination',    href: '/docs/plugins/pagination' },
      { label: 'Progress',      href: '/docs/plugins/progress' },
      { label: 'Thumbs',        href: '/docs/plugins/thumbs' },
    ],
  },
  {
    title: 'Plugins — Behaviour',
    items: [
      { label: 'Autoplay',      href: '/docs/plugins/autoplay' },
      { label: 'Mouse Wheel',   href: '/docs/plugins/mouseWheel' },
      { label: 'Keyboard',      href: '/docs/plugins/keyboard' },
      { label: 'Accessibility', href: '/docs/plugins/a11y' },
    ],
  },
  {
    title: 'Plugins — Advanced',
    items: [
      { label: 'Hooks',         href: '/docs/plugins/hooks' },
      { label: 'WebGL',         href: '/docs/plugins/webgl' },
    ],
  },
]
