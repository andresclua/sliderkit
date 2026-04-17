export interface DemoEntry {
  slug:        string
  label:       string
  title:       string
  description: string
  tags:        string[]
  group:       'core'
}

export const DEMOS: DemoEntry[] = [
  {
    slug: 'base',
    label: 'Base',
    title: 'Base slider',
    description: 'The simplest slider. Loop enabled, touch navigation out of the box.',
    tags: ['core', 'basic', 'loop', 'touch'],
    group: 'core',
  },
  {
    slug: 'non-loop',
    label: 'Non-loop',
    title: 'Non-loop',
    description: 'Linear slider that stops at the first and last slide. Arrows auto-disable at boundaries.',
    tags: ['core', 'no-loop', 'linear', 'boundaries'],
    group: 'core',
  },
  {
    slug: 'rewind',
    label: 'Rewind',
    title: 'Rewind',
    description: 'Like non-loop but reaching the last slide jumps back to the first in one animated step.',
    tags: ['core', 'rewind', 'no-loop'],
    group: 'core',
  },
  {
    slug: 'infinite-loop',
    label: 'Infinite Loop',
    title: 'Infinite Loop',
    description: 'Seamless infinite navigation with loop: true. Boundary slides are cloned so every transition looks continuous.',
    tags: ['core', 'loop', 'infinite', 'clones'],
    group: 'core',
  },
  {
    slug: 'start-index',
    label: 'Start Index',
    title: 'Start Index',
    description: 'Open the slider at any slide index with startIndex (0-based).',
    tags: ['core', 'start-index', 'api'],
    group: 'core',
  },
  {
    slug: 'vertical',
    label: 'Vertical',
    title: 'Vertical slider',
    description: 'Top-to-bottom track. Set axis: "vertical" and give the container a fixed height.',
    tags: ['core', 'vertical', 'axis'],
    group: 'core',
  },
  {
    slug: 'mouse-drag',
    label: 'Mouse Drag',
    title: 'Mouse Drag',
    description: 'Enable mouseDrag: true to let desktop users click and drag the slider.',
    tags: ['core', 'drag', 'mouse', 'desktop'],
    group: 'core',
  },
  {
    slug: 'gutter-edgepadding',
    label: 'Gutter & Edge Padding',
    title: 'Gutter & Edge Padding',
    description: 'gutter adds pixel gap between slides. edgePadding makes adjacent slides peek in from the sides.',
    tags: ['core', 'gutter', 'edge-padding', 'multi-slide'],
    group: 'core',
  },
  {
    slug: 'responsive',
    label: 'Responsive',
    title: 'Responsive / Breakpoints',
    description: 'Pass a responsive map to change any option at specific window widths.',
    tags: ['core', 'responsive', 'breakpoints', 'multi-slide'],
    group: 'core',
  },
  {
    slug: 'auto-height',
    label: 'Auto Height',
    title: 'Auto Height',
    description: 'The container animates its height to match each slide\'s natural height on every slide change.',
    tags: ['core', 'height', 'animation', 'auto-height'],
    group: 'core',
  },
  {
    slug: 'freeze-disable',
    label: 'Freeze / Disable',
    title: 'Freeze & Disable',
    description: 'The slider auto-disables when all slides fit on one page. You can also call disable() and enable() manually.',
    tags: ['core', 'freeze', 'disable', 'api'],
    group: 'core',
  },
  {
    slug: 'autoplay',
    label: 'Autoplay',
    title: 'Autoplay',
    description: 'Auto-advances on a fixed interval. Pauses on hover, focus, touch, and drag.',
    tags: ['plugin', 'autoplay', 'auto'],
    group: 'core',
  },
  {
    slug: 'a11y',
    label: 'Accessibility',
    title: 'Accessibility',
    description: 'WAI-ARIA carousel pattern — roles, roledescriptions, and live slide labels.',
    tags: ['plugin', 'a11y', 'accessibility', 'aria'],
    group: 'core',
  },
  {
    slug: 'center',
    label: 'Center Mode',
    title: 'Center Mode',
    description: 'center:true keeps the active slide centred in the viewport. Adjacent slides peek in from both sides.',
    tags: ['core', 'center', 'edge-padding'],
    group: 'core',
  },
  {
    slug: 'slide-by-page',
    label: 'Slide By Page',
    title: 'Slide By Page',
    description: 'slideBy:"page" advances the whole visible page at once instead of one slide at a time.',
    tags: ['core', 'slide-by', 'multi-slide'],
    group: 'core',
  },
  {
    slug: 'mouse-wheel',
    label: 'Mouse Wheel',
    title: 'Mouse Wheel',
    description: 'Navigate with the mouse wheel or trackpad. A cooldown prevents skipping slides mid-transition.',
    tags: ['plugin', 'mouse-wheel', 'scroll'],
    group: 'core',
  },
  {
    slug: 'keyboard',
    label: 'Keyboard',
    title: 'Keyboard navigation',
    description: 'Click the slider to focus it, then press ← → (or ↑ ↓ for vertical) to navigate.',
    tags: ['plugin', 'keyboard', 'a11y', 'accessibility'],
    group: 'core',
  },
  {
    slug: 'events',
    label: 'Events',
    title: 'Events live log',
    description: 'Navigate the slider and watch every lifecycle event fire in real time.',
    tags: ['core', 'events', 'lifecycle'],
    group: 'core',
  },
]

export const GROUP_LABELS: Record<DemoEntry['group'], string> = {
  core: 'Core',
}

export function getDemosByGroup(group: DemoEntry['group']): DemoEntry[] {
  return DEMOS.filter(d => d.group === group)
}

export function searchDemos(query: string): DemoEntry[] {
  const q = query.toLowerCase().trim()
  if (!q) return DEMOS
  return DEMOS.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.label.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q) ||
    d.tags.some(t => t.includes(q))
  )
}
