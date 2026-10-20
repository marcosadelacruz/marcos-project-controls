import assert from 'node:assert/strict';
import {BASELINE,calculateSchedule} from '../dist/schedule.mjs';
import {CERTIFICATES,CASES,SERVICES} from '../dist/content.mjs';
import {existsSync} from 'node:fs';

assert.equal(BASELINE.finish,27,'Baseline must follow scope + engineering + supply + assembly + tests.');
assert.equal(BASELINE.activities.find(a=>a.id==='site').float,3,'Preparation has three days of float.');
assert.equal(BASELINE.activities.find(a=>a.id==='site').critical,false);
assert.equal(calculateSchedule(7,false).finish,34,'A seven-day supply delay must reach delivery.');
assert.equal(calculateSchedule(7,true).finish,32,'The recovery example reduces mounting by exactly two days.');
assert.equal(calculateSchedule(0,true).finish,25,'Resource scenario can finish before baseline.');
assert.equal(calculateSchedule(500,false).delay,10,'The example bounds the slider input.');
assert.equal(calculateSchedule(-2,false).delay,0);
for(let delay=0;delay<=10;delay++)for(const recovery of [false,true]){
  const s=calculateSchedule(delay,recovery);
  for(const a of s.activities){
    assert.equal(a.finish-a.start,a.duration);
    assert(a.float>=0,'Float cannot be negative in an unconstrained forward/backward example.');
    for(const p of a.predecessors)assert(a.start>=s.activities.find(b=>b.id===p).finish,'A dependency must finish before its successor starts.');
  }
  assert.equal(s.finish,27+delay-(recovery?2:0),'Delivery must agree with the independent longest-path calculation.');
}
assert.equal(CASES.length,4);assert.equal(SERVICES.length,5);
assert.equal(new Set(CERTIFICATES.map(c=>c.id)).size,CERTIFICATES.length);
for(const c of CERTIFICATES){
  assert(existsSync(new URL(`../dist/assets/logo-${c.logo}`,import.meta.url)),`Logo missing for ${c.id}`);
  for(const p of c.pages||[])assert(existsSync(new URL(`../dist/assets/certificate-${p}.webp`,import.meta.url)),`Document missing for ${c.id}`);
  if(c.url)assert.equal(new URL(c.url).protocol,'https:');
}
console.log(`PASS: CPM constraints, 22 scenarios, four cases, five services, ${CERTIFICATES.length} credential records and their assets.`);

assert.deepEqual(CERTIFICATES.map(c=>c.id),['msproject','p6','evm','google','lt','kpi']);
