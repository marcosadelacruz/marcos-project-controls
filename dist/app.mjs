import {mountStoryNavigation} from './story-navigation.mjs';
import {mountMobileExperience} from './mobile-experience.mjs';
import {CASES,SERVICES,CERTIFICATES} from './content.mjs';
import {BASELINE,calculateSchedule} from './schedule.mjs';
import {mountIsometricScenes,setStoryView} from './isometric-scene.mjs';

mountIsometricScenes();

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior=()=>motion.matches?'instant':'smooth';

// Small navigation, with a usable page even if animation is disabled.
const menuButton=$('.menu-toggle'),mobileNav=$('#mobile-nav');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menú');mobileNav.hidden=true;}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');mobileNav.hidden=!open;});
mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width: 1101px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
$('#current-year').textContent=String(new Date().getFullYear());

if('IntersectionObserver' in window&&!motion.matches){
  document.body.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.1});
  $$('.reveal').forEach(e=>observer.observe(e));
  motion.addEventListener('change',e=>{if(e.matches){document.body.classList.remove('motion-ready');observer.disconnect();}});
}

// Progress and scene framing are updated only when the visitor scrolls/resizes.
const steps=$$('[data-story-step]');
const scene=$('#sticky-scene');
const sceneText=[['2019 — 2023','MINERÍA · CALIDAD','El detalle importa.'],['2023 — 2024','EPCM · MONTAJE INDUSTRIAL','Del plano a la realidad.'],['2024 — 2025','MINERÍA · INGENIERÍA','Sistemas que se coordinan.'],['2025 — ACTUALIDAD','FERROVIARIO · PROJECT CONTROLS','Todo forma parte del plan.']];
let activeChapter=-1,scrollQueued=false;
function setChapter(index){
  if(index===activeChapter)return;activeChapter=index;scene.dataset.chapter=String(index);setStoryView(index);
  $('#scene-year').textContent=sceneText[index][0];$('#scene-sector').textContent=sceneText[index][1];$('#scene-title').textContent=sceneText[index][2];$('#scene-number').textContent=String(index+1).padStart(2,'0');
  steps.forEach((e,i)=>e.classList.toggle('active',i===index));
  $$('[data-story-jump]').forEach((e,i)=>{e.classList.toggle('active',i===index);e.setAttribute('aria-pressed',String(i===index));});
}
const storyNavigation=mountStoryNavigation(setChapter);
function updateScroll(){
  scrollQueued=false;
  const y=window.scrollY||0,viewport=window.innerHeight,total=document.documentElement.scrollHeight-viewport;
  $('#reading-progress').style.transform=`scaleX(${total>0?Math.max(0,Math.min(1,y/total)):0})`;
  $('#site-header').classList.toggle('scrolled',y>35);
  if(!storyNavigation.isCompact()){
    const target=viewport*.53;
    let best=0,distance=Infinity;
    steps.forEach((e,i)=>{const r=e.getBoundingClientRect();const d=r.top<=target&&r.bottom>=target?0:Math.min(Math.abs(r.top-target),Math.abs(r.bottom-target));if(d<distance){distance=d;best=i;}});
    setChapter(best);
  }
  const navIds=['servicios','laboratorio','proceso','trayectoria'];
  let current='';
  navIds.forEach(id=>{const r=document.getElementById(id).getBoundingClientRect();if(r.top<=viewport*.4&&r.bottom>100)current=id;});
  $$('.desktop-nav a').forEach(a=>{if(a.getAttribute('href')===`#${current}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
function queueScroll(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}}
window.addEventListener('scroll',queueScroll,{passive:true});window.addEventListener('resize',queueScroll,{passive:true});motion.addEventListener('change',queueScroll);window.addEventListener('load',queueScroll);
$$('[data-story-jump]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.storyJump);if(storyNavigation.isCompact()){storyNavigation.select(i);return;}steps[i].scrollIntoView({behavior:scrollBehavior(),block:'start'});setChapter(i);}));
queueScroll();

// Case studies use supplied experience; there are no invented client projects.
const dialogOpeners=new WeakMap();
function openDialog(dialog){closeMenu();dialogOpeners.set(dialog,document.activeElement);dialog.showModal();}
$$('dialog').forEach(dialog=>{
  dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>dialogOpeners.get(dialog)?.focus({preventScroll:true}));
});
$$('[data-case]').forEach(b=>b.addEventListener('click',()=>{const c=CASES[Number(b.dataset.case)];$('#case-kicker').textContent=`${c.company} · ${c.period}`;$('#case-title').textContent=c.title;$('#case-role').textContent=c.role;$('#case-description').textContent=c.description;$('#case-list').innerHTML=c.items.map(i=>`<li>${escapeHTML(i)}</li>`).join('');openDialog($('#case-dialog'));}));

// Service tabs share one panel; arrows, Home and End follow the tab pattern.
let activeService=0;
const serviceButtons=$$('[data-service]');
function selectService(index,focus=false){
  activeService=index;const s=SERVICES[index];
  serviceButtons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
  $('#service-panel').setAttribute('aria-labelledby',`service-tab-${index}`);$('#service-tag').textContent=s.tag;$('#service-title').innerHTML=s.title;$('#service-description').textContent=s.description;$('#service-inputs').textContent=s.inputs;$('#service-mode').textContent=s.mode;$('#deliverables').innerHTML=s.deliverables.map(x=>`<li>${escapeHTML(x)}</li>`).join('');$('#service-contact').innerHTML=`${escapeHTML(s.cta)} <span aria-hidden="true">↗</span>`;
  if(focus)serviceButtons[index].focus();
}
serviceButtons.forEach((b,i)=>{b.addEventListener('click',()=>selectService(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%serviceButtons.length;if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i+serviceButtons.length-1)%serviceButtons.length;if(e.key==='Home')next=0;if(e.key==='End')next=serviceButtons.length-1;if(next!==undefined){e.preventDefault();selectService(next,true);}});});

// A real forward and backward CPM pass powers every bar, float and milestone.
const CHART_DAYS=45,ROW=49;
let schedule=calculateSchedule(4,false),selectedTask=null;
const barX=d=>d/CHART_DAYS*100;
const numberLabel=d=>String(d).padStart(2,'0');
$('#chart-scale').innerHTML=Array.from({length:10},(_,i)=>`<span style="left:${i/9*100}%;${i===9?'transform:translateX(-110%)':''}">${i*5===0?'D0':i*5}</span>`).join('');
function selectTask(id){
  selectedTask=id;const a=schedule.activities.find(a=>a.id===id);if(!a)return;
  $$('[data-task]').forEach(b=>{const selected=b.dataset.task===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#selected-task').textContent=`${a.name} · D${a.start}–D${a.finish} · Holgura: ${a.float} días. ${a.note}`;
}
function renderSchedule(){
  schedule=calculateSchedule($('#delay-range').value,$('#recovery-toggle').checked);
  const delay=schedule.delay;$('#delay-output').textContent=`+${delay} ${delay===1?'día':'días'}`;$('#delay-range').setAttribute('aria-valuetext',`${delay} ${delay===1?'día':'días'} de retraso en el suministro`);
  $('#forecast-day').textContent=`Día ${schedule.finish}`;
  const variance=schedule.finish-BASELINE.finish;
  $('#report-forecast').textContent=`Día ${schedule.finish}`;$('#report-variance').textContent=variance===0?'Sin desviación':`${variance>0?'+':''}${variance} días`;
  $('#report-summary').textContent=`El suministro incorpora ${delay} días adicionales. ${$('#recovery-toggle').checked?'El escenario reduce el montaje de 8 a 6 días, sujeto a validación.':'Se mantiene el montaje de 8 días.'} La entrega calculada es el día ${schedule.finish}, frente al día ${BASELINE.finish} de la línea base.`;
  $('#forecast-variance').textContent=variance===0?'En línea con la línea base':variance<0?`${Math.abs(variance)} días antes de la línea base`:`+${variance} ${variance===1?'día':'días'} frente a la línea base`;
  $('#task-rows').innerHTML=schedule.activities.map((a,i)=>`<button type="button" class="task-row${selectedTask===a.id?' selected':''}" data-task="${a.id}" aria-pressed="${selectedTask===a.id}" aria-label="${escapeHTML(a.name)}, ${a.duration} días, inicio día ${a.start}, fin día ${a.finish}"><span><small>${numberLabel(i+1)}</small>${escapeHTML(a.name)}</span><span>${a.duration===0?'◆':a.duration}</span></button>`).join('');
  $('#chart-bars').innerHTML=schedule.activities.map((a,i)=>{const b=BASELINE.activities[i];return `<span aria-hidden="true" class="baseline-bar${b.duration===0?' is-milestone':''}" style="top:${i*ROW+38}px;left:${barX(b.start)}%;width:${barX(b.duration)}%"></span><button type="button" data-task="${a.id}" class="chart-bar${a.critical?' is-critical':''}${a.duration===0?' is-milestone':''}${selectedTask===a.id?' selected':''}" style="top:${i*ROW+14}px;left:${barX(a.start)}%;width:${barX(a.duration)}%" aria-pressed="${selectedTask===a.id}" aria-label="${escapeHTML(a.name)}: día ${a.start} al ${a.finish}${a.critical?', en ruta crítica':''}" title="${escapeHTML(a.name)} · D${a.start}–D${a.finish}"></button>`;}).join('');
  const paths=[];
  schedule.activities.forEach((a,i)=>a.predecessors.forEach(p=>{const j=schedule.activities.findIndex(b=>b.id===p),pred=schedule.activities[j],x1=pred.finish*10,x2=a.start*10,y1=j*ROW+23.5,y2=i*ROW+23.5;const joint=x1+5;paths.push(`<path class="dependency${a.critical&&pred.critical?' is-critical':''}" d="M${x1} ${y1} H${joint} V${y2-11} H${Math.max(0,x2-4)} V${y2}" marker-end="url(#arrow)"/>`);}));
  $('#dependencies').setAttribute('viewBox',`0 0 450 ${ROW*schedule.activities.length}`);$('#dependencies').setAttribute('preserveAspectRatio','none');$('#dependencies').innerHTML=`<defs><marker id="arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L6 3L0 6" fill="#9aab9b"/></marker></defs>${paths.join('')}`;
  if(selectedTask)selectTask(selectedTask);else $('#selected-task').textContent='Selecciona una actividad para ver su detalle.';
}
$('#gantt').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(b)selectTask(b.dataset.task);});
$('#delay-range').addEventListener('input',renderSchedule);$('#recovery-toggle').addEventListener('change',renderSchedule);
$('#critical-toggle').addEventListener('click',()=>{const b=$('#critical-toggle'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.lastChild.textContent=on?' Ocultar ruta crítica':' Mostrar ruta crítica';$('#gantt').classList.toggle('show-critical',on);});
$('#reset-schedule').addEventListener('click',()=>{$('#delay-range').value='4';$('#recovery-toggle').checked=false;$('#critical-toggle').setAttribute('aria-pressed','false');$('#critical-toggle').lastChild.textContent=' Mostrar ruta crítica';$('#gantt').classList.remove('show-critical');selectedTask=null;renderSchedule();});
renderSchedule();
$('#show-recovery-example').addEventListener('click',()=>{$('#delay-range').value='7';$('#recovery-toggle').checked=true;renderSchedule();$('#schedule-example').scrollIntoView({behavior:scrollBehavior(),block:'start'});$('#delay-range').focus({preventScroll:true});});

// Certificate filters, original issuer links, and readable document previews.
let certificateFilter='all',showAll=false;
function renderCertificates(){
  const filtered=CERTIFICATES.filter(c=>certificateFilter==='all'||c.category===certificateFilter);
  const visible=certificateFilter==='all'&&!showAll?filtered.slice(0,6):filtered;
  $('#credential-grid').innerHTML=visible.map(c=>{
    const content=`<img class="certificate-logo${['asme','infotep','itc'].includes(c.logo.split('.')[0])?' tall-logo':''}${['linkedin','cisco','certiprof','freecodecamp'].includes(c.logo.split('.')[0])?' wide-logo':''}" src="assets/logo-${c.logo}" alt="Logo de ${escapeHTML(c.issuer)}" width="145" height="50" loading="lazy"><p class="credential-issuer">${escapeHTML(c.issuer)}</p><h3>${escapeHTML(c.title)}</h3>${c.historical?'<span class="historical-badge">DOCUMENTOS HISTÓRICOS · VENCIMIENTO 2025</span>':''}<div class="credential-card-footer"><span>${escapeHTML(c.date)} · ${c.pages?'VER DOCUMENTO':'VER CREDENCIAL'}</span><span aria-hidden="true">↗</span></div>`;
    return c.id==='tekla'?`<a class="credential-card" href="${c.url}" target="_blank" rel="noopener" aria-label="Ver credencial original de Tekla, abre una pestaña">${content}</a>`:`<button class="credential-card" type="button" data-certificate="${c.id}" aria-label="Ver certificado: ${escapeHTML(c.title)}">${content}</button>`;
  }).join('');
  const showButton=$('#show-all-certs');showButton.hidden=filtered.length<=6||certificateFilter!=='all';showButton.setAttribute('aria-expanded',String(showAll));showButton.innerHTML=showAll?'Ver menos <span aria-hidden="true">−</span>':`Ver toda la formación (${CERTIFICATES.length}) <span aria-hidden="true">+</span>`;
  $('#cert-count').textContent=`Mostrando ${visible.length} de ${filtered.length} credenciales en esta categoría.`;
}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{certificateFilter=b.dataset.filter;$$('[data-filter]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});renderCertificates();}));
$('#show-all-certs').addEventListener('click',()=>{showAll=!showAll;renderCertificates();if(!showAll)$('#credenciales').scrollIntoView({behavior:scrollBehavior(),block:'start'});});
$('#credential-grid').addEventListener('click',e=>{const b=e.target.closest('[data-certificate]');if(!b)return;const c=CERTIFICATES.find(c=>c.id===b.dataset.certificate);$('#certificate-issuer').textContent=c.issuer;$('#certificate-title').textContent=c.title;$('#certificate-note').textContent=c.note;$('#certificate-image-wrap').innerHTML=(c.pages||[]).map(page=>`<img class="certificate-document" src="assets/certificate-${page}.webp" alt="Documento de ${escapeHTML(c.title)}, página ${page} del CV" width="1040" loading="lazy">`).join('');$('#certificate-links').innerHTML=`<a class="text-link" href="assets/Marcos-De-La-Cruz-CV.pdf#page=${c.pages?.[0]||1}" target="_blank" rel="noopener">Ver en el documento original ↗</a>${c.url?`<a class="text-link" href="${escapeHTML(c.url)}" target="_blank" rel="noopener">Consultar enlace del emisor ↗</a>`:''}`;openDialog($('#certificate-dialog'));});
renderCertificates();

// This prepares a message locally. The visitor decides when to send it.
let preparedMessage='';
function openBrief(service){if(service)$('#brief-service').value=service;$('#brief-form').hidden=false;$('#brief-result').hidden=true;openDialog($('#brief-dialog'));}
$$('[data-open-brief]').forEach(button=>button.addEventListener('click',()=>openBrief(button.dataset.openBrief||undefined)));
$('#open-brief').addEventListener('click',()=>openBrief());$('#service-contact').addEventListener('click',()=>openBrief(SERVICES[activeService].brief));
$('#brief-form').addEventListener('submit',e=>{
  e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
  const data=new FormData(form),name=String(data.get('name')||'').trim(),company=String(data.get('company')||'').trim(),service=String(data.get('service')||'').trim(),message=String(data.get('message')||'').trim();
  if(!name||!message)return;
  const email=String(data.get('email')||'').trim(),target=String(data.get('target_date')||'').trim(),project=String(data.get('project_type')||'').trim(),documents=String(data.get('documents')||'').trim();
  preparedMessage=`Hola Marcos,\n\nSoy ${name}${company?`, de ${company}`:''}.\n\nQuisiera una propuesta para: ${service}.\nTipo de proyecto: ${project||'Por definir'}.\nFecha objetivo: ${target||'Por acordar'}.\nDocumentación disponible: ${documents||'Por revisar'}.${email?`\nCorreo de contacto: ${email}`:''}\n\nContexto del proyecto:\n${message}\n\nQuedo atento para coordinar una conversación.\n\nSaludos,\n${name}${company?`\n${company}`:''}`;
  $('#brief-whatsapp').setAttribute('href',`https://wa.me/18496520907?text=${encodeURIComponent(preparedMessage)}`);$('#brief-preview').textContent=preparedMessage;$('#brief-mailto').setAttribute('href',`mailto:marcosadelacruz@gmail.com?subject=${encodeURIComponent(`Consulta de proyecto · ${service}`)}&body=${encodeURIComponent(preparedMessage)}`);
  form.hidden=true;$('#brief-result').hidden=false;$('#copy-status').textContent='';$('#brief-mailto').focus();
});
$('#edit-brief').addEventListener('click',()=>{$('#brief-result').hidden=true;$('#brief-form').hidden=false;$('#brief-form input[name="name"]').focus();});
$('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(preparedMessage);$('#copy-status').textContent='Consulta copiada.';}catch{$('#copy-status').textContent='Puedes seleccionar y copiar el texto de la consulta de arriba.';}});

mountMobileExperience();

$$('[data-close-to-terms]').forEach(link=>link.addEventListener('click',()=>$('#brief-dialog').close()));
