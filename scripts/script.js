// ========================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ========================================

// Configuración general de la aplicación
const CONFIG = {
  // Velocidad de scroll suave en milisegundos
  scrollSpeed: 800,
  // Offset para la navegación sticky (altura del header)
  headerOffset: 64,
  // Umbral para mostrar el botón de scroll to top
  scrollTopThreshold: 300,
  // Duración de las animaciones en milisegundos
  animationDuration: 300,
}

// Estado global de la aplicación
const APP_STATE = {
  isMenuOpen: false,
  currentSection: "inicio",
  isScrolling: false,
}

// Importación o declaración de la variable lucide
const lucide = window.lucide || {} // Simulación de declaración si no está definido

// ========================================
// UTILIDADES GENERALES
// ========================================

/**
 * Función de debounce para optimizar eventos que se disparan frecuentemente
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @param {boolean} immediate - Si ejecutar inmediatamente
 * @returns {Function} Función debounced
 */
function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Función throttle para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en milisegundos
 * @returns {Function} Función throttled
 */
function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Función para scroll suave a un elemento
 * @param {string} targetId - ID del elemento destino
 * @param {number} offset - Offset adicional (opcional)
 */
function smoothScrollTo(targetId, offset = 0) {
  const targetElement = document.getElementById(targetId)
  if (!targetElement) return

  const targetPosition = targetElement.offsetTop - CONFIG.headerOffset - offset

  // Marcar que estamos haciendo scroll programático
  APP_STATE.isScrolling = true

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  })

  // Resetear el flag después del scroll
  setTimeout(() => {
    APP_STATE.isScrolling = false
  }, CONFIG.scrollSpeed)
}

/**
 * Función para verificar si un elemento está visible en el viewport
 * @param {Element} element - Elemento a verificar
 * @param {number} threshold - Porcentaje de visibilidad requerido (0-1)
 * @returns {boolean} True si el elemento está visible
 */
function isElementVisible(element, threshold = 0.5) {
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const elementHeight = rect.height

  // Calcular cuánto del elemento está visible
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
  const visibilityRatio = visibleHeight / elementHeight

  return visibilityRatio >= threshold
}

// ========================================
// NAVEGACIÓN Y HEADER
// ========================================

/**
 * Inicializa la funcionalidad del header y navegación
 */
function initNavigation() {
  const header = document.getElementById("header")
  const navToggle = document.getElementById("nav-toggle")
  const nav = document.getElementById("nav")
  const navLinks = document.querySelectorAll(".header__nav-link")

  // Manejar el scroll para efectos del header
  const handleScroll = throttle(() => {
    if (APP_STATE.isScrolling) return

    const scrollY = window.scrollY

    // Agregar clase para header con fondo cuando se hace scroll
    if (scrollY > 50) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }

    // Actualizar navegación activa
    updateActiveNavigation()

    // Manejar botón de scroll to top
    handleScrollToTop(scrollY)
  }, 16) // ~60fps

  window.addEventListener("scroll", handleScroll)

  // Manejar clicks en enlaces de navegación
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      smoothScrollTo(targetId)

      // Cerrar menú móvil si está abierto
      if (APP_STATE.isMenuOpen) {
        toggleMobileMenu()
      }
    })
  })

  // Manejar toggle del menú móvil
  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileMenu)
  }

  // Cerrar menú móvil al hacer click fuera
  document.addEventListener("click", (e) => {
    if (APP_STATE.isMenuOpen && !nav.contains(e.target) && !navToggle.contains(e.target)) {
      toggleMobileMenu()
    }
  })

  // Cerrar menú móvil al redimensionar ventana
  window.addEventListener(
    "resize",
    debounce(() => {
      if (window.innerWidth >= 768 && APP_STATE.isMenuOpen) {
        toggleMobileMenu()
      }
    }, 250),
  )
}

/**
 * Alterna el estado del menú móvil
 */
function toggleMobileMenu() {
  const nav = document.getElementById("nav")
  const navToggle = document.getElementById("nav-toggle")

  APP_STATE.isMenuOpen = !APP_STATE.isMenuOpen

  if (APP_STATE.isMenuOpen) {
    nav.classList.add("active")
    navToggle.setAttribute("aria-expanded", "true")
    // Cambiar ícono a X
    navToggle.innerHTML = '<i data-lucide="x"></i>'
  } else {
    nav.classList.remove("active")
    navToggle.setAttribute("aria-expanded", "false")
    // Cambiar ícono a hamburguesa
    navToggle.innerHTML = '<i data-lucide="menu"></i>'
  }

  // Reinicializar iconos de Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }
}

/**
 * Actualiza la navegación activa basada en la sección visible
 */
