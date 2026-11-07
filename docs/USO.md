# Usar DpIA

1. Abre JPEG/JPG, JFIF, PNG, WebP o AVIF. También puedes arrastrar un archivo en escritorio.
2. En **Ajustes**, usa controles individuales o **Mejora suave**. Esta última aplica valores moderados fijos; no analiza automáticamente el contenido.
3. Activa **Comparar** y desliza la división. Ambas vistas usan el mismo encuadre de salida.
4. En **Tamaño**, elige un formato o escribe medidas personalizadas. Cambia orientación si lo necesitas.
5. Selecciona formato de exportación y calidad cuando corresponda. Exporta una copia nueva.

## Tamaño, resolución y calidad

Tamaño físico y resolución en píxeles son independientes. La conversión es `píxeles = milímetros / 25.4 × ppp`, redondeada al entero más cercano. A4 vertical de 210 × 297 mm a 300 ppp corresponde a 2480 × 3508 píxeles. Cambiar una etiqueta de densidad por sí solo no crea detalle. La ampliación clásica interpola píxeles; la IA predice detalles y puede equivocarse.

El objetivo de ppp puede configurarse entre 36 y 1200. Para formatos grandes puede ser necesario reducirlo. A0 a 300 ppp supera los límites de memoria del prototipo; A0 a menor densidad puede caber. El límite depende de los píxeles, no del nombre del papel. No se promete que un original pequeño alcance calidad fotográfica a cualquier tamaño.

**Ajustar** conserva la foto completa y rellena el espacio libre con el fondo elegido. **Rellenar** recorta al centro. No existe recorte manual por punto focal en esta versión. El margen se expresa siempre en milímetros, incluso en un lienzo definido en píxeles.

## Formatos de salida

| Formato | Compresión y transparencia | Uso |
|---|---|---|
| PNG | Sin pérdida; admite alfa | Resultado de alta fidelidad, gráficos y conservación de transparencia |
| JPEG/JPG | Con pérdida; sin alfa | Fotos compatibles con la mayoría de aplicaciones |
| JFIF | Compresión JPEG, cabecera APP0 JFIF y densidad; sin alfa | Intercambio con extensión .jfif |
| WebP | Esta versión exporta con pérdida y admite alfa | Compartir y web |
| AVIF | Esta versión exporta con pérdida y admite alfa | Archivo digital eficiente; codificar puede ser lento |
| PDF | Página física, imagen raster incrustada | Impresión a tamaño real |

El control Calidad no elimina la pérdida de JPEG/JFIF/WebP/AVIF ni recupera datos ausentes. PNG y PDF no usan ese control. JPEG, JFIF y PDF aplanan la transparencia con el fondo elegido. SVG no convertiría una foto en vector; TIFF está previsto para una fase posterior.

PNG, JPEG y JFIF reciben metadatos de densidad de impresión. WebP y AVIF se orientan a uso digital; no se promete que otras aplicaciones respeten medidas físicas en estos formatos. PDF es la opción para papel de tamaño exacto: imprimir al 100 %, sin "ajustar a página" adicional. La impresora puede necesitar márgenes físicos o capacidad de impresión sin bordes.

## Color y metadatos

La ruta Canvas trabaja en sRGB de 8 bits. La decodificación la realiza el navegador/WebView. No se preservan EXIF, ubicación GPS ni perfiles ICC originales, ni se promete un flujo CMYK, HDR o de 16 bits. Puede existir variación respecto a aplicaciones con gestión de color diferente. El original no se modifica. La transparencia existente se mantiene en las rutas compatibles salvo el aplanado solicitado para el fondo.

## Cancelar y errores

Cancelar termina el Worker de cálculo; no puede interrumpir un diálogo nativo ya abierto. Si una exportación falla, reduce dimensiones o ppp, prueba PNG y desactiva IA. Una vista previa ajustada a pantalla no sustituye revisar la copia exportada al 100 %. Cuando la IA no está activada, la vista previa muestra filtros clásicos. **Probar IA** la aplica expresamente a la vista previa; modificar los ajustes vuelve a la vista clásica.

## IA lista para usar

El modelo incluido se carga al abrir la app. Activa IA cuando la necesites; no hay que importar archivos ni escribir un prompt. Comparar sin IA / con IA ejecuta una vista rápida sobre una copia pequeña. Ambas vistas usan los mismos ajustes clásicos y encuadre para aislar el cambio del modelo. El informe describe el cálculo; no garantiza mejor calidad.

Exportar utiliza la entrada completa, por lo que puede tardar más. El progreso indica bloques reales y una estimación variable tras los dos primeros. Puedes cancelar. Ver hardware y requisitos abre una ventana distinta de la ayuda general. En Opciones avanzadas se puede preparar una copia ligera; reduce detalle y tiempo sin modificar el original.

JFIF usa compresión JPEG y cabecera APP0 con densidad. La opción nueva exporta la extensión .jfif y permite reabrirla. No ofrece más calidad ni compresión sin pérdida por cambiar de extensión.
