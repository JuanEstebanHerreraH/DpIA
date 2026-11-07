# Compilar y distribuir

## Preparación común

Node.js 22+ (24 LTS recomendado), npm y conexión para descargar dependencias. Desde la raíz:

```powershell
npm ci
npm test
npm run build
```

Conserva los archivos lock. `prebuild` copia el runtime ONNX desde la dependencia instalada: no se descarga desde CDN durante el uso. Las imágenes y modelos seleccionados no se envían a servidores.

## Windows x64

Instala Visual Studio Build Tools con **Desktop development with C++**, Windows SDK y Rust estable con toolchain MSVC. El equipo de destino necesita WebView2. Node y Rust solo son necesarios para compilar.

```powershell
npm ci
npm run desktop:dev
npm run desktop:exe
npm run desktop:build
```

- EXE de aplicación: `src-tauri/target/release/dpia.exe`.
- Instalador: `src-tauri/target/release/bundle/nsis/DpIA_0.2.0_x64-setup.exe`.

Para distribuir se recomienda el instalador. El EXE por sí solo requiere que WebView2 ya esté instalado. El primer build descarga crates y herramientas NSIS; los siguientes reutilizan las cachés. Este proyecto no configura un certificado de firma comercial ni un actualizador automático.

`desktop:exe` compila sin empaquetado y produce un EXE que abre directamente. La entrega inicial incluye este archivo: el empaquetador NSIS falló en el entorno restringido de construcción con error Windows 623 al cargar makensis.exe. Eso no impidió compilar ni abrir DpIA. `bundle.useLocalToolsDir` guarda las herramientas de empaquetado dentro de `src-tauri/target/.tauri/`, sin exigir escribir en una caché global.

## Android

Requiere JDK 21 y Android SDK Platform 36. Android mínimo: API 30 / Android 11. Se requiere un WebView actualizado con soporte OffscreenCanvas y WebAssembly SIMD; cumplir solo la versión de Android no garantiza todos los códecs.

Ejemplo de variables en PowerShell; reemplaza la ruta del JDK por tu instalación:

```powershell
$env:JAVA_HOME = 'C:\ruta\a\jdk-21'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm ci
npm run android:debug
```

El script crea `android/local.properties` si no existe y hay una ruta de SDK en el entorno. Alternativamente, abre el proyecto con Android Studio para configurar su SDK. La clave debug se crea en `.local/debug.keystore` y no se incluye en Git. No debe usarse como identidad pública de una aplicación comercial.

APK instalable de desarrollo: `android/app/build/outputs/apk/debug/app-debug.apk`. Transfiérelo al teléfono y ábrelo; Android solicitará habilitar instalación desde la aplicación que recibe el archivo. También puedes instalarlo en un dispositivo de prueba conectado con `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.

Para actualizar una instalación debe conservarse la misma clave. Un APK generado con una clave debug diferente puede exigir desinstalar la compilación anterior. Para distribuir de forma estable, utiliza una clave release propia y conserva una copia segura fuera de Git.

```powershell
npm run android:release
npm run android:open
```

`android:release` produce `app-release-unsigned.apk`. En Android Studio usa **Build > Generate Signed App Bundle / APK** para firmarlo con tu clave o generar un AAB para una tienda. Los archivos de contraseña, certificados y keystores nunca deben ir en el ZIP público. Incrementa `versionCode` para cada publicación y sincroniza las versiones de package.json, Tauri y Android.

## GitHub Actions

Los flujos incluidos validan el motor y generan instaladores de Windows y APK debug como artefactos descargables. No publican automáticamente en tiendas ni crean Releases públicas. La firma release y los certificados de Windows son responsabilidad del mantenedor; se configurarían mediante secretos del repositorio.

## iPhone

No se incluye un proyecto iOS ni un IPA. Añadir iOS requeriría macOS, Xcode, configuración de Capacitor, el manifiesto de privacidad correspondiente y firma de Apple. Un APK Android no se instala en iPhone.
