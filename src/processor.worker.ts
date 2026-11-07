/// <reference lib="webworker" />
import type { RenderRequest } from './engine';
import { placement } from './domain';
import { adjust } from './pixels';
import { pngDpi,jpegDpi } from './metadata';
import type { AiReport, InferenceProgress } from './ai';
const ctx=(canvas:OffscreenCanvas)=>canvas.getContext('2d',{willReadFrequently:true})!;
function compose(image:OffscreenCanvas,r:RenderRequest){
  const canvas=new OffscreenCanvas(r.width,r.height),c=ctx(canvas);
  const alpha=r.settings.transparent&&!['jpg','jfif','pdf'].includes(r.format||'');
  if(!alpha){c.fillStyle=r.settings.background;c.fillRect(0,0,r.width,r.height);}
  const margin=r.settings.margin*r.settings.dpi/25.4*(r.width/(r.settings.unit==='px'?r.settings.width:Math.round(r.settings.width*r.settings.dpi/(r.settings.unit==='mm'?25.4:r.settings.unit==='cm'?2.54:1))));
  const p=placement(image.width,image.height,r.width,r.height,r.settings.fit,margin);
  c.save();c.beginPath();c.rect(margin,margin,r.width-2*margin,r.height-2*margin);c.clip();
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,p.x,p.y,p.width,p.height);c.restore();return canvas;
}
self.onmessage=async(e:MessageEvent<RenderRequest>)=>{
  const r=e.data;
  let ai:AiReport|undefined;
  const progress=(p:InferenceProgress)=>self.postMessage({type:'progress',progress:p});
  try {
    const source=new OffscreenCanvas(r.bitmap.width,r.bitmap.height),sc=ctx(source);
    sc.drawImage(r.bitmap,0,0);r.bitmap.close();
    const data=sc.getImageData(0,0,source.width,source.height);
    adjust(data.data,data.width,data.height,r.adjustments);sc.putImageData(data,0,0);
    let image:OffscreenCanvas=source;
    if(r.model){progress({stage:'loading-model',completed:0,total:0,elapsedMs:0});const {upscale}=await import('./upscale');const result=await upscale(data,r.model,r.maxPixels,progress,r.modelId);image=result.canvas;ai=result.report;progress({stage:'composing',completed:ai.blocks,total:ai.blocks,elapsedMs:ai.elapsedMs});}
    const canvas=compose(image,r),c=ctx(canvas);
    if(!r.format){const bitmap=canvas.transferToImageBitmap(),reference=ai?compose(source,r).transferToImageBitmap():undefined;self.postMessage({bitmap,reference,ai},reference?[bitmap,reference]:[bitmap]);return;}
    if(ai)progress({stage:'encoding',completed:ai.blocks,total:ai.blocks,elapsedMs:ai.elapsedMs});
    let bytes:Uint8Array;let mime=`image/${r.format==='jpg'||r.format==='jfif'?'jpeg':r.format}`;
    if(r.format==='avif') {
      const {default:encode}=await import('@jsquash/avif/encode');
      bytes=new Uint8Array(await encode(c.getImageData(0,0,r.width,r.height),{quality:Math.round((r.quality??0.9)*100),speed:8}));
    } else {
      if(r.format==='pdf')mime='image/png';
      const blob=await canvas.convertToBlob({type:mime,quality:r.quality??0.92});
      if(blob.type!==mime)throw new Error('Este dispositivo no puede exportar ese formato. Prueba PNG o JPEG.');
      bytes=new Uint8Array(await blob.arrayBuffer());
      if(mime==='image/png')bytes=pngDpi(bytes,r.settings.dpi);
      if(mime==='image/jpeg')bytes=jpegDpi(bytes,r.settings.dpi);
    }
    self.postMessage({bytes:bytes.buffer,mime,ai},[bytes.buffer]);
  }catch(error){self.postMessage({error:error instanceof Error?error.message:String(error)});}finally{r.bitmap.close();}
};
