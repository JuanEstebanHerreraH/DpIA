import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const parts=[await readFile('LICENSE','utf8'),await readFile('THIRD_PARTY_NOTICES.md','utf8')];
parts.push(await readFile('public/models/README.md','utf8'),await readFile('public/models/LICENSE-BSD-3-Clause.txt','utf8'));
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else if(entry.name!=='inventory.json')parts.push(`\n\n========== ${path.replaceAll('\\','/')} ==========\n\n${await readFile(path,'utf8')}`);}}
await walk('docs/licenses');await writeFile('public/third-party-notices.txt',parts.join('\n\n'));
