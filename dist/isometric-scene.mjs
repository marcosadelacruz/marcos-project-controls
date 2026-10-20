// Both page sections use the same volumetric scene, materials and animation.
const labels=['Vista general','Montaje · Estructura','Ingeniería · Sistemas','Ferroviario · Monorriel'];
const controllers=new Map();
let requestedView=0;
export function setStoryView(index){
 requestedView=Math.max(0,Math.min(3,Math.trunc(Number(index)||0)));
 controllers.get('story')?.setChapter(requestedView);
 const label=document.getElementById('scene-view-label');
 if(label)label.textContent=document.querySelector('[data-isometric-scene="story"].webgl-unavailable')?'Vista estática de referencia':`3D · ${String(requestedView+1).padStart(2,'0')} · ${labels[requestedView]}`;
}
export function mountIsometricScenes(){
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const buttons=[...document.querySelectorAll('[data-scene-motion]')];
 let paused=media.matches;
 function sync(){
  document.documentElement.dataset.scenePaused=String(paused);
  for(const controller of controllers.values()){controller.setMotionPreference(media.matches);controller.setPaused(paused);}
  for(const button of buttons){
   button.setAttribute('aria-pressed',String(paused));
   button.setAttribute('aria-label',paused?'Reproducir animación de la escena':'Pausar animación de la escena');
   button.innerHTML=`<span aria-hidden="true">${paused?'▷':'Ⅱ'}</span> ${paused?'Reproducir escena':'Pausar escena'}`;
  }
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{paused=!paused;sync();}));
 media.addEventListener('change',event=>{paused=event.matches;sync();});
 sync();
 for(const mount of document.querySelectorAll('[data-isometric-scene]')){
  const placement=mount.dataset.isometricScene;
  mount.innerHTML='<img class="model-fallback" src="assets/industrial-model-poster.webp" alt="Modelo conceptual de planta industrial, monorriel y grúa" width="1000" height="800"><span class="model-load-status" role="status">Preparando modelo 3D…</span>';
  const unavailable=()=>{mount.classList.add('webgl-unavailable');mount.querySelector('.model-load-status').textContent='Vista estática · 3D no disponible en este navegador';if(placement==='story')setStoryView(requestedView);};
  if(!window.WebGL2RenderingContext){unavailable();continue;}
  const loadModel=()=>import('./industrial-viewer.mjs').then(({mountIndustrialViewer})=>{
   const controller=mountIndustrialViewer(mount,{presentation:placement});
   controllers.set(placement,controller);controller.setMotionPreference(media.matches);controller.setPaused(paused);
   if(placement==='story')controller.setChapter(requestedView);
  }).catch(error=>{console.warn('Industrial 3D viewer unavailable:',error.message);unavailable();});
  if(placement==='hero'||!('IntersectionObserver' in window))loadModel();
  else {
   const loader=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){loader.disconnect();loadModel();}},{rootMargin:'400px 0px'});
   loader.observe(mount);
  }
 }
}
