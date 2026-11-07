import {test,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.getByText('Paisaje-de-muestra.jpg',{exact:true})).toBeVisible();await expect(page.getByText('Preparando vista previa',{exact:true})).toBeHidden({timeout:20000});});
test('desktop screenshot, classic enhancement and A4 PDF',async({page})=>{
  await page.getByRole('button',{name:'Mejora suave',exact:true}).click();await page.getByRole('button',{name:'Comparar',exact:true}).click();
  await expect(page.getByText('Preparando vista previa',{exact:true})).toBeHidden();
  await mkdir('docs/images',{recursive:true});await page.screenshot({path:'docs/images/dpia-desktop.png',fullPage:true});
  await page.getByRole('tab',{name:'Tamaño',exact:true}).click();await page.getByLabel('Formato de tamaño').selectOption('a4');
  await page.getByRole('button',{name:'PDF',exact:true}).click();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar imagen',exact:true}).click();const file=await download;
  const bytes=await readFile((await file.path())!);expect(bytes.subarray(0,5).toString()).toBe('%PDF-');const match=bytes.toString('latin1').match(/\/MediaBox\s*\[([\d.\s]+)\]/);expect(match).not.toBeNull();const box=match![1].trim().split(/\s+/).map(Number);expect(box[2]).toBeCloseTo(595.28,1);expect(box[3]).toBeCloseTo(841.89,1);
});
test('exports genuine PNG, JPEG, JFIF, WebP and AVIF with correct dimensions',async({page})=>{
  await page.getByRole('tab',{name:'Tamaño',exact:true}).click();await page.getByLabel('Ancho',{exact:true}).fill('240');await page.getByLabel('Alto',{exact:true}).fill('180');
  for(const [name,mime] of [['PNG','image/png'],['JPEG','image/jpeg'],['JFIF','image/jpeg'],['WEBP','image/webp'],['AVIF','image/avif']]){
    await page.getByRole('button',{name,exact:true}).click();const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar imagen',exact:true}).click();const download=await promise,bytes=await readFile((await download.path())!);
    const size=await page.evaluate(async({data,mime})=>{const b=await createImageBitmap(new Blob([new Uint8Array(data)],{type:mime}));const r=[b.width,b.height];b.close();return r;},{data:[...bytes],mime});expect(size).toEqual([240,180]);
    if(name==='PNG')expect(bytes.includes(Buffer.from('pHYs'))).toBeTruthy();if(name==='AVIF')expect(bytes.subarray(4,12).toString()).toContain('ftypavif');
    if(name==='JFIF'){expect(download.suggestedFilename()).toMatch(/\.jfif$/);expect(bytes.subarray(0,4)).toEqual(Buffer.from([255,216,255,224]));expect(bytes.subarray(6,11).toString()).toBe('JFIF\0');expect(bytes.readUInt16BE(14)).toBe(300);await page.locator('input[type=file]').first().setInputFiles({name:'importada.jfif',mimeType:'image/jpeg',buffer:bytes});await expect(page.getByText('importada.jfif',{exact:true})).toBeVisible();}
  }
});
test('included model is ready after reopening and hardware requirements are a dedicated dialog',async({page})=>{
  await page.getByRole('tab',{name:'IA',exact:true}).click();await expect(page.locator('.model-loaded')).toContainText('RealESR general ×4');await expect(page.getByLabel('Aplicar IA al exportar')).toBeEnabled();
  await expect(page.getByText('No necesita un prompt:',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Ver hardware y requisitos del modelo',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Hardware y requisitos de IA'});await expect(dialog).toBeVisible();await expect(dialog.getByText('6 GB o más; IA no garantizada con 4 GB',{exact:true})).toBeVisible();await expect(dialog.getByText('16 GB y SSD',{exact:true})).toBeVisible();await expect(dialog.getByText('CPU, un hilo de cálculo',{exact:true})).toBeVisible();await expect(dialog.getByText('Bienvenido a DpIA.',{exact:true})).toHaveCount(0);
  await page.screenshot({path:'docs/images/dpia-hardware.png',fullPage:true});await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
  await page.reload();await page.getByRole('tab',{name:'IA',exact:true}).click();await expect(page.locator('.model-loaded')).toContainText('RealESR general ×4');await expect(page.getByLabel('Aplicar IA al exportar')).toBeEnabled();
});
test('real included photo model runs without importing a file and offers a fair comparison',async({page})=>{
  const base64=await page.evaluate(async()=>{const image=await createImageBitmap(await (await fetch('demo.jpg')).blob());const c=document.createElement('canvas');c.width=160;c.height=120;c.getContext('2d')!.drawImage(image,0,0,160,120);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('input[type=file]').first().setInputFiles({name:'paisaje-pequeno.png',mimeType:'image/png',buffer:Buffer.from(base64,'base64')});await expect(page.getByText('paisaje-pequeno.png',{exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'Tamaño',exact:true}).click();await page.getByLabel('Ancho',{exact:true}).fill('640');await page.getByLabel('Alto',{exact:true}).fill('480');
  await page.getByRole('tab',{name:'IA',exact:true}).click();await page.getByLabel('Aplicar IA al exportar').check();await page.getByRole('button',{name:'Comparar sin IA / con IA',exact:true}).click();await expect(page.locator('.inference-progress')).toBeVisible();await expect(page.getByRole('progressbar',{name:'Progreso de IA'})).toBeVisible({timeout:30000});
  await expect(page.locator('.inference-progress p')).toContainText('Faltan aprox.',{timeout:30000});
  await expect(page.locator('.ai-report')).toContainText('Reconstrucción: 640 × 480 (×4)',{timeout:90000});await expect(page.locator('.inference-progress')).toBeHidden();await expect(page.getByText('Sin IA',{exact:true})).toBeVisible();await expect(page.getByText('Con IA',{exact:true})).toBeVisible();
  const difference=await page.locator('canvas').evaluateAll((nodes)=>{const a=nodes[0] as HTMLCanvasElement,b=nodes[1] as HTMLCanvasElement;const ap=a.getContext('2d')!.getImageData(0,0,a.width,a.height).data,bp=b.getContext('2d')!.getImageData(0,0,b.width,b.height).data;let delta=0;for(let i=0;i<ap.length;i++)if(i%4!==3)delta+=Math.abs(ap[i]-bp[i]);return delta/(a.width*a.height*3);});expect(difference).toBeGreaterThan(.2);
  await page.getByRole('button',{name:'Comparar sin IA / con IA',exact:true}).click();await expect(page.locator('.ai-report')).toContainText('Reconstrucción: 640 × 480 (×4)');await expect(page.getByText('Con IA',{exact:true})).toBeVisible();await expect(page.locator('.inference-progress')).toBeHidden();
  await page.screenshot({path:'docs/images/dpia-ai.png',fullPage:true});
});
test('AI preview can be canceled and classic export remains available',async({page})=>{
  await page.getByRole('tab',{name:'IA',exact:true}).click();await page.getByLabel('Aplicar IA al exportar').check();await page.getByRole('button',{name:'Comparar sin IA / con IA',exact:true}).click();await expect(page.locator('.inference-progress')).toBeVisible();await page.getByRole('button',{name:'Cancelar vista de IA',exact:true}).click();await expect(page.locator('.inference-progress')).toBeHidden();await expect(page.getByText('Preparando vista previa',{exact:true})).toBeHidden();await page.getByLabel('Aplicar IA al exportar').uncheck();await expect(page.getByRole('button',{name:'Exportar imagen',exact:true})).toBeEnabled();
});
test('optional local ONNX really runs through the worker',async({page})=>{
  const buffer=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=16;c.height=12;const x=c.getContext('2d')!;x.fillStyle='#ff0000';x.fillRect(0,0,8,12);x.fillStyle='#00ff00';x.fillRect(8,0,8,12);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('input[type=file]').first().setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(buffer,'base64')});await expect(page.getByText('test.png',{exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'IA',exact:true}).click();await page.locator('input[accept=".onnx"]').setInputFiles(resolve('tests/fixtures/nearest-x2.onnx'));
  await page.getByRole('tab',{name:'Tamaño',exact:true}).click();await page.getByLabel('Ancho',{exact:true}).fill('32');await page.getByLabel('Alto',{exact:true}).fill('24');
  const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar imagen',exact:true}).click();const download=await promise,bytes=await readFile((await download.path())!);
  const values=await page.evaluate(async data=>{const b=await createImageBitmap(new Blob([new Uint8Array(data)],{type:'image/png'}));const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d')!;x.drawImage(b,0,0);return {width:b.width,height:b.height,left:[...x.getImageData(2,2,1,1).data],right:[...x.getImageData(28,2,1,1).data]};},[...bytes]);
  expect(values).toEqual({width:32,height:24,left:[255,0,0,255],right:[0,255,0,255]});
});
test('phone layout and memory limit',async({page})=>{
  await page.setViewportSize({width:390,height:844});await expect(page.getByRole('button',{name:'Exportar imagen',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:'docs/images/dpia-mobile.png',fullPage:true});
  await page.getByRole('tab',{name:'Tamaño',exact:true}).click();await page.getByLabel('Formato de tamaño').selectOption('a0');await expect(page.getByRole('button',{name:'Exportar imagen',exact:true})).toBeDisabled();await expect(page.getByText(/La salida supera el límite/)).toBeVisible();
});
