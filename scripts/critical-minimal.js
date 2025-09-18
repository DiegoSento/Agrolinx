// JavaScript crítico ultra-optimizado - Solo lo esencial (< 2KB)
(()=>{
'use strict';

// Throttle optimizado
const t=(f,d)=>{let i;return(...a)=>{if(!i){f(...a);i=1;setTimeout(()=>i=0,d)}}};

// Scroll progress ultra-optimizado
const sp=document.getElementById('scrollProgress');
if(sp){
  const u=t(()=>{
    const s=window.pageYOffset;
    const h=document.documentElement.scrollHeight-window.innerHeight;
    sp.style.width=Math.min((s/h)*100,100)+'%';
  },16);
  window.addEventListener('scroll',u,{passive:true});
}

// Navegación suave ultra-optimizada
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a)return;
  e.preventDefault();
  const t=document.querySelector(a.getAttribute('href'));
  if(t){
    window.scrollTo({
      top:t.offsetTop-80,
      behavior:'smooth'
    });
  }
});

// Header scroll ultra-optimizado
const h=document.getElementById('header');
if(h){
  const u=t(()=>{
    h.classList.toggle('scrolled',window.scrollY>50);
  },16);
  window.addEventListener('scroll',u,{passive:true});
}

// Mobile nav básico
const nt=document.getElementById('nav-toggle');
const n=document.getElementById('nav');
if(nt&&n){
  nt.addEventListener('click',e=>{
    e.stopPropagation();
    const a=n.classList.toggle('active');
    nt.setAttribute('aria-expanded',a);
    document.body.style.overflow=a?'hidden':'';
  });
  
  document.addEventListener('click',e=>{
    if(!e.target.closest('#header')&&n.classList.contains('active')){
      n.classList.remove('active');
      nt.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    }
  });
}

})();