import { Slider } from '@andresclua/sliderkit'
import { arrows, smooth } from '@andresclua/sliderkit-plugins'

new Slider('#demo-smooth-skew', {
  items: 1,
  loop: true,
  touch: false,        // smooth() replaces the core drag
  mouseDrag: false,
  responsive: { 700: { items: 2 }, 1100: { items: 3 } },
  plugins: [
    smooth({
      skew: {
        target: '.smooth-card',   // element inside each slide that leans (default: the slide)
        perSecond: 2.5,           // degrees per slide/second of velocity
        max: 14,                  // max degrees either way
      },
    }),
    arrows(),
  ],
})

// Want a different effect? Keep the plugin and read sm.velocity (slides per second)
// every frame — see "Properties and methods" in the smooth plugin docs.
// Drawing on a canvas too? Use smooth({ raf: false }) and call sm.tick(now)
// at the start of your own requestAnimationFrame loop.
