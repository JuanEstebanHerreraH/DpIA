import {cp,mkdir,readdir,stat} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
const source=resolve('.'),destination=resolve(process.argv[2]||'../package/DpIA');
if(destination===source||destination.startsWith(source+sep))throw new Error('El destino del paquete debe quedar fuera del proyecto.');
const blocked=new Set(['node_modules','.git','.gradle','.idea','.local','dist','target','test-results','playwright-report','build']);
const include=(path)=>{const r=relative(source,path).replaceAll('\\','/');if(!r)return true;const parts=r.split('/');if(parts.some(p=>blocked.has(p)))return false;if(r.startsWith('public/runtime/')||r==='public/runtime'||r.startsWith('android/app/src/main/assets/public')||r.startsWith('android/capacitor-cordova-android-plugins')||r.startsWith('src-tauri/gen'))return false;if(/(^|\/)(local.properties|\.env[^/]*|Thumbs.db|\.DS_Store)$|\.(jks|keystore|log|tsbuildinfo|onnx.data)$/i.test(r))return false;if(r.endsWith('.onnx')&&!r.startsWith('tests/fixtures/')&&r!=='public/models/realesr-general-x4v3.onnx')return false;return true;};
await mkdir(destination,{recursive:true});await cp(source,destination,{recursive:true,filter:include});
console.log(`Código preparado en ${destination}`);
