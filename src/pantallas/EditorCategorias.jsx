import { useState } from "react";
import { uid, textoDe, pistaDe } from "../logica/juego.js";

/* Cada línea del textarea es una palabra.
   Para darle pista al impostor: palabra | pista
   Sin la barra, la palabra queda sin pista propia. */
function parsear(texto) {
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((linea) => {
      const [palabra, ...resto] = linea.split("|");
      const pista = resto.join("|").trim();
      return pista ? [palabra.trim(), pista] : [palabra.trim()];
    })
    .filter(([palabra]) => palabra.length > 0);
}

export default function EditorCategorias({ st, set }) {
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");

  const parseadas = parsear(texto);
  const sinPista = parseadas.filter((p) => !p[1]).length;
  const puedeGuardar = nombre.trim().length > 0 && parseadas.length >= 3;

  function crear() {
    if (!puedeGuardar) return;
    set({
      propias: [
        ...st.propias,
        { id: uid(), nombre: nombre.trim(), palabras: parseadas },
      ],
    });
    setNombre("");
    setTexto("");
  }

  return (
    <div className="editor">
      <input
        className="campo"
        placeholder="nombre de la categoría"
        value={nombre}
        maxLength={24}
        onChange={(e) => setNombre(e.target.value)}
      />
      <textarea
        className="campo area"
        placeholder={"una por línea, mínimo tres\npalabra | pista para el impostor"}
        value={texto}
        rows={6}
        onChange={(e) => setTexto(e.target.value)}
      />
      <p className="nota">
        Separá la pista con una barra: <code>choripán | se come parado</code>. Las
        palabras sin pista igual funcionan, pero el impostor queda muy a ciegas.
        {parseadas.length > 0 && (
          <>
            {" "}
            Van {parseadas.length}
            {sinPista > 0 && `, ${sinPista} sin pista`}.
          </>
        )}
      </p>
      <button className="btn btn-borde corto" disabled={!puedeGuardar} onClick={crear}>
        Guardar categoría
      </button>

      {st.propias.length > 0 && (
        <ul className="lista-nombres">
          {st.propias.map((c) => (
            <li key={c.id}>
              <span className="manuscrito nombre">{c.nombre}</span>
              <span className="ord">{(c.palabras || []).length}</span>
              <button
                className="tachar"
                onClick={() =>
                  set({
                    propias: st.propias.filter((x) => x.id !== c.id),
                    catId: st.catId === c.id ? "comida" : st.catId,
                  })
                }
                aria-label={`Borrar ${c.nombre}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Se exportan por si hace falta previsualizar una categoría propia. */
export { parsear, textoDe, pistaDe };
