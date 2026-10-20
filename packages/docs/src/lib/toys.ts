// Toys: loads the OBJ/MTL characters and draws them with raw WebGL, no dependencies.
// Every model is split into named parts (`feather`, `shackle`, `liveRing`...), and each toy has
// one animation function that moves those parts by name from three inputs: time, `active`
// (0–1, eased) and `pop` (a one-shot, 0–1).

type V3 = [number, number, number]

const TAU = Math.PI * 2
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const smooth01 = (x: number) => { const k = clamp(x); return k * k * (3 - 2 * k) }
const bell = (x: number) => Math.sin(Math.PI * clamp(x))            // 0 → 1 → 0
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3)
const frac = (x: number) => x - Math.floor(x)

// ── Parts and transforms ─────────────────────────────────────────────────────

export interface Xf {
  x: number; y: number; z: number
  rx: number; ry: number; rz: number
  sx: number; sy: number; sz: number
  a: number                  // opacity multiplier
  bl: number                 // blink: vertical scale around the part's own centre
  pv: V3 | null              // pivot for rotation/scale (default: the part's centre)
  col: V3 | null             // colour override
}
const newXf = (): Xf => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1, a: 1, bl: 1, pv: null, col: null })

export interface Part {
  name: string
  index: number              // among the parts with the same name (feather #3 → 2)
  kd: V3
  alpha: number              // material opacity from the MTL
  unlit: boolean
  first: number              // vertex range in the toy's buffer
  count: number
  c: V3                      // bounding-box centre
  xf: Xf
}

interface Toy {
  parts: Part[]
  vbo: WebGLBuffer
  by: Map<string, Part[]>
  center: V3
  ground: number             // y of the shadow
  shadowR: number
}

// ── OBJ / MTL parsing ────────────────────────────────────────────────────────

function parseMtl(text: string): Record<string, { kd: V3; d: number }> {
  const out: Record<string, { kd: V3; d: number }> = {}
  let cur: { kd: V3; d: number } | null = null
  for (const line of text.split('\n')) {
    const t = line.trim().split(/\s+/)
    if (t[0] === 'newmtl') out[t[1]!] = cur = { kd: [0.8, 0.8, 0.8], d: 1 }
    else if (t[0] === 'Kd' && cur) cur.kd = [+t[1]!, +t[2]!, +t[3]!]
    else if (t[0] === 'd' && cur) cur.d = +t[1]!
  }
  return out
}

interface RawPart { name: string; mat: string; tris: number[] }   // x y z nx ny nz per vertex

function parseObj(text: string): RawPart[] {
  const V: V3[] = [], N: V3[] = [], parts: RawPart[] = []
  let cur: RawPart | null = null
  for (const line of text.split('\n')) {
    const t = line.trim().split(/\s+/)
    const k = t[0]
    if (k === 'v') V.push([+t[1]!, +t[2]!, +t[3]!])
    else if (k === 'vn') N.push([+t[1]!, +t[2]!, +t[3]!])
    else if (k === 'o') parts.push(cur = { name: t[1]!, mat: '', tris: [] })
    else if (k === 'usemtl' && cur) cur.mat = t[1]!
    else if (k === 'f' && cur) {
      const vs = t.slice(1).map(tok => {
        const p = tok.split('/')
        const v = V[+p[0]! - 1]!, n = p[2] ? N[+p[2] - 1] ?? [0, 0, 0] : [0, 0, 0]
        return [v[0], v[1], v[2], n[0]!, n[1]!, n[2]!]
      })
      for (let i = 1; i < vs.length - 1; i++) cur.tris.push(...vs[0]!, ...vs[i]!, ...vs[i + 1]!)
    }
  }
  return parts.filter(p => p.tris.length)
}

function isCollapsed(t: number[]): boolean {
  for (let k = 0; k < t.length; k += 6) {
    if (t[k] !== t[0] || t[k + 1] !== t[1] || t[k + 2] !== t[2]) return false
    if (t[k + 3] || t[k + 4] || t[k + 5]) return false
  }
  return true
}

