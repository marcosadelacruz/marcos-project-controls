// Fictional example: all offsets are consecutive working days, not client data.
export type ActivityId='scope'|'engineering'|'supply'|'site'|'assembly'|'tests'|'handover';
export interface Activity {id:ActivityId;name:string;duration:number;predecessors:ActivityId[];note:string}
export interface ScheduledActivity extends Activity {start:number;finish:number;latestStart:number;latestFinish:number;float:number;critical:boolean}
export interface Schedule {activities:ScheduledActivity[];finish:number;delay:number;recovery:boolean}
export const ACTIVITY_TEMPLATE:Activity[]=[
 {id:'scope',name:'Definición del alcance',duration:3,predecessors:[],note:'Alinear entregables, límites y criterios de aceptación.'},
 {id:'engineering',name:'Ingeniería de detalle',duration:6,predecessors:['scope'],note:'Preparar la información técnica que permite comprar y construir.'},
 {id:'supply',name:'Suministro de materiales',duration:7,predecessors:['engineering'],note:'El deslizador añade una demora a esta actividad.'},
 {id:'site',name:'Preparación del frente',duration:4,predecessors:['engineering'],note:'Puede ejecutarse en paralelo con el suministro.'},
 {id:'assembly',name:'Montaje mecánico',duration:8,predecessors:['supply','site'],note:'Requiere el frente preparado y los materiales disponibles.'},
 {id:'tests',name:'Inspección y pruebas',duration:3,predecessors:['assembly'],note:'Verificar antes de entregar. En este ejemplo no se comprime esta etapa.'},
 {id:'handover',name:'Entrega del sistema',duration:0,predecessors:['tests'],note:'Hito final del ejemplo.'}
];
export function calculateSchedule(delay:number|string=0,recovery=false):Schedule {
 const extra=Math.max(0,Math.min(10,Number(delay)||0));
 const byId=new Map<ActivityId,ScheduledActivity>();
 const activities=ACTIVITY_TEMPLATE.map((a):ScheduledActivity=>{
  const duration=a.id==='supply'?a.duration+extra:a.id==='assembly'&&recovery?6:a.duration;
  const start=Math.max(0,...a.predecessors.map(id=>{const predecessor=byId.get(id);if(!predecessor)throw new Error(`Predecessor ${id} must be scheduled first`);return predecessor.finish;}));
  const activity:ScheduledActivity={...a,duration,start,finish:start+duration,latestStart:0,latestFinish:0,float:0,critical:false};byId.set(a.id,activity);return activity;
 });
 const finish=Math.max(...activities.map(a=>a.finish));
 for(const a of [...activities].reverse()){
  const next=activities.filter(b=>b.predecessors.includes(a.id));
  a.latestFinish=next.length?Math.min(...next.map(b=>b.latestStart)):finish;
  a.latestStart=a.latestFinish-a.duration;a.float=a.latestStart-a.start;a.critical=Math.abs(a.float)<1e-9;
 }
 return {activities,finish,delay:extra,recovery};
}
export const BASELINE=calculateSchedule();
