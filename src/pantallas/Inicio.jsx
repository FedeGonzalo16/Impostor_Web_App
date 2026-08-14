import { useState } from "react";

export default function Inicio({ hayPartida, hayProgreso, rondas, catalogo, onNuevo, onSeguir }) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <section className="bloque">
      <div className="entrada">
        <p>
          Todos ven la misma palabra excepto uno, el Impostor, que recibe una
          pista y debe fingir saber la palabra.
        </p>
        <p>El objetivo del impostor es adivinar la palabra secreta sin ser descubierto.</p>
        <p>Ronda por ronda, se dan pistas, se discute, se sospecha y se acusa.</p>
      </div>

      <div className="pie">
        {confirmando ? (
          <>
            <p className="nota">
              Se pierden los jugadores cargados
              {rondas > 0 &&
                ` y las ${rondas} ${rondas === 1 ? "ronda anotada" : "rondas anotadas"}`}
              .
            </p>
            <button className="btn btn-rojo" onClick={onNuevo}>
              Sí, empezar de cero
            </button>
            <button className="enlace" onClick={() => setConfirmando(false)}>
              No, continuar con esta
            </button>
          </>
        ) : (
          <button
            className="btn btn-tinta"
            onClick={() => (hayProgreso ? setConfirmando(true) : onNuevo())}
          >
            Nuevo juego
          </button>
        )}

        {hayPartida && !confirmando && (
          <button className="btn btn-borde" onClick={onSeguir}>
            Seguir la juntada
            <em className="manuscrito bajo">
              {rondas} {rondas === 1 ? "ronda anotada" : "rondas anotadas"}
            </em>
          </button>
        )}
      </div>

      <div className="apartado">
        <h2 className="rotulo">Cómo se juega</h2>
        <ol className="instrucciones">
          <li>
            <span className="ord">i</span>
            <span>Cargá los nombres de los jugadores, elegí la cantidad de impostores y una categoría para la ronda.</span>
          </li>
          <li>
            <span className="ord">ii</span>
            <span>
              El teléfono pasa de mano en mano. Cada uno abre su papelito y lo
              vuelve a doblar antes de pasarlo.
            </span>
          </li>
          <li>
            <span className="ord">iii</span>
            <span>
              Arranca la ronda: cada uno dice <em>una</em> palabra relacionada. Sin
              decir la palabra secreta, que es la que debe adivinar el Impostor.
            </span>
          </li>
          <li>
            <span className="ord">iv</span>
            <span>
              Se vota. Si pierde el impostor, suman 1 punto los jugadores restantes. Si el Impostor gana, suma 2 puntos.
            </span>
          </li>
           <li>
            <span className="ord">v</span>
            <span>
              Finalmente, el que suma más puntos gana.
            </span>
          </li>
        </ol>
      </div>

      <dl className="ficha">
        <div>
          <dt>Jugadores</dt>
          <dd>3 o más</dd>
        </div>
        <div>
          <dt>Teléfonos</dt>
          <dd>uno solo</dd>
        </div>
        <div>
          <dt>Palabras</dt>
          <dd>+ de {catalogo.palabras}</dd>
        </div>
      </dl>
    </section>
  );
}
