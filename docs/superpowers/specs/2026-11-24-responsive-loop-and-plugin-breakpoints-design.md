# `loop` y `rewind` por breakpoint

Fecha: 2026-11-24. Paquete: `@andresclua/sliderkit` (core). Versión prevista: 2.4.0.

Alcance acordado con Andrés el 2026-11-24: solo `loop` y `rewind` dentro de `responsive` (camino 1). El resto de ideas discutidas (plugins por breakpoint, `minWidth` / `maxWidth`, reconstrucción completa del slider al cruzar un breakpoint) quedan **aparcadas** y no se hacen ahora; ver "Fuera de alcance".

## Intención y por qué

Angela (frontend del equipo) configuró un slider así y no funciona:

```js
new Slider('#s', {
  items: 1, gutter: 24, loop: true, speed: 400, mouseDrag: true, overflow: 'visible',
  responsive: { 1024: { items: 3, gutter: 32, loop: false } },
})
```

El `loop: false` del breakpoint se ignora: a 1200 px sigue habiendo los mismos clones que a 600 px (comprobado con una prueba en jsdom). No es una regresión: `loop` se lee una sola vez, al crear el slider (`Slider.ts:270`, `this.options.loop`, línea heredada del commit inicial `8bb3cff`), porque el loop se monta con clones al inicio (`cloneCount`, `Slider.ts:288`). `resizeTasks` (`Slider.ts:1572`) vuelve a leer `items`, `speed`, `center`, `autoHeight`, `fixedWidth` y `disable` al cruzar un breakpoint, pero no `loop`. `rewind` (`Slider.ts:269`) tampoco, y además `Slider.ts:216` escribe `this.options.loop = false` cuando `rewind` es verdadero en el init, lo que pisaría para siempre el `loop` de otros breakpoints.

## Objetivos

1. `loop` y `rewind` dentro de `responsive` funcionan, tanto al cargar como al cruzar un breakpoint redimensionando la ventana, en las dos direcciones (`true` → `false` y `false` → `true`).
2. Al cruzar, el usuario se queda en la misma card.
3. La documentación (`/docs/options`, el skill y la receta de la guía) pasa de "no se puede" a "se puede, con estas limitaciones".

## Fuera de alcance (aparcado)

- `plugins` dentro de `responsive`, `minWidth` / `maxWidth` en plugins y la reconstrucción completa del slider al cruzar un breakpoint. Para las flechas por ancho, la documentación recomienda CSS `@media`.
- `loop` / `rewind` por breakpoint con `edgePadding`, `fixedWidth` o `autoWidth` en esta versión. La clave `loop` del breakpoint se ignora en esos casos. Nota: `loop` **sí** funciona con esas opciones cuando se fija en la base; la limitación es solo cambiarlo por breakpoint.
- Efectos (`fade`, `flip`, `clip-path`...) y WebGL.

## Antiobjetivos

- Que al cruzar el breakpoint el usuario salte a otra card o a la primera, salvo cuando su card no existe sin loop.
- Que reaparezca el "pop in" de la card vecina o el doble zoom en la vuelta del loop (bugs corregidos entre 2.1.5 y 2.1.8).
- Cambiar el comportamiento de cualquier slider que no use `loop` o `rewind` en `responsive`.

## Restricciones

- El core es un port de Tiny Slider 2.9.4. La lógica del loop (clones, `updateIndex`, salto silencioso en `onTransitionEnd`) es delicada y ya tiene tests (`describe('loop clones')`, `describe('loop --active on clones')`).
- Los 21 tests actuales deben seguir pasando.
- Commits solo a nombre de Andrés, sin pie de Claude.

## Diseño

- `loop` y `rewind` se leen con `getOption(...)` (respeta `responsive`) en el init y en `resizeTasks` cuando cambia el breakpoint.
- **`loop` efectivo** en cada ancho = `rewind ? false : loop`, calculado con los valores de **ese** breakpoint. Se elimina la mutación `this.options.loop = false` de `Slider.ts:216`.
- Cuando el `loop` efectivo cambia al cruzar un breakpoint, el core **quita o añade los clones** y recalcula todo lo que deriva de ellos: `cloneCount`, `slideCountNew`, `indexMax`, clases `--active` de los clones, `autoHeight`, `info()`, bordes de `updateIndex`. Se hace en el mismo punto de `resizeTasks` donde hoy se recalculan `items` y el layout, sin animación. Si resulta más seguro reconstruir ese estado interno de golpe que parchearlo pieza a pieza, vale, siempre que el DOM de las slides del usuario no se reemplace.
- **Misma card:** el usuario se queda en la misma card real. Al pasar a `loop: false`, si el índice real queda fuera del rango válido de un slider sin loop, se ajusta al máximo válido antes de aplicar `slideBy` y `center`, y se emite `indexChanged` si el índice se mueve.
- Si solo cambia `rewind` y el `loop` efectivo sigue siendo `false`, no hay clones que tocar: solo cambia qué pasa al llegar al final.
- Tras reconstruir, el core emite `newBreakpointEnd` como hasta ahora, y los plugins que se refrescan en ese evento (`pagination`, `thumbs`, `progress`, `arrows`) lo usan. Hay que comprobar que ninguno lee `cloneCount` ni el índice con valores antiguos.
- **Efectos y `autoplay`:** con un plugin de efecto instalado, `loop` / `rewind` en `responsive` se ignora con un `console.warn`. `autoplay` sigue funcionando al cruzar; con `loop: false` se comporta en la última card como ya lo hace hoy en un slider sin loop.
- **`edgePadding`, `fixedWidth`, `autoWidth`:** la clave `loop` / `rewind` del breakpoint se ignora, sin aviso, y la documentación lo dice.

## Pruebas que se esperan

- jsdom: con `loop: true` y `responsive: { 1024: { loop: false } }`, los clones son 0 a 1200 px y > 0 a 600 px, al cargar y tras un `resize` en ambas direcciones.
- jsdom: `rewind` por breakpoint, con `loop: true` en la base y `rewind: true` en el breakpoint: el `loop` efectivo es `false` solo en ese ancho y vuelve a `true` al salir.
- jsdom: la card activa real es la misma antes y después de cruzar, y el ajuste al pasar a `loop: false` cuando el índice no existe.
- Navegador (muestreo por fotograma, como en los arreglos del loop): redimensionar cruzando 1024 px varias veces; en `loop: true` recorrer todas las cards con la vuelta de la última a la primera y comprobar que no hay huecos ni saltos.

## Documentación y entregables

- `/docs/options` (sección Responsive): `loop` y `rewind` pasan de "no se puede" a "se puede"; se mantiene la tabla de lo que no se puede cambiar (`plugins`, `overflow`, `peek`, efectos) y se anota la limitación con `edgePadding` / `fixedWidth` / `autoWidth`. Las recetas de "recrear el slider" se reducen a lo que siga siendo necesario (plugins por ancho).
- Skill (`SKILL.md`, `recipes.md`) y `sliderkit.skill` regenerado.
- Entrada de changelog y versión **2.4.0**.

## Lo que se deja a quien construya

- Cómo reconstruir los clones sin parpadeo y en qué orden recalcular los índices.
- Los nombres internos y la estructura de las pruebas.
