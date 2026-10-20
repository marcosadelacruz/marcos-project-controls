import {SERVICES} from './content.mjs';

/** Small, typed mobile controller. Visual layout stays in CSS. */
export function mountMobileExperience():void {
 const select=document.querySelector<HTMLSelectElement>('#mobile-service');
 const tabs=[...document.querySelectorAll<HTMLButtonElement>('[data-service]')];
 const panel=document.querySelector<HTMLElement>('#service-panel');
 if(select){
  select.replaceChildren(...SERVICES.map((service,index)=>Object.assign(document.createElement('option'),{textContent:service.tag,value:String(index)})));
  select.addEventListener('change',()=>{
   const index=Number(select.value);
   if(!Number.isInteger(index)||index<0||index>=tabs.length)return;
   tabs[index].click();
   panel?.focus({preventScroll:true});
  });
  tabs.forEach((tab,index)=>tab.addEventListener('click',()=>{select.value=String(index);}));
 }
 const scope=document.querySelector<HTMLDetailsElement>('.service-scope');
 const screen=window.matchMedia('(max-width: 900px)');
 const adaptScope=():void=>{if(scope)scope.open=!screen.matches;};
 adaptScope();screen.addEventListener('change',adaptScope);
 const dock=document.querySelector<HTMLElement>('.mobile-action-bar');
 const hero=document.querySelector<HTMLElement>('#inicio');
 const contact=document.querySelector<HTMLElement>('#contacto');
 let heroVisible=true,contactVisible=false;
 const updateDock=():void=>{if(dock)dock.hidden=heroVisible||contactVisible;};
 if(dock&&hero&&contact&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){if(entry.target===hero)heroVisible=entry.isIntersecting;if(entry.target===contact)contactVisible=entry.isIntersecting;}
   updateDock();
  });observer.observe(hero);observer.observe(contact);
 }
}
