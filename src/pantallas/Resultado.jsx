import { Palotes } from "../componentes/Ornamentos.jsx";

export default function Resultado({ st, set, ranking, nombreDe, onNueva, onTerminar }) {
  const r = st.rondas[st.rondas.length - 1];
  if (!r) return null;

  const ganoImpostor = r.ganador === "impostores";
  const premiados = ganoImpostor ? r.impostorIds : r.inocentesIds;

  /* El puntaje sale siempre de `rondas`, nunca se acumula (ver juego.js),
     así que corregir un botón apretado de más es invertir el ganador de
     la última ronda: el resto se recalcula solo. */
  function corregir() {
    set({
      rondas: st.rondas.map((x, i) =>
        i !== st.rondas.length - 1
          ? x
          : { ...x, ganador: ganoImpostor ? "jugadores" : "impostores" }
      ),
    });
  }

  return (
    <section className="bloque">
      <div className={`veredicto ${ganoImpostor ? "es-impostor" : ""}`}>
        <span className="rotulo">Ronda {String(r.n).padStart(2, "0")}</span>
        <p className="fallo">
          {ganoImpostor
            ? r.impostorIds.length > 1
              ? "Ganaron los impostores"
              : "Ganó el impostor"
            : "Ganaron los jugadores"}
        </p>
        <p className="manuscrito bajo">
          {ganoImpostor ? "2 puntos" : "1 punto"} para {premiados.length}{" "}
          {premiados.length === 1 ? "jugador" : "jugadores"}
        </p>
      </div>

      <button className="enlace" onClick={corregir}>
        Si te equivocaste de ganador, clickea acá.
      </button>

      <div className="apartado">
        <h2 className="rotulo">La palabra era</h2>
        <p className="revelado">{r.palabra}</p>

        <h2 className="rotulo separado">
          {r.impostorIds.length > 1 ? "Los impostores eran" : "El impostor era"}
        </h2>
        <p className="revelado">
          {r.impostorIds.map((id) => nombreDe(id)).join(", ")}
        </p>

        {r.conPista && r.pista && (
          <>
            <h2 className="rotulo separado">Y la pista que tenía</h2>
            <p className="pista-revelada manuscrito">“{r.pista}”</p>
          </>
        )}
      </div>

      <div className="apartado">
        <h2 className="rotulo">Anotador</h2>
        <ul className="anotador">
          {ranking.map((j) => (
            <li key={j.id}>
              <span className="manuscrito nombre">
                {j.nombre}
                {premiados.includes(j.id) && (
                  <span className="mas rojo-txt">+{ganoImpostor ? 2 : 1}</span>
                )}
              </span>
              <span className="puntos">
                <Palotes
                  n={j.puntos}
                  nuevos={premiados.includes(j.id) ? (ganoImpostor ? 2 : 1) : 0}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pie">
        <button className="btn btn-tinta" onClick={onNueva}>
          Nueva ronda
        </button>
        <button className="btn btn-borde" onClick={onTerminar}>
          Terminar la juntada
        </button>
      </div>
    </section>
  );
}
