import { Slider } from '@andresclua/sliderkit'
import { marquee } from '@andresclua/sliderkit-plugins'
import { DEMOS } from './marquee-demos.js'

for (const d of DEMOS) {
  new Slider(`#demo-marquee-${d.id}`, {
    loop: true, touch: false, mouseDrag: false, speed: 0,
    ...(d.autoWidth
      ? { autoWidth: true }
      : { items: d.items, responsive: Object.fromEntries(Object.entries(d.bp).map(([w, items]) => [w, { items }])) }),
    plugins: [marquee(d.marquee)],
  })
}
