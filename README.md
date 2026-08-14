# El Impostor · anotador de juntada

Juego del impostor para jugar en cualquier juntada con **un solo teléfono** que se
pasa de mano en mano. Sin backend, sin cuentas, sin salas: todo el estado vive en
`localStorage`.

## Arrancar

```bash
npm install
npm run dev        # abre en localhost:5173
npm run dev -- --host   # accesible desde el celular en la misma red wifi
npm test           # corre verificar.mjs: palabras, pistas, sorteo, roles, puntaje
npm run build      # deja el sitio estático en dist/
```

Para deploy en Vercel: preset Vite, build `npm run build`, output `dist`. No hay
variables de entorno. `vercel.json` agrega los headers de seguridad (ver más
abajo) — si algún día se despliega en otro lado, hay que llevarlos a la
configuración de ese hosting, porque `vercel.json` sólo lo lee Vercel.

## Cómo funciona

Cinco pantallas, todas dentro de `App.jsx`, que es el único lugar donde vive el
estado:

1. **inicio** — arrancar o retomar la juntada.
2. **setup** — jugadores, impostores, pista, reloj, categoría.
3. **reparto** — el papelito que cada uno abre y vuelve a doblar.
4. **ronda** — quién arranca, cronómetro, y los dos botones de resolución.
5. **resultado** — palabra, impostores, pista y el anotador actualizado.
6. **final** — podio, planilla de la noche e historial.

El objeto de estado se persiste completo en cada cambio, **incluida la pantalla
actual**: si alguien recarga o se cierra el navegador a mitad de partida, retoma
exactamente donde estaba. La clave es `impostor-anotador-v2`
(en `src/logica/almacenamiento.js`). Si cambiás la forma del estado, subile la
versión a la clave para no leer datos viejos incompatibles.

El cronómetro entra en eso: se guarda en `actual.crono` como el **instante en que
vence** (`finEn`) y no como los segundos que faltan. Así no hay que escribir en
`localStorage` una vez por segundo, y si alguien recarga a mitad de ronda el reloj
retoma con el tiempo real que pasó en lugar de arrancar de cero. `finEn: null`
significa en pausa, y ahí sí vale `restante`.

### Estructura

```text
src/
  App.jsx                    estado de la juntada y ruteo entre pantallas
  main.jsx                   punto de entrada
  estilos.css                todo el diseño (variables CSS arriba)
  fuentes.css                los @font-face de las tres tipografías
  fuentes/                   los .woff2 alojados + LICENCIAS.md
  datos/categorias.js        palabras y pistas
  logica/juego.js            reglas puras: sorteo, roles, puntaje, cronómetro
  logica/almacenamiento.js   localStorage con fallback en memoria
  componentes/Ornamentos.jsx volutas, roseta, palotes, borde rasgado
  pantallas/                 una por pantalla, sin estado global propio
verificar.mjs                los tests
```

`logica/juego.js` no importa React: son funciones puras y se pueden testear
directamente con node.

## Agregar categorías

En `src/datos/categorias.js`. Cada palabra es una tupla
`[palabra, pista para el impostor]`:

```js
{
  id: "musica",              // único: se usa para no repetir palabras
  nombre: "Rock nacional",
  palabras: [
    ["Seru Giran", "banda de los setenta con teclados"],
    ["el Luna Park", "ahí toca todo el mundo alguna vez"],
  ],
}
```

Reglas para que la pista funcione:

- No puede contener la palabra ni un sinónimo directo.
- Tiene que alcanzar para que el impostor diga **algo creíble** en la ronda, pero
  no para que adivine con certeza.
- Corta: entre tres y siete palabras.
- Apunta al contexto o a la situación, no a la definición.

Hay un script que valida esto:

```bash
npm test
```

Chequea que toda palabra tenga pista, que ninguna pista filtre una palabra de más
de cuatro letras del término, que los ids no se repitan, que el sorteo no repita
hasta agotar la categoría (ni por su categoría ni por el bolillero), que el
reparto de roles y el puntaje sean correctos para 3 a 8 jugadores con 1 a 3
impostores, y que el cronómetro descuente y pause bien.

No usa framework: es `node verificar.mjs` a secas. Cada vez que arregles algo de
`logica/juego.js`, dejale un caso acá.

### Categorías del usuario

Se escriben desde la app (setup → "escribir mis propias categorías"), una por
línea con el formato `palabra | pista`, y quedan guardadas en `localStorage`
aparte de la partida: sobreviven a "empezar de cero".

## Reglas implementadas

