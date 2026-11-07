import { useEffect,useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Dialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
  const box=useRef<HTMLElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;box.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>previous?.focus();},[]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={box} className="modal" role="dialog" aria-modal="true" aria-label={title} onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=box.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><button className="icon-button modal-close" aria-label="Cerrar ventana" onClick={onClose}><X size={21}/></button><h2>{title}</h2>{children}</section></div>;
}
