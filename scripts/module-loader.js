// Cargador de Módulos Optimizado - Carga bajo demanda
class ModuleLoader {
  constructor() {
    this.loadedModules = new Set();
    this.observers = new Map();
  }

  // Cargar módulo solo cuando sea necesario
  async loadModule(moduleName, condition) {
    if (this.loadedModules.has(moduleName)) return;

    try {
      switch (moduleName) {
        case 'gallery':
          if (condition()) {
            const { GalleryModule } = await import('./gallery-module.js');
            const gallery = new GalleryModule();
            gallery.init();
            this.loadedModules.add('gallery');
          }
          break;

        case 'form':
          if (condition()) {
            const { FormModule } = await import('./form-module.js');
            const form = new FormModule();
            await form.init();
            this.loadedModules.add('form');
          }
          break;

        case 'animations':
          if (condition()) {
            this.initScrollAnimations();
            this.loadedModules.add('animations');
          }
          break;
      }
    } catch (error) {
      console.warn(`Error loading module ${moduleName}:`, error);
    }
  }

  // Configurar observadores para carga condicional
  setupObservers() {
    // Cargar galería cuando sea visible
    this.observeElement('#galeria', () => {
      this.loadModule('gallery', () => document.getElementById('carouselTrack'));
    });

    // Cargar formulario cuando sea visible
    this.observeElement('#contacto', () => {
      this.loadModule('form', () => document.getElementById('contactForm'));
    });

    // Cargar animaciones después de un delay
    setTimeout(() => {
      this.loadModule('animations', () => true);
    }, 1000);
  }

  observeElement(selector, callback) {
    const element = document.querySelector(selector);
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    }, { rootMargin: '100px' });

    observer.observe(element);
    this.observers.set(selector, observer);
  }

  // Animaciones de scroll optimizadas
  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, index * 50); // Stagger animations
          animationObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe animated elements
    document.querySelectorAll('.animate-on-scroll, .animate-slide-from-left, .animate-slide-from-right, .animate-slide-from-bottom')
      .forEach(el => animationObserver.observe(el));
  }

  // Scroll to top optimizado
  initScrollToTop() {
    let scrollBtn = document.getElementById('scrollToTop');
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.id = 'scrollToTop';
      scrollBtn.innerHTML = '<i data-lucide="chevron-up"></i>';
      scrollBtn.className = 'scroll-to-top';
      scrollBtn.setAttribute('aria-label', 'Volver arriba');
      document.body.appendChild(scrollBtn);
    }

    let isVisible = false;
    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 300;
      if (shouldShow !== isVisible) {
        scrollBtn.classList.toggle('visible', shouldShow);
        isVisible = shouldShow;
      }
    };

    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Actualizar año actual
  updateCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // Inicializar iconos cuando estén disponibles
  initIcons() {
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons();
      } catch (error) {
        console.warn('Error initializing icons:', error);
      }
    }
  }

  // Inicialización principal
  init() {
    // Funcionalidades inmediatas
    this.updateCurrentYear();
    this.initScrollToTop();

    // Configurar observadores para carga bajo demanda
    this.setupObservers();

    // Inicializar iconos cuando Lucide esté disponible
    if (typeof lucide !== 'undefined') {
      this.initIcons();
    } else {
      // Esperar a que Lucide se cargue
      const checkLucide = () => {
        if (typeof lucide !== 'undefined') {
          this.initIcons();
        } else {
          setTimeout(checkLucide, 100);
        }
      };
      checkLucide();
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const loader = new ModuleLoader();
    loader.init();
  });
} else {
  const loader = new ModuleLoader();
  loader.init();
}