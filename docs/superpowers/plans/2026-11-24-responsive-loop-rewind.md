# `loop` y `rewind` por breakpoint: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que `loop` y `rewind` funcionen dentro de `responsive` en el core, al cargar y al cruzar un breakpoint redimensionando.

**Architecture:** `loop` / `rewind` se leen con `getOption` (respeta `responsive`) en el init. En `resizeTasks`, cuando cambia el breakpoint y cambia el `loop` efectivo, un método nuevo `applyLoop(next)` quita o añade los clones, recalcula los valores derivados, reconstruye las reglas del stylesheet (el ancho del contenedor y de cada slide depende de `slideCountNew`) y recoloca el índice en la misma card real.

**Tech Stack:** TypeScript, Vite, Vitest + jsdom (`packages/core`), Astro (`packages/docs`).

**Spec:** `docs/superpowers/specs/2026-11-24-responsive-loop-and-plugin-breakpoints-design.md`

## Global Constraints

- Solo `loop` y `rewind`. No tocar plugins, `minWidth` / `maxWidth`, ni reconstrucción general del slider.
- Los 21 tests actuales deben seguir pasando (`cd packages/core && npx vitest run`).
- Con `edgePadding`, `fixedWidth` o `autoWidth` activos en el ancho actual, la clave `loop` / `rewind` del breakpoint se ignora sin aviso.
- Con un plugin de efecto instalado (`name` termina en `Effect`, o es `webgl`), se ignora con `console.warn`.
- El DOM de las slides originales del usuario no se reemplaza; solo se quitan o añaden clones (`sliderkit__item--clone`).
- Sin animación al reconstruir; el usuario se queda en la misma card real.
- Commits solo a nombre de Andrés, sin pie de Claude. **No commitear ni publicar sin que Andrés lo confirme.**
- Versión prevista: 2.4.0.

## Review Focus

- Cruzar el breakpoint varias veces seguidas (ida y vuelta) no acumula clones ni reglas del stylesheet (`sheet.cssRules.length` estable).
- Cruzar mientras hay una transición en marcha (`running`) no deja el slider bloqueado: acaba en la card correcta y vuelve a aceptar navegación.
- `destroy()` después de cambiar de modo deja el contenedor sin clones y con las slides originales intactas.
- Cruzar a un ancho donde todas las slides caben (`freeze`) con `loop: false` no lanza errores.
- Un slider vertical que cruza el breakpoint no lanza errores y mantiene la misma card.

## File Structure

- Modify `packages/core/src/Slider.ts`: lectura de `loop` / `rewind`, `insertClones()`, `applyLoop()`, `rebuildSheet()`, enganche en `resizeTasks`.
- Modify `packages/core/__tests__/Slider.test.ts`: tests nuevos (`describe('responsive loop')`).
- Modify `packages/docs/src/pages/docs/options.astro`, `packages/core/skills/sliderkit/SKILL.md`, `.../references/recipes.md`, `packages/docs/public/sliderkit.skill`, `CHANGELOG.md`, `packages/core/package.json`.
- Modify la página del demo Responsive (localizarla con `grep -rl "responsive" packages/docs/src/pages/demos`) para verificar en el navegador.

---

### Task 1: Leer `loop` y `rewind` con `responsive` en el init

**Files:**
- Modify: `packages/core/src/Slider.ts` (constructor, líneas ~215-217 y ~269-270)
- Test: `packages/core/__tests__/Slider.test.ts`

**Interfaces:**
- Produces: `this.rewind` y `this.loop` calculados con `getOption('rewind')` y `getOption('loop')`. `loop` efectivo = `rewind ? false : loop`. Ya no se muta `this.options.loop`.

- [ ] **Step 1: Write the failing test.** En un `describe('responsive loop')` con un helper `makeAt(width, options)` que fija `window.innerWidth` con `Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })` y crea el slider sobre `createContainer(6)`:
  - `it('loop: false in a breakpoint removes the clones at load')`: a 1200 px con `{ items: 1, loop: true, responsive: { 1024: { items: 3, loop: false } } }` hay 0 `.sliderkit__item--clone`; a 600 px hay más de 0.
  - `it('rewind in a breakpoint turns the loop off only there')`: `{ loop: true, responsive: { 1024: { rewind: true } } }` da 0 clones a 1200 px y más de 0 a 600 px.
