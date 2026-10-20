import * as T from './vendor/three/three.module.js';
import {buildIndustrialModel,makeModelScene,positionModelCamera,MODEL_VIEWS} from './industrial-model.mjs';

export function mountIndustrialViewer(mount,{rendererFactory,presentation='story'}={}){
 const isHero=presentation==='hero',compact=window.innerWidth<=900;
 const renderer=rendererFactory?rendererFactory():new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:compact?'low-power':'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,compact?1.25:1.75));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 renderer.shadowMap.enabled=!compact;renderer.shadowMap.type=T.PCFShadowMap;
 const model=buildIndustrialModel(),scene=makeModelScene(model),camera=new T.OrthographicCamera();
 const canvas=renderer.domElement;canvas.className='industrial-canvas';canvas.tabIndex=isHero?-1:0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Modelo 3D de planta industrial, monorriel y grúa. Arrastra para girar. Flechas para cambiar el ángulo, más y menos para zoom, Inicio para centrar.');
 if(isHero)canvas.setAttribute('aria-hidden','true');
 mount.append(canvas);mount.classList.add('webgl-stage');
 const instruction=document.createElement('span');instruction.className='orbit-instruction';instruction.textContent='Arrastra para girar';if(!isHero)mount.append(instruction);
 const reset=document.createElement('button');reset.type='button';reset.className='reset-model-view';reset.textContent='↺ Centrar vista';reset.setAttribute('aria-label','Centrar la vista 3D en la etapa actual');if(!isHero)mount.append(reset);
 let chapter=0,paused=false,reduced=false,visible=!('IntersectionObserver' in window),frame=0,last=null,seconds=0,drag=null,needsRender=true,contextLost=false;
 let current={...MODEL_VIEWS[0],target:[...MODEL_VIEWS[0].target]},goal={...current,target:[...current.target]};
 let width=1,height=1;
 const copyView=v=>({...v,target:[...v.target]});
 function resize(){const rect=mount.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);renderer.setSize(width,height,false);needsRender=true;wake();}
 function setChapter(index){chapter=Math.max(0,Math.min(3,Number(index)||0));goal=copyView(MODEL_VIEWS[chapter]);if(reduced)current=copyView(goal);needsRender=true;wake();}
 function difference(){return Math.abs(Math.atan2(Math.sin(goal.azimuth-current.azimuth),Math.cos(goal.azimuth-current.azimuth)))+Math.abs(goal.elevation-current.elevation)+Math.abs(goal.span-current.span)+goal.target.reduce((sum,v,i)=>sum+Math.abs(v-current.target[i]),0);}
 const available=()=>visible&&!document.hidden&&!contextLost;
 function draw(now){
  frame=0;if(!available()){last=null;return;}
  if(compact&&last!==null&&now-last<32){frame=requestAnimationFrame(draw);return;}
  const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;
  if(!paused)seconds+=dt;
  const ease=reduced?1:1-Math.exp(-dt*3.2);
  current.azimuth+=Math.atan2(Math.sin(goal.azimuth-current.azimuth),Math.cos(goal.azimuth-current.azimuth))*ease;
  current.elevation=T.MathUtils.lerp(current.elevation,goal.elevation,ease);current.span=T.MathUtils.lerp(current.span,goal.span,ease);current.target=current.target.map((v,i)=>T.MathUtils.lerp(v,goal.target[i],ease));
  positionModelCamera(camera,isHero?{...current,span:Math.max(34,27*width/height)}:{...current,span:Math.max(current.span,current.span*.8*width/height)},width/height);model.animate(seconds);renderer.render(scene,camera);needsRender=false;
  if(!paused||difference()>.002||drag)frame=requestAnimationFrame(draw);else last=null;
 }
 function wake(){if(available()&&!frame&&(needsRender||!paused||difference()>.002)){last=null;frame=requestAnimationFrame(draw);}}
 function setPaused(value){paused=Boolean(value);needsRender=true;if(frame){cancelAnimationFrame(frame);frame=0;}last=null;wake();}
 function setMotionPreference(value){reduced=Boolean(value);if(reduced){current=copyView(goal);needsRender=true;}wake();}
 reset.addEventListener('click',()=>setChapter(chapter));canvas.addEventListener('dblclick',()=>setChapter(chapter));
 canvas.addEventListener('pointerdown',e=>{if(isHero)return;if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};goal.azimuth-=dx*.009;goal.elevation=T.MathUtils.clamp(goal.elevation+dy*.006,.15,1.2);current.azimuth=goal.azimuth;current.elevation=goal.elevation;needsRender=true;wake();});
 const endDrag=()=>{drag=null;canvas.classList.remove('dragging');};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 canvas.addEventListener('keydown',e=>{let handled=true;if(e.key==='ArrowLeft')goal.azimuth+=.2;else if(e.key==='ArrowRight')goal.azimuth-=.2;else if(e.key==='ArrowUp')goal.elevation=Math.min(1.2,goal.elevation+.12);else if(e.key==='ArrowDown')goal.elevation=Math.max(.15,goal.elevation-.12);else if(e.key==='+'||e.key==='=')goal.span=Math.max(17,goal.span*.9);else if(e.key==='-')goal.span=Math.min(45,goal.span*1.1);else if(e.key==='Home')setChapter(chapter);else handled=false;if(handled){e.preventDefault();if(reduced)current=copyView(goal);needsRender=true;wake();}});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;mount.classList.remove('webgl-ready');mount.classList.add('webgl-unavailable');mount.querySelector('.model-load-status').textContent='La vista 3D se detuvo. Recarga para reintentar.';if(frame)cancelAnimationFrame(frame);frame=0;});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;mount.classList.add('webgl-ready');mount.classList.remove('webgl-unavailable');needsRender=true;wake();});
 const resizeObserver='ResizeObserver' in window?new ResizeObserver(resize):null;if(resizeObserver)resizeObserver.observe(mount);else window.addEventListener('resize',resize,{passive:true});
 const visibilityObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;last=null;}wake();},{threshold:0}):null;
 visibilityObserver?.observe(mount);document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;last=null;}else wake();});
 resize();positionModelCamera(camera,isHero?{...current,span:Math.max(34,27*width/height)}:{...current,span:Math.max(current.span,current.span*.8*width/height)},width/height);renderer.render(scene,camera);mount.classList.add('webgl-ready');mount.dataset.modelType='volumetric-3d';
 return {setChapter,setPaused,setMotionPreference,stats:{parts:model.partCount,renderer:'WebGL2',revision:T.REVISION},dispose(){if(frame)cancelAnimationFrame(frame);resizeObserver?.disconnect();visibilityObserver?.disconnect();renderer.dispose();}};
}
