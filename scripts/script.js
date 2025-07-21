// ========================================
// AGROLINX - JavaScript Principal
// ========================================

// Gallery data
const galleryImages = [
  {
    id: 1,
    src: "imag/ima1.webp",
    alt: "Granja avícola moderna",
    title: "Granja Avícola Moderna",
    category: "avicola"
  },
  {
    id: 2,
    src: "imag/ima3.webp",
    alt: "Acompañamiento técnico",
    title: "Acompañamiento Técnico",
    category: "servicios"
  },
  {
    id: 3,
    src: "imag/ima4.webp",
    alt: "Granja porcina",
    title: "Instalaciones Porcinas",
    category: "porcina"
  },
  {
    id: 4,
    src: "imag/ima5.webp",
    alt: "Planta de alimentos",
    title: "Planta de Alimentos",
    category: "procesamiento"
  },
  {
    id: 5,
    src: "imag/ima6.webp",
    alt: "Laboratorio de calidad",
    title: "Control de Calidad",
    category: "laboratorio"
  },
  {
    id: 6,
    src: "imag/ima7.webp",
    alt: "Equipo veterinario",
    title: "Equipo Veterinario",
    category: "servicios"
  }
];

// Global variables
let currentImageIndex = 0;
let filteredImages = [...galleryImages];
let isLightboxOpen = false;

// ========================================
// INTERSECTION OBSERVER - Animaciones
// ========================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // Una vez animado, dejar de observar para mejor rendimiento
      animationObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// ========================================
// HEADER - Scroll behavior & Mobile Navigation
// ========================================
function initHeader() {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');

  // Efecto de scroll en header
  window.addEventListener('scroll', utils.throttle(() => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, 10));

  // Navegación móvil
  if (navToggle && nav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', nav.classList.contains('active'));
      
      // Cambiar icono del botón hamburguesa
      const icon = navToggle.querySelector('i');
      if (nav.classList.contains('active')) {
        icon.setAttribute('data-lucide', 'x');
      } else {
        icon.setAttribute('data-lucide', 'menu');
      }
      
      // Reinicializar iconos de Lucide
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && nav.classList.contains('active')) {
        nav.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        
        const icon = navToggle.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    });

    // Cerrar menú al cambiar tamaño de ventana
    window.addEventListener('resize', utils.debounce(() => {
      if (window.innerWidth > 768 && nav.classList.contains('active')) {
        nav.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        
        const icon = navToggle.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    }, 250));
  }

  // Smooth scroll para links de navegación
  const navLinks = document.querySelectorAll('.header__nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Cerrar menú móvil si está abierto
        if (nav && nav.classList.contains('active')) {
          nav.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          
          const icon = navToggle.querySelector('i');
          icon.setAttribute('data-lucide', 'menu');
          
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }

        // Calcular offset según el tamaño de pantalla
        const headerHeight = window.innerWidth <= 768 ? 56 : 64;
        const offsetTop = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========================================
// GALLERY - Funcionalidad completa
// ========================================
function initGallery() {
  renderGallery();
  initGalleryFilters();
  initLightbox();
}

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '';

  filteredImages.forEach((image, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery__item animate-on-scroll';
    galleryItem.style.animationDelay = `${index * 0.1}s`;
    galleryItem.dataset.category = image.category;
    galleryItem.dataset.index = index;

    galleryItem.innerHTML = `
      <img 
        src="${image.src}" 
        alt="${image.alt}"
        class="gallery__item-image"
        loading="lazy"
      >
      <div class="gallery__item-overlay">
        <h3 class="gallery__item-title">${image.title}</h3>
        <p class="gallery__item-category">${getCategoryLabel(image.category)}</p>
      </div>
      <div class="gallery__item-zoom">
        <i data-lucide="zoom-in"></i>
      </div>
    `;

    galleryItem.addEventListener('click', () => openLightbox(index));
    galleryGrid.appendChild(galleryItem);

    // Observar para animaciones
    animationObserver.observe(galleryItem);
  });

  // Reinicializar iconos de Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function getCategoryLabel(category) {
  const labels = {
    'avicola': 'Avícola',
    'porcina': 'Porcina',
    'servicios': 'Servicios',
    'procesamiento': 'Procesamiento',
    'laboratorio': 'Laboratorio'
  };
  return labels[category] || category;
}

function initGalleryFilters() {
  const filterButtons = document.querySelectorAll('.gallery__filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Actualizar botones activos
      filterButtons.forEach(btn => btn.classList.remove('gallery__filter-btn--active'));
      button.classList.add('gallery__filter-btn--active');

      const category = button.dataset.category;
      filterGallery(category);
    });
  });
}

