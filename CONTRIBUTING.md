# Contribuir

Consulta README.md y docs/COMPILACION.md para preparar el entorno. Haz cambios acotados, conserva el modo oscuro y comprueba tanto la vista de escritorio como la móvil.

Antes de proponer un cambio:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Incluye descripción del comportamiento, pasos para reproducirlo y capturas cuando cambie la interfaz. Para errores de exportación adjunta un archivo de prueba sin datos privados y dimensiones esperadas. No incluyas fotos personales, claves, contraseñas ni modelos cuya licencia no permita redistribución. Actualiza documentación y avisos de terceros al cambiar dependencias.
