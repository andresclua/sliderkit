import { Slider } from '@andresclua/sliderkit'
import { arrows, smooth } from '@andresclua/sliderkit-plugins'

let cards = []      // one entry per slide element, loop clones included

const slider = new Slider('#demo-smooth-update', {
  items: 1,
  loop: true,
  touch: false,        // smooth() replaces the core drag
  mouseDrag: false,
  responsive: { 700: { items: 2 }, 1100: { items: 3 } },
  plugins: [
    smooth({
      // Called every frame the slider moves, and once more when it comes to rest.
      onUpdate(sm) {
        const middle = (slider.currentItems - 1) / 2                       // viewport centre, in slides
        const speed = Math.min(Math.abs(sm.velocity) * 0.02, 0.1)
        const lag = Math.max(-50, Math.min(50, sm.velocity * 6))           // px, follows the speed

        cards.forEach(({ card, title, index }) => {
          const near = Math.max(0, 1 - Math.abs(sm.positions[index] - middle) / 1.5)   // 1 at the centre, 0 at 1.5 slides away
          card.style.opacity = String(0.55 + 0.45 * near)                  // dims towards the edges
          card.style.transform = `scale(${1 - speed})`                     // shrinks while moving fast
          title.style.transform = `translateX(${lag}px)`                   // trails behind the movement
        })
      },
    }),
    arrows(),
  ],
})

// sm.positions has one value per REAL slide (0 = at the start of the viewport,
// 1 = one slide to the right...). Clones show the same slide, so they share its value.
// Build effects from continuous functions of these numbers: anything that steps
// (Math.round, %) makes the effect jump when the slider settles.
const clones = (slider.slides.length - slider.slideCount) / 2
cards = slider.slides.map((slide, i) => ({
  card: slide.querySelector('.smooth-card'),
  title: slide.querySelector('h3'),
  index: (((i - clones) % slider.slideCount) + slider.slideCount) % slider.slideCount,
}))
