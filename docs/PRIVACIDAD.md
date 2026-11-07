# Privacidad

- No hay cuentas, analítica, publicidad ni subida de fotos o modelos a servidores.
- Las fotos se abren desde archivos seleccionados por el usuario; el original no se sobrescribe.
- Las vistas y ajustes permanecen en memoria. Cerrar la app libera esa sesión; las copias exportadas permanecen donde el usuario las guarde.
- En Android, compartir usa una copia en caché. Puede permanecer hasta que Android limpie esa caché o una exportación posterior borre copias de más de 24 horas. El usuario puede borrarla desde Ajustes de Android > Aplicaciones > DpIA > Almacenamiento > Borrar caché.
- Compartir con una aplicación de terceros entrega una copia a esa aplicación. Sus condiciones de privacidad son independientes de DpIA.
- Las exportaciones no conservan EXIF/GPS originales. La ruta de procesamiento es sRGB de 8 bits.
- La imagen de demostración es un recurso sintético incluido. Ninguna foto personal de la conversación se distribuye en el repositorio.
- Instalar dependencias, compilar, descargar herramientas o actualizar WebView requiere conexión. Eso es distinto del procesamiento local de fotos.

Esta versión no incluye procesamiento remoto. Añadirlo requeriría una opción explícita, información del destino y una política de eliminación de archivos.

Desde 0.2.0 se incluye el modelo RealESR general ×4 en recursos locales. Se carga automáticamente, sin descarga ni envío de fotos. La lectura de memoria e hilos en la ventana de requisitos ocurre localmente; no se transmite. Los modelos personalizados no se guardan entre sesiones.
