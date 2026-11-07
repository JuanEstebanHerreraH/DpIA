import type { Adjustments } from './domain';
const clamp=(v:number)=>Math.min(255,Math.max(0,v));
/** Separable 3×3 box blur. O(n), no pixels are read outside the image. */
export function blur3(data:Uint8ClampedArray,w:number,h:number) {
  const temp=new Uint8ClampedArray(data.length),out=new Uint8ClampedArray(data.length);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const i=(y*w+x)*4,l=(y*w+Math.max(0,x-1))*4,r=(y*w+Math.min(w-1,x+1))*4;
    for(let c=0;c<3;c++)temp[i+c]=(data[l+c]+data[i+c]+data[r+c])/3;
    temp[i+3]=data[i+3];
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const i=(y*w+x)*4,t=(Math.max(0,y-1)*w+x)*4,b=(Math.min(h-1,y+1)*w+x)*4;
    for(let c=0;c<3;c++)out[i+c]=(temp[t+c]+temp[i+c]+temp[b+c])/3;
    out[i+3]=data[i+3];
  }
  return out;
}
export function adjust(data:Uint8ClampedArray,w:number,h:number,a:Adjustments) {
  const contrast=1+a.contrast/100, saturation=1+a.saturation/100,exposure=2**(a.brightness/100);
  for(let i=0;i<data.length;i+=4) {
    const r=data[i],g=data[i+1],b=data[i+2],luma=0.2126*r+0.7152*g+0.0722*b;
    data[i]=clamp(((luma+(r-luma)*saturation)*exposure-128)*contrast+128);
    data[i+1]=clamp(((luma+(g-luma)*saturation)*exposure-128)*contrast+128);
    data[i+2]=clamp(((luma+(b-luma)*saturation)*exposure-128)*contrast+128);
  }
  if(a.denoise>0) {
    const blurred=blur3(data,w,h),amount=a.denoise/100*0.65;
    for(let i=0;i<data.length;i++)if(i%4!==3)data[i]=data[i]*(1-amount)+blurred[i]*amount;
  }
  if(a.sharpen>0) {
    const blurred=blur3(data,w,h),amount=a.sharpen/100*1.4;
    for(let i=0;i<data.length;i++)if(i%4!==3)data[i]=clamp(data[i]+amount*(data[i]-blurred[i]));
  }
  return data;
}
