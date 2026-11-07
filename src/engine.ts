import type { Adjustments, SizeSettings, Format } from './domain';
import type { AiReport, InferenceProgress } from './ai';
export interface RenderRequest { bitmap:ImageBitmap; adjustments:Adjustments; width:number; height:number; settings:SizeSettings; format?:Format; quality?:number; model?:ArrayBuffer; modelId?:string; maxPixels?:number; }
export interface RenderResult { bitmap?:ImageBitmap; reference?:ImageBitmap; bytes?:ArrayBuffer; mime?:string; ai?:AiReport; }
export function createProcessor() {
  let worker:Worker|null=null;
  let pending:{resolve:(r:RenderResult)=>void;reject:(e:Error)=>void;onProgress?:(p:InferenceProgress)=>void}|null=null;
  const start=()=>{
    worker=new Worker(new URL('./processor.worker.ts',import.meta.url),{type:'module'});
    worker.onmessage=(e)=>{if(!pending)return;if(e.data.type==='progress'){pending.onProgress?.(e.data.progress);return;}if(e.data.error)pending.reject(new Error(e.data.error));else pending.resolve(e.data);pending=null;};
    worker.onerror=(e)=>{pending?.reject(new Error(e.message||'No se pudo procesar la imagen.'));pending=null;};
  };
  return {
    run(request:RenderRequest,onProgress?:(p:InferenceProgress)=>void):Promise<RenderResult> { if(pending)return Promise.reject(new Error('Ya hay una imagen en proceso.'));if(!worker)start();return new Promise((resolve,reject)=>{pending={resolve,reject,onProgress};worker!.postMessage(request,[request.bitmap]);}); },
    cancel(){worker?.terminate();worker=null;pending?.reject(new Error('Proceso cancelado.'));pending=null;},
    dispose(){this.cancel();}
  };
}
