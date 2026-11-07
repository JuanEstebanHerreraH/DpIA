# Validación de la versión 0.2.0

## Comprobado automáticamente

- TypeScript y Vite compilan la versión de producción.
- **13 pruebas unitarias aprobadas:** medidas, proporciones, límites, píxeles neutros, alfa, densidad PNG/JPEG, presupuesto de IA, copia proporcional, estimación sin valores inventados, tamaño de vista rápida y extensión JFIF.
- **7 pruebas E2E aprobadas en Chromium:** escritorio/PDF A4; PNG/JPEG/JFIF/WebP/AVIF reabiertos con medidas correctas y cabecera/densidad JFIF; modelo listo al reabrir; hardware dedicado; modelo fotográfico real sin importación y comparación distinta de la interpolación; cancelación y retorno al modo clásico; grafo ONNX ×2; pantalla móvil y rechazo de salida excesiva (algunas comprobaciones se agrupan en una prueba).
- Capturas de escritorio y móvil generadas desde la interfaz real y revisadas visualmente.

Las pruebas de IA incluyen un grafo sintético de vecino más próximo para comprobar valores exactos y una ejecución del modelo fotográfico preentrenado incluido. Se verifica que hay reconstrucción real distinta de la interpolación, carga automática, progreso y cancelación. Una diferencia de píxeles no prueba mayor calidad: la valoración fotográfica requiere revisión de imágenes representativas.

## Compilación nativa

Se prepararon los proyectos Tauri/Windows y Capacitor/Android. Los detalles finales de los artefactos entregados y su validación se registran junto a los instaladores en `LEEME-ENTREGA.md`.

La compilación APK de desarrollo utiliza una clave de prueba local. El instalador de Windows no utiliza firma comercial. Una compilación exitosa no equivale a una certificación de rendimiento ni a una prueba en todos los equipos.

## Pendiente de validar en hardware físico

- Android real de 4 GB y 6 GB: RAM máxima, temperatura, batería, tiempos, selector de archivos y compartir con aplicaciones concretas.
- Windows de 8 GB: tiempos y memoria con fotografías representativas.
- Calidad de un modelo preentrenado con retratos, letras y texturas.
- Compatibilidad con distintas versiones de WebView2/WebView y aplicaciones receptoras de AVIF.
- Impresión física: la prueba PDF comprueba MediaBox A4; el tamaño en papel depende además de las opciones del controlador y de la impresora.

## Reproducir

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

En Windows se utiliza Edge por defecto. Para Chromium, ejecuta `npx playwright install chromium` y configura `PW_CHANNEL=chromium`. En PowerShell: `$env:PW_CHANNEL = 'chromium'`. El script de pruebas genera su fixture ONNX y guarda capturas en `docs/images/`. Los archivos descargados por las pruebas se guardan temporalmente en `test-results/`.

## Límites conocidos

- No hay aceleración GPU/NPU de IA en esta versión; se utiliza CPU/WASM.
- Se incluye RealESR general ×4; no hay descarga de modelos durante el uso. GPU/NPU y tiempos de ejecución uniformes no están garantizados.
- La ruta de imagen es sRGB de 8 bits; no conserva EXIF/GPS ni perfiles ICC originales.
- Entrada limitada tras decodificar: no se promete resistencia a archivos maliciosos o bombas de descompresión.
- Box blur y enfoque son filtros clásicos moderados, no restauración avanzada.
- SVG/TIFF/RAW/HEIC, lotes, CMYK/PDF-X, iOS e historial persistente quedan fuera del alcance inicial.
- La versión web de desarrollo no es una PWA instalable con caché sin conexión.
