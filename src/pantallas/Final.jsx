import { useState } from "react";
import { Palotes, Roseta } from "../componentes/Ornamentos.jsx";
import {
  ORDINAL,
  calcularImpostorLetal,
  calcularRachaMasLarga,
  calcularPeorRacha,
  calcularIntocable,
  calcularImpostorFrecuente,
} from "../logica/juego.js";

export default function Final({ ranking, rondas, onSeguir, onNuevo }) {
  const [confirmando, setConfirmando] = useState(false);
  const podio = ranking.slice(0, 3);
  const orden = [podio[1], podio[0], podio[2]].filter(Boolean);
  const alto = ["primero", "segundo", "tercero"];
  const impostorLetal = calcularImpostorLetal(ranking, rondas);
  const racha = calcularRachaMasLarga(ranking, rondas);
  const peorRacha = calcularPeorRacha(ranking, rondas);
  const intocable = calcularIntocable(ranking, rondas);
  const impostorFrecuente = calcularImpostorFrecuente(ranking, rondas);

  return (
    <section className="bloque">
      <p className="rotulo entre">
        Fin de la juntada
        <span className="cuenta">
          {rondas.length} {rondas.length === 1 ? "ronda" : "rondas"}
        </span>
      </p>

      {ranking.length > 0 && (
        <div className="apartado centrado">
          <h2 className="rotulo">
            Podio de la juntada</h2>
          <div className="podio">
            {orden.map((j) => {
              const puesto = ranking.findIndex((x) => x.id === j.id);
              return (
                <div className={`recorte ${alto[puesto]}`} key={j.id}>
                  {puesto === 0 && <Roseta className="roseta-podio" />}
                  <span className="puesto">{ORDINAL[puesto]}</span>
                  {puesto === 0 ? (
                    <span className="cinta chica manuscrito">{j.nombre}</span>
                  ) : (
                    <span className="manuscrito recorte-nombre">{j.nombre}</span>
                  )}
                  <Palotes n={j.puntos} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="apartado">
        <h2 className="rotulo">Planilla de resultados</h2>
        <div className="desliza">
          <table className="planilla">
            <thead>
              <tr>
                <th className="izq">jugador</th>
                {rondas.map((r) => (
                  <th key={r.n}>{r.n}</th>
                ))}
                <th className="tot">pts</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((j, i) => (
                <tr key={j.id} className={i === 0 ? "puntero" : ""}>
                  <td className="izq manuscrito nombre">{j.nombre}</td>
                  {rondas.map((r) => {
                    const fueImpostor = r.impostorIds.includes(j.id);
                    const jugo = fueImpostor || r.inocentesIds.includes(j.id);
                    const gano =
                      r.ganador === "impostores"
                        ? fueImpostor
                        : r.inocentesIds.includes(j.id);
                    return (
                      <td key={r.n} className={fueImpostor ? "fue-impostor" : ""}>
                        {!jugo ? (
                          <span className="cero">…</span>
                        ) : gano ? (
                          <span className="tilde">✓</span>
                        ) : (
                          <span className="cero">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="tot">{j.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="nota">
          Cada columna es una ronda: El <span className="tilde">✓</span> significa que la ganó la ronda,
          <span className="cero">—</span> que la perdió y{" "}
          <span className="cero">…</span> que todavía no jugaba. La celda
          sombreada marca las rondas en las que le tocó ser impostor. Pts, indica la cantidad de puntos totales de cada jugador.
        </p>
      </div>

      <div className="apartado">
        <h2 className="rotulo entre">
          Palabras que salieron
          <span className="cuenta">Ganadores</span>
        </h2>
        <ul className="historial">
          {rondas.map((r) => (
            <li key={r.n}>
              <span className="ord">{String(r.n).padStart(2, "0")}</span>
              <span className="hist-palabra">
                {r.palabra}
                {r.conPista && r.pista && (
                  <em className="hist-pista manuscrito">{r.pista}</em>
                )}
              </span>
              <span
                className={`hist-quien ${
                  r.ganador === "impostores" ? "rojo-txt" : ""
                }`}
              >
                {r.ganador === "impostores" ? "impostor" : "jugadores"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {(impostorLetal || racha || peorRacha || intocable || impostorFrecuente) && (
        <div className="apartado">
          <h2 className="rotulo">El dato de la juntada</h2>
          <dl className="ficha">
            {impostorLetal && (
              <div>
                <dt>Impostor más letal</dt>
                <dd className="manuscrito">
                  <span className="dato-nombre">{impostorLetal.nombre}</span>{" "}
                  <span className="dato-detalle">
                    - {impostorLetal.veces}{" "}
                    {impostorLetal.veces === 1 ? "vez" : "veces"}
                  </span>
                </dd>
              </div>
            )}
            {racha && (
              <div>
                <dt>Racha más larga</dt>
                <dd className="manuscrito">
                  <span className="dato-nombre">{racha.nombre}</span>{" "}
                  <span className="dato-detalle">- {racha.veces} seguidas</span>
                </dd>
              </div>
            )}
            {peorRacha && (
              <div>
                <dt>Peor racha</dt>
                <dd className="manuscrito">
                  <span className="dato-nombre">{peorRacha.nombre}</span>{" "}
                  <span className="dato-detalle">- {peorRacha.veces} seguidas</span>
                </dd>
              </div>
            )}
            {intocable && (
              <div>
                <dt>El intocable</dt>
                <dd className="manuscrito">
                  <span className="dato-nombre">{intocable.nombre}</span>{" "}
                  <span className="dato-detalle">- nunca fue impostor</span>
                </dd>
              </div>
            )}
            {impostorFrecuente && (
              <div>
                <dt>Impostor más frecuente</dt>
                <dd className="manuscrito">
                  <span className="dato-nombre">{impostorFrecuente.nombre}</span>{" "}
                  <span className="dato-detalle">- {impostorFrecuente.veces} veces</span>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="pie">
        {confirmando ? (
          <>
            <p className="nota">
              Se pierde la planilla entera de esta juntada: {rondas.length}{" "}
              {rondas.length === 1 ? "ronda" : "rondas"}.
            </p>
            <button className="btn btn-rojo" onClick={onNuevo}>
              Sí, empezar de cero
            </button>
            <button className="enlace" onClick={() => setConfirmando(false)}>
              no, volver
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-tinta" onClick={onSeguir}>
              Jugar otra ronda
            </button>
            <button className="btn btn-borde" onClick={() => setConfirmando(true)}>
              Empezar de cero
            </button>
          </>
        )}
      </div>
    </section>
  );
}