// Generated stand-ins for parts the OBJ exports collapsed to a single point (scale 0)
function boxMesh(w: number, h: number, d: number, at: V3): number[] {
  const out: number[] = []
  const [x, y, z] = [w / 2, h / 2, d / 2]
  const faces: [V3, V3, V3, V3, V3][] = [
    [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z], [0, 0, 1]],
    [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z], [0, 0, -1]],
    [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z], [1, 0, 0]],
    [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z], [-1, 0, 0]],
    [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z], [0, 1, 0]],
    [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], [0, -1, 0]],
  ]
  for (const [a, b, c, e, n] of faces) {
    for (const p of [a, b, c, a, c, e]) out.push(p[0] + at[0], p[1] + at[1], p[2] + at[2], n[0], n[1], n[2])
  }
  return out
}

function octaMesh(r: number, at: V3): number[] {
  const out: number[] = []
  const P: V3[] = [[r, 0, 0], [-r, 0, 0], [0, r * 1.6, 0], [0, -r * 1.6, 0], [0, 0, r], [0, 0, -r]]
  const T = [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]]
  for (const [a, b, c] of T) {
    const A = P[a!]!, B = P[b!]!, C = P[c!]!
    const u: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]]
    const n: V3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
    const l = Math.hypot(...n) || 1
    for (const p of [A, B, C]) out.push(p[0] + at[0], p[1] + at[1], p[2] + at[2], n[0] / l, n[1] / l, n[2] / l)
  }
  return out
}

// Ground shadow: a flat ellipse that always faces the camera, so it reads the same whatever the tilt
function discMesh(r: number, y: number): number[] {
  const out: number[] = []
  const N = 40, squash = 0.34
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * TAU, a1 = ((i + 1) / N) * TAU
    out.push(0, y, 0, 0, 0, 1, Math.cos(a0) * r, y + Math.sin(a0) * r * squash, 0, 0, 0, 1, Math.cos(a1) * r, y + Math.sin(a1) * r * squash, 0, 0, 0, 1)
  }
  return out
}

// Body colours from the site palette, per toy and per MTL material. Anything not listed keeps the
// model's own colour (cheeks, glints, the RGB-shift copies...). Eyes, mouths and keyholes (`ink`) use
// the palette's dark green in every toy. Remove an entry to get the original colour back.
const COLORS: Record<string, Record<string, string>> = {
  '01-lightweight-core':   { coreRed: '#99F6E4', feather: '#F0FDFA' },
  '02-fully-accessible':   { plate: '#005345', keycap: '#14B8A6', liveRing: '#005345' },
  '03-3-css-effects':      { cardFade: '#5EEAD4', cardFlip: '#F0FDFA', cardClip: '#14B8A6' },
  '04-webgl-renderer':     { gem: '#E6F6F3' },
  '05-10-plugins':         { socket: '#005345', plugBody: '#14B8A6', prong: '#E2E8F0', spark: '#005345' },
  '06-touch-smooth-drag':  { blob: '#99F6E4', trail: '#99F6E4' },
  '07-responsive':         { bezel: '#00221A', screen: '#14B8A6', uiBar: '#F0FDFA', stand: '#005345' },
  '08-typescript-strict':  { lockBody: '#F0FDFA', shackle: '#00221A' },
}
const INK = '#00221A'
const hex = (h: string): V3 => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]

const UNLIT = new Set(['glint', 'cheek', 'cheekLight', 'led', 'spark', 'sparkle'])

// ── Animations ───────────────────────────────────────────────────────────────

export interface Ctx {
  t: number; dt: number
  a: number                     // active, eased 0–1
  pop: number                   // 0–1 while a pop plays, -1 otherwise
  px: number; py: number        // pointer inside the card, -1…1 (0 when away)
  g: Xf                         // the whole toy
  mem: Record<string, any>
  all(name: string): Part[]
  one(name: string): Part
  /** copy `from`'s transform to the face parts, so the face rides on the body */
  face(from: Part, ...faceParts: Part[]): void
}

const FACE = ['eye', 'eyeGlint', 'cheek', 'cheekLight', 'mouth', 'keyhole']

type Anim = (c: Ctx) => void

