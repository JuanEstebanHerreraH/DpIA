import { useEffect,useState } from 'react';
import type { InferenceProgress } from './ai';
import { duration } from './ai';
export default function ProgressView({progress,compact=false}:{progress:InferenceProgress|null;compact?:boolean}){
  const [,setTick]=useState(0),[started]=useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setTick(n=>n+1),1000);return()=>clearInterval(t);},[]);
  const elapsed=Math.max(progress?.elapsedMs||0,Date.now()-started);
  const title=progress?.stage==='upscaling'?'Reconstruyendo detalle':progress?.stage==='composing'?'Adaptando al tamaño elegido':progress?.stage==='encoding'?'Guardando el formato':'Preparando modelo de IA';
  const percent=progress?.total?Math.round(progress.completed/progress.total*100):0;
  return <div className={`inference-progress ${compact?'compact':''}`} role="status"><div><strong>{title}</strong><span>{duration(elapsed)}</span></div>{progress?.stage==='upscaling'&&<><progress max={progress.total} value={progress.completed} aria-label="Progreso de IA"/><p>Bloque {progress.completed} de {progress.total} · {percent} %{progress.etaMs!==undefined?` · Faltan aprox. ${duration(progress.etaMs)}`:progress.completed<2?' · Estimando tiempo…':''}</p></>}<small>CPU local · La estimación cambia según el equipo.</small></div>;
}
