import { useState } from "react";
import { uid } from "../logica/juego.js";
import { CirculoRojo, Palotes } from "../componentes/Ornamentos.jsx";
import EditorCategorias from "./EditorCategorias.jsx";

const RELOJES = [
  [0, "sin reloj"],
  [180, "3 min"],
  [300, "5 min"],
  [600, "10 min"],
];

export default function Setup({
  st,
  set,
  categorias,
  maxImpostores,
  ranking,
  onEmpezar,
  onTerminar,
}) {
  const [nombre, setNombre] = useState("");
  const [editor, setEditor] = useState(false);

  const enJuego = st.rondas.length > 0;
  const listo = st.jugadores.length >= 3;
  const cat = categorias.find((c) => c.id === st.catId);
  const catVacia = cat?.propia && (cat.palabras || []).length < 3;

  function agregar() {
    const n = nombre.trim().slice(0, 16);
    if (!n) return;
    set({ jugadores: [...st.jugadores, { id: uid(), nombre: n }] });
    setNombre("");
  }

  function quitar(id) {
    const jugadores = st.jugadores.filter((j) => j.id !== id);
    set({
      jugadores,
      impostores: Math.min(st.impostores, Math.max(1, jugadores.length - 2)),
    });
  }

  return (
    <section className="bloque">
      {enJuego && (
        <div className="apartado">
          <h2 className="rotulo">Cómo va la cosa</h2>
          <ul className="anotador">
            {ranking.map((j) => (
              <li key={j.id}>
                <span className="manuscrito nombre">{j.nombre}</span>
                <span className="puntos">
                  <Palotes n={j.puntos} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="apartado">
        <h2 className="rotulo">
          Jugadores <span className="cuenta">{st.jugadores.length}</span>
        </h2>
        <div className="renglon-input">
          <input
            className="campo"
            value={nombre}
            placeholder="nombre o apodo"
            maxLength={16}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregar()}
          />
          <button className="btn btn-tinta corto" onClick={agregar}>
            Sumar
          </button>
        </div>
        {st.jugadores.length === 0 ? (
          <p className="nota">Hacen falta tres jugadores como mínimo para comenzar el juego.</p>
        ) : (
          <ul className="lista-nombres">
            {st.jugadores.map((j, i) => (
              <li key={j.id}>
                <span className="ord">{String(i + 1).padStart(2, "0")}</span>
                <span className="manuscrito nombre">{j.nombre}</span>
                <button
                  className="tachar"
                  onClick={() => quitar(j.id)}
                  aria-label={`Quitar a ${j.nombre}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="apartado">
        <h2 className="rotulo">Impostores</h2>
        <div className="fila-opciones">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`opcion ${st.impostores === n ? "elegida" : ""}`}
              disabled={n > maxImpostores}
              onClick={() => set({ impostores: n })}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="nota">Siempre deben haber al menos dos jugadores que no sean impostores.</p>
      </div>

      <div className="apartado">
        <h2 className="rotulo">Pista para el impostor</h2>
        <div className="fila-opciones">
          <button
            className={`opcion ${st.conPista ? "elegida" : ""}`}
            onClick={() => set({ conPista: true })}
          >
            con pista
          </button>
          <button
            className={`opcion ${!st.conPista ? "elegida" : ""}`}
            onClick={() => set({ conPista: false })}
          >
           sin pista
          </button>
        </div>
        <p className="nota">
          Con pista, el impostor recibe una frase que lo orienta en el adivinar la palabra.
          En la opción sin pista, en cambio, el impostor debe adivinar la palabra sin ningún ayuda.
        </p>
      </div>

      <div className="apartado">
        <h2 className="rotulo">Reloj de la ronda</h2>
        <div className="fila-opciones">
          {RELOJES.map(([v, t]) => (
            <button
              key={v}
              className={`opcion ${st.reloj === v ? "elegida" : ""}`}
              onClick={() => set({ reloj: v })}
            >
              {t}
            </button>
          ))}
            <p className="nota">Configura la duración de la ronda. Esto, luego, es igualmente configurable durante la misma ronda, podrás pausarla o reiniciarla en caso de necesitarlo.</p>
        </div>
      </div>

      <div className="apartado">
        <h2 className="rotulo">Categoría</h2>
        <ul className="lista-cat">
          {categorias.map((c, i) => (
            <li key={c.id}>
              <button
                className={`cat ${st.catId === c.id ? "elegida" : ""}`}
                onClick={() => set({ catId: c.id })}
              >
                <span className="ord">{String(i + 1).padStart(2, "0")}</span>
                <span className="cat-nombre">
                  <span className="cat-texto">
                    {c.nombre}
                    {st.catId === c.id && <CirculoRojo />}
                  </span>
                  {c.nota && <em className="manuscrito bajo"> {c.nota}</em>}
                  {c.propia && (
                    <em className="manuscrito bajo">
                      {" "}
                      {(c.palabras || []).length} palabras
                    </em>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button className="enlace" onClick={() => setEditor(!editor)}>
          {editor ? "cerrar" : "escribir mis propias categorías"}
        </button>
        {editor && <EditorCategorias st={st} set={set} />}
      </div>

      <div className="pie">
        <button
          className="btn btn-tinta"
          disabled={!listo || catVacia}
          onClick={onEmpezar}
        >
          {!listo
            ? `Faltan ${3 - st.jugadores.length} jugadores`
            : catVacia
            ? "Esa categoría necesita 3 palabras"
            : "Repartir papelitos"}
        </button>
        {enJuego && (
          <button className="btn btn-borde" onClick={onTerminar}>
            Terminar la juntada
          </button>
        )}
      </div>
    </section>
  );
}