function updateActiveNavigation() {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(".header__nav-link")

  let currentSection = ""

  // Encontrar la sección actualmente visible
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - CONFIG.headerOffset - 100
    const sectionBottom = sectionTop + section.offsetHeight
    const scrollPosition = window.scrollY

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSection = section.id
    }
  })

  // Si estamos en la parte superior, marcar inicio como activo
  if (window.scrollY < 100) {
    currentSection = "inicio"
  }

  // Actualizar enlaces activos
  if (currentSection && currentSection !== APP_STATE.currentSection) {
    APP_STATE.currentSection = currentSection

    navLinks.forEach((link) => {
      const href = link.getAttribute("href").substring(1)
      if (href === currentSection) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })
  }
}

// ========================================
// SCROLL TO TOP
// ========================================

/**
 * Inicializa el botón de scroll to top
 */
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById("scrollToTop")

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", () => {
      APP_STATE.isScrolling = true
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      setTimeout(() => {
        APP_STATE.isScrolling = false
      }, CONFIG.scrollSpeed)
    })
  }
}

/**
 * Maneja la visibilidad del botón scroll to top
 * @param {number} scrollY - Posición actual del scroll
 */
function handleScrollToTop(scrollY) {
  const scrollToTopBtn = document.getElementById("scrollToTop")

  if (scrollToTopBtn) {
    if (scrollY > CONFIG.scrollTopThreshold) {
      scrollToTopBtn.classList.add("visible")
    } else {
      scrollToTopBtn.classList.remove("visible")
    }
  }
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================

/**
 * Inicializa la funcionalidad del formulario de contacto
 */
function initContactForm() {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit)

    // Validación en tiempo real
    const inputs = contactForm.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input))
      input.addEventListener("input", () => clearFieldError(input))
    })
  }
}

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} e - Evento de submit
 */
async function handleFormSubmit(e) {
  e.preventDefault()

  const form = e.target
  const formData = new FormData(form)
  const submitBtn = form.querySelector('button[type="submit"]')

  // Validar formulario
  if (!validateForm(form)) {
    showNotification("Por favor, corrige los errores en el formulario.", "error")
    return
  }

  // Deshabilitar botón y mostrar loading
  const originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.textContent = "Enviando..."

  try {
    // Simular envío del formulario (aquí iría la lógica real de envío)
    await simulateFormSubmission(formData)

    // Mostrar mensaje de éxito
    showNotification("¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.", "success")

    // Limpiar formulario
    form.reset()
  } catch (error) {
    console.error("Error al enviar formulario:", error)
    showNotification("Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.", "error")
  } finally {
    // Restaurar botón
    submitBtn.disabled = false
    submitBtn.textContent = originalText
  }
}

/**
 * Simula el envío del formulario (reemplazar con lógica real)
 * @param {FormData} formData - Datos del formulario
 * @returns {Promise} Promise que resuelve después de 2 segundos
 */
function simulateFormSubmission(formData) {
  return new Promise((resolve, reject) => {
    // Simular delay de red
    setTimeout(() => {
      // Simular éxito (90% de las veces)
      if (Math.random() > 0.1) {
        resolve()
      } else {
        reject(new Error("Error simulado"))
      }
    }, 2000)
  })
}

/**
 * Valida todo el formulario
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {boolean} True si el formulario es válido
 */
function validateForm(form) {
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

/**
 * Valida un campo individual
 * @param {HTMLElement} field - Campo a validar
 * @returns {boolean} True si el campo es válido
 */
function validateField(field) {
  const value = field.value.trim()
  const fieldType = field.type
  const fieldName = field.name

  // Limpiar errores previos
  clearFieldError(field)

  // Validar campos requeridos
  if (field.hasAttribute("required") && !value) {
    showFieldError(field, "Este campo es obligatorio.")
    return false
  }

  // Validaciones específicas por tipo
  if (value) {
    switch (fieldType) {
      case "email":
        if (!isValidEmail(value)) {
          showFieldError(field, "Por favor, ingresa un email válido.")
          return false
        }
        break

      case "tel":
        if (!isValidPhone(value)) {
          showFieldError(field, "Por favor, ingresa un teléfono válido.")
          return false
        }
        break
    }

    // Validaciones específicas por nombre
    switch (fieldName) {
      case "name":
        if (value.length < 2) {
          showFieldError(field, "El nombre debe tener al menos 2 caracteres.")
          return false
        }
        break

      case "company":
        if (value.length < 2) {
          showFieldError(field, "El nombre de la empresa debe tener al menos 2 caracteres.")
          return false
        }
        break
    }
  }

  return true
}

/**
 * Muestra un error en un campo específico
 * @param {HTMLElement} field - Campo con error
 * @param {string} message - Mensaje de error
 */
function showFieldError(field, message) {
  field.classList.add("error")

  // Crear o actualizar mensaje de error
  let errorElement = field.parentNode.querySelector(".field-error")
  if (!errorElement) {
    errorElement = document.createElement("span")
    errorElement.className = "field-error"
    field.parentNode.appendChild(errorElement)
  }

  errorElement.textContent = message
}

/**
 * Limpia el error de un campo
 * @param {HTMLElement} field - Campo a limpiar
 */
function clearFieldError(field) {
  field.classList.remove("error")

  const errorElement = field.parentNode.querySelector(".field-error")
  if (errorElement) {
    errorElement.remove()
  }
}

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si un teléfono es válido (formato venezolano)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
function isValidPhone(phone) {
  // Remover espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-$$$$]/g, "")

  // Validar formato venezolano: +58XXXXXXXXXX o 58XXXXXXXXXX o 0XXXXXXXXXX
  const phoneRegex = /^(\+?58|0)?[2-9]\d{9}$/
  return phoneRegex.test(cleanPhone)
}

// ========================================
// NOTIFICACIONES
// ========================================

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'info')
 * @param {number} duration - Duración en milisegundos (opcional)
 */
