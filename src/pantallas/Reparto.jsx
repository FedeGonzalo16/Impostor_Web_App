import { Voluta } from "../componentes/Ornamentos.jsx";

export default function Reparto({ st, set, onListo }) {
  const a = st.actual;
  if (!a) return null;

  const jugador = st.jugadores[a.idx];
  const esImpostor = a.impostorIds.includes(jugador.id);
  const ultimo = a.idx === st.jugadores.length - 1;
  const siguiente = ultimo ? null : st.jugadores[a.idx + 1];
  const conPista = a.conPista && Boolean(a.pista);

  return (
    <section className="bloque">
      <p className="rotulo entre">
        {a.catNombre}
        <span className="cuenta">
          {a.idx + 1}/{st.jugadores.length}
        </span>
      </p>

      <p className="pasale">
        pasale el teléfono a:{" "}
        <span className="manuscrito destacado">{jugador.nombre}</span>
      </p>

      <div className={`papelito ${a.abierta ? "abierto" : ""}`}>
        <div className="papelito-in">
          <button
            className="cara doblado"
            onClick={() => set({ actual: { ...a, abierta: true } })}
            disabled={a.abierta}
          >
            <Voluta className="orn-esq orn-esq-1" />
            <Voluta className="orn-esq orn-esq-2" />
            <span className="pliegue" />
            <span className="manuscrito firma">{jugador.nombre}</span>
            <span className="abrir">abrir</span>
            <Voluta className="orn-esq orn-esq-3" />
            <Voluta className="orn-esq orn-esq-4" />
          </button>

          <div
            className={`cara abierta-cara ${esImpostor ? "es-impostor" : ""} ${
              esImpostor && conPista ? "con-pista" : ""
            }`}
          >
            {esImpostor ? (
              <>
                <span className="marco-rojo">
                  <span className="grande pintado-rojo">IMPOSTOR</span>
                </span>
                {conPista ? (
                  <>
                    <span className="rotulo etiqueta-pista">tu pista</span>
                    <span className="pista">{a.pista}</span>
                  </>
                ) : (
                  <span className="manuscrito bajo">mentí con cara de piedra</span>
                )}
              </>
            ) : (
              <>
                <span className="rotulo">la palabra es</span>
                <span className="grande pintado">{a.palabra}</span>
                <span className="manuscrito bajo">recordala y no la digas</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pie">
        <button
          className="btn btn-tinta"
          disabled={!a.abierta}
          onClick={() =>
            ultimo
              ? onListo()
              : set({ actual: { ...a, idx: a.idx + 1, abierta: false } })
          }
        >
          {!a.abierta
            ? "Tocá el papelito"
            : ultimo
            ? "Doblar y arrancar la ronda"
            : `Doblar y pasar a ${siguiente.nombre}`}
        </button>
      </div>
    </section>
  );
}
