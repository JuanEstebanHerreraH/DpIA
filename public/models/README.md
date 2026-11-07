# Modelo incluido en DpIA 0.2.0

`realesr-general-x4v3.onnx`, modelo fotográfico compacto SRVGGNet, float32 RGB NCHW, rango 0–1, dimensiones dinámicas, ampliación ×4.

Pesos originales: Real-ESRGAN, Xintao Wang y colaboradores, Tencent ARC Lab.

- Upstream: https://github.com/xinntao/Real-ESRGAN
- Conversión ONNX distribuida por: https://huggingface.co/jonathanst29/tinier-upscale-models
- Archivo: https://huggingface.co/jonathanst29/tinier-upscale-models/blob/main/realesr-general-x4v3.onnx
- Tamaño: 4 866 396 bytes.
- SHA-256: `924ebad6532777303582d4ce7811849b88869231a3ae7093e0f21200249df8d5`.
- Licencia declarada: BSD-3-Clause. Se conserva el texto upstream en LICENSE-BSD-3-Clause.txt; no se relicencia bajo MIT.

El script prebuild verifica la huella. El modelo se incluye en el ZIP de código y en el EXE/APK. Se lee desde los recursos locales al abrir la app y solo realiza cálculos si el usuario activa IA. No se descarga desde un servidor durante el uso. Los modelos personalizados son opcionales y no sustituyen el modelo incluido al reiniciar.
