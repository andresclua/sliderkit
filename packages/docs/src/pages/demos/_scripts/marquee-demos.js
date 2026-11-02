// One config per demo: the page prints it as the visible code and marquee.js runs it
export const DEMOS = [
  { id: 'pause',  autoWidth: true, marquee: { speed: 50 } },
  { id: 'scroll', autoWidth: true, marquee: { speed: 40, scrollBoost: 1.5 } },
  { id: 'hover',  autoWidth: true, marquee: { speed: 50, hoverSpeed: 300 } },
  { id: 'drag',   autoWidth: true, marquee: { speed: 50, draggable: true } },
  { id: 'images', items: 2, bp: { 700: 3, 1100: 4 }, marquee: { speed: 40, draggable: true } },
  { id: 'gallery', autoWidth: true, marquee: { speed: 45, draggable: true } },
  { id: 'wide',   items: 1, bp: { 700: 2 },          marquee: { speed: 60, draggable: true } },
  { id: 'narrow', autoWidth: true, marquee: { speed: 35 } },
  { id: 'text',   autoWidth: true, marquee: { speed: 90, pauseOnHover: false } },
  { id: 'logos',  autoWidth: true, marquee: { speed: 30, hoverSpeed: 0 } },
  { id: 'right',  autoWidth: true, marquee: { speed: 120, direction: 'right', pauseOnHover: false } },
]
