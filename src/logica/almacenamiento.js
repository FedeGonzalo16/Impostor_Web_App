/* ============================================================
   Persistencia de la partida.

   Usa localStorage. Si el navegador lo tiene bloqueado (modo
   incógnito estricto, iframes con sandbox, algunos previews),
   cae a una copia en memoria para que la app no se rompa:
   se pierde al recargar, pero funciona.
   ============================================================ */

const CLAVE = "impostor-anotador-v2";
const memoria = {};

export function guardar(estado) {
  const data = JSON.stringify(estado);
  try {
    window.localStorage.setItem(CLAVE, data);
  } catch {
    memoria[CLAVE] = data;
  }
}

export function leer() {
  let bruto = null;
  try {
    bruto = window.localStorage.getItem(CLAVE);
  } catch {
    bruto = null;
  }
  if (bruto == null) bruto = memoria[CLAVE] ?? null;
  if (!bruto) return null;
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

export function borrar() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    /* nada */
  }
  delete memoria[CLAVE];
}
