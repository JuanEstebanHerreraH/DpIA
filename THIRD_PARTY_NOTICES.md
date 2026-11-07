# Componentes de terceros

El código original de DpIA está bajo MIT. Este documento no cambia la licencia de sus dependencias. `docs/licenses/` contiene los textos de licencia y avisos disponibles en los paquetes instalados, junto con un inventario de versiones. Regenera con `npm run licenses` después de instalar dependencias y compilar Rust. El inventario incluye herramientas de desarrollo; no todas se incorporan al ejecutable.

| Componente | Licencia declarada por upstream | Uso |
|---|---|---|
| React / React DOM | MIT | Interfaz |
| Vite / TypeScript | MIT / Apache-2.0 | Construcción y tipado |
| Tauri y plugins | MIT o Apache-2.0 | Aplicación Windows |
| Capacitor y plugins oficiales | MIT | Integración Android |
| Lucide | ISC | Iconos de interfaz |
| jsPDF | MIT | Documentos PDF |
| ONNX Runtime | MIT y avisos de componentes incorporados | Inferencia local |
| jSquash | Apache-2.0 y licencias de los códecs subyacentes | Codificación AVIF |
| libavif / libaom | BSD-2-Clause y avisos upstream | Códec AVIF incorporado en WASM |

Referencias oficiales: [Tauri](https://github.com/tauri-apps/tauri), [Capacitor](https://github.com/ionic-team/capacitor), [ONNX Runtime](https://github.com/microsoft/onnxruntime), [jSquash](https://github.com/jamsinclair/jSquash), [libavif](https://github.com/AOMediaCodec/libavif), [libaom](https://aomedia.googlesource.com/aom/), [Lucide](https://github.com/lucide-icons/lucide), [jsPDF](https://github.com/parallax/jsPDF).

Android incorpora componentes AndroidX con sus avisos/licencias de upstream; no se relicencian bajo MIT. Gradle resuelve sus versiones desde los archivos del proyecto. El wrapper Gradle se distribuye bajo Apache-2.0. Microsoft WebView2 se instala o utiliza bajo los términos de Microsoft; no es código MIT de DpIA.

## Recursos propios

- `public/icon.svg`: icono original de DpIA, incluido bajo MIT.
- `public/demo.jpg`: paisaje sintético creado con la herramienta integrada de generación de imágenes para este proyecto. No se presenta como fotografía documental ni como captura de un lugar real.
- `docs/images/dpia-desktop.png` y `dpia-mobile.png`: capturas de la interfaz del proyecto usando la imagen sintética de muestra.
- `tests/fixtures/nearest-x2.onnx`: grafo sin pesos entrenados, generado por nuestro script para pruebas técnicas. No ofrece mejora fotográfica.

## Modelos

DpIA 0.2.0 incluye `public/models/realesr-general-x4v3.onnx`: pesos originales de Real-ESRGAN de Xintao Wang y colaboradores, exportados a ONNX por jonathanst29/tinier-upscale-models. El exportador declara BSD-3-Clause. Se conservan procedencia, huella SHA-256 y texto upstream en `public/models/README.md` y `LICENSE-BSD-3-Clause.txt`. El prebuild verifica la huella. Estos pesos no se relicencian bajo MIT; sus avisos también se empaquetan con la app.

Quien importe otros modelos debe revisar sus términos por separado. El grafo sintético de pruebas sigue siendo un recurso de validación técnica y no se usa como modelo de mejora del producto.
