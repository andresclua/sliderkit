import type { PreloadConfig, WebGLAssets } from './types'

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload  = () => res(img)
    img.onerror = () => rej(new Error(`Failed to load: ${src}`))
    img.src     = src
  })
}

export async function preloadWebGL(config: PreloadConfig): Promise<WebGLAssets> {
  const [images, disp] = await Promise.all([
    Promise.all(config.slides.map(loadImg)),
    config.displacement ? loadImg(config.displacement) : Promise.resolve(undefined),
  ])
  const assets: WebGLAssets = { images }
  if (disp) assets.displacement = disp
  return assets
}