function filterGallery(category) {
  if (category === 'all') {
    filteredImages = [...galleryImages];
  } else {
    filteredImages = galleryImages.filter(img => img.category === category);
  }

  // Animar salida de elementos actuales
  const currentItems = document.querySelectorAll('.gallery__item');
  currentItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
    }, index * 50);
  });

  // Renderizar nueva galería después de la animación
  setTimeout(() => {
    renderGallery();
  }, currentItems.length * 50 + 200);
}

// ========================================
// LIGHTBOX - Funcionalidad completa
// ========================================
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxBackdrop = lightbox?.querySelector('.lightbox__backdrop');

  if (!lightbox) return;

  // Cerrar lightbox
  [lightboxClose, lightboxBackdrop].forEach(element => {
    element?.addEventListener('click', closeLightbox);
  });

  // Navegación
  lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext?.addEventListener('click', () => navigateLightbox(1));

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!isLightboxOpen) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateLightbox(-1);
        break;
      case 'ArrowRight':
        navigateLightbox(1);
        break;
    }
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  currentImageIndex = index;
  isLightboxOpen = true;

  const image = filteredImages[index];
  
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.innerHTML = `
    <h3>${image.title}</h3>
    <p>${getCategoryLabel(image.category)}</p>
  `;

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Actualizar visibilidad de botones de navegación
  updateLightboxNavigation();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  isLightboxOpen = false;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  const newIndex = currentImageIndex + direction;
  
  if (newIndex >= 0 && newIndex < filteredImages.length) {
    openLightbox(newIndex);
  }
}

function updateLightboxNavigation() {
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (lightboxPrev) {
    lightboxPrev.style.display = currentImageIndex > 0 ? 'block' : 'none';
  }
  
  if (lightboxNext) {
    lightboxNext.style.display = currentImageIndex < filteredImages.length - 1 ? 'block' : 'none';
  }
}

// ========================================
// SCROLL TO TOP
// ========================================
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (!scrollToTopBtn) return;

  // Mostrar/ocultar botón según scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  });

  // Funcionalidad del botón
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Validación básica
    if (!data.name || !data.company || !data.email || !data.phone) {
      showNotification('Por favor completa todos los campos obligatorios.', 'error');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showNotification('Por favor ingresa un email válido.', 'error');
      return;
    }

    // Simular envío (aquí conectarías con tu backend)
    showNotification('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
    
    // Limpiar formulario
    contactForm.reset();
  });
}

// ========================================
// NOTIFICACIONES
// ========================================
function showNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-error)' : 'var(--color-info)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    max-width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

// ========================================
// STATS COUNTER - Animación de números
// ========================================
function initStatsCounter() {
  const statsNumbers = document.querySelectorAll('.stats__number');
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  });

  statsNumbers.forEach(number => {
    statsObserver.observe(number);
  });
}

function animateNumber(element) {
  const finalNumber = element.textContent.replace(/[^\d]/g, '');
  const duration = 2000;
  const increment = finalNumber / (duration / 16);
  let currentNumber = 0;

  const timer = setInterval(() => {
    currentNumber += increment;
    if (currentNumber >= finalNumber) {
      clearInterval(timer);
      element.textContent = element.textContent; // Restaurar formato original
    } else {
      element.textContent = Math.floor(currentNumber) + (element.textContent.includes('+') ? '+' : '') + (element.textContent.includes('%') ? '%' : '');
    }
  }, 16);
}

// ========================================
// SMOOTH SCROLL - Enlaces internos
// ========================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========================================
// FOOTER - Año actual
// ========================================
function updateCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// ========================================
// ANIMACIONES EN SCROLL - Setup general
// ========================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  animatedElements.forEach(element => {
    animationObserver.observe(element);
  });

  // También observar elementos con clases de animación específicas
  const specificAnimations = document.querySelectorAll('.animate-slide-left, .animate-slide-right, .animate-slide-up, .animate-fade-in');
  specificAnimations.forEach(element => {
    element.classList.add('animate-on-scroll');
    animationObserver.observe(element);
  });
}

// ========================================
// LAZY LOADING - Imágenes
// ========================================
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// ========================================
// PERFORMANCE - Optimizaciones
// ========================================
function initPerformanceOptimizations() {
  // Precargar imágenes críticas
  const criticalImages = [
    'imag/ima1.webp'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Optimizar scroll events
  let scrollTimeout;
  const originalScrollHandler = window.onscroll;
  
  window.onscroll = function() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(function() {
      if (originalScrollHandler) {
        originalScrollHandler();
      }
    }, 10);
  };
}

