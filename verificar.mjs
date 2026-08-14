import { CATEGORIAS, BOLILLERO } from "./src/datos/categorias.js";
import { armarCategorias, sortearPalabra, repartirRoles, calcularRanking, textoDe, pistaDe, arrancarCrono, pausarCrono, segundosDe, contarCatalogo, calcularImpostorLetal, calcularRachaMasLarga } from "./src/logica/juego.js";

let fallas = 0;
const mal = (m) => { console.log("  ✗ " + m); fallas++; };

// 1) toda palabra tiene pista y la pista no delata
let total = 0;
for (const c of CATEGORIAS) {
  for (const e of c.palabras) {
    total++;
    if (!Array.isArray(e) || !e[1]) { mal(`${c.id}: "${textoDe(e)}" sin pista`); continue; }
    const palabra = e[0].toLowerCase().replace(/^(el|la|los|las) /, "");
    const pista = e[1].toLowerCase();
    // ninguna palabra significativa del término puede aparecer en la pista
    for (const t of palabra.split(/\s+/).filter(w => w.length > 4)) {
      if (pista.includes(t)) mal(`${c.id}: la pista de "${e[0]}" contiene "${t}"`);
    }
    if (e[1].length > 60) mal(`${c.id}: pista muy larga en "${e[0]}"`);
  }
}
console.log(`  palabras con pista: ${total}`);

// 2) ids unicos
const ids = CATEGORIAS.map(c => c.id);
if (new Set(ids).size !== ids.length) mal("hay ids de categoría repetidos");

// 3) no repite palabras hasta agotar la categoría
const cats = armarCategorias([]);
let usadas = {};
const vistas = new Set();
const cat = CATEGORIAS[0];
for (let i = 0; i < cat.palabras.length; i++) {
  const s = sortearPalabra({ categorias: cats, catId: cat.id, usadas });
  if (vistas.has(s.palabra)) mal(`repitió "${s.palabra}" antes de agotar`);
  vistas.add(s.palabra);
  usadas = s.usadas;
}
const reinicio = sortearPalabra({ categorias: cats, catId: cat.id, usadas });
if (!reinicio) mal("no reinicia al agotarse la categoría");

// 4) el bolillero trae pista propia de cada palabra
for (let i = 0; i < 60; i++) {
  const s = sortearPalabra({ categorias: cats, catId: BOLILLERO.id, usadas: {} });
  if (!s.pista || s.pista.includes("categoría")) mal(`bolillero sin pista propia: ${s.palabra}`);
}

// 4b) el historial es compartido: lo jugado en una categoría tampoco sale por el bolillero
const totalPalabras = CATEGORIAS.reduce((n, c) => n + c.palabras.length, 0);
{
  // se agota la primera categoría jugándola por su cuenta...
  let u = {};
  for (let i = 0; i < cat.palabras.length; i++) {
    u = sortearPalabra({ categorias: cats, catId: cat.id, usadas: u }).usadas;
  }
  if (u[BOLILLERO.id]) mal("el bolillero no debería aparecer como clave de usadas");
  const agotadas = new Set(cat.palabras.map(textoDe));
  // ...y ahora el bolillero tiene que evitarlas hasta agotar todo lo demás
  for (let i = 0; i < totalPalabras - cat.palabras.length; i++) {
    const s = sortearPalabra({ categorias: cats, catId: BOLILLERO.id, usadas: u });
    if (agotadas.has(s.palabra)) mal(`el bolillero repitió "${s.palabra}", ya jugada en ${cat.id}`);
    u = s.usadas;
  }
}
{
  // y al revés: el bolillero recorre todo sin repetir y después reinicia
  let u = {};
  const vistas2 = new Set();
  for (let i = 0; i < totalPalabras; i++) {
    const s = sortearPalabra({ categorias: cats, catId: BOLILLERO.id, usadas: u });
    if (vistas2.has(s.palabra)) mal(`el bolillero repitió "${s.palabra}" antes de agotar`);
    vistas2.add(s.palabra);
    u = s.usadas;
  }
  if (vistas2.size !== totalPalabras) mal(`el bolillero no cubrió todo: ${vistas2.size}/${totalPalabras}`);
  const post = sortearPalabra({ categorias: cats, catId: BOLILLERO.id, usadas: u });
  if (!post) mal("el bolillero no reinicia al agotarse");
  if (Object.values(post.usadas).flat().length !== 1) mal("el bolillero no limpió el historial al reiniciar");
}

// 5) categorías propias sin pista: fallback
const propias = [{ id: "mias", nombre: "Mis cosas", palabras: [["a"], ["b"], ["c"]] }];
const s5 = sortearPalabra({ categorias: armarCategorias(propias), catId: "mias", usadas: {} });
if (!s5.pista.includes("Mis cosas")) mal("falta el fallback de pista en categorías propias");

// 6) roles: cantidad correcta y sin solapamiento
for (const n of [3, 4, 5, 8]) {
  const jug = Array.from({ length: n }, (_, i) => ({ id: "j" + i, nombre: "J" + i }));
  for (const imp of [1, 2, 3]) {
    const r = repartirRoles({ jugadores: jug, impostores: imp });
    const esperado = Math.min(imp, Math.max(1, n - 2));
    if (r.impostorIds.length !== esperado) mal(`${n} jugadores / ${imp} impostores dio ${r.impostorIds.length}`);
    if (r.impostorIds.some(id => r.inocentesIds.includes(id))) mal("un jugador quedó en los dos bandos");
    if (r.impostorIds.length + r.inocentesIds.length !== n) mal("se perdió un jugador en el reparto");
    if (!jug.some(j => j.id === r.arranca)) mal("arranca un jugador inexistente");
  }
}

