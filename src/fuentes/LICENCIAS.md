# Tipografías

Los tres archivos `.woff2` de esta carpeta son subsets (latin y latin-ext)
servidos por Google Fonts y alojados acá para que la app funcione sin internet.

Las tres están publicadas bajo la **SIL Open Font License 1.1**, que permite
usarlas, redistribuirlas y empaquetarlas con un producto sin costo ni permiso
adicional.

| Familia | Autoría | Licencia |
| --- | --- | --- |
| Alfa Slab One | JM Solé (Rodrigo Fuenzalida) | OFL 1.1 |
| Archivo | Omnibus-Type (Buenos Aires) | OFL 1.1 |
| Caveat | Impallari Type (Pablo Impallari, Rosario) | OFL 1.1 |

Texto completo de la licencia: https://openfontlicense.org

## Volver a bajarlas

Si hace falta otro subset, otro peso o una versión más nueva, están en
`fuentes.css` las URLs de origen. El pedido original a la API de Google fue:

```
https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Archivo:wdth,wght@62..125,400..900&family=Caveat:wght@500;700&display=swap
```

Hay que pedirlo con un User-Agent de navegador moderno, si no devuelve `ttf`
en lugar de `woff2`.