const ANIMS: Record<string, Anim> = {
  // 01 — wings flap faster and it climbs; pop is a loop-the-loop
  '01-lightweight-core': c => {
    const core = c.one('core')
    const f = lerp(2.6, 11, c.a) + (c.pop >= 0 ? 6 : 0)
    const amp = lerp(0.22, 0.5, c.a)
    c.g.y = 0.06 * Math.sin(c.t * 1.5) + 0.5 * c.a + (c.pop >= 0 ? 0.5 * bell(c.pop) : 0)
    if (c.pop >= 0) c.g.rx = -TAU * smooth01(c.pop)
    core.xf.rz = 0.04 * Math.sin(c.t * f * 0.5)
    c.face(core, ...FACE.flatMap(n => c.all(n)))
    c.all('feather').forEach((p, i) => {
      const left = i < 3, k = i % 3
      p.xf.pv = [left ? -0.5 : 0.5, 0.32, -0.16]
      p.xf.rz = (left ? 1 : -1) * amp * Math.sin(c.t * f - k * 0.3)
    })
  },

  // 02 — live rings pulse, the keycap types, pop is a deep press and a hop
  '02-fully-accessible': c => {
    const cap = c.one('keycap')
    const press = 0.5 + 0.5 * Math.sin(c.t * 7)
    let ty = -0.1 * press * c.a, sy = 1 - 0.06 * press * c.a + 0.015 * Math.sin(c.t * 2)
    if (c.pop >= 0) {
      const p = c.pop
      if (p < 0.3) { ty = -0.34 * smooth01(p / 0.3); sy = 1 - 0.26 * smooth01(p / 0.3) }
      else { const q = (p - 0.3) / 0.7; ty = -0.34 * (1 - smooth01(q * 2)) + 0.9 * bell(q); sy = lerp(0.74, 1, smooth01(q * 2)) }
    }
    cap.xf.y = ty; cap.xf.sy = sy; cap.xf.pv = [0, -0.58, 0]
    c.face(cap, ...FACE.flatMap(n => c.all(n)))
    c.all('liveRing').forEach((r, i) => {
      const ph = frac(c.t * 0.9 + i / 3)
      r.xf.sx = r.xf.sz = 1 + 0.35 * ph * c.a + 0.02 * Math.sin(c.t * 2 + i)
      r.xf.a = (1 + 4 * c.a * (1 - ph)) * (0.7 + 0.3 * Math.sin(c.t * 2 + i * 1.3))
    })
  },

  // 03 — the three cards: fade, flip, clip. Pop is a cascade of flips
  '03-3-css-effects': c => {
    const fade = c.one('fadeCard'), flip = c.one('flipCard'), clip = c.one('clipCard')
    c.g.y = 0.05 * Math.sin(c.t * 1.4)
    ;[fade, flip, clip].forEach((p, i) => { p.xf.rz = 0.05 * Math.sin(c.t * 1.1 + i * 1.7) })
    fade.xf.a = lerp(1, 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(c.t * 2.6)), c.a)
    flip.xf.ry = c.a * TAU * smooth01(frac(c.t * 0.4) * 1.4)
    clip.xf.pv = [0.07, 0.06, -0.12]
    clip.xf.sx = lerp(1, 0.12 + 0.88 * (0.5 + 0.5 * Math.sin(c.t * 2.2)), c.a)
    if (c.pop >= 0) {
      const s = (a: number, b: number) => smooth01((c.pop - a) / (b - a))
      fade.xf.ry = TAU * s(0, 0.55); flip.xf.ry = TAU * s(0.15, 0.7); clip.xf.ry = TAU * s(0.3, 0.85)
    }
    c.face(flip, ...FACE.flatMap(n => c.all(n)))
  },

  // 04 — RGB fringe grows into a chromatic split with sparkles; pop spins and bursts
  '04-webgl-renderer': c => {
    const gem = c.one('gem')
    c.g.y = 0.1 * Math.sin(c.t * 1.3)
    c.g.ry = 0.5 + 0.08 * Math.sin(c.t * 0.7)
    gem.xf.rz = 0.04 * Math.sin(c.t * 0.9)
    const burst = c.pop >= 0 ? bell(c.pop) * 0.5 : 0
    if (c.pop >= 0) c.g.ry += TAU * 2 * easeOut(c.pop)
    c.face(gem, ...FACE.flatMap(n => c.all(n)))
    const tints: V3[] = [[1, 0.2, 0.3], [0.25, 1, 0.5], [0.25, 0.5, 1]]
    c.all('rgbShift').forEach((p, i) => {
      p.xf.x = (i - 1) * (0.035 + 0.13 * c.a + burst)
      p.xf.rz = gem.xf.rz; p.xf.col = tints[i]!; p.xf.a = 0.55 + 0.3 * c.a
    })
    c.all('sparkle').forEach((p, i) => {
      const k = Math.max(c.a, c.pop >= 0 ? bell(c.pop) : 0)
      const s = k * (0.55 + 0.45 * Math.sin(c.t * 5 + i * 1.7))
      p.xf.sx = p.xf.sy = p.xf.sz = Math.max(s, 0); p.xf.ry = c.t * 2 + i
    })
  },

  // 05 — the plug hovers by the socket, plugs in with a LED and sparks, pop unplugs and flips
  '05-10-plugins': c => {
    const body = c.one('plugBody')
    let dx = -0.28 + 0.05 * Math.sin(c.t * 1.8) + 0.72 * c.a
    let rx = 0, lift = 0
    if (c.pop >= 0) { dx -= 0.95 * bell(c.pop); rx = TAU * smooth01(c.pop); lift = 0.3 * bell(c.pop) }
    const set = (p: Part) => { p.xf.x = dx; p.xf.y = lift; p.xf.rx = rx; p.xf.pv = body.c }
    ;[body, ...c.all('prong'), ...FACE.flatMap(n => c.all(n))].forEach(set)
    const cord = c.one('cord')
    cord.xf.pv = [-1.49, -0.5, -0.2]; cord.xf.sx = 1 + dx / 1.67 + 0.15 * Math.sin(c.t * 1.8)
    const led = c.one('led'), on = c.pop < 0 ? smooth01((c.a - 0.7) / 0.3) : 0
    led.xf.col = [lerp(0.16, 0.35, on), lerp(0.43, 1, on), lerp(0.27, 0.5, on)]
    c.all('spark').forEach((p, i) => {
      const ph = frac(c.t * 2.1 + i / 7), on2 = c.pop < 0 ? smooth01((c.a - 0.6) / 0.4) : 0
      const ang = i * 2.4 + 0.5, r = ph * 0.75
      p.xf.x = 0.52 + Math.cos(ang) * r * 0.5; p.xf.y = Math.sin(ang) * r; p.xf.z = 0.35 + Math.cos(ang * 1.7) * r * 0.6
      p.xf.sx = p.xf.sy = p.xf.sz = on2 * (1 - ph) * 1.5
    })
  },

  // 06 — squishy blob: follows the pointer with inertia (trail lags behind), pop jumps and squashes
  '06-touch-smooth-drag': c => {
    const blob = c.one('blob')
    const m = (c.mem.o ??= { x: 0, y: 0, tr: [[0, 0], [0, 0], [0, 0], [0, 0]] })
    const k = 1 - Math.exp(-c.dt * 6)
    m.x += (c.px * 1.0 * c.a - m.x) * k; m.y += (-c.py * 0.8 * c.a - m.y) * k
    let prev: number[] = [m.x, m.y]
    m.tr.forEach((q: number[], i: number) => {
      const kk = 1 - Math.exp(-c.dt * (9 - i * 1.6)); q[0] = q[0]! + (prev[0]! - q[0]!) * kk; q[1] = q[1]! + (prev[1]! - q[1]!) * kk; prev = q
    })
    let sy = 1 + 0.05 * Math.sin(c.t * 2), sx = 1 - 0.03 * Math.sin(c.t * 2), jy = 0
    if (c.pop >= 0) {
      const p = c.pop
      if (p < 0.7) { const q = p / 0.7; jy = 0.85 * 4 * q * (1 - q); sy = 1 + 0.18 * bell(q); sx = 1 - 0.1 * bell(q) }
      else { const q = (p - 0.7) / 0.3; sy = 1 - 0.38 * bell(q); sx = 1 + 0.3 * bell(q) }
    }
    blob.xf.x = m.x; blob.xf.y = m.y + jy; blob.xf.sx = sx; blob.xf.sy = sy; blob.xf.pv = [0, -0.72, 0]
    c.face(blob, ...FACE.flatMap(n => c.all(n)))
    c.all('trail').forEach((p, i) => {
      p.xf.x = m.tr[i][0]; p.xf.y = m.tr[i][1] + jy * 0.6; p.xf.a = 1 + 2.5 * c.a
    })
  },

  // 07 — phone → tablet → desktop while active; pop rotates it to landscape
  '07-responsive': c => {
    const SIZES: [number, number][] = [[1, 1], [1.75, 1.25], [2.8, 1.5]]            // phone, tablet, desktop
    // its own clock: starts as a phone every time it wakes up, and rewinds when it falls asleep
    c.mem.clk = c.a < 0.02 ? 0 : (c.mem.clk ?? 0) + c.dt * 0.42
    const u = c.mem.clk % 3
    const stage = Math.floor(u), f = smooth01((frac(u) - 0.55) / 0.45)
    const A = SIZES[stage % 3]!, B = SIZES[(stage + 1) % 3]!
    const sx = lerp(A[0], B[0], f), sy = lerp(A[1], B[1], f)
    const desk = stage % 3 === 2 ? 1 - f : stage % 3 === 1 ? f : 0                  // how "desktop" it is → the stand
    const stand = smooth01(desk)
    c.g.rz = 0.07 * Math.sin(c.t * 1.2); c.g.ry = 0.18 * Math.sin(c.t * 0.8)
    if (c.pop >= 0) {
      const p = c.pop
      c.g.rz += -Math.PI / 2 * (p < 0.25 ? smooth01(p / 0.25) : p < 0.75 ? 1 : 1 - smooth01((p - 0.75) / 0.25))
    }
    const pvD: V3 = [0, 0.05, 0]
    ;[c.one('bezel'), c.one('screen'), c.one('uiBar')].forEach(p => { p.xf.pv = pvD; p.xf.sx = sx; p.xf.sy = sy })
    const bottom = 0.05 - 0.725 * sy
    const neck = c.one('standNeck'), base = c.one('standBase')
    neck.xf.y = bottom - 0.2 - neck.c[1] + 0.0; neck.xf.sx = neck.xf.sy = neck.xf.sz = stand
    base.xf.y = bottom - 0.42 - base.c[1]; base.xf.sx = base.xf.sy = base.xf.sz = stand
    neck.xf.pv = [0, bottom - 0.2, 0]; base.xf.pv = [0, bottom - 0.42, 0]
  },

  // 08 — locked and swaying; active unlocks with a happy bounce; pop slams shut and shakes
  '08-typescript-strict': c => {
    const body = c.one('lockBody')
    let open = c.a, bounce = Math.abs(Math.sin(c.t * 5)) * 0.14 * c.a
    c.g.rz = 0.06 * Math.sin(c.t * 1.3)
    let shake = 0
    if (c.pop >= 0) {
      const p = c.pop
      open = p < 0.3 ? lerp(1, 0.9, p / 0.3) : Math.max(0, 1 - (p - 0.3) / 0.08)
      shake = p > 0.38 ? 0.1 * Math.sin(p * 55) * (1 - p) : 0
      bounce = 0
    }
    c.g.x = shake; c.g.y = bounce
    body.xf.sy = 1 - (c.pop >= 0 && c.pop > 0.38 ? 0.1 * bell((c.pop - 0.38) / 0.2) : 0)
    c.face(body, ...FACE.flatMap(n => c.all(n)))
    ;[c.one('shackle'), ...c.all('shackleLeg')].forEach(p => {
      p.xf.pv = [0.4, 0.3, 0]; p.xf.y = 0.26 * open; p.xf.ry = -1.25 * open
    })
  },
}

