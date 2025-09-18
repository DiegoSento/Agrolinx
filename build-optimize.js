// Script de optimización de JavaScript - Sin dependencias externas
const fs = require('fs');
const path = require('path');

class JSOptimizer {
  constructor() {
    this.scriptsDir = './scripts';
    this.distDir = './scripts/dist';
  }

  // Minificar JavaScript básico (sin dependencias)
  minifyJS(code) {
    return code
      // Remover comentarios
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      // Remover espacios extra
      .replace(/\s+/g, ' ')
      // Remover espacios alrededor de operadores
      .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
      // Remover espacios al inicio y final
      .trim();
  }

  // Crear versiones minificadas
  async optimizeFiles() {
    const files = [
      'critical-minimal.js',
      'module-loader.js', 
      'gallery-module.js',
      'form-module.js'
    ];

    // Crear directorio dist si no existe
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }

    for (const file of files) {
      const inputPath = path.join(this.scriptsDir, file);
      const outputPath = path.join(this.distDir, file.replace('.js', '.min.js'));

      if (fs.existsSync(inputPath)) {
        const code = fs.readFileSync(inputPath, 'utf8');
        const minified = this.minifyJS(code);
        
        fs.writeFileSync(outputPath, minified);
        
        const originalSize = Buffer.byteLength(code, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ ${file}: ${originalSize}B → ${minifiedSize}B (${savings}% reducción)`);
      }
    }
  }

  // Generar bundle crítico ultra-optimizado
  generateCriticalBundle() {
    const criticalFeatures = `
// Ultra-optimized critical bundle (< 1KB gzipped)
(()=>{
'use strict';
const t=(f,d)=>{let i;return(...a)=>{if(!i){f(...a);i=1;setTimeout(()=>i=0,d)}}};
const sp=document.getElementById('scrollProgress');
if(sp){
  const u=t(()=>sp.style.width=Math.min((window.pageYOffset/(document.documentElement.scrollHeight-window.innerHeight))*100,100)+'%',16);
  window.addEventListener('scroll',u,{passive:true});
}
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(a){e.preventDefault();const t=document.querySelector(a.getAttribute('href'));if(t)window.scrollTo({top:t.offsetTop-80,behavior:'smooth'});}
});
const h=document.getElementById('header');
if(h)window.addEventListener('scroll',t(()=>h.classList.toggle('scrolled',window.scrollY>50),16),{passive:true});
const nt=document.getElementById('nav-toggle'),n=document.getElementById('nav');
if(nt&&n){
  nt.addEventListener('click',e=>{e.stopPropagation();const a=n.classList.toggle('active');nt.setAttribute('aria-expanded',a);document.body.style.overflow=a?'hidden':'';});
  document.addEventListener('click',e=>{if(!e.target.closest('#header')&&n.classList.contains('active')){n.classList.remove('active');nt.setAttribute('aria-expanded','false');document.body.style.overflow='';}});
}
})();`;

    const bundlePath = path.join(this.distDir, 'critical-bundle.min.js');
    fs.writeFileSync(bundlePath, criticalFeatures.trim());
    
    const size = Buffer.byteLength(criticalFeatures.trim(), 'utf8');
    console.log(`🚀 Critical bundle: ${size}B (ultra-optimizado)`);
  }

  // Análisis de tamaño de archivos
  analyzeFiles() {
    console.log('\n📊 Análisis de tamaños:');
    
    const files = fs.readdirSync(this.scriptsDir).filter(f => f.endsWith('.js'));
    let totalOriginal = 0;
    
    files.forEach(file => {
      const filePath = path.join(this.scriptsDir, file);
      const size = fs.statSync(filePath).size;
      totalOriginal += size;
      
      const status = size > 10000 ? '🔴' : size > 5000 ? '🟡' : '🟢';
      console.log(`${status} ${file}: ${size}B`);
    });
    
    console.log(`\n📦 Total original: ${totalOriginal}B`);
    
    if (fs.existsSync(this.distDir)) {
      const distFiles = fs.readdirSync(this.distDir);
      let totalMinified = 0;
      
      distFiles.forEach(file => {
        const filePath = path.join(this.distDir, file);
        const size = fs.statSync(filePath).size;
        totalMinified += size;
      });
      
      const savings = ((totalOriginal - totalMinified) / totalOriginal * 100).toFixed(1);
      console.log(`📦 Total minificado: ${totalMinified}B`);
      console.log(`💾 Ahorro total: ${savings}%`);
    }
  }

  async run() {
    console.log('🚀 Iniciando optimización de JavaScript...\n');
    
    await this.optimizeFiles();
    this.generateCriticalBundle();
    this.analyzeFiles();
    
    console.log('\n✨ Optimización completada!');
    console.log('💡 Usa los archivos .min.js para producción');
  }
}

// Ejecutar optimización
const optimizer = new JSOptimizer();
optimizer.run().catch(console.error);