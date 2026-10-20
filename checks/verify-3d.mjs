import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.js';
import {buildIndustrialModel,MODEL_VIEWS,positionModelCamera} from '../dist/industrial-model.mjs';
const m=buildIndustrialModel();
let instances=0,drawMeshes=0;
m.root.traverse(o=>{if(o.isMesh){drawMeshes++;assert(o.geometry.attributes.position.count>0);if(o.isInstancedMesh)instances+=o.count;}});
assert(instances>2000,'The scene must contain the volumetric industrial components.');
assert(drawMeshes<100,'Static repeated parts must be instanced for browser rendering.');
assert.equal(m.cars.length,4);assert(m.track.getLength()>10);
const initial=m.cars[0].position.clone();m.animate(16);assert(initial.distanceTo(m.cars[0].position)>3,'The train must move along a real world-space curve.');
const cableLengths=[];
for(let t=0;t<=64;t+=.5){m.animate(t);m.root.updateMatrixWorld(true);for(const car of m.cars){assert(car.position.toArray().every(Number.isFinite));assert(Math.abs(car.quaternion.length()-1)<1e-8);assert(Math.abs(car.position.y-3.25)<1e-8);}assert(m.cable.scale.y>0);assert(Math.abs(m.cable.position.y+m.cable.scale.y/2-7.6)<1e-8,'The cable top stays attached to the boom tip.');cableLengths.push(m.cable.scale.y);}
assert(Math.max(...cableLengths)-Math.min(...cableLengths)>1.5,'Hoisting must vary the physical cable length.');
const camera=new T.OrthographicCamera(),directions=[];
for(const view of MODEL_VIEWS){positionModelCamera(camera,view,.85);assert(camera.projectionMatrix.elements.every(Number.isFinite));directions.push(camera.getWorldDirection(new T.Vector3()));}
for(let i=1;i<4;i++)assert(directions[i].angleTo(directions[i-1])>.65,'Each chapter must change the actual camera angle.');
const bounds=new T.Box3().setFromObject(m.root);assert(bounds.getSize(new T.Vector3()).z>15);assert(bounds.getSize(new T.Vector3()).y>14);
console.log(`PASS: ${m.partCount} dimensional primitives, ${drawMeshes} instanced draw groups, four actual camera directions, articulated curve motion and variable hoist geometry.`);