// where the shadow sits and how wide it is, per toy
const GROUND: Record<string, [number, number]> = {
  '01-lightweight-core': [-1.2, 0.75], '02-fully-accessible': [-0.9, 0], '03-3-css-effects': [-1.25, 0.9],
  '04-webgl-renderer': [-1.4, 0.65], '05-10-plugins': [-1.3, 1.0], '06-touch-smooth-drag': [-1.05, 0.75],
  '07-responsive': [-1.05, 0.7], '08-typescript-strict': [-0.95, 0.7],
}

// ── Matrices (column-major) ──────────────────────────────────────────────────

const M = () => new Float32Array(16)

function mul(o: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    o[c * 4 + r] = a[r]! * b[c * 4]! + a[4 + r]! * b[c * 4 + 1]! + a[8 + r]! * b[c * 4 + 2]! + a[12 + r]! * b[c * 4 + 3]!
  }
  return o
}

/** T(pivot + t) · Rz Ry Rx · S · T(-pivot) */
function trs(o: Float32Array, x: Xf, pv: V3): Float32Array {
  const cx = Math.cos(x.rx), sx_ = Math.sin(x.rx), cy = Math.cos(x.ry), sy_ = Math.sin(x.ry), cz = Math.cos(x.rz), sz_ = Math.sin(x.rz)
  // R = Rz * Ry * Rx
  const r00 = cz * cy, r01 = cz * sy_ * sx_ - sz_ * cx, r02 = cz * sy_ * cx + sz_ * sx_
  const r10 = sz_ * cy, r11 = sz_ * sy_ * sx_ + cz * cx, r12 = sz_ * sy_ * cx - cz * sx_
  const r20 = -sy_, r21 = cy * sx_, r22 = cy * cx
  o[0] = r00 * x.sx; o[1] = r10 * x.sx; o[2] = r20 * x.sx; o[3] = 0
  o[4] = r01 * x.sy; o[5] = r11 * x.sy; o[6] = r21 * x.sy; o[7] = 0
  o[8] = r02 * x.sz; o[9] = r12 * x.sz; o[10] = r22 * x.sz; o[11] = 0
  const px = pv[0], py = pv[1], pz = pv[2]
  o[12] = px + x.x - (o[0]! * px + o[4]! * py + o[8]! * pz)
  o[13] = py + x.y - (o[1]! * px + o[5]! * py + o[9]! * pz)
  o[14] = pz + x.z - (o[2]! * px + o[6]! * py + o[10]! * pz)
  o[15] = 1
  return o
}

