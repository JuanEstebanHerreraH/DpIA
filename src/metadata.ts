function crc32(bytes:Uint8Array) { let crc=0xffffffff;for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0; }
export function pngDpi(input:Uint8Array,dpi:number) {
  const density=Math.round(dpi/0.0254),chunk=new Uint8Array(21),view=new DataView(chunk.buffer);
  view.setUint32(0,9);chunk.set([112,72,89,115],4);view.setUint32(8,density);view.setUint32(12,density);chunk[16]=1;view.setUint32(17,crc32(chunk.subarray(4,17)));
  const parts:Uint8Array[]=[input.subarray(0,8)];let offset=8;
  while(offset<input.length){const length=new DataView(input.buffer,input.byteOffset+offset,4).getUint32(0);const type=String.fromCharCode(...input.subarray(offset+4,offset+8));if(type!=='pHYs')parts.push(input.subarray(offset,offset+length+12));if(type==='IHDR')parts.push(chunk);offset+=length+12;}
  const result=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let p=0;for(const part of parts){result.set(part,p);p+=part.length;}return result;
}
export function jpegDpi(bytes:Uint8Array,dpi:number) {
  const density=Math.round(dpi);
  for(let p=2;p+18<bytes.length;){if(bytes[p]!==255)break;const marker=bytes[p+1];if(marker===218||marker===217)break;const length=(bytes[p+2]<<8)|bytes[p+3];if(length<2)break;
    if(marker===224&&String.fromCharCode(...bytes.subarray(p+4,p+9))==='JFIF\0'){bytes[p+11]=1;bytes[p+12]=density>>8;bytes[p+13]=density&255;bytes[p+14]=density>>8;bytes[p+15]=density&255;return bytes;}p+=2+length;}
  const app=new Uint8Array([255,224,0,16,74,70,73,70,0,1,1,1,density>>8,density&255,density>>8,density&255,0,0]);
  const result=new Uint8Array(bytes.length+app.length);result.set(bytes.subarray(0,2));result.set(app,2);result.set(bytes.subarray(2),20);return result;
}