// ========================================
// SCROLL PROGRESS INDICATOR
// ========================================
function initScrollProgress() {
  // Crear indicador de progreso
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-indicator';
  document.body.appendChild(progressBar);

  // Actualizar progreso en scroll
  window.addEventListener('scroll', utils.throttle(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    
    progressBar.style.transform = `scaleX(${scrollPercent})`;
  }, 10));
}

// ========================================
// ENHANCED ANIMATIONS
// ========================================
function initEnhancedAnimations() {
  // Agregar efectos de ripple a botones
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.classList.add('ripple-effect');
  });

  // Agregar hover interactivo a tarjetas
  const cards = document.querySelectorAll('.impact-card, .partner-card, .pillar-card');
  cards.forEach(card => {
    card.classList.add('interactive-hover');
  });

  // Animaciones de entrada más sofisticadas
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const enhancedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Aplicar diferentes animaciones según la posición
        if (element.classList.contains('animate-slide-left')) {
          element.style.animation = 'slideInFromLeft 0.8s ease-out forwards';
        } else if (element.classList.contains('animate-slide-right')) {
          element.style.animation = 'slideInFromRight 0.8s ease-out forwards';
        } else if (element.classList.contains('animate-slide-up')) {
          element.style.animation = 'slideInFromBottom 0.8s ease-out forwards';
        } else if (element.classList.contains('animate-fade-in')) {
          element.style.animation = 'zoomIn 0.6s ease-out forwards';
        }
        
        enhancedObserver.unobserve(element);
      }
    });
  }, observerOptions);

  // Observar elementos con animaciones
  const animatedElements = document.querySelectorAll('.animate-slide-left, .animate-slide-right, .animate-slide-up, .animate-fade-in');
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    enhancedObserver.observe(element);
  });
}

