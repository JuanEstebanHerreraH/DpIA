import { copyFile,mkdir,readdir,unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
const source=resolve('node_modules/onnxruntime-web/dist'),destination=resolve('public/runtime');
await mkdir(destination,{recursive:true});
for(const file of await readdir(destination))await unlink(resolve(destination,file));
for(const file of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs'])await copyFile(resolve(source,file),resolve(destination,file));
console.log('Runtime ONNX local preparado.');
