import { Capacitor } from '@capacitor/core';
import type { Format,SizeSettings } from './domain';
import { millimeters } from './domain';
export async function saveResult(bytes:ArrayBuffer,mime:string,name:string,format:Format,size:SizeSettings) {
  if(format==='pdf') {
    const {jsPDF}=await import('jspdf');
    const w=millimeters(size.width,size.unit,size.dpi),h=millimeters(size.height,size.unit,size.dpi);
    const pdf=new jsPDF({orientation:w>h?'landscape':'portrait',unit:'mm',format:[w,h],compress:true});
    pdf.setProperties({title:name,creator:'DpIA'});pdf.addImage(new Uint8Array(bytes),'PNG',0,0,w,h);bytes=pdf.output('arraybuffer');mime='application/pdf';
  }
  if('__TAURI_INTERNALS__' in window) {
    const [{save},{writeFile}]=await Promise.all([import('@tauri-apps/plugin-dialog'),import('@tauri-apps/plugin-fs')]);
    const path=await save({defaultPath:name,filters:[{name:format.toUpperCase(),extensions:[format]}]});
    if(!path)return false;await writeFile(path,new Uint8Array(bytes));return true;
  }
  const blob=new Blob([bytes],{type:mime});
  if(Capacitor.isNativePlatform()) {
    const [{Filesystem,Directory},{Share}]=await Promise.all([import('@capacitor/filesystem'),import('@capacitor/share')]);
    const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
    // Keep files long enough for the receiving app to read them after the share sheet closes.
    try { const list=await Filesystem.readdir({path:'exports',directory:Directory.Cache});for(const item of list.files)if(item.mtime&&Date.now()-item.mtime>86400000)await Filesystem.deleteFile({path:`exports/${item.name}`,directory:Directory.Cache}); } catch { /* First export or cache cleanup: nothing to remove. */ }
    const path=`exports/${Date.now()}-${name}`;
    const file=await Filesystem.writeFile({path,data:base64,directory:Directory.Cache,recursive:true});
    await Share.share({title:name,files:[file.uri],dialogTitle:'Guardar o compartir con…'});return true;
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);return true;
}
