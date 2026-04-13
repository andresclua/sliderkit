import { Slider } from '@acslider/core'
import { pagination, autoplay, arrows } from '@acslider/plugins'

// Basic slider
const basicEl = document.getElementById('slider-basic')
if (basicEl) {
  const slider = new Slider(basicEl, {
    slidesPerPage: 1,
    loop: true,
    speed: 400,
    grabCursor: true,
    mouseDrag: true,
    plugins: [
      pagination({ type: 'dots', clickable: true }),
      arrows(),
      autoplay({ delay: 3000, pauseOnHover: true }),
    ],
    on: {
      afterSlideChange: ({ index }) => {
        console.log('Active slide:', index)
      },
    },
  })

  // Expose to window for debugging
  ;(window as unknown as Record<string, unknown>).slider = slider
}

// Multi per page
const multiEl = document.getElementById('slider-multi')
if (multiEl) {
  new Slider(multiEl, {
    slidesPerPage: 3,
    gutter: 16,
    loop: false,
    rewind: true,
    plugins: [
      pagination({ type: 'fraction' }),
      arrows(),
    ],
  })
}