function showNotification(message, type = "info", duration = 5000) {
  // Crear elemento de notificación
  const notification = document.createElement("div")
  notification.className = `notification notification--${type}`
  notification.innerHTML = `
        <div class="notification__content">
            <span class="notification__message">${message}</span>
            <button class="notification__close" aria-label="Cerrar notificación">
                <i data-lucide="x"></i>
            </button>
        </div>
    `

  // Agregar al DOM
  document.body.appendChild(notification)

  // Inicializar iconos de Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  // Mostrar notificación con animación
  setTimeout(() => {
    notification.classList.add("notification--visible")
  }, 100)

  // Manejar cierre manual
  const closeBtn = notification.querySelector(".notification__close")
  closeBtn.addEventListener("click", () => {
    hideNotification(notification)
  })

  // Auto-ocultar después del tiempo especificado
  if (duration > 0) {
    setTimeout(() => {
      hideNotification(notification)
    }, duration)
  }
}

/**
 * Oculta una notificación
 * @param {HTMLElement} notification - Elemento de notificación a ocultar
 */
function hideNotification(notification) {
  notification.classList.remove("notification--visible")

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, CONFIG.animationDuration)
}

// ========================================
// ANIMACIONES Y EFECTOS VISUALES
// ========================================

/**
 * Inicializa las animaciones de scroll
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll("[data-animate]")

  // Crear observer para animaciones
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target
          const animationType = element.dataset.animate

          element.classList.add(`animate-${animationType}`)
          observer.unobserve(element)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  // Observar elementos
  animatedElements.forEach((element) => {
    observer.observe(element)
  })
}

/**
 * Inicializa efectos de hover en cards
 */
function initCardEffects() {
  const cards = document.querySelectorAll(".impact-card, .pillar-card, .partner-card")

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)"
    })
  })
}

// ========================================
// UTILIDADES DE FECHA
// ========================================

/**
 * Actualiza el año actual en el footer
 */
function updateCurrentYear() {
  const yearElement = document.getElementById("currentYear")
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear()
  }
}

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================

/**
 * Inicializa todas las funcionalidades cuando el DOM está listo
 */
function initApp() {
  console.log("🚀 Inicializando Agrolinx Website...")

  try {
    // Inicializar componentes principales
    initNavigation()
    initScrollToTop()
    initContactForm()
    initScrollAnimations()
    initCardEffects()
    updateCurrentYear()

    // Inicializar iconos de Lucide
    if (typeof lucide !== "undefined") {
      lucide.createIcons()
      console.log("✅ Iconos de Lucide inicializados")
    }

    console.log("✅ Agrolinx Website inicializado correctamente")
  } catch (error) {
    console.error("❌ Error al inicializar la aplicación:", error)
  }
}

// ========================================
// EVENT LISTENERS PRINCIPALES
// ========================================

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp)
} else {
  initApp()
}

// Manejar errores globales
window.addEventListener("error", (e) => {
  console.error("Error global capturado:", e.error)
})

// Manejar promesas rechazadas
window.addEventListener("unhandledrejection", (e) => {
  console.error("Promesa rechazada no manejada:", e.reason)
})

// ========================================
// ESTILOS ADICIONALES PARA NOTIFICACIONES
// ========================================

// Agregar estilos CSS para notificaciones dinámicamente
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        z-index: 10000;
        border-left: 4px solid;
    }
    
    .notification--visible {
        transform: translateX(0);
    }
    
    .notification--success {
        border-left-color: #34d399;
    }
    
    .notification--error {
        border-left-color: #f87171;
    }
    
    .notification--info {
        border-left-color: #60a5fa;
    }
    
    .notification__content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 16px;
        gap: 12px;
    }
    
    .notification__message {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        color: #374151;
    }
    
    .notification__close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: #6b7280;
        transition: background-color 0.2s;
    }
    
    .notification__close:hover {
        background-color: #f3f4f6;
    }
    
    .field-error {
        display: block;
        font-size: 12px;
        color: #ef4444;
        margin-top: 4px;
    }
    
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    @media (max-width: 640px) {
        .notification {
            left: 20px;
            right: 20px;
            max-width: none;
        }
    }
`

// Agregar estilos al head
const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)

// Exportar funciones principales para uso externo si es necesario
window.AgrolinxApp = {
  smoothScrollTo,
  showNotification,
  CONFIG,
  APP_STATE,
}
