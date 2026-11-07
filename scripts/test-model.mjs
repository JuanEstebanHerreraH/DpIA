// A deliberately untrained nearest-neighbor ONNX graph. Fixture only, not an enhancement model.
import {mkdir,writeFile} from 'node:fs/promises';
const varint=(n)=>{const b=[];do{let v=n&127;n=Math.floor(n/128);b.push(v|(n?128:0));}while(n);return Buffer.from(b);};
const vi=(field,value)=>Buffer.concat([varint(field*8),varint(value)]);
const raw=(field,value)=>{const b=typeof value==='string'?Buffer.from(value):value;return Buffer.concat([varint(field*8+2),varint(b.length),b]);};
const concat=(...parts)=>Buffer.concat(parts);
const dimension=(value)=>typeof value==='number'?vi(1,value):raw(2,value);
const valueInfo=(name,dims)=>raw(11,concat(raw(1,name),raw(2,raw(1,concat(vi(1,1),raw(2,concat(...dims.map(d=>raw(1,dimension(d))))))))));
const attribute=(name,value)=>raw(5,concat(raw(1,name),raw(4,value),vi(20,3)));
const node=raw(1,concat(raw(1,'input'),raw(1,''),raw(1,'scales'),raw(2,'output'),raw(4,'Resize'),attribute('mode','nearest'),attribute('coordinate_transformation_mode','asymmetric'),attribute('nearest_mode','floor')));
const floats=Buffer.alloc(16);[1,1,2,2].forEach((v,i)=>floats.writeFloatLE(v,i*4));
const scales=raw(5,concat(vi(1,4),vi(2,1),raw(4,floats),raw(8,'scales')));
const output=valueInfo('output',[1,3,'outH','outW']);output[0]=12*8+2;
const graph=concat(node,raw(2,'DpIA-test-only'),scales,valueInfo('input',[1,3,'h','w']),output);
const model=concat(vi(1,8),raw(2,'DpIA automated tests'),raw(7,graph),raw(8,vi(2,13)));
await mkdir('tests/fixtures',{recursive:true});await writeFile('tests/fixtures/nearest-x2.onnx',model);
