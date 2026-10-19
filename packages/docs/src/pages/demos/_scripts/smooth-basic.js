import { Slider } from '@andresclua/sliderkit'
import { arrows, smooth } from '@andresclua/sliderkit-plugins'

new Slider('#demo-smooth-basic', {
  items: 1,
  loop: true,
  touch: false,        // smooth() replaces the core drag
  mouseDrag: false,
  responsive: { 700: { items: 2 }, 1100: { items: 3 } },
  plugins: [smooth(), arrows()],
})
