import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
const port=Number(process.env.DPIA_TEST_PORT||1420);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Puerto de pruebas inválido.');
export default defineConfig({testDir:'./tests/e2e',timeout:120000,workers:1,reporter:'list',use:{baseURL:`http://127.0.0.1:${port}`,viewport:{width:1440,height:940},headless:true,acceptDownloads:true,launchOptions:{downloadsPath:resolve('test-results/downloads')},channel:process.env.PW_CHANNEL||'msedge',screenshot:'only-on-failure'},webServer:{command:`npm run preview -- --port ${port}`,url:`http://127.0.0.1:${port}`,reuseExistingServer:!process.env.CI,timeout:30000}});