// ========================================
// PARTICLE SYSTEM
// ========================================
function initParticleSystem() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Crear partículas adicionales dinámicamente
  for (let i = 7; i <= 12; i++) {
    const particle = document.createElement('div');
    particle.className = `particle particle--${i}`;
    
    // Propiedades aleatorias
    const size = Math.random() * 10 + 4;
    const colors = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-secondary)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const duration = Math.random() * 5 + 6;
    const delay = Math.random() * 3;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      top: ${top}%;
      left: ${left}%;
      animation: float ${duration}s ease-in-out infinite;
      animation-delay: ${delay}s;
      opacity: 0.4;
    `;

    const particlesContainer = hero.querySelector('.hero__particles');
    if (particlesContainer) {
      particlesContainer.appendChild(particle);
    }
  }
}

// ========================================
// ENHANCED STATS COUNTER
// ========================================
function initEnhancedStatsCounter() {
  const statsNumbers = document.querySelectorAll('.stats__number');
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumberWithEffect(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  });

  statsNumbers.forEach(number => {
    statsObserver.observe(number);
  });
}

function animateNumberWithEffect(element) {
  const finalText = element.textContent;
  const finalNumber = parseInt(finalText.replace(/[^\d]/g, ''));
  const hasPlus = finalText.includes('+');
  const hasPercent = finalText.includes('%');
  
  const duration = 2000;
  const increment = finalNumber / (duration / 16);
  let currentNumber = 0;

  // Efecto de pulso durante la animación
  element.style.transform = 'scale(1.1)';
  element.style.transition = 'transform 0.3s ease';

  const timer = setInterval(() => {
    currentNumber += increment;
    if (currentNumber >= finalNumber) {
      clearInterval(timer);
      element.textContent = finalNumber + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
      element.style.transform = 'scale(1)';
    } else {
      element.textContent = Math.floor(currentNumber) + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
    }
  }, 16);
}

// ========================================
// INTERACTIVE ELEMENTS
// ========================================
function initInteractiveElements() {
  // Efecto de hover en las tarjetas de impacto
  const impactCards = document.querySelectorAll('.impact-card');
  impactCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.02)';
      card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '';
    });
  });

  // Efecto de parallax suave en el hero
  window.addEventListener('scroll', utils.throttle(() => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const particles = document.querySelector('.hero__particles');
    
    if (hero && particles) {
      particles.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, 10));
}

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar componentes principales
  initHeader();
  initGallery();
  initScrollToTop();
  initContactForm();
  initEnhancedStatsCounter();
  initSmoothScroll();
  initScrollAnimations();
  initLazyLoading();
  initPerformanceOptimizations();
  updateCurrentYear();
  
  // Nuevas funcionalidades dinámicas
  initScrollProgress();
  initEnhancedAnimations();
  initParticleSystem();
  initInteractiveElements();
  
  // Funcionalidades responsive
  initResponsiveUtilities();
  initResponsiveAdjustments();
  initTouchGestures();
  initPerformanceMonitoring();

  console.log('🌱 Agrolinx - Sitio web responsive cargado exitosamente');
});

// ========================================
// ERROR HANDLING - Manejo global de errores
// ========================================
window.addEventListener('error', function(e) {
  console.error('Error en Agrolinx:', e.error);
  // En producción, aquí enviarías el error a un servicio de tracking
});

// ========================================
// RESPONSIVE UTILITIES
// ========================================
function initResponsiveUtilities() {
  // Detectar tipo de dispositivo
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Agregar clases al body para CSS específico
  document.body.classList.toggle('is-mobile', isMobile);
  document.body.classList.toggle('is-tablet', isTablet);
  document.body.classList.toggle('is-touch', isTouch);

  // Optimizaciones para móviles
  if (isMobile) {
    // Reducir partículas en móviles
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
      if (index > 3) particle.style.display = 'none';
    });

    // Simplificar animaciones
    document.documentElement.style.setProperty('--transition-normal', '0.2s ease-in-out');
    document.documentElement.style.setProperty('--transition-slow', '0.3s ease-in-out');
  }

  // Manejar cambios de orientación
  window.addEventListener('orientationchange', utils.debounce(() => {
    location.reload();
  }, 500));

  // Manejar redimensionamiento de ventana
  window.addEventListener('resize', utils.debounce(() => {
    const newIsMobile = window.innerWidth <= 768;
    const newIsTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    document.body.classList.toggle('is-mobile', newIsMobile);
    document.body.classList.toggle('is-tablet', newIsTablet);
    
    // Reajustar elementos si es necesario
    if (newIsMobile !== isMobile) {
      initResponsiveAdjustments();
    }
  }, 250));
}

// ========================================
// RESPONSIVE ADJUSTMENTS
// ========================================
function initResponsiveAdjustments() {
  const isMobile = window.innerWidth <= 768;
  
  // Ajustar altura de imágenes en móviles
  if (isMobile) {
    const images = document.querySelectorAll('.hero__image, .about__image, .impact-card__image');
    images.forEach(img => {
      img.style.height = 'auto';
      img.style.minHeight = '200px';
    });

    // Ajustar espaciado de secciones
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.style.paddingTop = '3rem';
      section.style.paddingBottom = '3rem';
    });
  }
}

// ========================================
// TOUCH GESTURES
// ========================================
function initTouchGestures() {
  if (!('ontouchstart' in window)) return;

  let startX, startY, endX, endY;

  // Gestos para la galería lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    lightbox.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Swipe horizontal para navegar
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          navigateLightbox(-1); // Swipe right = anterior
        } else {
          navigateLightbox(1);  // Swipe left = siguiente
        }
      }
      
      // Swipe vertical hacia abajo para cerrar
      if (deltaY > 100 && Math.abs(deltaX) < 50) {
        closeLightbox();
      }
    });
  }

  // Prevenir zoom en inputs en iOS
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name=viewport]');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }
    });

    input.addEventListener('blur', () => {
      if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name=viewport]');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    });
  });
}

// ========================================
// PERFORMANCE MONITORING
// ========================================
function initPerformanceMonitoring() {
  // Monitorear FPS en dispositivos móviles
  if (window.innerWidth <= 768) {
    let lastTime = performance.now();
    let frameCount = 0;
    
    function checkFPS() {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Si FPS es bajo, reducir animaciones
        if (fps < 30) {
          document.body.classList.add('low-performance');
          // Desactivar partículas
          const particles = document.querySelectorAll('.particle');
          particles.forEach(particle => particle.style.display = 'none');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkFPS);
    }
    
    requestAnimationFrame(checkFPS);
  }
}

// ========================================
// UTILS - Funciones auxiliares
// ========================================
const utils = {
  // Debounce function para optimizar eventos
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function para scroll events
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Validar email
  isValidEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Formatear números
  formatNumber: function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  // Detectar dispositivo móvil
  isMobile: function() {
    return window.innerWidth <= 768;
  },

  // Detectar dispositivo táctil
  isTouch: function() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Obtener breakpoint actual
  getCurrentBreakpoint: function() {
    const width = window.innerWidth;
    if (width <= 640) return 'xs';
    if (width <= 768) return 'sm';
    if (width <= 1024) return 'md';
    if (width <= 1280) return 'lg';
    if (width <= 1536) return 'xl';
    return '2xl';
  }

  
};

// Exportar utils para uso global
window.AgrolinxUtils = utils;