function perspective(o: Float32Array, fov: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2)
  o.fill(0); o[0] = f; o[5] = f; o[10] = (far + near) / (near - far); o[11] = -1; o[14] = (2 * far * near) / (near - far)
}

// ── Renderer ─────────────────────────────────────────────────────────────────

const VERT = `attribute vec3 aPos; attribute vec3 aNrm;
uniform mat4 uMVP; uniform mat3 uNM; varying vec3 vN;
void main(){ vN = uNM * aNrm; gl_Position = uMVP * vec4(aPos, 1.); }`

const FRAG = `precision mediump float;
varying vec3 vN; uniform vec3 uColor; uniform float uAlpha; uniform float uLit;
void main(){
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  vec3 L = normalize(vec3(-.45, .7, .55));
  float d = max(dot(n, L), 0.);
  float hemi = .5 + .5 * n.y;
  float rim = pow(1. - max(n.z, 0.), 3.) * .08;
  vec3 c = mix(uColor, uColor * (.74 + .13 * hemi + .2 * d) + rim, uLit);
  gl_FragColor = vec4(c * uAlpha, uAlpha);
}`

export interface ToyState {
  a: number                       // active amount, eased by the renderer
  hover: boolean
  popAt: number                   // seconds when the current pop started, -1 = none
  px: number; py: number
  born: number                    // seconds when it first drew (spawn animation)
  last: number
  mem: Record<string, any>
}
export const newToyState = (): ToyState => ({ a: 0, hover: false, popAt: -1, px: 0, py: 0, born: -1, last: -1, mem: {} })

