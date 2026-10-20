interface StoryNavigation {isCompact:()=>boolean;select:(index:number)=>void}
/** Four mobile cards; desktop keeps all chapters available for scrollytelling. */
export function mountStoryNavigation(onSelect:(index:number)=>void):StoryNavigation {
 const section=document.querySelector<HTMLElement>('#trayectoria');
 const steps=[...document.querySelectorAll<HTMLElement>('[data-story-step]')];
 const tabs=[...document.querySelectorAll<HTMLButtonElement>('[data-mobile-chapter]')];
 const query=window.matchMedia('(max-width: 900px)');
 let selected=0;
 function sync():void {
  section?.classList.toggle('compact-journey',query.matches);
  steps.forEach((step,index)=>{
   step.hidden=query.matches&&index!==selected;
   if(query.matches){step.setAttribute('role','tabpanel');step.setAttribute('aria-labelledby',`mobile-chapter-${index}`);}
   else {step.removeAttribute('role');step.removeAttribute('aria-labelledby');}
  });
  tabs.forEach((tab,index)=>{tab.setAttribute('aria-selected',String(index===selected));tab.tabIndex=index===selected?0:-1;});
 }
 function select(index:number):void {
  if(!Number.isInteger(index)||index<0||index>=steps.length)return;
  selected=index;sync();onSelect(index);
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>select(index));
  tab.addEventListener('keydown',event=>{
   let next:number|undefined;
   if(event.key==='ArrowRight')next=(index+1)%tabs.length;
   if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
   if(event.key==='Home')next=0;
   if(event.key==='End')next=tabs.length-1;
   if(next!==undefined){event.preventDefault();select(next);tabs[next].focus();}
  });
 });
 query.addEventListener('change',()=>{sync();if(query.matches)onSelect(selected);});
 sync();onSelect(selected);
 return {isCompact:()=>query.matches,select};
}
