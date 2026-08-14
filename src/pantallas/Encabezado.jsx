import { Voluta, Roseta } from "../componentes/Ornamentos.jsx";

export default function Encabezado({ ronda, fuera, onInicio }) {
  return (
    <header className="encabezado">
      <div className="corona">
        <Voluta className="orn-izq" />
        <Roseta />
        <Voluta className="orn-der" />
      </div>

      <h1 className="titulo">
        <span className="titulo-chico">el</span>
        <span className="titulo-grande">Impostor</span>
      </h1>
      <p className="cinta manuscrito">anotador de juntada</p>

      <div className="doble-regla" />

      {(fuera || ronda > 0) && (
        <div className="franja">
          {fuera ? (
            <button className="volver" onClick={onInicio}>
              ← inicio
            </button>
          ) : (
            <span />
          )}
          {ronda > 0 && (
            <span className="plaqueta">
              ronda <b>{String(ronda).padStart(2, "0")}</b>
            </span>
          )}
        </div>
      )}
    </header>
  );
}
