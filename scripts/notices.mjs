import {readFile,readdir,mkdir,copyFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
const destination=resolve('docs/licenses');await mkdir(destination,{recursive:true});
const lock=JSON.parse(await readFile('package-lock.json','utf8')),npm=[];
for(const [path,entry] of Object.entries(lock.packages)){
  if(!path)continue;
  const folder=resolve(path);if(!existsSync(join(folder,'package.json')))continue;
  const pkg=JSON.parse(await readFile(join(folder,'package.json'),'utf8'));
  const id=`${pkg.name.replaceAll('/','--')}@${pkg.version}`,out=join(destination,'npm',id);let copied=0;
  for(const name of await readdir(folder))if(/^(licen[cs]e|copying|notice|ThirdPartyNotices)([.\-_]|$)/i.test(name)){
    try{await mkdir(out,{recursive:true});await copyFile(join(folder,name),join(out,name));copied++;}catch{}
  }
  npm.push({name:pkg.name,version:pkg.version,license:pkg.license||entry.license||'Revisar upstream',notices:copied});
}
const rust=[];const cargoRoot=process.env.CARGO_HOME||join(homedir(),'.cargo');
const registry=join(cargoRoot,'registry/src');const roots=existsSync(registry)?await readdir(registry):[];
if(existsSync('src-tauri/Cargo.lock')){
  const cargo=await readFile('src-tauri/Cargo.lock','utf8');
  for(const block of cargo.split('[[package]]').slice(1)){
    const name=block.match(/\nname = "([^"]+)"/)?.[1],version=block.match(/\nversion = "([^"]+)"/)?.[1];if(!name||!version||name==='dpia')continue;
    const folder=roots.map(root=>join(registry,root,`${name}-${version}`)).find(existsSync);if(!folder)continue;
    const manifest=await readFile(join(folder,'Cargo.toml'),'utf8');let copied=0;
    const out=join(destination,'rust',`${name}-${version}`);
    for(const file of await readdir(folder))if(/^(licen[cs]e|copying|notice|copyright)([.\-_]|$)/i.test(file)){
      try{await mkdir(out,{recursive:true});await copyFile(join(folder,file),join(out,file));copied++;}catch{}
    }
    rust.push({name,version,license:manifest.match(/^license\s*=\s*"([^"]+)"/m)?.[1]||'Ver upstream',notices:copied});
  }
}
await writeFile(join(destination,'inventory.json'),JSON.stringify({npm,rust},null,2)+'\n');
console.log(`Avisos: ${npm.length} paquetes npm y ${rust.length} crates locales. Los textos disponibles se copiaron a docs/licenses.`);
