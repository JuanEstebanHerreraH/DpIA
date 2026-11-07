# IA incluida en DpIA 0.2.0

## Qué hace y por qué no hay prompt

DpIA incluye **RealESR general ×4**, un modelo compacto de restauración/superresolución. Recibe píxeles y aplica patrones aprendidos durante su entrenamiento; no interpreta instrucciones de texto. Puede suavizar ruido y artefactos de compresión, reforzar contornos y reconstruir texturas al ampliar. El resultado depende del original: también puede inventar detalles o cambiar letras y rasgos.

Aumentar píxeles no demuestra por sí solo mayor calidad. DpIA no asigna una puntuación automática de calidad. Se debe revisar el resultado antes de conservarlo.

## Modelo cargado automáticamente

`public/models/realesr-general-x4v3.onnx` se incluye en el código, EXE y APK. Se carga desde recursos locales al abrir DpIA, sin descarga durante el uso. Solo calcula si se activa **Aplicar IA al exportar**. No es necesario seleccionar un archivo ONNX.

El archivo ocupa 4 866 396 bytes. SHA-256: `924ebad6532777303582d4ce7811849b88869231a3ae7093e0f21200249df8d5`. El prebuild verifica la huella. Se conservan procedencia y licencia BSD-3-Clause en `public/models/`; MIT de DpIA no sustituye esa licencia.

## Comparación y salida

1. Abre una foto, entra en IA y activa la casilla.
2. Pulsa **Comparar sin IA / con IA** y desliza la división.
3. Ambas vistas parten de la misma copia reducida y usan los mismos ajustes clásicos y encuadre. Una usa interpolación convencional; la otra pasa por el modelo.
4. Revisa ruido, contornos, texturas, letras y rostros. El informe muestra dimensiones, escala y tiempo reales del cálculo, no una certificación de calidad.
5. Elige el tamaño de archivo en Tamaño y exporta. El modelo calcula detalle ×4 antes de adaptar la reconstrucción a las medidas elegidas.

La vista rápida usa como máximo 192 px de lado mayor en móvil y 320 en escritorio. No equivale al cálculo completo. La exportación usa el archivo de entrada completo, por lo que puede tardar mucho más.

## Hardware, tiempo y progreso

Se ejecuta ONNX Runtime Web/WASM en **CPU, un hilo**. GPU/NPU no se utilizan ni son obligatorias.

| Entorno | Objetivo básico | Recomendado para IA |
|---|---|---|
| Android 11+, procesador de 64 bits | 4 GB de RAM | 6 GB o más; IA no garantizada en todo equipo de 4 GB |
| Windows 64 bits y WebView2 | 8 GB de RAM | 16 GB y SSD |

Son objetivos de diseño, no requisitos certificados en todos los equipos. **Ver hardware y requisitos del modelo** abre una ventana diferente de la ayuda general con esta tabla, datos orientativos del navegador, motor, límites y dimensiones de la foto. La memoria informada puede estar redondeada y no indica RAM libre.

Es normal que IA tarde más que redimensionar. Se procesa por bloques de 64 × 64, con 8 px de contexto por lado (entrada real 80 × 80). Más área implica más bloques. Se muestran bloques reales, tiempo transcurrido y una estimación variable de tiempo restante tras al menos dos bloques. No se promete un tiempo fijo para todos los dispositivos.

La sesión se reutiliza en exportaciones sucesivas del mismo modelo y Worker. Cancelar o cambiar de modelo puede liberarla. La vista rápida evita calcular una foto completa para mostrar una miniatura. Hay cancelación en vista previa y exportación. Exportar queda deshabilitado durante una vista IA para evitar dos inferencias simultáneas.

## Límites y copia ligera

×4 genera 16 veces más píxeles. Entrada máxima del modelo incluido: **0.75 MP en móvil** y **1.5 MP en escritorio**, con resultados intermedios de hasta 12 y 24 MP. Se comprueba antes de empezar la exportación. La salida final respeta también los límites generales.

En Opciones avanzadas, **Preparar copia ligera para IA** crea una entrada nueva de hasta 480 px de lado mayor en móvil o 640 en escritorio, dentro del presupuesto. Reduce detalle y tiempo; no modifica el original en disco. No se presenta esa reducción como mejora de calidad. Si el original ya tiene suficiente resolución, pueden bastar los filtros clásicos.

El contexto de bloques reduce costuras, sin garantizar eliminarlas en cualquier arquitectura. El alfa se conserva por vecino más próximo, no se predice con la red.

## Modelos personalizados

La importación sigue disponible en Opciones avanzadas. Se requiere ONNX autocontenido hasta 160 MB; una entrada y una salida float32 NCHW, RGB 0–1, dimensiones espaciales dinámicas y escala ×2 o ×4. No se admiten pesos externos, BGR/NHWC, difusión ni varias entradas. También se comprueba el límite intermedio para modelos personalizados. Al reiniciar se vuelve al modelo incluido; no se guarda el archivo personalizado.

## Procedencia y validación

- Pesos originales: https://github.com/xinntao/Real-ESRGAN
- Conversión: https://huggingface.co/jonathanst29/tinier-upscale-models
- Archivo: https://huggingface.co/jonathanst29/tinier-upscale-models/blob/main/realesr-general-x4v3.onnx

Se prueban el grafo sintético ×2 (valores exactos), el modelo fotográfico incluido (sin importar archivo), comparación, carga al reabrir, progreso y cancelación. Se verifica integración técnica; calidad subjetiva y rendimiento en teléfonos físicos requieren evaluación adicional.
