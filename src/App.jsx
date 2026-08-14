import { useState, useEffect, useMemo } from "react";
import {
  ESTADO_INICIAL,
  armarCategorias,
  sortearPalabra,
  repartirRoles,
  maxImpostores as calcularMaxImpostores,
  calcularRanking,
  contarCatalogo,
} from "./logica/juego.js";
import { guardar, leer } from "./logica/almacenamiento.js";
import { BordeRasgado } from "./componentes/Ornamentos.jsx";
import Encabezado from "./pantallas/Encabezado.jsx";
import Inicio from "./pantallas/Inicio.jsx";
import Setup from "./pantallas/Setup.jsx";
import Reparto from "./pantallas/Reparto.jsx";
import Ronda from "./pantallas/Ronda.jsx";
import Resultado from "./pantallas/Resultado.jsx";
import Final from "./pantallas/Final.jsx";

export default function App() {
  /* Todo el estado de la juntada vive acá y se persiste completo,
     incluida la pantalla actual: si recargás, retomás donde estabas. */
  const [st, setSt] = useState(() => ({ ...ESTADO_INICIAL, ...(leer() || {}) }));
  const set = (parche) => setSt((prev) => ({ ...prev, ...parche }));

  useEffect(() => {
    guardar(st);
  }, [st]);

  const categorias = useMemo(() => armarCategorias(st.propias), [st.propias]);
  const catalogo = useMemo(() => contarCatalogo(categorias), [categorias]);
  const maxImpostores = calcularMaxImpostores(st.jugadores.length);
  const ranking = useMemo(
    () => calcularRanking(st.jugadores, st.rondas),
    [st.jugadores, st.rondas]
  );

  const nombreDe = (id) => st.jugadores.find((j) => j.id === id)?.nombre ?? "—";

  /* ---------- acciones ---------- */

  function nuevoJuego() {
    /* Se conservan las categorías propias: son del usuario, no de la partida.
       Quien la llama ya se aseguró de confirmar si había algo que perder
       (ver el paso de "¿seguro?" en Inicio y Final). */
    set({ ...ESTADO_INICIAL, pantalla: "setup", propias: st.propias });
  }

  function empezarRonda() {
    const sorteo = sortearPalabra({
      categorias,
      catId: st.catId,
      usadas: st.usadas,
    });
    if (!sorteo) return;

    const roles = repartirRoles({
      jugadores: st.jugadores,
      impostores: st.impostores,
    });

    set({
      pantalla: "reparto",
      usadas: sorteo.usadas,
      actual: {
        catId: sorteo.catId,
        catNombre: sorteo.catNombre,
        palabra: sorteo.palabra,
        pista: sorteo.pista,
        conPista: st.conPista,
        ...roles,
        idx: 0,
        abierta: false,
      },
    });
  }

  function resolver(ganador) {
    const a = st.actual;
    if (!a) return;
    set({
      rondas: [
        ...st.rondas,
        {
          n: st.rondas.length + 1,
          catNombre: a.catNombre,
          palabra: a.palabra,
          pista: a.pista,
          conPista: a.conPista,
          impostorIds: a.impostorIds,
          inocentesIds: a.inocentesIds,
          ganador,
        },
      ],
      pantalla: "resultado",
    });
  }

  /* ---------- render ---------- */

  const P = st.pantalla;

  return (
    <div className="mesa">
      <div className="hoja">
        <Encabezado
          ronda={st.rondas.length}
          fuera={P !== "inicio"}
          onInicio={() => set({ pantalla: "inicio" })}
        />

        {P === "inicio" && (
          <Inicio
            hayPartida={st.jugadores.length >= 3}
            hayProgreso={st.jugadores.length > 0 || st.rondas.length > 0}
            rondas={st.rondas.length}
            catalogo={catalogo}
            onNuevo={nuevoJuego}
            onSeguir={() =>
              set({ pantalla: st.rondas.length ? "resultado" : "setup" })
            }
          />
        )}

        {P === "setup" && (
          <Setup
            st={st}
            set={set}
            categorias={categorias}
            maxImpostores={maxImpostores}
            ranking={ranking}
            onEmpezar={empezarRonda}
            onTerminar={() => set({ pantalla: "final" })}
          />
        )}

        {P === "reparto" && (
          <Reparto st={st} set={set} onListo={() => set({ pantalla: "ronda" })} />
        )}

        {P === "ronda" && (
          <Ronda st={st} set={set} nombreDe={nombreDe} onResolver={resolver} />
        )}

        {P === "resultado" && (
          <Resultado
            st={st}
            set={set}
            ranking={ranking}
            nombreDe={nombreDe}
            onNueva={() => set({ pantalla: "setup" })}
            onTerminar={() => set({ pantalla: "final" })}
          />
        )}

        {P === "final" && (
          <Final
            ranking={ranking}
            rondas={st.rondas}
            onSeguir={() => set({ pantalla: "setup" })}
            onNuevo={nuevoJuego}
          />
        )}

        <BordeRasgado />
      </div>

      <p className="pie-mesa">
        © {new Date().getFullYear()} FGP — El Impostor. Todos los derechos reservados.
      </p>
    </div>
  );
}
