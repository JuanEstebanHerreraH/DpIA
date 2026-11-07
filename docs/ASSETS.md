# Recursos visuales

## Icono

`public/icon.svg` es un diseño original de DpIA, realizado como vector. Sus variantes para instaladores y Android se generan con `npx tauri icon public/icon.svg --output src-tauri/icons` y se copian al proyecto Android. Código vectorial bajo MIT.

## Imagen de muestra

`public/demo.jpg` deriva de una imagen creada el 6 de noviembre de 2026 con la herramienta integrada de generación de imágenes, en modo generación nueva. Se convirtió a JPEG para reducir el peso del paquete. No contiene personas, logotipos ni fotografías privadas del usuario. No es una captura documental de un lugar real.

Prompt empleado:

> Create one original realistic landscape photograph for a photo editing app bundled demo. Beautiful quiet alpine lake in the Italian Dolomites, dark green evergreen trees, rugged stone mountain ridge in the distance, a small red wooden boathouse at the edge of the water, calm clear teal reflections, gentle early morning golden light with fine mist. Rich natural colors, credible photographic detail, subtle fine film grain, no people, no logos, no text, no border, no UI. Landscape 4:3 composition with good shadows and highlights useful for demonstrating photo editing. Commercial product demo quality.

## Capturas

`docs/images/dpia-desktop.png` y `dpia-mobile.png` muestran la interfaz real renderizada por Chromium con la muestra incluida. La captura móvil es una simulación de pantalla de 390 píxeles de ancho, no evidencia de una prueba en un teléfono físico. Se pueden regenerar con las pruebas E2E.
