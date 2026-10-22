/**
 * Koryla A/B test for the SliderKit homepage hero.
 *
 * The docs site is fully static, so the variant is decided here, at the edge:
 *   - "/"                        → assign a variant (sticky cookie), rewrite the hero
 *                                  text for non-control variants, record the impression
 *   - "/docs/getting-started"    → the experiment's conversion page: record the conversion
 *
 * Fails open: any error, missing key or inactive experiment serves the page untouched.
 */

const env = (name: string): string =>
  (typeof Deno !== 'undefined' ? Deno.env.get(name) : (globalThis as any).process?.env?.[name]) ?? ''

const KORYLA_API_URL = 'https://koryla.com'
const COOKIE_PREFIX = 'ky_'
const SESSION_COOKIE = 'ky_session'
const CONFIG_TTL_MS = 60_000

// Variant B hero copy. The markup in packages/docs/src/pages/index.astro carries
// data-ky="title" | "subtitle" | "cta" so these can be swapped safely.
const HERO_B = {
  title: 'A slider built for performance.',
  accent: 'Ship only what you use.',
  subtitle:
    'A ~10 KB core, with plugins, CSS effects and WebGL as separate packages — so your bundle never grows for features you don’t import.',
  cta: 'Build your slider →',
}

let cachedExperiments: any[] = []
let cachedAt = 0

async function getConfig(host: string): Promise<any[]> {
  if (Date.now() - cachedAt < CONFIG_TTL_MS) return cachedExperiments
  try {
    const res = await fetch(`${KORYLA_API_URL}/api/worker/config`, {
      headers: { Authorization: `Bearer ${env('KORYLA_API_KEY')}`, 'X-Koryla-Host': host },
    })
    if (res.ok) {
      cachedExperiments = await res.json()
      cachedAt = Date.now()
    }
  } catch { /* keep stale cache */ }
  return cachedExperiments
}

function sendEvent(host: string, body: Record<string, string>): Promise<unknown> {
  return fetch(`${KORYLA_API_URL}/api/worker/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env('KORYLA_API_KEY')}`,
      'X-Koryla-Host': host,
    },
    body: JSON.stringify(body),
  }).catch(() => {})
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map(c => c.trim().split('=').map(s => s.trim())).filter(([k]) => k),
  )
}

function assignVariant(variants: { id: string; traffic_weight: number }[]): string {
  const total = variants.reduce((s, v) => s + v.traffic_weight, 0)
  let rand = Math.random() * total
  for (const v of variants) { rand -= v.traffic_weight; if (rand <= 0) return v.id }
  return variants[variants.length - 1].id
}

const normalizePath = (p: string) => p.replace(/\/+$/, '') || '/'
const pathOf = (u: string) => { try { return normalizePath(new URL(u).pathname) } catch { return null } }

/** Swap the hero text for variant B. Returns the HTML unchanged if a marker is missing. */
export function rewriteHero(html: string): string {
  const swap = (attr: string, fn: (inner: string) => string) => {
    html = html.replace(
      new RegExp(`(<(\\w+)[^>]*data-ky="${attr}"[^>]*>)([\\s\\S]*?)(</\\2>)`),
      (_m, open, _tag, inner, close) => open + fn(inner) + close,
    )
  }
  swap('title', inner => {
    // keep the scoped-style attributes of the original accent span
    const accentOpen = inner.match(/<span class="hero-accent"[^>]*>/)?.[0] ?? '<span class="hero-accent">'
    return `${HERO_B.title}<br />${accentOpen}${HERO_B.accent}</span>`
  })
  swap('subtitle', () => HERO_B.subtitle)
  swap('cta', () => HERO_B.cta)
  return html
}

/** Adds an `x-koryla` header saying what the function did — handy to debug without edge logs. */
async function tagged(reason: string, res: Promise<Response> | Response): Promise<Response> {
  const r = await res
  try {
    const h = new Headers(r.headers)
    h.set('x-koryla', reason.replace(/[^\x20-\x7e]/g, '?').slice(0, 120))
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h })
  } catch { return r }
}

export default async function handler(request: Request, context: any): Promise<Response> {
  let decision: null | {
    experiment: any; variantId: string; isControl: boolean; isNew: boolean; sessionId: string
    cookieName: string; newSession: boolean; host: string
  } = null

  try {
    // NETLIFY isn't set in the edge runtime, so only the API key is checked
    if (!env('KORYLA_API_KEY')) return tagged('skip:no-api-key', context.next())

    const url = new URL(request.url)
    const host = url.hostname
    const path = normalizePath(url.pathname)
    const experiments = await getConfig(host)
    const cookies = parseCookies(request.headers.get('cookie'))

    // Conversion page: count it, serve as usual
    const converting = experiments.find((e: any) => e.conversion_url && pathOf(e.conversion_url) === path)
    if (converting) {
      const variantId = cookies[`${COOKIE_PREFIX}${converting.id}`]
      const sessionId = cookies[SESSION_COOKIE]
      if (variantId && sessionId && converting.variants.some((v: any) => v.id === variantId)) {
        const p = sendEvent(host, {
          experiment_id: converting.id, variant_id: variantId, session_id: sessionId, event_type: 'conversion',
        })
        context.waitUntil?.(p)
      }
      return tagged('conversion-page', context.next())
    }

    // Hero page: assign a variant
    const experiment = experiments.find((e: any) => pathOf(e.base_url) === path)
    if (!experiment) return tagged(`skip:no-experiment (config:${experiments.length})`, context.next())

    const cookieName = `${COOKIE_PREFIX}${experiment.id}`
    let variantId = cookies[cookieName]
    let isNew = false

    if (experiment.override_assignment) {
      for (const v of experiment.variants) {
        const hit = (v.rules ?? []).some((r: any) => r.param && url.searchParams.get(r.param) === r.value)
        if (hit) { isNew = variantId !== v.id; variantId = v.id; break }
      }
    }
    if (!experiment.variants.some((v: any) => v.id === variantId)) {
      variantId = assignVariant(experiment.variants)
      isNew = true
    }

    const variant = experiment.variants.find((v: any) => v.id === variantId)
    const sessionId = cookies[SESSION_COOKIE] ?? crypto.randomUUID()
    decision = {
      experiment, variantId, isControl: !!variant.is_control, isNew, sessionId,
      cookieName, newSession: !cookies[SESSION_COOKIE], host,
    }
  } catch (e) {
    return tagged(`error:${(e as Error)?.message ?? e}`, context.next())
  }

  const response: Response = await context.next()
  const d = decision

  if (d.isNew) {
    const p = sendEvent(d.host, {
      experiment_id: d.experiment.id, variant_id: d.variantId, session_id: d.sessionId, event_type: 'impression',
    })
    context.waitUntil?.(p)
  }

  const isHtml = (response.headers.get('content-type') ?? '').includes('text/html')
  let body: BodyInit | null = response.body
  const headers = new Headers(response.headers)

  if (!d.isControl && isHtml) {
    try { body = rewriteHero(await response.clone().text()); headers.delete('content-length') }
    catch { return response }
  }

  const maxAge = 60 * 60 * 24 * 30
  if (d.isNew) headers.append('Set-Cookie', `${d.cookieName}=${d.variantId}; Path=/; Max-Age=${maxAge}; SameSite=Lax`)
  if (d.newSession) headers.append('Set-Cookie', `${SESSION_COOKIE}=${d.sessionId}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`)

  headers.set('x-koryla', `${d.isControl ? 'control' : 'variant'}${d.isNew ? ':new' : ''}`)
  return new Response(body, { status: response.status, statusText: response.statusText, headers })
}
