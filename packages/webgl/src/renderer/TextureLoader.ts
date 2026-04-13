export interface LoadedTexture {
  image: HTMLImageElement | null
  texture: WebGLTexture | null
}

export class TextureLoader {
  private gl: WebGLRenderingContext
  private cache: Map<string, LoadedTexture> = new Map()

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
  }

  load(src: string): Promise<LoadedTexture> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!)
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const texture = this.createTexture(img)
        const loaded: LoadedTexture = { image: img, texture }
        this.cache.set(src, loaded)
        resolve(loaded)
      }

      img.onerror = () => reject(new Error(`Failed to load texture: ${src}`))
      img.src = src
    })
  }

  private createTexture(img: HTMLImageElement): WebGLTexture | null {
    const { gl } = this
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
  }

  destroyAll(): void {
    this.cache.forEach(({ image, texture }) => {
      if (texture) this.gl.deleteTexture(texture)
      if (image) {
        // Release reference
      }
    })
    this.cache.clear()
  }
}
