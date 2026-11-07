export type Unit = 'mm' | 'cm' | 'in' | 'px';
export type Format = 'png' | 'jpg' | 'jfif' | 'webp' | 'avif' | 'pdf';
export type Fit = 'contain' | 'cover';
export interface Adjustments { brightness: number; contrast: number; saturation: number; sharpen: number; denoise: number }
export const neutral: Adjustments = { brightness: 0, contrast: 0, saturation: 0, sharpen: 0, denoise: 0 };
export interface SizeSettings { preset: string; width: number; height: number; unit: Unit; dpi: number; margin: number; fit: Fit; background: string; transparent: boolean }
export interface Preset { id: string; label: string; width: number; height: number; unit: Unit; group: string }
export const presets: Preset[] = [
  ...[[841,1189],[594,841],[420,594],[297,420],[210,297],[148,210],[105,148]].map(([width,height],i) => ({ id: `a${i}`, label: `A${i}`, width, height, unit:'mm' as Unit, group:'Papel ISO' })),
  ...[['carta','Carta',215.9,279.4],['legal','Legal',215.9,355.6],['tabloide','Tabloide',279.4,431.8]].map(([id,label,width,height])=>({id:String(id),label:String(label),width:Number(width),height:Number(height),unit:'mm' as Unit,group:'Papel americano'})),
  ...[[100,150],[130,180],[200,300]].map(([width,height])=>({id:`foto${width}`,label:`${width/10} × ${height/10} cm`,width,height,unit:'mm' as Unit,group:'Fotografía'})),
  ...[['hd','HD',1280,720],['fhd','Full HD',1920,1080],['4k','4K UHD',3840,2160],['square','Cuadrado',1080,1080],['vertical','Vertical',1080,1920]].map(([id,label,width,height])=>({id:String(id),label:String(label),width:Number(width),height:Number(height),unit:'px' as Unit,group:'Pantalla'}))
];
export const defaultSize: SizeSettings = { preset:'a4',width:210,height:297,unit:'mm',dpi:300,margin:0,fit:'contain',background:'#ffffff',transparent:false };
export function pixels(value: number, unit: Unit, dpi: number): number { return Math.round(unit==='px'?value:value*dpi/(unit==='mm'?25.4:unit==='cm'?2.54:1)); }
export function millimeters(value: number, unit: Unit, dpi: number): number { return unit==='mm'?value:unit==='cm'?value*10:unit==='in'?value*25.4:value/dpi*25.4; }
export function dimensions(s: SizeSettings) { return { width:pixels(s.width,s.unit,s.dpi),height:pixels(s.height,s.unit,s.dpi) }; }
export function validateSize(s:SizeSettings, maxPixels=24_000_000): string | null {
  if (![s.width,s.height,s.dpi,s.margin].every(Number.isFinite)||s.width<=0||s.height<=0||s.dpi<36||s.dpi>1200||s.margin<0) return 'Revisa las medidas. Usa valores positivos y entre 36 y 1200 ppp.';
  const {width,height}=dimensions(s);
  if (width<1||height<1||width>16384||height>16384||width*height>maxPixels) return `La salida supera el límite de ${maxPixels/1e6} megapíxeles. Reduce el tamaño o los ppp.`;
  const marginPx=s.margin*s.dpi/25.4;
  if (marginPx*2>=Math.min(width,height)) return 'Los márgenes ocupan toda la página. Reduce su medida.';
  return null;
}
export function placement(sw:number,sh:number,tw:number,th:number,fit:Fit,margin=0) {
  const availableW=tw-2*margin,availableH=th-2*margin;
  const ratio=(fit==='contain'?Math.min:Math.max)(availableW/sw,availableH/sh);
  const width=sw*ratio,height=sh*ratio;
  return { x:(tw-width)/2,y:(th-height)/2,width,height,scale:ratio };
}
export function suggestedFilename(name:string,s:SizeSettings,format:Format) {
  const stem=name.replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N}._-]/gu,'-').slice(0,70)||'imagen';
  return `${stem}-DpIA-${s.preset==='custom'?'personalizado':s.preset}.${format}`;
}
