import { spawnSync } from 'node:child_process';
import { existsSync,mkdirSync,writeFileSync } from 'node:fs';
import { join } from 'node:path';
const release=process.argv[2]==='release';
const args=[release?'assembleRelease':'assembleDebug','--no-daemon'];
const command=process.platform==='win32'?'gradlew.bat':'./gradlew';
if(!existsSync('android/gradlew')){console.error('Falta el proyecto Android. Ejecuta: npx cap add android');process.exit(1);}
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT;
if(!existsSync('android/local.properties')&&sdk)writeFileSync('android/local.properties',`sdk.dir=${sdk.replaceAll('\\','/')}\n`);
if(!release&&!existsSync('.local/debug.keystore')) {
  mkdirSync('.local',{recursive:true});
  const keytool=process.env.JAVA_HOME?join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'keytool.exe':'keytool'):'keytool';
  const created=spawnSync(keytool,['-genkeypair','-keystore','.local/debug.keystore','-storepass','android','-alias','androiddebugkey','-keypass','android','-keyalg','RSA','-keysize','2048','-validity','3650','-dname','CN=DpIA Development, O=DpIA','-noprompt'],{stdio:'inherit'});
  if(created.status!==0)process.exit(created.status??1);
}
const result=spawnSync(command,args,{cwd:'android',stdio:'inherit',shell:process.platform==='win32'});
process.exit(result.status??1);