export const POP_SECONDS = 1.5

export interface ToyView { cx: number; cy: number; side: number; dpr: number; canvasH: number }

export function createToys(gl: WebGLRenderingContext, names: string[], base: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error('toys shader:', gl.getShaderInfoLog(s))
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error('toys program:', gl.getProgramInfoLog(prog))
  const aPos = gl.getAttribLocation(prog, 'aPos'), aNrm = gl.getAttribLocation(prog, 'aNrm')
  const U = { mvp: gl.getUniformLocation(prog, 'uMVP'), nm: gl.getUniformLocation(prog, 'uNM'), color: gl.getUniformLocation(prog, 'uColor'), alpha: gl.getUniformLocation(prog, 'uAlpha'), lit: gl.getUniformLocation(prog, 'uLit') }

  const toys: (Toy | null)[] = names.map(() => null)
  const FOV = 28 * Math.PI / 180, K = 1.25, CARD_UNITS = 3.9
  const camZ = (K * CARD_UNITS / 2) / Math.tan(FOV / 2)
  const P = M(); perspective(P, FOV, 1, 40)
  const TILT = 4 * Math.PI / 180

  async function load(i: number) {
    const name = names[i]!
    const [objText, mtlText] = await Promise.all([
      fetch(`${base}${name}.obj`).then(r => r.text()), fetch(`${base}${name}.mtl`).then(r => r.text()),
    ])
    const mtl = parseMtl(mtlText), raw = parseObj(objText)
    const data: number[] = [], parts: Part[] = []
    const seen: Record<string, number> = {}
    const push = (nm: string, mat: string, kd: V3, alpha: number, verts: number[]) => {
      let mn: V3 = [1e9, 1e9, 1e9], mx: V3 = [-1e9, -1e9, -1e9]
      for (let k = 0; k < verts.length; k += 6) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a]!, verts[k + a]!); mx[a] = Math.max(mx[a]!, verts[k + a]!) }
      const first = data.length / 6
      for (let k = 0; k < verts.length; k++) data.push(verts[k]!)
      parts.push({
        name: nm, index: seen[nm] = (seen[nm] ?? -1) + 1, kd, alpha, unlit: UNLIT.has(mat) || UNLIT.has(nm),
        first, count: verts.length / 6, c: [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], xf: newXf(),
      })
    }
    for (const r of raw) {
      const own = mtl[r.mat] ?? { kd: [0.8, 0.8, 0.8] as V3, d: 1 }
      const swap = r.mat === 'ink' ? INK : COLORS[name]?.[r.mat]
      const m = swap ? { ...own, kd: hex(swap) } : own
      if (isCollapsed(r.tris)) {   // exported at scale 0: all vertices on one point, no normals
        const at: V3 = [r.tris[0]!, r.tris[1]!, r.tris[2]!]
        if (r.name === 'sparkle') push('sparkle', r.mat, [1, 1, 1], 1, octaMesh(0.11, at))
        else if (r.name === 'standNeck') push('standNeck', r.mat, m.kd, 1, boxMesh(0.14, 0.4, 0.12, at))
        else if (r.name === 'standBase') push('standBase', r.mat, m.kd, 1, boxMesh(0.9, 0.08, 0.5, at))
        continue
      }
      push(r.name, r.mat, m.kd, m.d, r.tris)
    }
    const [gy, gr] = GROUND[name] ?? [-1.2, 1]
    // the shadow is its own part, drawn first
    if (gr > 0) push('shadow', 'shadow', [0, 0, 0], 0.2, discMesh(gr, gy))
    // bounding box of the real parts → centre the toy on the card
    let mn: V3 = [1e9, 1e9, 1e9], mx: V3 = [-1e9, -1e9, -1e9]
    for (const p of parts) if (p.name !== 'shadow') for (let k = p.first * 6; k < (p.first + p.count) * 6; k += 6) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a]!, data[k + a]!); mx[a] = Math.max(mx[a]!, data[k + a]!) }
    const vbo = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    const by = new Map<string, Part[]>()
    for (const p of parts) (by.get(p.name) ?? by.set(p.name, []).get(p.name)!).push(p)
    toys[i] = { parts, vbo, by, center: [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2 + 0.1, (mn[2] + mx[2]) / 2], ground: gy, shadowR: gr }
  }

  const gM = M(), vM = M(), pM = M(), mv = M(), mvp = M(), tmp = M(), nm = new Float32Array(9)

  function draw(i: number, v: ToyView, s: ToyState, now: number, reduced: boolean) {
    const toy = toys[i]
    if (!toy) return
    const dt = s.last < 0 ? 1 / 60 : Math.min(now - s.last, 0.1)
    s.last = now
    if (s.born < 0) s.born = now
    s.a += ((s.hover ? 1 : 0) - s.a) * (1 - Math.exp(-dt * 5))
    const popT = s.popAt >= 0 ? now - s.popAt : -1
    if (popT > POP_SECONDS) s.popAt = -1
    const pop = s.popAt >= 0 ? clamp(popT / POP_SECONDS) : -1
    const t = reduced ? 0 : now

    // reset, then let the toy's animation move its parts
    for (const p of toy.parts) p.xf = newXf()
    const g = newXf()
    const ctx: Ctx = {
      t, dt, a: reduced ? 0 : s.a, pop: reduced ? -1 : pop, px: s.px, py: s.py, g, mem: s.mem,
      all: n => toy.by.get(n) ?? [],
      one: n => toy.by.get(n)?.[0] ?? { name: n, index: 0, kd: [0, 0, 0], alpha: 1, unlit: false, first: 0, count: 0, c: [0, 0, 0], xf: newXf() },
      face(from, ...parts) { for (const p of parts) { p.xf = { ...from.xf, pv: from.xf.pv ?? from.c, a: 1, bl: 1, col: null } } },
    }
    ANIMS[names[i]!]?.(ctx)

    // blink, look-at and spawn
    const blinkPhase = frac(t / 3.6 + i * 0.37)
    const bl = reduced ? 1 : blinkPhase > 0.965 ? 0.12 : 1
    for (const n of ['eye', 'eyeGlint']) for (const p of toy.by.get(n) ?? []) p.xf.bl = bl
    const spawn = easeOutBack(clamp((now - s.born) / 0.7))
    if (!reduced) { g.rx += -s.py * 0.18; g.ry += s.px * 0.3 }
    g.sx *= spawn; g.sy *= spawn; g.sz *= spawn

    // world = View · Tilt · Toy · centre
    const tilt = M(); trs(tilt, { ...newXf(), rx: TILT }, [0, 0, 0])
    const toyM = M(); trs(toyM, g, [0, 0, 0])
    const cen = M(); trs(cen, { ...newXf(), x: -toy.center[0], y: -toy.center[1], z: -toy.center[2] }, [0, 0, 0])
    const view = M(); trs(view, { ...newXf(), z: -camZ }, [0, 0, 0])
    mul(tmp, tilt, toyM); mul(gM, tmp, cen); mul(vM, view, gM)

    // viewport: a square around the card, depth cleared inside it only
    const x = Math.round(v.cx - v.side / 2), y = Math.round(v.canvasH - (v.cy + v.side / 2)), w = Math.round(v.side)
    gl.enable(gl.SCISSOR_TEST); gl.scissor(x, y, w, w); gl.viewport(x, y, w, w); gl.clear(gl.DEPTH_BUFFER_BIT)

    gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, toy.vbo)
    gl.enableVertexAttribArray(aPos); gl.enableVertexAttribArray(aNrm)
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, 24, 12)

    // shadow shrinks and fades as the toy rises
    const sh = toy.by.get('shadow')?.[0]
    if (sh) { sh.xf.sx = sh.xf.sz = clamp(1 - 0.22 * g.y, 0.5, 1.2) * spawn; sh.xf.a = clamp(1.2 - 0.35 * Math.max(g.y, 0)); sh.xf.pv = [0, toy.ground, 0] }

    // shadow first, then opaque parts, then transparent ones (they must not write depth)
    const opaque: Part[] = [], clear: Part[] = []
    for (const p of toy.parts) (p.name === 'shadow' ? opaque : p.alpha * p.xf.a < 1 ? clear : opaque).push(p)
    const order = [...(sh ? [sh] : []), ...opaque.filter(p => p !== sh), ...clear]
    for (const p of order) {
      const alpha = p.alpha * p.xf.a
      if (alpha < 0.003 || Math.abs(p.xf.sx * p.xf.sy * p.xf.sz) < 1e-4) continue
      const local = trs(tmp, p.xf, p.xf.pv ?? p.c)
      if (p.xf.bl !== 1) { // blink: squash around the part's own centre, before its other transform
        const b = M(); trs(b, { ...newXf(), sy: p.xf.bl }, p.c); mul(mv, local, b)
      } else mv.set(local)
      mul(pM, vM, mv)
      mul(mvp, P, pM)
      // normals: upper 3×3 of the model-view matrix (normalised in the shader)
      nm[0] = pM[0]!; nm[1] = pM[1]!; nm[2] = pM[2]!; nm[3] = pM[4]!; nm[4] = pM[5]!; nm[5] = pM[6]!; nm[6] = pM[8]!; nm[7] = pM[9]!; nm[8] = pM[10]!
      const col = p.xf.col ?? p.kd
      gl.uniformMatrix4fv(U.mvp, false, mvp); gl.uniformMatrix3fv(U.nm, false, nm)
      gl.uniform3f(U.color, col[0], col[1], col[2]); gl.uniform1f(U.alpha, alpha); gl.uniform1f(U.lit, p.unlit || p.name === 'shadow' ? 0 : 1)
      const transparent = alpha < 1
      gl.depthMask(!transparent && p.name !== 'shadow')
      gl.drawArrays(gl.TRIANGLES, p.first, p.count)
    }
    gl.depthMask(true)
  }

  const easeOutBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2) }

  function begin(w: number, h: number) {
    gl.disable(gl.SCISSOR_TEST); gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  }

  return { load, draw, begin, ready: (i: number) => !!toys[i], count: names.length, K }
}
