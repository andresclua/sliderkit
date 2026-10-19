import { Slider } from '@andresclua/sliderkit'
import { arrows, pagination, a11y } from '@andresclua/sliderkit-plugins'

new Slider('#demo-a11y-tab', {
  items: 1,
  loop: true,
  speed: 300,
  plugins: [
    arrows(),
    pagination({ type: 'dots', clickable: true }),
    a11y({
      containerLabel: 'Feature carousel',
      slideLabel: '{{index}} of {{total}}',
    }),
  ],
})
