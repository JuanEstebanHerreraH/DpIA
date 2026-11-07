import * as ort from 'onnxruntime-web/wasm';
import { remainingTime } from './ai';
import type { AiReport, InferenceProgress } from './ai';
let cachedSession:ort.InferenceSession|null=null;
let cachedId='';
async function sessionFor(model:ArrayBuffer,id:string){
  if(id&&cachedSession&&cachedId===id)return cachedSession;
  if(cachedSession)await cachedSession.release();
  cachedSession=null;
  ort.env.wasm.numThreads=1;
  ort.env.wasm.wasmPaths=new URL('../runtime/',self.location.href).href;
  const session=await ort.InferenceSession.create(model,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  cachedSession=session;cachedId=id;return session;
}
/** Local restoration; the model session is reused for successive exports. */
export async function upscale(input:ImageData,model:ArrayBuffer,maxPixels=24_000_000,onProgress?:(p:InferenceProgress)=>void,modelId=''){
  const started=performance.now(),tile=64,pad=8,side=tile+2*pad,total=Math.ceil(input.width/tile)*Math.ceil(input.height/tile);
  onProgress?.({stage:'loading-model',completed:0,total,elapsedMs:0});
  const session=await sessionFor(model,modelId);
  if(session.inputNames.length!==1||session.outputNames.length!==1)throw new Error('El modelo debe tener una entrada RGB y una salida. Consulta los requisitos del modelo.');
  let canvas:OffscreenCanvas|undefined,context:OffscreenCanvasRenderingContext2D|undefined,scale=0,completed=0;
  const floats=new Float32Array(3*side*side),tensor=new ort.Tensor('float32',floats,[1,3,side,side]),computeStarted=performance.now();
  onProgress?.({stage:'upscaling',completed:0,total,elapsedMs:performance.now()-started});
  try{
    for(let y=0;y<input.height;y+=tile)for(let x=0;x<input.width;x+=tile){
      for(let ty=0;ty<side;ty++)for(let tx=0;tx<side;tx++){
        const sx=Math.max(0,Math.min(input.width-1,x+tx-pad)),sy=Math.max(0,Math.min(input.height-1,y+ty-pad)),si=(sy*input.width+sx)*4,di=ty*side+tx;
        for(let c=0;c<3;c++)floats[c*side*side+di]=input.data[si+c]/255;
      }
      const outputs=await session.run({[session.inputNames[0]]:tensor});
      try{
        const result=outputs[session.outputNames[0]],dims=result.dims,factor=Number(dims[2])/side;
        if(result.type!=='float32'||dims.length!==4||dims[0]!==1||dims[1]!==3||dims[2]!==dims[3]||![2,4].includes(factor)||(scale&&factor!==scale))throw new Error('Modelo incompatible: se requiere RGB float32 NCHW ×2 o ×4 y tamaño dinámico.');
        if(!canvas){scale=factor;if(input.width*input.height*scale*scale>maxPixels)throw new Error(`La IA superaría ${maxPixels/1e6} MP. Prepara una copia ligera o usa los ajustes clásicos.`);canvas=new OffscreenCanvas(input.width*scale,input.height*scale);context=canvas.getContext('2d')!;}
        const w=Math.min(tile,input.width-x)*scale,h=Math.min(tile,input.height-y)*scale,outSide=side*scale,data=new Uint8ClampedArray(w*h*4),values=result.data as Float32Array;
        for(let oy=0;oy<h;oy++)for(let ox=0;ox<w;ox++){const si=(oy+pad*scale)*outSide+ox+pad*scale,di=(oy*w+ox)*4;for(let c=0;c<3;c++)data[di+c]=Math.max(0,Math.min(255,Math.round(values[c*outSide*outSide+si]*255)));data[di+3]=input.data[((y+Math.floor(oy/scale))*input.width+x+Math.floor(ox/scale))*4+3];}
        context!.putImageData(new ImageData(data,w,h),x*scale,y*scale);
      }finally{for(const output of Object.values(outputs))output.dispose();}
      completed++;onProgress?.({stage:'upscaling',completed,total,elapsedMs:performance.now()-started,etaMs:remainingTime(completed,total,performance.now()-computeStarted)});
    }
    const report:AiReport={inputWidth:input.width,inputHeight:input.height,outputWidth:canvas!.width,outputHeight:canvas!.height,scale,blocks:total,elapsedMs:performance.now()-started,backend:'cpu'};
    return {canvas:canvas!,report};
  }finally{tensor.dispose();}
}