// 7) puntaje
const jug = [{id:"a",nombre:"A"},{id:"b",nombre:"B"},{id:"c",nombre:"C"}];
const rondas = [
  { impostorIds:["a"], inocentesIds:["b","c"], ganador:"jugadores" },
  { impostorIds:["b"], inocentesIds:["a","c"], ganador:"impostores" },
  { impostorIds:["c"], inocentesIds:["a","b"], ganador:"jugadores" },
];
const rk = calcularRanking(jug, rondas);
const pts = Object.fromEntries(rk.map(j => [j.id, j.puntos]));
// el impostor que zafa se lleva 2 puntos; el inocente que descubre al impostor, 1.
// a: gana r3 como inocente = 1 | b: inocente ganador en r1 y r3 (1+1) más impostor
// ganador en r2 (2) = 4 | c: solo r1 = 1
if (pts.a !== 1 || pts.b !== 4 || pts.c !== 1) mal(`puntaje mal: ${JSON.stringify(pts)}`);
if (rk[0].id !== "b") mal("el ranking no ordena por puntos");
if (rk[1].id !== "a" || rk[2].id !== "c") mal("los empates no se ordenan por nombre");

// 8) cronómetro: sobrevive a la recarga y a la pausa
const T0 = 1_700_000_000_000; // instante fijo, para no depender del reloj real
{
  const c = arrancarCrono(180, T0);
  if (segundosDe(c, T0) !== 180) mal("el crono no arranca en el total");
  if (segundosDe(c, T0 + 30_000) !== 150) mal("el crono no descuenta el tiempo transcurrido");
  if (segundosDe(c, T0 + 300_000) !== 0) mal("el crono se pasa de cero");

  // recargar es leer el mismo objeto más tarde: tiene que dar lo mismo
  const guardado = JSON.parse(JSON.stringify(c));
  if (segundosDe(guardado, T0 + 60_000) !== 120) mal("el crono no sobrevive a la serialización");

  const p = pausarCrono(c, T0 + 60_000);
  if (p.finEn !== null) mal("el crono en pausa debería tener finEn en null");
  if (segundosDe(p, T0 + 999_000) !== 120) mal("el crono en pausa sigue descontando");

  const r = arrancarCrono(segundosDe(p), T0 + 999_000);
  if (segundosDe(r, T0 + 999_000 + 20_000) !== 100) mal("el crono no retoma desde la pausa");

  if (segundosDe(null) !== 0) mal("un crono inexistente debería dar 0");
  if (segundosDe({ restante: -5, finEn: null }) !== 0) mal("un restante negativo debería dar 0");
}

// 9) el contador de la portada: cuenta lo real y no cuenta el bolillero
{
  const c = contarCatalogo(cats);
  if (c.palabras !== totalPalabras) mal(`la portada diría ${c.palabras} palabras y hay ${totalPalabras}`);
  if (c.categorias !== CATEGORIAS.length) mal("la portada cuenta el bolillero como categoría");

  const conPropias = contarCatalogo(armarCategorias(propias));
  if (conPropias.palabras !== totalPalabras + 3) mal("la portada no suma las categorías propias");
  if (conPropias.categorias !== CATEGORIAS.length + 1) mal("la portada no suma la categoría propia");
}

// 10) los datos de cierre de la pantalla final
{
  // a gana las cuatro rondas (dos como impostor, dos como inocente);
  // b y c ganan una sola vez cada uno; d nunca jugó.
  const jugCierre = [{ id: "a", nombre: "A" }, { id: "b", nombre: "B" }, { id: "c", nombre: "C" }, { id: "d", nombre: "D" }];
  const rondasCierre = [
    { impostorIds: ["a"], inocentesIds: ["b", "c"], ganador: "impostores" },
    { impostorIds: ["b"], inocentesIds: ["a", "c"], ganador: "jugadores" },
    { impostorIds: ["a"], inocentesIds: ["b", "c"], ganador: "impostores" },
    { impostorIds: ["c"], inocentesIds: ["a", "b"], ganador: "jugadores" },
  ];

  const letal = calcularImpostorLetal(jugCierre, rondasCierre);
  if (letal?.id !== "a" || letal?.veces !== 2) mal(`impostor más letal mal: ${JSON.stringify(letal)}`);

  const racha = calcularRachaMasLarga(jugCierre, rondasCierre);
  if (racha?.id !== "a" || racha?.veces !== 4) mal(`racha más larga mal: ${JSON.stringify(racha)}`);

  // sin rondas, no hay nada que contar
  if (calcularImpostorLetal(jugCierre, []) !== null) mal("impostor letal sin rondas debería dar null");
  if (calcularRachaMasLarga(jugCierre, []) !== null) mal("racha sin rondas debería dar null");

  // una racha de una sola ronda no cuenta como racha
  const unaRonda = [{ impostorIds: ["a"], inocentesIds: ["b"], ganador: "impostores" }];
  if (calcularRachaMasLarga(jugCierre, unaRonda) !== null) mal("una racha de una ronda no debería contar");
}

console.log(fallas === 0 ? "\n  TODO OK" : `\n  ${fallas} fallas`);