- [ ] **Step 2: Run** `cd packages/core && npx vitest run -t "responsive loop"`. Expected: FAIL (hay clones a 1200 px).
- [ ] **Step 3: Implement.** Quitar el bloque `if (this.options.rewind) this.options.loop = false`. Cambiar las líneas `this.rewind = this.options.rewind` y `this.loop = this.rewind ? false : this.options.loop` para que usen `this.getOption('rewind') as boolean` y `this.getOption('loop') as boolean`.
- [ ] **Step 4: Run** `npx vitest run`. Expected: todos en verde (21 anteriores + 2).

### Task 2: Cambiar `loop` / `rewind` al cruzar un breakpoint

**Files:**
- Modify: `packages/core/src/Slider.ts`: extraer el bloque "clone slides" de `initStructure` (líneas ~586-607) a `insertClones()`; añadir `applyLoop()` y `rebuildSheet()`; engancharlos en `resizeTasks`.
- Test: `packages/core/__tests__/Slider.test.ts`

**Interfaces:**
- Produces:
  - `private insertClones(): void`: inserta `this.cloneCount` clones a cada lado y deja `this.slides = Array.from(this.slideItems)`. `initStructure` lo llama en lugar del bloque actual.
  - `private rebuildSheet(): void`: borra todas las reglas de `this.sheet` (`while (this.sheet.cssRules.length) this.sheet.deleteRule(0)`) y llama a `initSheet()`.
  - `private applyLoop(nextLoop: boolean): void`: pasa el slider a `nextLoop`.
- Consumes: `getCloneCountForLoop()`, `getIndexMax()`, `getAbsIndex()`, `updateSlideStatus()`, `doContainerTransformSilent()`, `events.emit`.

- [ ] **Step 1: Write the failing tests** en `describe('responsive loop')`, con un helper `async resizeTo(width)` que fija `innerWidth`, hace `window.dispatchEvent(new Event('resize'))` y espera `await new Promise(r => setTimeout(r, 50))`:
  - `crosses 1024 → loop turns off, 600 → turns on again`: config `{ items: 1, loop: true, responsive: { 1024: { items: 3, loop: false } } }` creada a 600 px; `resizeTo(1200)` deja 0 clones; `resizeTo(600)` deja los clones del principio (mismo número).
  - `keeps the same real card`: ir con `slider.goTo(3)` a la card 3 (confirmar con `slider.activeIndex === 3`), cruzar y volver; `activeIndex` sigue siendo 3 en los dos sentidos.
  - `clamps and emits indexChanged when the card no longer exists`: a 600 px con 6 slides y `items: 1`, `goTo(5)`; cruzar a 1200 px con `items: 3`: `activeIndex` pasa a 3 (máximo válido sin loop) y se emitió `indexChanged` (spy con `slider.on('indexChanged', fn)`).
  - `repeated crossings do not accumulate clones or css rules`: cruzar 6 veces; el número de clones y `document.styleSheets` / la longitud de `cssRules` del slider son iguales tras cada vuelta al mismo ancho.
  - `ignores loop in the breakpoint with edgePadding`: `{ loop: true, edgePadding: 20, responsive: { 1024: { loop: false } } }` mantiene los clones tras cruzar.
  - `ignores it with an effect plugin installed and warns`: con un plugin falso `{ name: 'fadeEffect', install() {}, destroy() {} }` mantiene los clones y `console.warn` fue llamado (spy).
  - `destroy after a switch leaves no clones`: cruzar a `loop: false`, volver a `true`, `destroy()`; `el.querySelectorAll('.sliderkit__item--clone').length === 0` y `el.children.length === 6`.
