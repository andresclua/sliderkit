import type { SliderPlugin, SliderInstance, SliderInfo } from '@andresclua/sliderkit'
import { isWebGLSupported } from './renderer/FallbackDetector'
import type { WebGLOptions } from './types'
import { VERT, getFragSrc } from './internal/shaders'
import { buildProg, uploadTex, makeQuad, defaultEase } from './internal/gl'

export function webgl(options: WebGLOptions): SliderPlugin {
  const {
    effect,
    assets,
    duration  = 900,
    intensity = 0.08,
    easing    = defaultEase,
    frag:       customFrag,
    uniforms:   extraUniforms = {},
  } = options

  let cleanup: (() => void) | null = null

  return {
    name: 'webgl',

    install(slider: SliderInstance) {
      if (!isWebGLSupported()) return

      const canvas = document.createElement('canvas')
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:5;pointer-events:none'

      const glOrNull = canvas.getContext('webgl')
      if (!glOrNull) return
      const gl = glOrNull

      const fragSrc  = effect === 'custom' ? customFrag! : getFragSrc(effect, intensity)
      const prog     = buildProg(gl, VERT, fragSrc)
      const textures = assets.images.map(img => uploadTex(gl, img))
      const dispTex  = assets.displacement ? uploadTex(gl, assets.displacement) : null

      makeQuad(gl, prog)

      let fromIdx  = 0
      let toIdx    = 0
      let progress = 1
      let rafId:   number | null = null
      let animStart = 0

      const outer = (slider as any).outerWrapper as HTMLElement

      function resize() {
        const rect = canvas.getBoundingClientRect()
        canvas.width  = Math.round(rect.width  * devicePixelRatio)
        canvas.height = Math.round(rect.height * devicePixelRatio)
        gl.viewport(0, 0, canvas.width, canvas.height)
      }

      function draw() {
        gl.useProgram(prog)
        const bind = (unit: number, tex: WebGLTexture) => {
          gl.activeTexture(gl.TEXTURE0 + unit)
          gl.bindTexture(gl.TEXTURE_2D, tex)
        }
        bind(0, textures[fromIdx])
        bind(1, textures[toIdx])
        if (dispTex) bind(2, dispTex)

        const loc = (n: string) => gl.getUniformLocation(prog, n)
        gl.uniform1i(loc('u_from'),     0)
        gl.uniform1i(loc('u_to'),       1)
        if (dispTex) gl.uniform1i(loc('u_disp'), 2)
        gl.uniform1f(loc('u_progress'), easing(progress))
        gl.uniform1f(loc('u_ar'),       canvas.width / canvas.height)

        for (const [name, val] of Object.entries(extraUniforms)) {
          const v = typeof val === 'function' ? (val as () => unknown)() : val
          const l = loc(name)
          if (typeof v === 'number') {
            gl.uniform1f(l, v)
          } else if (Array.isArray(v)) {
            if (v.length === 2) gl.uniform2fv(l, v as number[])
            else if (v.length === 3) gl.uniform3fv(l, v as number[])
            else if (v.length === 4) gl.uniform4fv(l, v as number[])
          }
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      function animTick(now: number) {
        progress = Math.min((now - animStart) / duration, 1)
        draw()
        if (progress < 1) rafId = requestAnimationFrame(animTick)
        else rafId = null
      }

      function startAnim() {
        if (rafId) cancelAnimationFrame(rafId)
        animStart = performance.now()
        rafId = requestAnimationFrame(animTick)
      }

      outer.appendChild(canvas)
      requestAnimationFrame(() => { resize(); draw() })

      const ro = new ResizeObserver(() => { resize(); draw() })
      ro.observe(outer)

      const onIndexChanged = (info: SliderInfo) => {
        const newIdx = (info.displayIndex - 1) % textures.length
        if (newIdx === toIdx) return
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; progress = 1 }
        fromIdx  = toIdx
        toIdx    = newIdx
        progress = 0
        startAnim()
      }

      slider.on('indexChanged', onIndexChanged as (data: SliderInfo) => void)

      cleanup = () => {
        if (rafId) cancelAnimationFrame(rafId)
        ro.disconnect()
        slider.off('indexChanged', onIndexChanged as (data: SliderInfo) => void)
        canvas.remove()
        const ext = gl.getExtension('WEBGL_lose_context')
        if (ext) ext.loseContext()
      }
    },

    destroy() {
      cleanup?.()
      cleanup = null
    },
  }
}
