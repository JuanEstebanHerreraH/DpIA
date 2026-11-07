# DpIA 0.2.0 — Entrega

## Archivos

- **DpIA-0.2.0-Windows-x64.exe:** ejecutable para Windows x64; abre directamente, sin instalador. Requiere Microsoft Edge WebView2. No tiene firma comercial.
- **DpIA-0.2.0-Android-prueba.apk:** APK Android 11+ de desarrollo, firmado con clave de prueba. Se verificó la firma APK v2 y el identificador `app.dpia.studio`, versión 0.2.0. No es una publicación de Google Play ni se ha probado en un teléfono físico.
- **DpIA-0.2.0-GitHub.zip:** código del proyecto, README con capturas, documentación, MIT, avisos de terceros, pruebas y flujos de GitHub Actions. No incluye node_modules, cachés, carpetas de compilación, fotos personales ni claves privadas.
- **DpIA-vista-previa.png:** captura real de la interfaz de escritorio.

El instalador NSIS de Windows no pudo generarse: makensis.exe devuelve error Windows 623 de reasignación de DLL en este entorno. Se entrega el EXE funcional y los comandos para compilar un instalador en un entorno compatible.

## Comandos desde la carpeta del código

```sh
npm ci
npm run desktop:exe
npm run android:debug
```

Para crear el instalador Windows: `npm run desktop:build`. Para crear el APK release sin firma: `npm run android:release`; firma la publicación con tu clave propia desde Android Studio. Los requisitos de compilación están en `docs/COMPILACION.md`.

## Funciones y límites

Modo oscuro; filtros clásicos; comparación; tamaños de papel, fotografía y pantalla; medidas personalizadas; PNG, JPEG, JFIF, WebP, AVIF y PDF. SVG/TIFF y otras ampliaciones están en la hoja de ruta.

La IA es opcional y ya incluye RealESR general ×4, cargado automáticamente. No requiere importar archivos ni un prompt. Se ejecuta en CPU; hay progreso, comparación y cancelación. No usa GPU. Los modelos personalizados son opcionales. Consulta `docs/IA.md`.

## Validación

13 pruebas unitarias y 7 pruebas E2E aprobadas en Chromium. Se verificaron formatos reales (incluido JFIF y su cabecera/densidad), PDF A4, carga del modelo al reabrir, requisitos de hardware separados, modelo fotográfico incluido, comparación, progreso y cancelación. También se mantiene la comprobación numérica del adaptador con un grafo sintético. Las capturas se generan desde la interfaz real.

La compilación APK final contiene el mismo frontend que pasó las pruebas y su firma se verificó con apksigner. La vista móvil de las capturas es una simulación de pantalla; siguen pendientes las pruebas en teléfonos físicos de 4/6 GB y las mediciones de rendimiento.
