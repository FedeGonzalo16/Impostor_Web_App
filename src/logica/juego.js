import { CATEGORIAS, BOLILLERO } from "../datos/categorias.js";

/* ---------- estado inicial ---------- */

export const ESTADO_INICIAL = {
  pantalla: "inicio", // inicio | setup | reparto | ronda | resultado | final
  jugadores: [], // [{ id, nombre }]
  impostores: 1,
  catId: "comida",
  reloj: 180, // segundos; 0 = sin reloj
  conPista: true, // el impostor recibe una pista
  rondas: [], // historial de rondas cerradas
  actual: null, // ronda en curso
  usadas: {}, // { [catId]: [palabras ya jugadas] }
  propias: [], // categorías escritas por el usuario
};

/* ---------- utilidades ---------- */

export const uid = () => Math.random().toString(36).slice(2, 9);

export function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const alAzar = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const mmss = (s) =>
  `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, "0")}`;

/* ---------- cronómetro de la ronda ----------
   Se guarda el instante en que vence (`finEn`) y no los segundos que
   quedan, por dos razones: no hay que escribir en localStorage una vez
   por segundo, y si alguien recarga el navegador a mitad de ronda el
   reloj retoma con el tiempo real que pasó, no desde el principio.

   `finEn: null` significa en pausa, y ahí sí vale `restante`.
   `ahora` se inyecta para poder testear sin depender del reloj real. */

export const arrancarCrono = (segundos, ahora = Date.now()) => ({
  restante: segundos,
  finEn: ahora + segundos * 1000,
});

export function segundosDe(crono, ahora = Date.now()) {
  if (!crono) return 0;
  if (crono.finEn == null) return Math.max(0, crono.restante);
  return Math.max(0, Math.round((crono.finEn - ahora) / 1000));
}

export const pausarCrono = (crono, ahora = Date.now()) => ({
  restante: segundosDe(crono, ahora),
  finEn: null,
});

/* ---------- palabras y pistas ----------
   Una entrada de categoría puede ser:
     ["palabra", "pista"]   <- formato normal
     "palabra"              <- sin pista (categorías viejas o propias)
*/

export const textoDe = (entrada) => (Array.isArray(entrada) ? entrada[0] : entrada);

export function pistaDe(entrada, nombreCategoria) {
  if (Array.isArray(entrada) && entrada[1]) return entrada[1];
  return `algo de la categoría "${nombreCategoria}"`;
}

/* ---------- catálogo completo ---------- */

export function armarCategorias(propias = []) {
  return [
    ...CATEGORIAS,
    ...propias.map((c) => ({ ...c, propia: true })),
    BOLILLERO,
  ];
}

/* Cuánto hay para jugar, contando las categorías propias. Se muestra en
   la portada; se calcula y no se escribe a mano para que no mienta al
   agregar palabras. El bolillero no cuenta: no tiene palabras propias. */
export function contarCatalogo(categorias) {
  const fuentes = categorias.filter((c) => c.id !== BOLILLERO.id);
  return {
    categorias: fuentes.length,
    palabras: fuentes.reduce((n, c) => n + (c.palabras || []).length, 0),
  };
}

/* Devuelve el banco de la categoría elegida como
   [{ entrada, origenId, categoria }].

   `origenId` es la categoría de la que salió la palabra, que en el
   bolillero no es la categoría elegida. Se conserva para dos cosas:
   la pista lleva el nombre de su categoría real, y el historial de
   usadas se lleva por origen —así una palabra que salió jugando
   "Comida y birra" tampoco vuelve a salir por el bolillero. */
function bancoDe(categorias, catId) {
  const cat = categorias.find((c) => c.id === catId) || CATEGORIAS[0];
  const fuentes =
    cat.id === BOLILLERO.id
      ? categorias.filter((c) => c.id !== BOLILLERO.id && (c.palabras || []).length > 0)
      : [cat];

  return {
    cat,
    banco: fuentes.flatMap((c) =>
      (c.palabras || []).map((entrada) => ({
        entrada,
        origenId: c.id,
        categoria: c.nombre,
      }))
    ),
  };
}

/* Elige una palabra sin repetir dentro de la misma juntada.
   Cuando se agota el banco, se limpia el historial de las categorías
   que lo componen y vuelve a empezar de cero. */
export function sortearPalabra({ categorias, catId, usadas = {} }) {
  const { cat, banco } = bancoDe(categorias, catId);
  if (!banco.length) return null;

  const yaJugada = (b, historial) =>
    (historial[b.origenId] || []).includes(textoDe(b.entrada));

  let historial = usadas;
  let disponibles = banco.filter((b) => !yaJugada(b, historial));

  if (!disponibles.length) {
    const origenes = [...new Set(banco.map((b) => b.origenId))];
    historial = { ...usadas };
    origenes.forEach((id) => (historial[id] = []));
    disponibles = banco;
  }

  const elegido = alAzar(disponibles);
  const palabra = textoDe(elegido.entrada);
  const origen = elegido.origenId;

  return {
    catId: cat.id,
    catNombre: cat.nombre,
    palabra,
    pista: pistaDe(elegido.entrada, elegido.categoria),
    usadas: { ...historial, [origen]: [...(historial[origen] || []), palabra] },
  };
}

/* ---------- reparto de roles ---------- */

