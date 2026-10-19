import { Slider } from '@andresclua/sliderkit'
import { arrows, smooth } from '@andresclua/sliderkit-plugins'

// One slider per preset. Any option overrides the preset it starts from:
//   smooth({ preset: 'floaty', inertia: 1200, skew: true })
for (const preset of ['smooth', 'snappy', 'floaty', 'free']) {
  new Slider('#demo-smooth-' + preset, {
    items: 1,
    loop: true,
    touch: false,
    mouseDrag: false,
    responsive: { 700: { items: 2 }, 1100: { items: 3 } },
    plugins: [smooth({ preset }), arrows()],
  })
}
