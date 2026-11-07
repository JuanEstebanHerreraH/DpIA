import { useEffect,useRef,useState } from 'react';
import type { ChangeEvent,CSSProperties,DragEvent } from 'react';
import { ArrowDownToLine,ArrowUpRight,Check,ChevronDown,ChevronsLeftRight,CloudOff,Expand,FileImage,FolderOpen,ImagePlus,Info,LoaderCircle,LockKeyhole,Maximize2,RotateCcw,Settings2,ShieldCheck,SlidersHorizontal,Sparkles,Upload,X } from 'lucide-react';
import type { Adjustments,Format,SizeSettings,Unit } from './domain';
import { defaultSize,dimensions,millimeters,neutral,placement,presets,suggestedFilename,validateSize } from './domain';
import { createProcessor } from './engine';
import { saveResult } from './save';
import { Capacitor } from '@capacitor/core';
import AiPanel from './AiPanel';
import Dialog from './Dialog';
import ModelRequirements from './ModelRequirements';
import ProgressView from './ProgressView';
import { aiSizeError,bundledModel,duration,fittedInput,previewSide } from './ai';
import type { AiReport,InferenceProgress } from './ai';

interface Photo {file:File; width:number;height:number;demo:boolean}
type Tab='adjust'|'size'|'ai';
function Range({label,value,onChange,min=-50,max=50,suffix=''}:{label:string;value:number;onChange:(n:number)=>void;min?:number;max?:number;suffix?:string}) {
  return <label className="range-field"><span>{label}<b>{value>0&&min<0?'+':''}{value}{suffix}</b></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
function App(){
  const [photo,setPhoto]=useState<Photo|null>(null),[tab,setTab]=useState<Tab>('adjust');
  const [adjustments,setAdjustments]=useState<Adjustments>({...neutral}),[size,setSize]=useState<SizeSettings>({...defaultSize,preset:'original',width:1200,height:900,unit:'px'});
  const [format,setFormat]=useState<Format>('png'),[quality,setQuality]=useState(92),[comparison,setComparison]=useState(false),[split,setSplit]=useState(50);
  const [previewBusy,setPreviewBusy]=useState(false),[exportBusy,setExportBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState(''),[help,setHelp]=useState(false),[dragging,setDragging]=useState(false);
  const [model,setModel]=useState<ArrayBuffer|null>(null),[modelName,setModelName]=useState(''),[useAI,setUseAI]=useState(false),[aiPreview,setAiPreview]=useState(false);
  const [modelIncluded,setModelIncluded]=useState(true),[modelLoading,setModelLoading]=useState(true),[requirements,setRequirements]=useState(false),[modelId,setModelId]=useState(bundledModel.id);
  const [previewProgress,setPreviewProgress]=useState<InferenceProgress|null>(null),[exportProgress,setExportProgress]=useState<InferenceProgress|null>(null);
  const [previewReport,setPreviewReport]=useState<AiReport|null>(null),[exportReport,setExportReport]=useState<AiReport|null>(null);
  const fileInput=useRef<HTMLInputElement>(null),modelInput=useRef<HTMLInputElement>(null),after=useRef<HTMLCanvasElement>(null),before=useRef<HTMLCanvasElement>(null);
  const previewProcessor=useRef(createProcessor()),exportProcessor=useRef(createProcessor()),loadId=useRef(0);
  const modelLoadId=useRef(0);
  const mobile=Capacitor.isNativePlatform()||window.matchMedia('(pointer: coarse)').matches,maxPixels=mobile?12_000_000:24_000_000;
  const output=dimensions(size),sizeError=validateSize(size,maxPixels),busy=exportBusy;
  const aiError=useAI&&modelIncluded&&photo?aiSizeError(photo.width,photo.height,maxPixels):null;
  const showAi=aiPreview&&!!previewReport;
  const patchSize=(patch:Partial<SizeSettings>)=>setSize(s=>({...s,...patch}));
  const patchAdjustment=(key:keyof Adjustments,value:number)=>{setAiPreview(false);setPreviewReport(null);setExportReport(null);setAdjustments(a=>({...a,[key]:value}));};

  async function loadIncludedModel(){
    const id=++modelLoadId.current;setModelLoading(true);
    try{const response=await fetch(`${import.meta.env.BASE_URL}${bundledModel.file}`);if(!response.ok)throw new Error('No se encontró el modelo incluido. Reinstala esta versión de DpIA.');const bytes=await response.arrayBuffer();if(bytes.byteLength!==4866396)throw new Error('El modelo incluido está incompleto. Reinstala DpIA.');if(id!==modelLoadId.current)return;setModel(bytes);setModelName(bundledModel.name);setModelId(bundledModel.id);setModelIncluded(true);setAiPreview(false);setPreviewReport(null);setExportReport(null);}catch(e){if(id===modelLoadId.current)setError(e instanceof Error?e.message:'No se pudo cargar el modelo incluido.');}finally{if(id===modelLoadId.current)setModelLoading(false);}
  }
  useEffect(()=>{void loadIncludedModel();return()=>{modelLoadId.current++;};},[]);

  async function loadFile(file:File,demo=false){
    const id=++loadId.current;setError('');setNotice('');
    try {
      if(file.size>40*1024*1024)throw new Error('El archivo supera 40 MB. Usa una copia más pequeña.');
      if(!/\.(jpe?g|jfif|png|webp|avif)$/i.test(file.name))throw new Error('Abre una fotografía JPEG, JFIF, PNG, WebP o AVIF.');
      const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
      const width=bitmap.width,height=bitmap.height;bitmap.close();
      if(id!==loadId.current)return;
      if(width*height>(mobile?20:40)*1e6)throw new Error(`La entrada supera ${mobile?20:40} MP. Reduce su resolución antes de abrirla.`);
      setPhoto({file,width,height,demo});setSize({...defaultSize,preset:'original',width,height,unit:'px'});setAdjustments({...neutral});setAiPreview(false);setComparison(false);
      setPreviewReport(null);setExportReport(null);
      if(width*height>maxPixels)setNotice('La foto se abrió. Elige un tamaño de salida menor para exportar.');
    }catch(e){setError(e instanceof Error?e.message:'No se pudo abrir la foto. Comprueba su formato.');}
  }
  async function demo(){try{const r=await fetch(`${import.meta.env.BASE_URL}demo.jpg`);if(!r.ok)throw new Error();await loadFile(new File([await r.blob()],'Paisaje-de-muestra.jpg',{type:'image/jpeg'}),true);}catch{setError('No se pudo cargar la muestra. Puedes abrir una foto desde tu equipo.');}}
  useEffect(()=>{void demo();return()=>{previewProcessor.current.dispose();exportProcessor.current.dispose();};},[]);
  useEffect(()=>{
    if(!photo||sizeError){setPreviewBusy(false);return;}
    let alive=true;
    setPreviewBusy(true);setError('');setPreviewProgress(null);setPreviewReport(null);
    const timer=setTimeout(async()=>{
      try{
        const ratio=Math.min(1,1100/Math.max(output.width,output.height)),pw=Math.max(1,Math.round(output.width*ratio)),ph=Math.max(1,Math.round(output.height*ratio));
        const sourceScale=Math.min(1,(aiPreview&&useAI?previewSide(mobile):1400)/Math.max(photo.width,photo.height));
        const bitmap=await createImageBitmap(photo.file,{resizeWidth:Math.round(photo.width*sourceScale),resizeHeight:Math.round(photo.height*sourceScale),resizeQuality:'high'});
        if(!alive){bitmap.close();return;}
        if(before.current){const c=before.current;c.width=pw;c.height=ph;const cx=c.getContext('2d')!;cx.clearRect(0,0,pw,ph);if(!size.transparent){cx.fillStyle=size.background;cx.fillRect(0,0,pw,ph);}const margin=size.margin*size.dpi/25.4*ratio,p=placement(bitmap.width,bitmap.height,pw,ph,size.fit,margin);cx.save();cx.beginPath();cx.rect(margin,margin,pw-2*margin,ph-2*margin);cx.clip();cx.drawImage(bitmap,p.x,p.y,p.width,p.height);cx.restore();}
        const result=await previewProcessor.current.run({bitmap,adjustments,width:pw,height:ph,settings:size,maxPixels,modelId,model:aiPreview&&useAI&&model?model:undefined},p=>{if(alive)setPreviewProgress(p);});
        if(result.bitmap){if(alive&&after.current){after.current.width=pw;after.current.height=ph;after.current.getContext('2d')!.drawImage(result.bitmap,0,0);}result.bitmap.close();}
        if(result.reference){if(alive&&before.current){before.current.width=pw;before.current.height=ph;before.current.getContext('2d')!.drawImage(result.reference,0,0);}result.reference.close();}
        if(alive&&result.ai){setPreviewReport(result.ai);setComparison(true);}
      }catch(e){if(alive)setError(e instanceof Error?e.message:'Error al generar la vista previa.');}finally{if(alive)setPreviewBusy(false);}
    },180);
    return()=>{alive=false;clearTimeout(timer);previewProcessor.current.cancel();};
  },[photo,adjustments,size,aiPreview,useAI,model,modelId,sizeError]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),7000);return()=>clearTimeout(t);},[notice]);

  function choosePreset(id:string){
    setAiPreview(false);
    if(id==='original'&&photo){patchSize({preset:id,width:photo.width,height:photo.height,unit:'px',margin:0});return;}
    const p=presets.find(p=>p.id===id);if(p)patchSize({preset:id,width:p.width,height:p.height,unit:p.unit});else patchSize({preset:'custom'});
  }
  async function pickModel(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;try{if(!f.name.toLowerCase().endsWith('.onnx')||f.size>160*1024*1024)throw new Error('Selecciona un modelo .onnx de hasta 160 MB.');modelLoadId.current++;setModel(await f.arrayBuffer());setModelName(f.name);setModelId(`${f.name}-${Date.now()}`);setModelIncluded(false);setModelLoading(false);setUseAI(true);setAiPreview(false);setPreviewReport(null);setExportReport(null);setNotice('Modelo personalizado cargado. Prueba la vista previa antes de exportar.');}catch(err){setError(String(err));}finally{e.target.value='';}}
  async function prepareAiCopy(){
    if(!photo)return;
    try{const allowed=fittedInput(photo.width,photo.height,maxPixels),ratio=Math.min(1,(mobile?480:640)/Math.max(allowed.width,allowed.height));const width=Math.max(1,Math.floor(allowed.width*ratio)),height=Math.max(1,Math.floor(allowed.height*ratio));const bitmap=await createImageBitmap(photo.file,{resizeWidth:width,resizeHeight:height,resizeQuality:'high'});const canvas=new OffscreenCanvas(width,height);canvas.getContext('2d')!.drawImage(bitmap,0,0);bitmap.close();const blob=await canvas.convertToBlob({type:'image/png'});await loadFile(new File([blob],`${photo.file.name.replace(/\.[^.]+$/,'')}-copia-IA.png`,{type:'image/png'}));setTab('ai');setNotice(`Copia ligera de ${width} × ${height} creada. El archivo original no se ha modificado.`);}catch(e){setError(e instanceof Error?e.message:'No se pudo preparar la copia.');}
  }
  async function exportPhoto(){
    if(!photo||busy)return;if(sizeError){setError(sizeError);return;}if(aiError){setError(aiError);setTab('ai');return;}if(useAI&&!model){setError('Espera a que termine de cargar el modelo incluido.');setTab('ai');return;}
    setExportBusy(true);setError('');setExportProgress(null);
    try{
      const bitmap=await createImageBitmap(photo.file);
      const result=await exportProcessor.current.run({bitmap,adjustments,width:output.width,height:output.height,settings:size,maxPixels,format,quality:quality/100,modelId,model:useAI&&model?model:undefined},setExportProgress);
      if(!result.bytes||!result.mime)throw new Error('No se generó el archivo.');
      setExportReport(result.ai||null);
      const saved=await saveResult(result.bytes,result.mime,suggestedFilename(photo.file.name,size,format),format,size);
      if(saved)setNotice(Capacitor.isNativePlatform()?'Se abrió el menú para guardar o compartir.':'Tu imagen está lista. Se exportó una copia.');
    }catch(e){setError(e instanceof Error?e.message:'No se pudo exportar. Prueba una resolución menor.');}finally{setExportBusy(false);}
  }
  function onDrop(e:DragEvent){e.preventDefault();setDragging(false);if(!busy&&e.dataTransfer.files[0])void loadFile(e.dataTransfer.files[0]);}
  const physicalW=millimeters(size.width,size.unit,size.dpi),physicalH=millimeters(size.height,size.unit,size.dpi);

  return <div className="app-shell">
    <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,.jfif" onChange={e=>{const f=e.target.files?.[0];if(f)void loadFile(f);e.target.value='';}}/>
    <input ref={modelInput} className="sr-only" type="file" accept=".onnx" onChange={pickModel}/>
    <header className="topbar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setHelp(true);}} aria-label="Acerca de DpIA"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt=""/><span>Dp<span className="brand-ai">IA</span><small>PHOTO STUDIO</small></span></a><div className="top-divider"/><span className="workspace-title">Tu espacio creativo <span className="version">v0.2</span></span><span className="private-pill"><span/> Todo queda en tu equipo</span><button className="icon-button help-button" onClick={()=>setHelp(true)} aria-label="Ayuda y privacidad"><Info size={18}/></button><button className="button open-top" disabled={busy} onClick={()=>fileInput.current?.click()}><ImagePlus size={16}/> Abrir imagen</button></header>
    <main className="studio">
      <aside className="controls"><div className="panel-heading"><span className="eyebrow">EL TOQUE JUSTO</span><h1>Tu imagen, mejor.</h1><p>Más claridad. La misma historia.</p></div>
        <div className="tabs" role="tablist" aria-label="Herramientas"><button role="tab" aria-selected={tab==='adjust'} className={tab==='adjust'?'active':''} onClick={()=>setTab('adjust')}><SlidersHorizontal size={16}/>Ajustes</button><button role="tab" aria-selected={tab==='size'} className={tab==='size'?'active':''} onClick={()=>setTab('size')}><Expand size={16}/>Tamaño</button><button role="tab" aria-selected={tab==='ai'} className={tab==='ai'?'active':''} onClick={()=>setTab('ai')}><Sparkles size={16}/>IA</button></div>
        <fieldset disabled={busy} className="control-fieldset">
        {tab==='adjust'&&<section className="adjust-panel"><div className="section-label"><h2>Ajustes de imagen</h2><button className="text-button" onClick={()=>{setAdjustments({...neutral});setAiPreview(false);}}><RotateCcw size={13}/>Restablecer</button></div><Range label="Exposición" value={adjustments.brightness} onChange={v=>patchAdjustment('brightness',v)}/><Range label="Contraste" value={adjustments.contrast} onChange={v=>patchAdjustment('contrast',v)}/><Range label="Saturación" value={adjustments.saturation} onChange={v=>patchAdjustment('saturation',v)}/><div className="line"/><div className="section-label"><h2>Recupera claridad</h2><span className="tiny-tag">CLÁSICO</span></div><Range label="Nitidez" value={adjustments.sharpen} min={0} max={100} onChange={v=>patchAdjustment('sharpen',v)}/><Range label="Suavizar ruido" value={adjustments.denoise} min={0} max={100} onChange={v=>patchAdjustment('denoise',v)}/><button className="subtle-button enhance-button" disabled={!photo} onClick={()=>{setAdjustments({brightness:4,contrast:5,saturation:3,sharpen:22,denoise:8});setAiPreview(false);}}><Settings2 size={16}/>Mejora suave</button><p className="small-note">Ajustes moderados, sin redibujar el contenido. El original siempre se conserva.</p></section>}
        {tab==='size'&&<section className="size-panel"><div className="section-label"><h2>Destino de tu imagen</h2><Maximize2 size={15}/></div><label className="field">Formato de tamaño<select value={size.preset} onChange={e=>choosePreset(e.target.value)}><option value="original">Tamaño original</option>{['Papel ISO','Papel americano','Fotografía','Pantalla'].map(group=><optgroup label={group} key={group}>{presets.filter(p=>p.group===group).map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>)}<option value="custom">Personalizado</option></select></label><div className="two-fields"><label className="field">Ancho<input aria-label="Ancho" type="number" min="1" value={size.width} onChange={e=>patchSize({width:Number(e.target.value),preset:'custom'})}/></label><label className="field">Alto<input aria-label="Alto" type="number" min="1" value={size.height} onChange={e=>patchSize({height:Number(e.target.value),preset:'custom'})}/></label></div><div className="two-fields"><label className="field">Unidad<select aria-label="Unidad" value={size.unit} onChange={e=>{const unit=e.target.value as Unit;const convert=(value:number)=>{const mm=millimeters(value,size.unit,size.dpi);return Math.round((unit==='mm'?mm:unit==='cm'?mm/10:unit==='in'?mm/25.4:mm*size.dpi/25.4)*100)/100;};patchSize({width:convert(size.width),height:convert(size.height),unit,preset:'custom'});}}>{[['mm','Milímetros'],['cm','Centímetros'],['in','Pulgadas'],['px','Píxeles']].map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><label className="field">Resolución (ppp)<input aria-label="Resolución (ppp)" type="number" min="36" max="1200" value={size.dpi} onChange={e=>patchSize({dpi:Number(e.target.value)})}/></label></div><button className="subtle-button" onClick={()=>patchSize({width:size.height,height:size.width})}><ChevronsLeftRight size={15}/>Cambiar orientación</button><div className="line"/><label className="field">Encaje<select value={size.fit} onChange={e=>patchSize({fit:e.target.value as 'contain'|'cover'})}><option value="contain">Ajustar · conservar imagen completa</option><option value="cover">Rellenar · recortar al centro</option></select></label><div className="two-fields"><label className="field">Margen (mm)<input aria-label="Margen (mm)" type="number" min="0" value={size.margin} onChange={e=>patchSize({margin:Number(e.target.value)})}/></label><label className="field">Fondo<input aria-label="Color de fondo" type="color" value={size.background} onChange={e=>patchSize({background:e.target.value})}/></label></div><label className="checkbox"><input type="checkbox" checked={size.transparent} onChange={e=>patchSize({transparent:e.target.checked})}/>Fondo transparente</label><p className="small-note">Transparencia en PNG, WebP y AVIF. JPEG, JFIF y PDF usan el color de fondo.</p></section>}
        {tab==='ai'&&<AiPanel model={model} modelName={modelName} included={modelIncluded} loading={modelLoading} enabled={useAI} previewBusy={previewBusy} previewActive={aiPreview} hasPhoto={!!photo} inputError={aiError} report={previewReport||exportReport} progress={previewProgress} mobile={mobile} onToggle={v=>{setUseAI(v);setAiPreview(false);setPreviewReport(null);}} onCustom={()=>modelInput.current?.click()} onIncluded={()=>void loadIncludedModel()} onPreview={()=>{if(aiPreview&&previewReport){setComparison(true);return;}setPreviewReport(null);setAiPreview(true);setComparison(true);}} onCancel={()=>{setAiPreview(false);setPreviewReport(null);setPreviewProgress(null);}} onRequirements={()=>setRequirements(true)} onCopy={()=>void prepareAiCopy()} onSize={()=>setTab('size')}/>}
        </fieldset><div className="local-card"><span className="local-icon"><LockKeyhole size={17}/></span><div><strong>Local por naturaleza</strong><p>Sin cuentas. Sin subir tus fotos.</p></div></div>
      </aside>

      <section className={`workspace ${dragging?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}>
        <div className="workspace-toolbar"><div className="file-title"><FileImage size={16}/><span>{photo?.file.name||'Tu próxima imagen'}</span>{photo?.demo&&<span className="tiny-tag">MUESTRA</span>}</div><button className={`compare-button ${comparison?'selected':''}`} disabled={!photo} onClick={()=>setComparison(!comparison)}><ChevronsLeftRight size={16}/><span>Comparar</span></button></div>
        <div className="stage">{photo?<><div className="preview-frame" style={{'--ratio':sizeError?1:output.width/output.height} as CSSProperties}><canvas ref={after} aria-label="Vista previa mejorada"/><canvas ref={before} className="before-canvas" style={{clipPath:comparison?`inset(0 ${100-split}% 0 0)`:'inset(0 100% 0 0)'}} aria-label="Vista previa original"/>{comparison&&<><div className="compare-line" style={{left:`${split}%`}}><span><ChevronsLeftRight size={18}/></span></div><span className="compare-tag original-tag">{showAi?'Sin IA':'Original'}</span><span className="compare-tag improved-tag">{showAi?'Con IA':'Ajustada'}</span><input aria-label="Deslizar comparación" className="comparison-slider" type="range" min="0" max="100" value={split} onChange={e=>setSplit(Number(e.target.value))}/></>}{previewBusy&&<span className="preview-loading"><LoaderCircle size={15} className="spin"/>Preparando vista previa</span>}</div><div className="stage-caption"><span><ShieldCheck size={13}/>Original protegido</span><span>{showAi?'IA sobre copia reducida · exportación usa la entrada completa':'Vista previa clásica adaptada a pantalla'}</span></div></>:<button className="empty-drop" onClick={()=>fileInput.current?.click()}><Upload size={34}/><h2>Empieza con una foto.</h2><p>Arrástrala aquí o haz clic para abrirla.</p><span>JPEG · JFIF · PNG · WebP · AVIF</span></button>}{dragging&&<div className="drop-overlay"><Upload size={38}/>Suelta tu imagen aquí</div>}</div>
        <div className="bottom-bar"><span><span className="status-dot"/>{previewBusy&&aiPreview?`IA: ${previewProgress?.completed||0} / ${previewProgress?.total||'…'} bloques`:previewBusy?'Actualizando…':photo?'Listo para crear':'Esperando imagen'}</span><button className="text-button" disabled={busy} onClick={demo}>Abrir imagen de muestra <ArrowUpRight size={13}/></button></div>
      </section>

      <aside className="export-panel"><div className="section-label"><h2>El siguiente destino.</h2><ArrowUpRight size={17}/></div><p className="export-intro">De tu pantalla al lugar que imaginas.</p><fieldset disabled={busy} className="control-fieldset"><span className="field-caption">EXPORTAR COMO</span><div className="format-grid">{(['png','jpg','jfif','webp','avif','pdf'] as Format[]).map(f=><button key={f} className={`format-button ${format===f?'active':''}`} onClick={()=>setFormat(f)}>{f==='jpg'?'JPEG':f.toUpperCase()}{format===f&&<Check size={13}/>}</button>)}</div><p className="format-description">{format==='png'?'Sin pérdida de compresión. Ideal para conservar tu resultado.':format==='jpg'?'Compatible y práctico. JPG y JPEG son el mismo formato.':format==='jfif'?'JPEG con cabecera JFIF y densidad de impresión. Sin transparencia.':format==='webp'?'Una copia ligera para compartir y usar en la web.':format==='avif'?'Compresión eficiente. Puede tardar más al exportar.':'Una página con medidas exactas, lista para imprimir al 100 %.'}</p>{!['png','pdf'].includes(format)&&<Range label="Calidad" value={quality} min={30} max={100} suffix=" %" onChange={setQuality}/>}<div className="line"/><div className="output-summary"><span className="field-caption">TU ARCHIVO FINAL</span><strong>{output.width.toLocaleString('es')} <span>×</span> {output.height.toLocaleString('es')}</strong><span>píxeles</span><dl><div><dt>Medida física</dt><dd>{Number.isFinite(physicalW)?physicalW.toFixed(1):'—'} × {Number.isFinite(physicalH)?physicalH.toFixed(1):'—'} mm</dd></div><div><dt>Resolución</dt><dd>{size.dpi} ppp</dd></div><div><dt>Procesamiento</dt><dd>{useAI?'IA local':'Clásico'}</dd></div><div><dt>Encaje</dt><dd>{size.fit==='contain'?'Imagen completa':'Recorte central'}</dd></div></dl></div><button className="text-button dimensions-link" onClick={()=>setTab('size')}>Cambiar tamaño <ArrowUpRight size={13}/></button></fieldset>{sizeError&&<p role="alert" className="inline-error">{sizeError}</p>}{aiError&&<p className="inline-error">{aiError}</p>}<div className="export-actions">{busy&&useAI&&<ProgressView progress={exportProgress}/>}<button className="button primary export-button" disabled={!photo||!!sizeError||!!aiError||busy||(aiPreview&&previewBusy)||(useAI&&!model)} onClick={exportPhoto}>{busy?<LoaderCircle className="spin" size={17}/>:<ArrowDownToLine size={18}/>} {busy?'Preparando archivo…':aiPreview&&previewBusy?'Espera o cancela la vista de IA':'Exportar imagen'}</button>{busy&&<button className="text-button cancel-button" onClick={()=>exportProcessor.current.cancel()}>Cancelar exportación</button>}<p>{exportReport?`Última IA: ×${exportReport.scale}, ${duration(exportReport.elapsedMs)} · CPU local`:'Una nueva copia. Tu original, intacto.'}</p></div><div className="export-footer"><CloudOff size={16}/><span>Procesado en tu dispositivo</span></div></aside>
    </main>
    {(notice||error)&&<div className={`toast ${error?'error':''}`} role={error?'alert':'status'}>{error?<Info size={18}/>:<Check size={18}/>}<span>{error||notice}</span><button aria-label="Cerrar aviso" onClick={()=>{setNotice('');setError('');}}><X size={16}/></button></div>}
    {help&&<Dialog title="Bienvenido a DpIA." onClose={()=>setHelp(false)}><img className="modal-logo" src={import.meta.env.BASE_URL+'icon.svg'} alt=""/><p>Abre una foto, ajusta su apariencia, elige el tamaño y exporta una copia. Todo se procesa localmente.</p><h3>Impresión con medidas reales</h3><p>Elige papel o medidas en mm, cm o pulgadas y los ppp. Para imprimir con medidas exactas, exporta PDF y selecciona tamaño real / 100 %. PNG, JPEG y JFIF también guardan la densidad.</p><h3>IA incluida, de uso opcional</h3><p>RealESR general ×4 se carga automáticamente. Reconstruye detalles a partir de la foto y no necesita un prompt. Puede alterar texturas o letras: compara el resultado. El botón de requisitos de IA muestra hardware y límites específicos.</p><h3>Privacidad y límites</h3><p>No hay cuentas, analítica ni subida de fotos. El modelo incluido está dentro del paquete. Las fotos y modelos personalizados permanecen en memoria durante la sesión. Salida máxima: {maxPixels/1e6} MP en este dispositivo. SVG, TIFF y RAW no están incluidos.</p><button className="button primary" onClick={()=>setHelp(false)}>Entendido</button></Dialog>}
    {requirements&&<ModelRequirements onClose={()=>setRequirements(false)} mobile={mobile} maxPixels={maxPixels} modelName={modelName} photo={photo}/>} 
  </div>;
}
export default App;


