import { useState, useEffect } from "react";
import { mmss, arrancarCrono, pausarCrono, segundosDe } from "../logica/juego.js";

/* Sin `navigator.vibrate` (iOS, escritorio) no hace nada: es sólo un
   empujoncito extra para no depender de mirar la pantalla. */
const vibrarFinDelTiempo = () => navigator.vibrate?.([120, 60, 120]);

export default function Ronda({ st, set, nombreDe, onResolver }) {
  const a = st.actual;
  const crono = a?.crono ?? null;

  /* El estado real del reloj vive en `actual.crono`, que se persiste.
     Acá sólo se guarda el número que se muestra, que se recalcula
     contra el reloj del sistema y no se acumula tick a tick. */
  const [seg, setSeg] = useState(() => segundosDe(crono));

  const ponerCrono = (nuevo) => set({ actual: { ...a, crono: nuevo } });

  /* Arranca al entrar a la ronda, no al sortear la palabra: repartir
     los papelitos puede llevar un rato. También cubre las partidas
     guardadas antes de que el crono se persistiera. */
  useEffect(() => {
    if (a && st.reloj > 0 && !a.crono) ponerCrono(arrancarCrono(st.reloj));
  }, [a?.crono, st.reloj]);

  useEffect(() => {
    if (!crono) return;
    if (crono.finEn == null) {
      setSeg(Math.max(0, crono.restante));
      return;
    }
    setSeg(segundosDe(crono));
    /* Si ya estaba vencido al entrar —se volvió a la app pasado el
       tiempo— no hay que vibrar, sólo cuando se cumple en el momento. */
    const yaVencido = segundosDe(crono) <= 0;
    /* Cada 250 ms para que al volver de segundo plano —donde el
       navegador frena los timers— la cifra se acomode enseguida. */
    const tic = setInterval(() => {
      const resto = segundosDe(crono);
      setSeg(resto);
      if (resto <= 0) {
        clearInterval(tic);
        if (!yaVencido) vibrarFinDelTiempo();
      }
    }, 250);
    return () => clearInterval(tic);
  }, [crono?.finEn, crono?.restante]);

  if (!a) return null;

  const corriendo = crono?.finEn != null && seg > 0;
  const resto = st.reloj ? seg / st.reloj : 0;

  return (
    <section className="bloque">
      <p className="rotulo entre">
        {a.catNombre}
        <span className="cuenta">ronda en curso</span>
      </p>

      <div className="apartado centrado">
        <h2 className="rotulo">Arranca hablando</h2>
        <p className="manuscrito arranca">{nombreDe(a.arranca)}</p>
        <p className="nota">Una palabra por persona, en ronda. Después se acusa.</p>
      </div>

      {st.reloj > 0 && (
        <div className="apartado centrado">
          <p className={`crono ${seg === 0 ? "vencido" : ""}`}>{mmss(seg)}</p>
          <div className="cinta-tiempo">
            <span style={{ width: `${resto * 100}%` }} />
          </div>
          <div className="fila-opciones centrada">
            <button
              className="opcion"
              disabled={seg === 0}
              onClick={() =>
                ponerCrono(corriendo ? pausarCrono(crono) : arrancarCrono(seg))
              }
            >
              {corriendo ? "pausa" : "seguir"}
            </button>
            <button
              className="opcion"
              onClick={() => ponerCrono(arrancarCrono(st.reloj))}
            >
              de nuevo
            </button>
          </div>
          {seg === 0 && <p className="nota rojo-txt">Se acabó el tiempo. A votar.</p>}
        </div>
      )}

      <div className="pie">
        <button className="btn btn-tinta" onClick={() => onResolver("jugadores")}>
          Ganaron los jugadores
        </button>
        <button className="btn btn-rojo" onClick={() => onResolver("impostores")}>
          {a.impostorIds.length > 1 ? "Ganaron los impostores" : "Ganó el impostor"}
        </button>
      </div>
    </section>
  );
}
