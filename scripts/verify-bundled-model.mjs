import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const bytes=await readFile('public/models/realesr-general-x4v3.onnx');
const hash=createHash('sha256').update(bytes).digest('hex');
if(hash!=='924ebad6532777303582d4ce7811849b88869231a3ae7093e0f21200249df8d5')throw new Error('El modelo incluido no coincide con su SHA-256 esperado.');
console.log('Modelo fotográfico incluido: SHA-256 verificado.');
