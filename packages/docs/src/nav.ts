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
    title: 'Guide',
    items: [
      { label: 'Getting Started', href: '/docs/getting-started' },
      { label: 'Options',         href: '/docs/options' },
      { label: 'Methods',         href: '/docs/methods' },
      { label: 'Events',          href: '/docs/events' },
      { label: 'Styling',         href: '/docs/styling' },
    ],
  },
  {
    title: 'Plugins',
    items: [
      { label: 'Overview',     href: '/docs/plugins' },
      { label: 'Arrows',       href: '/docs/plugins/arrows' },
      { label: 'Pagination',   href: '/docs/plugins/pagination' },
      { label: 'Autoplay',     href: '/docs/plugins/autoplay' },
      { label: 'A11y',         href: '/docs/plugins/a11y' },
      { label: 'Mouse Wheel',  href: '/docs/plugins/mouseWheel' },
      { label: 'Keyboard',     href: '/docs/plugins/keyboard' },
    ],
  },
]