- Mínimo 3 jugadores. Los impostores nunca superan `jugadores - 2`, así siempre
  quedan al menos dos jugadores comunes.
- Una palabra no se repite hasta agotar la categoría; ahí se reinicia el mazo. El
  historial se lleva **por categoría de origen**, así que una palabra que ya salió
  jugando "Comida y birra" tampoco puede volver a salir por el bolillero.
- El impostor recibe una pista (se puede desactivar con "a ciegas").
- **Ganan los jugadores**: un punto a cada no-impostor de esa ronda.
  **Gana el impostor**: un punto a cada impostor.
- El puntaje se recalcula siempre desde el historial de rondas, nunca se acumula
  en un contador. Podés sumar jugadores a mitad de juntada sin romper nada: solo
  puntúan las rondas que jugaron.
- El bolillero mezcla todas las categorías y cada palabra se lleva su propia
  pista.

## El diseño

La dirección es **fileteado porteño impreso sobre un anotador de papel**: hoja
cuadriculada con margen rojo y borde inferior arrancado, sobre un fondo oscuro
con un brillo verde, uno azul y uno rojo, cada uno en su esquina —los mismos
colores del título y los ornamentos.

- Tipografías: `Alfa Slab One` para el cartel, `Archivo` variable (foundry
  Omnibus-Type, de Buenos Aires) para interfaz y datos, `Caveat` (Impallari Type,
  de Rosario) para lo manuscrito. Están **alojadas en `src/fuentes/`**, no se
  piden a Google: las tres son OFL 1.1 y así la app no depende de la red para
  renderizar. Sólo se incluyen los subsets latin y latin-ext; en
  `fuentes/LICENCIAS.md` está cómo volver a bajarlas.
- Paleta en variables CSS al tope de `estilos.css`: papel, azul birome, rojo de
  corrección, ocre reservado para los ornamentos, y verde que además del
  fileteado asoma en el fondo, junto al azul y al rojo.
- Los puntos son palotes dibujados en SVG, de a cinco. El palote recién ganado se
  traza en rojo con una animación.
- Los ornamentos (`componentes/Ornamentos.jsx`) usan la técnica del fileteador:
  tallo azul, hoja verde, punto ocre y trazo de brillo crema encima.

Si tocás el diseño, la regla es: el fileteado grita en el encabezado, el papelito
y el podio; el medio de la app (listas, opciones, planilla) se mantiene austero y
legible.

## Seguridad

La superficie de ataque es chica a propósito: no hay backend, no hay cuentas,
no hay cookies, no se manda un solo byte a ningún servidor. Lo único que
persiste es `localStorage`, en el propio teléfono de quien juega.

- **Nada de HTML sin escapar.** No hay un solo `dangerouslySetInnerHTML` en
  toda la app: ni la palabra de una categoría propia ni ningún otro texto
  cargado por el usuario se interpreta como HTML, React lo escapa siempre.
- **Content-Security-Policy** en `vercel.json`, con `default-src 'none'` y una
  lista explícita de lo que sí hace falta (script, estilos, fuentes propias).
  `style-src` necesita `'unsafe-inline'` porque la cinta de tiempo del
  cronómetro se anima con un `style` en línea (`Ronda.jsx`); si en algún
  momento se elimina ese inline style, se puede sacar también de la política.
- **Headers del resto**: `X-Frame-Options` y `frame-ancestors` para que la
  página no se pueda embeber en un `<iframe>` ajeno (clickjacking),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy` y un
  `Permissions-Policy` que le cierra la puerta a cámara/micrófono/geolocalización,
  que la app no usa.
- Estos headers sólo se aplican en el deploy de Vercel: `npm run dev` y
  `npm run preview` no los tienen, así que no son la forma de probarlos.
- `npm audit` de vez en cuando. Al momento de escribir esto queda pendiente
  una vulnerabilidad moderada de `esbuild` (a través de `vite`): sólo afecta al
  servidor de desarrollo (`npm run dev`), nunca al sitio compilado, y arreglarla
  pide saltar a Vite 8, que es un cambio mayor. No es urgente, pero no hay que
  olvidarla la próxima vez que se actualicen dependencias.

## Pendientes posibles

- Service worker + `manifest.json` para que funcione sin internet e instale como
  PWA de verdad. Las tipografías ya no piden red, así que no queda nada externo
  que cachear.
- Sonido al terminar el cronómetro.
- Modo "el impostor adivina": si acierta la palabra al ser descubierto, empata.
- Exportar la planilla de la noche como imagen para mandar al grupo.
