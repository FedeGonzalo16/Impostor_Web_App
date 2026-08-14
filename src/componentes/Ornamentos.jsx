/* ============================================================
   Ornamentos de fileteado porteño y marcas a mano.
   Los colores salen de las variables CSS en estilos.css:
   .orn-tallo, .orn-hoja, .orn-brillo, .orn-punto, etc.
   ============================================================ */

/* Voluta: el rulo con hoja de acanto. Se espeja con scaleX(-1). */
export function Voluta({ className = "" }) {
  return (
    <svg className={`voluta ${className}`} viewBox="0 0 112 60" aria-hidden="true">
      <path className="orn-hoja" d="M20 50 C32 30 52 17 74 13 C60 24 47 34 39 50 Z" />
      <path className="orn-tallo" d="M6 55 C6 32 28 11 64 7" />
      <path className="orn-tallo" d="M64 7 C84 4 98 13 98 27 C98 39 86 46 76 41 C67 36 70 24 80 25" />
      <path className="orn-brillo" d="M11 51 C13 33 33 16 60 12" />
      <circle className="orn-punto" cx="84" cy="30" r="3.2" />
      <circle className="orn-gota" cx="8" cy="48" r="2.6" />
    </svg>
  );
}

/* Roseta radiada, al estilo de las plaquetas pintadas. */
export function Roseta({ className = "" }) {
  const rayos = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const largo = i % 2 ? 17.5 : 21.5;
    rayos.push(
      <line
        key={i}
        x1={24 + Math.cos(a) * 13}
        y1={24 + Math.sin(a) * 13}
        x2={24 + Math.cos(a) * largo}
        y2={24 + Math.sin(a) * largo}
      />
    );
  }
  return (
    <svg className={`roseta ${className}`} viewBox="0 0 48 48" aria-hidden="true">
      <g className="orn-rayos">{rayos}</g>
      <circle className="orn-disco" cx="24" cy="24" r="12" />
      <circle className="orn-anillo" cx="24" cy="24" r="12" />
      <circle className="orn-centro" cx="24" cy="24" r="4.4" />
    </svg>
  );
}

/* Borde inferior de la hoja, arrancado. */
export function BordeRasgado() {
  return (
    <svg className="rasgado" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 16 L0 7 L15 12 L29 4 L45 10 L61 3 L77 9 L93 5 L109 12 L125 6 L141 11 L157 4 L173 9 L189 5 L205 12 L221 6 L237 10 L253 3 L269 9 L285 5 L301 11 L317 6 L333 10 L349 4 L365 9 L381 6 L400 11 L400 16 Z" />
    </svg>
  );
}

/* Círculo de lápiz rojo para marcar la categoría elegida. */
export function CirculoRojo() {
  return (
    <svg className="circulo" viewBox="0 0 138 46" preserveAspectRatio="none" aria-hidden="true">
      <path d="M14 23 C15 9 33 4 56 4 C79 4 103 8 118 16 C122 18 123 21 120 24 C114 36 95 42 69 42 C42 42 21 37 14 29 C12 26 12 24 14 23" />
    </svg>
  );
}

/* ------------------------------------------------------------
   Palotes: los puntos anotados a mano, de a cinco.
   `nuevos` pinta y anima esa cantidad de trazos recién ganados (los
   últimos): 1 punto normal, 2 cuando zafa el impostor.
   ------------------------------------------------------------ */

const JITTER = [0.7, -0.9, 0.5, -0.6, 0.8, -0.4, 0.6, -0.7];

/* El cero también a mano: una vuelta floja de birome, no un guión
   tipográfico. Que ni el cero delate que hay una fuente debajo. */
function CeroManuscrito() {
  return (
    <svg
      className="cero-manuscrito"
      viewBox="0 0 32 24"
      width="32"
      height="22"
      role="img"
      aria-label="0 puntos"
    >
      {/* mismo ancho de caja (32) y alto (22) que un grupo de Palotes,
          así el cero cae en la misma columna que el resto de las marcas */}
      <path
        transform="translate(4 1)"
        d="M14 3.5C7 2.5 2.5 7.5 3.5 12.5C4.5 17.5 11.5 19.5 16.5 17.5C20.5 15.8 20 8.5 17 5.5C16 4.5 15 3.7 14 3.5"
      />
    </svg>
  );
}

export function Palotes({ n, nuevos = 0 }) {
  if (!n) return <CeroManuscrito />;
  if (n > 20) return <span className="num-suelto">{n}</span>;

  const grupos = [];
  let resta = n;
  while (resta > 0) {
    grupos.push(Math.min(5, resta));
    resta -= 5;
  }
  const ancho = grupos.length * 32;
  let contados = 0;

  return (
    <svg
      className="palotes"
      viewBox={`0 0 ${ancho} 24`}
      width={ancho}
      height={22}
      role="img"
      aria-label={`${n} ${n === 1 ? "punto" : "puntos"}`}
    >
      {grupos.map((cant, gi) => {
        const trazos = [];
        const verticales = Math.min(4, cant);
        for (let i = 0; i < verticales; i++) {
          contados += 1;
          const j = JITTER[(gi * 4 + i) % JITTER.length];
          trazos.push(
            <line
              key={`v${i}`}
              className={contados > n - nuevos ? "rojo" : ""}
              x1={4 + i * 6 + j}
              y1="3"
              x2={4 + i * 6 - j}
              y2="20"
            />
          );
        }
        if (cant === 5) {
          contados += 1;
          trazos.push(
            <line
              key="d"
              className={contados > n - nuevos ? "rojo" : ""}
              x1="0"
              y1="19"
              x2="24"
              y2="4"
            />
          );
        }
        return (
          <g key={gi} transform={`translate(${gi * 32} 0)`}>
            {trazos}
          </g>
        );
      })}
    </svg>
  );
}