export function repartirRoles({ jugadores, impostores }) {
  const ids = jugadores.map((j) => j.id);
  const impostorIds = mezclar(ids).slice(0, Math.min(impostores, Math.max(1, ids.length - 2)));
  return {
    impostorIds,
    inocentesIds: ids.filter((id) => !impostorIds.includes(id)),
    arranca: alAzar(ids),
  };
}

/* Máximo de impostores: siempre quedan al menos dos jugadores comunes. */
export const maxImpostores = (cantidadJugadores) =>
  Math.max(1, Math.min(3, cantidadJugadores - 2));

/* ---------- puntaje ---------- */

export function calcularTotales(jugadores, rondas) {
  const totales = {};
  jugadores.forEach((j) => (totales[j.id] = 0));
  rondas.forEach((r) => {
    // Si zafa el impostor se lleva 2 puntos; si lo descubren, los
    // jugadores restantes se llevan 1 punto cada uno.
    const ganoImpostor = r.ganador === "impostores";
    const ganadores = ganoImpostor ? r.impostorIds : r.inocentesIds;
    const puntos = ganoImpostor ? 2 : 1;
    ganadores.forEach((id) => {
      if (id in totales) totales[id] += puntos;
    });
  });
  return totales;
}

export function calcularRanking(jugadores, rondas) {
  const totales = calcularTotales(jugadores, rondas);
  return [...jugadores]
    .map((j) => ({ ...j, puntos: totales[j.id] ?? 0 }))
    .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre));
}

export const ORDINAL = ["1º", "2º", "3º"];

/* ---------- datos de cierre ----------
   Datos de sobremesa para la pantalla final. No compiten con el
   ranking: mientras ese decide quién ganó la noche, éstos cuentan una
   anécdota puntual. Todos devuelven `null` cuando no hay nada
   interesante para mostrar (nadie se salvó siendo impostor, nadie
   encadenó más de una ronda ganada o perdida...), en vez de forzar un
   dato vacío. */

/* El jugador que más veces ganó siendo impostor. */
export function calcularImpostorLetal(jugadores, rondas) {
  const candidatos = jugadores.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    veces: rondas.filter((r) => r.ganador === "impostores" && r.impostorIds.includes(j.id)).length,
  }));
  const [mejor] = candidatos
    .filter((c) => c.veces > 0)
    .sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre));
  return mejor ?? null;
}

/* La racha más larga de rondas ganadas al hilo, contando sólo las
   rondas que cada uno jugó (sumarse a mitad de juntada no cuenta en
   contra). Una racha de una sola ronda no es racha: no se muestra. */
export function calcularRachaMasLarga(jugadores, rondas) {
  const candidatos = jugadores.map((j) => {
    let actual = 0;
    let maxima = 0;
    for (const r of rondas) {
      const jugo = r.impostorIds.includes(j.id) || r.inocentesIds.includes(j.id);
      if (!jugo) continue;
      const gano = r.ganador === "impostores" ? r.impostorIds.includes(j.id) : r.inocentesIds.includes(j.id);
      actual = gano ? actual + 1 : 0;
      maxima = Math.max(maxima, actual);
    }
    return { id: j.id, nombre: j.nombre, veces: maxima };
  });
  const [mejor] = candidatos
    .filter((c) => c.veces >= 2)
    .sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre));
  return mejor ?? null;
}

/* La racha más larga de rondas perdidas al hilo: el espejo de la
   anterior. Mismo criterio de "sólo cuentan las rondas jugadas" y
   mismo piso de 2 para que sea una racha de verdad. */
export function calcularPeorRacha(jugadores, rondas) {
  const candidatos = jugadores.map((j) => {
    let actual = 0;
    let maxima = 0;
    for (const r of rondas) {
      const jugo = r.impostorIds.includes(j.id) || r.inocentesIds.includes(j.id);
      if (!jugo) continue;
      const gano = r.ganador === "impostores" ? r.impostorIds.includes(j.id) : r.inocentesIds.includes(j.id);
      actual = gano ? 0 : actual + 1;
      maxima = Math.max(maxima, actual);
    }
    return { id: j.id, nombre: j.nombre, veces: maxima };
  });
  const [peor] = candidatos
    .filter((c) => c.veces >= 2)
    .sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre));
  return peor ?? null;
}

/* El jugador que jugó todas las rondas y nunca le tocó ser impostor.
   Con menos de 3 rondas es demasiado fácil que le toque a nadie por
   pura suerte, así que ahí no se muestra. */
export function calcularIntocable(jugadores, rondas) {
  if (rondas.length < 3) return null;
  const candidatos = jugadores.filter((j) => {
    const jugoTodas = rondas.every((r) => r.impostorIds.includes(j.id) || r.inocentesIds.includes(j.id));
    const nuncaImpostor = rondas.every((r) => !r.impostorIds.includes(j.id));
    return jugoTodas && nuncaImpostor;
  });
  const [elegido] = [...candidatos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  return elegido ? { id: elegido.id, nombre: elegido.nombre } : null;
}

/* El jugador al que más veces le tocó ser impostor, gane o pierda.
   A diferencia de `calcularImpostorLetal` (que mide victorias), esto
   mide pura frecuencia del rol. */
export function calcularImpostorFrecuente(jugadores, rondas) {
  const candidatos = jugadores.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    veces: rondas.filter((r) => r.impostorIds.includes(j.id)).length,
  }));
  const [mejor] = candidatos
    .filter((c) => c.veces >= 2)
    .sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre));
  return mejor ?? null;
}
