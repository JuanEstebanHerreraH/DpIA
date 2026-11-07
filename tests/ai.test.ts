import {describe,it,expect} from 'vitest';
import {aiInputLimit,aiSizeError,fittedInput,remainingTime,previewSide} from '../src/ai';
import {suggestedFilename,defaultSize} from '../src/domain';
describe('IA con presupuesto explícito',()=>{
  it('comprueba entrada ×4 antes de iniciar un cálculo excesivo',()=>{expect(aiInputLimit(12e6,4)).toBe(750000);expect(aiSizeError(1200,1200,12e6)).toContain('0.75 MP');expect(aiSizeError(1200,1200,24e6)).toBeNull();});
  it('prepara una copia proporcional dentro del presupuesto sin ampliarla',()=>{const copy=fittedInput(4000,3000,12e6);expect(copy.width*copy.height).toBeLessThanOrEqual(750000);expect(copy.width/copy.height).toBeCloseTo(4/3,2);expect(fittedInput(100,50,12e6)).toEqual({width:100,height:50});});
  it('no inventa una estimación antes de tener muestras de progreso',()=>{expect(remainingTime(0,10,100)).toBeUndefined();expect(remainingTime(1,10,200)).toBeUndefined();expect(remainingTime(2,10,1000)).toBe(4000);expect(remainingTime(10,10,4000)).toBeUndefined();});
  it('mantiene pequeña la entrada de vista rápida, separada de la exportación',()=>{expect(previewSide(true)).toBe(192);expect(previewSide(false)).toBe(320);});
  it('genera la extensión JFIF solicitada',()=>{expect(suggestedFilename('foto.jfif',defaultSize,'jfif')).toBe('foto-DpIA-a4.jfif');});
});
