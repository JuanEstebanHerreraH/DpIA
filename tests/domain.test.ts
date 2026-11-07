import {describe,it,expect} from 'vitest';
import {defaultSize,dimensions,millimeters,pixels,placement,validateSize} from '../src/domain';
import {adjust} from '../src/pixels';
import {pngDpi,jpegDpi} from '../src/metadata';
describe('Medidas de impresión',()=>{
  it('calcula A4 a 300 ppp y cambia de orientación',()=>{expect(dimensions(defaultSize)).toEqual({width:2480,height:3508});expect(dimensions({...defaultSize,width:297,height:210})).toEqual({width:3508,height:2480});});
  it('convierte pulgadas y centímetros sin confundirlos con píxeles',()=>{expect(pixels(1,'in',300)).toBe(300);expect(pixels(2.54,'cm',300)).toBe(300);expect(millimeters(300,'px',300)).toBe(25.4);expect(pixels(1080,'px',72)).toBe(1080);});
  it('rechaza excesos de memoria, medidas vacías y márgenes imposibles',()=>{expect(validateSize({...defaultSize,width:841,height:1189})).toContain('límite');expect(validateSize({...defaultSize,width:NaN})).not.toBeNull();expect(validateSize({...defaultSize,margin:110})).toContain('márgenes');expect(validateSize(defaultSize,12_000_000)).toBeNull();});
  it('conserva proporciones al ajustar y recorta solo con cover',()=>{expect(placement(200,100,100,100,'contain')).toEqual({x:0,y:25,width:100,height:50,scale:.5});expect(placement(200,100,100,100,'cover')).toEqual({x:-50,y:0,width:200,height:100,scale:1});expect(placement(100,100,120,120,'contain',10)).toEqual({x:10,y:10,width:100,height:100,scale:1});});
});
describe('Fidelidad de píxeles y transparencia',()=>{
  it('los ajustes neutros conservan exactamente los valores',()=>{const input=new Uint8ClampedArray([19,60,124,0,255,0,30,128]);expect(adjust(input.slice(),2,1,{brightness:0,contrast:0,saturation:0,sharpen:0,denoise:0})).toEqual(input);});
  it('el suavizado y enfoque no cambian el alfa',()=>{const data=new Uint8ClampedArray([0,0,0,10,100,120,150,87,255,255,255,255]);const out=adjust(data,3,1,{brightness:3,contrast:2,saturation:4,sharpen:30,denoise:20});expect([out[3],out[7],out[11]]).toEqual([10,87,255]);});
});
describe('Metadatos de impresión',()=>{
  it('escribe pHYs en PNG después de IHDR',()=>{const input=new Uint8Array(45);input.set([137,80,78,71,13,10,26,10]);new DataView(input.buffer).setUint32(8,13);input.set([73,72,68,82],12);input.set([73,69,78,68],37);const out=pngDpi(input,300);expect(String.fromCharCode(...out.subarray(37,41))).toBe('pHYs');expect(new DataView(out.buffer).getUint32(41)).toBe(11811);expect(out[49]).toBe(1);});
  it('añade JFIF con densidad en pulgadas a un JPEG sin ella',()=>{const result=jpegDpi(new Uint8Array([255,216,255,217]),300);expect(result[13]).toBe(1);expect((result[14]<<8)|result[15]).toBe(300);expect(result.slice(-2)).toEqual(new Uint8Array([255,217]));});
});