- [ ] **Step 2: Run** `npx vitest run -t "responsive loop"`. Expected: FAIL.
- [ ] **Step 3: Implement `applyLoop(nextLoop)`.** Pasos: (a) guardar `realIndex = this.getAbsIndex(this.index)`; (b) quitar del `container` todos los hijos con clase `CLS.CLONE`; (c) fijar `this.loop = nextLoop`, `this.cloneCount = nextLoop ? this.getCloneCountForLoop() : 0`, `this.slideCountNew = this.slideCount_ + this.cloneCount * 2`, `this.hasRightDeadZone`, `this.updateIndexBeforeTransform = !nextLoop`; (d) `this.insertClones()`; (e) `this.rebuildSheet()`; (f) `this.indexMax = this.getIndexMax()` y `this.index = nextLoop ? realIndex + this.cloneCount : Math.min(realIndex, this.indexMax)`; `this.indexCached = this.index`; (g) `this.updateSlideStatus()` y `this.doContainerTransformSilent()`; (h) recalcular `activeIndex`, `isBeginning`, `isEnd` como hace `additionalUpdates()`. Si el índice real cambió por el ajuste del paso (f), emitir `indexChanged`.
- [ ] **Step 4: Hook in `resizeTasks`** justo después de calcular `bpChanged`, antes de capturar `itemsTem` / `indexTem`: calcular `nextRewind = this.getOption('rewind')` y `nextLoop = nextRewind ? false : this.getOption('loop')`; si `bpChanged && nextLoop !== this.loop`, y no hay `edgePadding` / `fixedWidth` / `autoWidth` activos, y no hay plugin de efecto (`name` termina en `Effect` o es `webgl`; si lo hay, `console.warn('SliderKit: loop/rewind in responsive is ignored with effect plugins')`), llamar `applyLoop(nextLoop)`; guardar siempre `this.rewind = nextRewind`.
- [ ] **Step 5: Run** `npx vitest run`. Expected: todos en verde.
- [ ] **Step 6: Add the Review Focus tests.** Una prueba por cada línea de "Review Focus" no cubierta arriba: cruzar con `slider.goTo(...)` en curso (esperar `running`) y comprobar que después `goTo` vuelve a funcionar; `freeze` (tres slides, `items: 3` en el breakpoint) sin errores; slider vertical (`axis: 'vertical'`) sin errores. Run `npx vitest run`. Expected: verde.

### Task 3: Comprobarlo en el navegador

**Files:**
- Modify: la página del demo Responsive (ver File Structure): añadir un slider de ejemplo con `loop: true` y `responsive: { 1024: { items: 3, loop: false } }`.

- [ ] **Step 1: Start the dev server** (`npm run dev` ya puede estar corriendo en http://localhost:4321/; no lanzar otro) y abrir la página con `mcp__chrome-devtools`.
- [ ] **Step 2: Verify con muestreo por fotograma** (como en los arreglos del loop 2.1.5-2.1.8): con `resize_page` a 600 px, dar 7 pasos con arrastre y comprobar que no hay huecos en la vuelta de la última a la primera; pasar a 1200 px y comprobar que no hay clones (`.sliderkit__item--clone` = 0) y que el último paso no avanza; volver a 600 px y repetir. Expected: sin huecos y sin saltos en los dos anchos.
- [ ] **Step 3: Run** `npx vitest run` y `npx tsc --noEmit` en `packages/core`. Expected: verde.

### Task 4: Documentación, skill, changelog y versión

**Files:**
- Modify: `packages/docs/src/pages/docs/options.astro`, `packages/core/skills/sliderkit/SKILL.md`, `packages/core/skills/sliderkit/references/recipes.md`, `CHANGELOG.md`, `packages/core/package.json`.

- [ ] **Step 1: Update docs.** En `options.astro`: añadir `loop` y `rewind` a la lista de lo que sí cambia por breakpoint, quitar sus filas de "What you can't change per breakpoint", y anotar la limitación (se ignora con `edgePadding`, `fixedWidth`, `autoWidth` y efectos; el slider se queda en la misma card). La receta de `matchMedia` se limita ahora a los plugins. Mismos cambios en `SKILL.md` (viñeta Responsive) y en `recipes.md`.
- [ ] **Step 2: Regenerate the skill zip.** Desde `packages/core/skills`: `rm -f <abs>/packages/docs/public/sliderkit.skill && zip -qr -X <abs>/packages/docs/public/sliderkit.skill sliderkit` (rutas absolutas).
- [ ] **Step 3: Changelog and version.** Entrada `## [2.4.0] - <fecha>` con "Added: `loop` and `rewind` can be set inside `responsive`; Changed: docs" y `"version": "2.4.0"`.
- [ ] **Step 4: Verify.** `cd packages/core && npm run build && npx vitest run`; abrir `/docs/options/` y comprobar la sección Responsive. Expected: build y tests en verde.
- [ ] **Step 5: Stop.** No commitear ni publicar. Contar a Andrés qué cambió y pedirle confirmación; solo entonces `git commit` (sin pie de Claude), `npx --yes pnpm@9 publish --access public --no-git-checks` desde `packages/core` y `git push origin main`.
