// ========================================
// AGROLINX - JavaScript Completamente Nuevo
// ========================================

// ========================================
// CONFIGURACIÓN Y DATOS
// ========================================
const GALLERY_IMAGES = [
  {
    id: 1,
    src: "/imag/granja4.webp",
    alt: "Granja avícola moderna en Venezuela - Tecnología Agrolinx",
    title: "Granja Avícola Moderna",
    description: "Instalaciones avícolas de última generación con tecnología Agrolinx",
    category: "avicola",
  },
  {
    id: 2,
    src: "/imag/granja6.webp",
    alt: "Granja avícola moderna",
    title: "Instalaciones Avícolas",
    description: "Sistemas de producción avícola optimizados",
    category: "avicola",
  },
  {
    id: 3,
    src: "/imag/aves4.webp",
    alt: "Acompañamiento técnico",
    title: "Acompañamiento Técnico",
    description: "Nuestro equipo brindando asesoría especializada",
    category: "servicios",
  },
  {
    id: 4,
    src: "/imag/operador1.webp",
    alt: "Granja porcina",
    title: "Instalaciones Porcinas",
    description: "Producción porcina con estándares internacionales",
    category: "porcina",
  },
  {
    id: 5,
    src: "/imag/granja1.webp",
    alt: "Planta de alimentos",
    title: "Planta de Alimentos",
    description: "Procesamiento de alimentos balanceados",
    category: "procesamiento",
  },
  {
    id: 6,
    src: "/imag/a.webp",
    alt: "Laboratorio de calidad",
    title: "Control de Calidad",
    description: "Análisis y control de calidad de productos",
    category: "laboratorio",
  },
  {
    id: 7,
    src: "/imag/aa.webp",
    alt: "Equipo veterinario",
    title: "Equipo Veterinario",
    description: "Profesionales especializados en salud animal",
    category: "servicios",
  },
  {
    id: 8,
    src: "/imag/b.webp",
    alt: "Equipo Agrolinx en granja porcina - Acompañamiento técnico",
    title: "Equipo Técnico Agrolinx",
    description: "Nuestro equipo trabajando en campo",
    category: "servicios",
  },
]

// Variables globales
let currentSlide = 0
let isLightboxOpen = false

// ========================================
// UTILIDADES
// ========================================
const utils = {
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  throttle: (func, limit) => {
    let inThrottle
    return function () {
      const args = arguments
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },
}

// ========================================
// HEADER Y NAVEGACIÓN
// ========================================
function initHeader() {
  const header = document.getElementById("header")
  const navToggle = document.getElementById("nav-toggle")
  const nav = document.getElementById("nav")

  if (!header || !navToggle || !nav) return

  let lastScrollY = window.scrollY

  // Scroll behavior
  window.addEventListener(
    "scroll",
    utils.throttle(() => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 50) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }

      if (window.innerWidth <= 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          header.style.transform = "translateY(-100%)"
        } else {
          header.style.transform = "translateY(0)"
        }
      }

      lastScrollY = currentScrollY
    }, 10),
  )

  // Mobile navigation
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation()
    const isActive = nav.classList.toggle("active")
    navToggle.setAttribute("aria-expanded", isActive)

    if (isActive) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  })

  // Close nav on outside click
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target) && nav.classList.contains("active")) {
      closeNavMenu()
    }
  })

  // Close nav on resize
  window.addEventListener(
    "resize",
    utils.debounce(() => {
      if (window.innerWidth > 768 && nav.classList.contains("active")) {
        closeNavMenu()
      }
    }, 250),
  )

  function closeNavMenu() {
    nav.classList.remove("active")
    navToggle.setAttribute("aria-expanded", "false")
    document.body.style.overflow = ""
  }

  // Smooth scroll navigation
  const navLinks = document.querySelectorAll(".header__nav-link, .footer__link")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href")
      if (href && href.startsWith("#")) {
        e.preventDefault()
        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)

        if (targetElement) {
          if (nav.classList.contains("active")) {
            closeNavMenu()
          }

          const headerHeight = window.innerWidth <= 768 ? 56 : 80
          const offsetTop = targetElement.offsetTop - headerHeight

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          })
        }
      }
    })
  })
}

// ========================================
// SCROLL PROGRESS BAR
// ========================================
function initScrollProgress() {
  let scrollProgress = document.getElementById("scrollProgress")
  if (!scrollProgress) {
    scrollProgress = document.createElement("div")
    scrollProgress.id = "scrollProgress"
    scrollProgress.className = "scroll-progress"
    document.body.insertBefore(scrollProgress, document.body.firstChild)
  }

  window.addEventListener(
    "scroll",
    utils.throttle(() => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      scrollProgress.style.width = scrollPercent + "%"
    }, 10),
  )
}

// ========================================
// GALERÍA - COMPLETAMENTE NUEVA
// ========================================
function initGallery() {
  console.log("🎨 Inicializando galería...")

  if (GALLERY_IMAGES.length === 0) {
    console.error("❌ No hay imágenes para la galería")
    return
  }

  renderGallery()
  initGalleryControls()
  initLightbox()

  console.log(`✅ Galería inicializada con ${GALLERY_IMAGES.length} imágenes`)
}

function renderGallery() {
  const track = document.getElementById("carouselTrack")
  const thumbnails = document.getElementById("galleryThumbnails")
  const indicators = document.getElementById("carouselIndicators")

  if (!track) {
    console.error("❌ No se encontró el track del carrusel")
    return
  }

  // Limpiar contenedores
  track.innerHTML = ""
  if (thumbnails) thumbnails.innerHTML = ""
  if (indicators) indicators.innerHTML = ""

  // Crear slides
  GALLERY_IMAGES.forEach((image, index) => {
    // Slide principal
    const slide = document.createElement("div")
    slide.className = "gallery-carousel__slide"
    slide.innerHTML = `
      <img 
        src="${image.src}" 
        alt="${image.alt}"
        class="gallery-carousel__image"
        loading="lazy"
      >
    `
    slide.addEventListener("click", () => openLightbox(index))
    track.appendChild(slide)

    // Thumbnail
    if (thumbnails) {
      const thumbnail = document.createElement("div")
      thumbnail.className = `gallery-thumbnail ${index === 0 ? "active" : ""}`
      thumbnail.innerHTML = `<img src="${image.src}" alt="${image.alt}">`
      thumbnail.addEventListener("click", () => goToSlide(index))
      thumbnails.appendChild(thumbnail)
    }

    // Indicador
    if (indicators) {
      const indicator = document.createElement("button")
      indicator.className = `gallery-carousel__indicator ${index === 0 ? "active" : ""}`
      indicator.setAttribute("aria-label", `Ir a imagen ${index + 1}`)
      indicator.addEventListener("click", () => goToSlide(index))
      indicators.appendChild(indicator)
    }
  })

  updateGalleryInfo()

  // Restaurar iconos después de renderizar la galería
  restoreAllIcons()
}

function initGalleryControls() {
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  // Navegación
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      previousSlide()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide()
    })
  }

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (!isLightboxOpen && document.activeElement && document.activeElement.closest(".gallery")) {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          previousSlide()
          break
        case "ArrowRight":
          e.preventDefault()
          nextSlide()
          break
      }
    }
  })
}

function goToSlide(index) {
  if (index < 0 || index >= GALLERY_IMAGES.length) return

  currentSlide = index
  updateCarouselPosition()
  updateGalleryInfo()
  updateThumbnails()
  updateIndicators()
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % GALLERY_IMAGES.length
  updateCarouselPosition()
  updateGalleryInfo()
  updateThumbnails()
  updateIndicators()
}

function previousSlide() {
  currentSlide = (currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
  updateCarouselPosition()
  updateGalleryInfo()
  updateThumbnails()
  updateIndicators()
}

function updateCarouselPosition() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const translateX = -currentSlide * 100
  track.style.transform = `translateX(${translateX}%)`
}

function updateGalleryInfo() {
  if (GALLERY_IMAGES.length === 0) return

  const currentImage = GALLERY_IMAGES[currentSlide]
  const titleElement = document.getElementById("imageTitle")
  const descriptionElement = document.getElementById("imageDescription")
  const categoryElement = document.getElementById("imageCategory")
  const counterElement = document.getElementById("imageCounter")

  if (titleElement) titleElement.textContent = currentImage.title
  if (descriptionElement) descriptionElement.textContent = currentImage.description
  if (categoryElement) categoryElement.textContent = getCategoryLabel(currentImage.category)
  if (counterElement) counterElement.textContent = `${currentSlide + 1} / ${GALLERY_IMAGES.length}`
}

function updateThumbnails() {
  const thumbnails = document.querySelectorAll(".gallery-thumbnail")
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.classList.toggle("active", index === currentSlide)
  })
}

function updateIndicators() {
  const indicators = document.querySelectorAll(".gallery-carousel__indicator")
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSlide)
  })
}



function getCategoryLabel(category) {
  const labels = {
    avicola: "Avícola",
    porcina: "Porcina",
    servicios: "Servicios",
    procesamiento: "Procesamiento",
    laboratorio: "Laboratorio",
  }
  return labels[category] || category
}

// ========================================
// LIGHTBOX
// ========================================
function initLightbox() {
  const lightbox = document.getElementById("galleryLightbox")
  const lightboxClose = document.getElementById("lightboxClose")
  const lightboxPrev = document.getElementById("lightboxPrev")
  const lightboxNext = document.getElementById("lightboxNext")
  const lightboxBackdrop = lightbox?.querySelector(".gallery-lightbox__backdrop")

  if (!lightbox) return

  // Cerrar lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox)
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener("click", closeLightbox)
  }

  // Navegación
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => {
      const newIndex = currentSlide - 1
      if (newIndex >= 0) {
        openLightbox(newIndex)
      }
    })
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => {
      const newIndex = currentSlide + 1
      if (newIndex < GALLERY_IMAGES.length) {
        openLightbox(newIndex)
      }
    })
  }

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (!isLightboxOpen) return

    switch (e.key) {
      case "Escape":
        closeLightbox()
        break
      case "ArrowLeft":
        const prevIndex = currentSlide - 1
        if (prevIndex >= 0) {
          openLightbox(prevIndex)
        }
        break
      case "ArrowRight":
        const nextIndex = currentSlide + 1
        if (nextIndex < GALLERY_IMAGES.length) {
          openLightbox(nextIndex)
        }
        break
    }
  })

  // Touch gestures
  initTouchGestures(lightbox)
}

function openLightbox(index) {
  const lightbox = document.getElementById("galleryLightbox")
  const lightboxImage = document.getElementById("lightboxImage")
  const lightboxTitle = document.getElementById("lightboxTitle")
  const lightboxDescription = document.getElementById("lightboxDescription")
  const lightboxCategory = document.getElementById("lightboxCategory")
  const lightboxCounter = document.getElementById("lightboxCounter")

  if (!lightbox || !lightboxImage) return

  currentSlide = index
  isLightboxOpen = true

  const image = GALLERY_IMAGES[index]

  lightboxImage.src = image.src
  lightboxImage.alt = image.alt

  if (lightboxTitle) lightboxTitle.textContent = image.title
  if (lightboxDescription) lightboxDescription.textContent = image.description
  if (lightboxCategory) lightboxCategory.textContent = getCategoryLabel(image.category)
  if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${GALLERY_IMAGES.length}`

  lightbox.classList.add("active")
  document.body.style.overflow = "hidden"

  updateLightboxNavigation()
  preloadAdjacentImages(index)
}

function closeLightbox() {
  const lightbox = document.getElementById("galleryLightbox")
  if (!lightbox) return

  isLightboxOpen = false
  lightbox.classList.remove("active")
  document.body.style.overflow = ""
}

function updateLightboxNavigation() {
  const lightboxPrev = document.getElementById("lightboxPrev")
  const lightboxNext = document.getElementById("lightboxNext")

  if (lightboxPrev) {
    lightboxPrev.style.display = currentSlide > 0 ? "flex" : "none"
  }

  if (lightboxNext) {
    lightboxNext.style.display = currentSlide < GALLERY_IMAGES.length - 1 ? "flex" : "none"
  }
}

function preloadAdjacentImages(index) {
  const preloadIndexes = [index - 1, index + 1]

  preloadIndexes.forEach((i) => {
    if (i >= 0 && i < GALLERY_IMAGES.length) {
      const img = new Image()
      img.src = GALLERY_IMAGES[i].src
    }
  })
}

// ========================================
// TOUCH GESTURES
// ========================================
function initTouchGestures(lightbox) {
  if (!("ontouchstart" in window) || !lightbox) return

  let startX, startY, endX, endY

  lightbox.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    },
    { passive: true },
  )

  lightbox.addEventListener(
    "touchend",
    (e) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY

      const deltaX = endX - startX
      const deltaY = endY - startY

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right = anterior
          const prevIndex = currentSlide - 1
          if (prevIndex >= 0) {
            openLightbox(prevIndex)
          }
        } else {
          // Swipe left = siguiente
          const nextIndex = currentSlide + 1
          if (nextIndex < GALLERY_IMAGES.length) {
            openLightbox(nextIndex)
          }
        }
      }

      if (deltaY > 100 && Math.abs(deltaX) < 50) {
        closeLightbox()
      }
    },
    { passive: true },
  )
}

// ========================================
// SCROLL TO TOP
// ========================================
function initScrollToTop() {
  let scrollToTopBtn = document.getElementById("scrollToTop")

  if (!scrollToTopBtn) {
    scrollToTopBtn = document.createElement("button")
    scrollToTopBtn.id = "scrollToTop"
    scrollToTopBtn.innerHTML = '<i data-lucide="chevron-up"></i>'
    scrollToTopBtn.className = "scroll-to-top"
    scrollToTopBtn.setAttribute("aria-label", "Volver arriba")
    document.body.appendChild(scrollToTopBtn)
    // Restaurar iconos después de crear el botón
    restoreAllIcons()
  }

  let isVisible = false

  window.addEventListener(
    "scroll",
    utils.throttle(() => {
      const shouldShow = window.scrollY > 300

      if (shouldShow && !isVisible) {
        scrollToTopBtn.classList.add("visible")
        isVisible = true
      } else if (!shouldShow && isVisible) {
        scrollToTopBtn.classList.remove("visible")
        isVisible = false
      }
    }, 100),
  )

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// ========================================
// CONFIGURACIÓN EMAILJS
// ========================================
const EMAIL_CONFIG = {
  serviceId: 'service_h2hvohe', // Reemplazar con tu Service ID real de EmailJS
  templateId: 'template_t1491kb', // Reemplazar con tu Template ID real de EmailJS
  publicKey: 'bNqMyJVanAEZPXISP' // Reemplazar con tu Public Key real de EmailJS
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================
function initContactForm() {
  const contactForm = document.getElementById("contactForm")
  if (!contactForm) return

  // Inicializar EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAIL_CONFIG.publicKey)
    console.log("✅ EmailJS inicializado correctamente")
  } else {
    console.warn("⚠️ EmailJS no está disponible. Verifica que el script esté cargado.")
  }

  const inputs = contactForm.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input))
    input.addEventListener("input", () => clearFieldError(input))
  })

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = contactForm.querySelector('button[type="submit"]')
    const submitText = document.getElementById("submitText")
    const submitLoading = document.getElementById("submitLoading")
    const originalText = submitText.textContent

    let isValid = true
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false
      }
    })

    if (!isValid) {
      showNotification("Por favor corrige los errores en el formulario.", "error")
      return
    }

    // Mostrar estado de carga
    submitBtn.disabled = true
    submitText.style.display = "none"
    submitLoading.style.display = "flex"

    try {
      // Preparar datos del formulario
      const formData = new FormData(contactForm)
      const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        position: formData.get('position') || 'No especificado',
        operation: getOperationLabel(formData.get('operation')),
        message: formData.get('message') || 'Sin mensaje adicional',
        to_email: 'diego.barrera@sento.tech', // Email de destino
        reply_to: formData.get('email'), // Para responder directamente al cliente
        current_date: new Date().toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Enviar email usando EmailJS
      if (typeof emailjs !== 'undefined') {
        console.log("📧 Enviando email con EmailJS...", templateParams)

        const response = await emailjs.send(
          EMAIL_CONFIG.serviceId,
          EMAIL_CONFIG.templateId,
          templateParams
        )

        console.log("✅ Email enviado exitosamente:", response)
        showNotification("¡Mensaje enviado exitosamente! Diego se pondrá en contacto contigo en las próximas 24 horas.", "success")
        showContactSuccess()
        contactForm.reset()
      } else {
        throw new Error('EmailJS no está disponible. Verifica la configuración.')
      }

    } catch (error) {
      console.error('❌ Error enviando email:', error)

      let errorMessage = "Error al enviar el mensaje. "

      if (error.text) {
        // Error específico de EmailJS
        if (error.text.includes('Invalid service ID')) {
          errorMessage += "Configuración de servicio incorrecta. "
        } else if (error.text.includes('Invalid template ID')) {
          errorMessage += "Template no encontrado. "
        } else if (error.text.includes('Invalid public key')) {
          errorMessage += "Clave pública incorrecta. "
        } else {
          errorMessage += `Error: ${error.text} `
        }
      }

      errorMessage += "Por favor contáctanos directamente a diego.barrera@sento.tech o +58 (414) 5906535"

      showNotification(errorMessage, "error", 8000)
    } finally {
      // Restaurar estado del botón
      submitBtn.disabled = false
      submitText.style.display = "inline"
      submitLoading.style.display = "none"
    }
  })
}

function getOperationLabel(operation) {
  const labels = {
    'avicola-engorde': 'Avícola - Pollos de engorde',
    'avicola-ponedoras': 'Avícola - Ponedoras',
    'porcina': 'Porcina - Cría y engorde',
    'planta-alimentos': 'Planta de alimentos',
    'planta-beneficio': 'Planta de beneficio',
    'distribuidor': 'Distribuidor',
    'otro': 'Otro'
  }
  return labels[operation] || operation || 'No especificado'
}

function showContactSuccess() {
  const contactForm = document.getElementById("contactForm")
  const contactSuccess = document.getElementById("contactSuccess")
  const sendAnotherBtn = document.getElementById("sendAnotherBtn")

  if (contactForm && contactSuccess) {
    contactForm.style.display = "none"
    contactSuccess.style.display = "block"

    if (sendAnotherBtn) {
      sendAnotherBtn.addEventListener("click", () => {
        contactForm.style.display = "block"
        contactSuccess.style.display = "none"
      })
    }
  }
}

function validateField(field) {
  const value = field.value.trim()
  const isRequired = field.hasAttribute("required")
  let isValid = true
  let errorMessage = ""

  clearFieldError(field)

  if (isRequired && !value) {
    errorMessage = "Este campo es obligatorio"
    isValid = false
  } else if (field.type === "email" && value && !utils.validateEmail(value)) {
    errorMessage = "Por favor ingresa un email válido"
    isValid = false
  } else if (field.type === "tel" && value && !/^[+]?[0-9\s\-()]{10,}$/.test(value)) {
    errorMessage = "Por favor ingresa un teléfono válido"
    isValid = false
  }

  if (!isValid) {
    showFieldError(field, errorMessage)
  }

  return isValid
}

function showFieldError(field, message) {
  field.classList.add("error")

  let errorElement = field.parentNode.querySelector(".field-error")
  if (!errorElement) {
    errorElement = document.createElement("span")
    errorElement.className = "field-error"
    errorElement.style.cssText = `
      color: var(--color-error);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-1);
      display: block;
    `
    field.parentNode.appendChild(errorElement)
  }

  errorElement.textContent = message
}

function clearFieldError(field) {
  field.classList.remove("error")
  const errorElement = field.parentNode.querySelector(".field-error")
  if (errorElement) {
    errorElement.remove()
  }
}

// ========================================
// NOTIFICACIONES
// ========================================
function showNotification(message, type = "info", duration = 5000) {
  const notification = document.createElement("div")
  notification.className = `notification notification--${type}`

  const colors = {
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  }

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    max-width: 350px;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: var(--font-size-sm);
    line-height: 1.4;
  `

  const icons = {
    success: "check-circle",
    error: "x-circle",
    warning: "alert-triangle",
    info: "info",
  }

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i data-lucide="${icons[type] || icons.info}" style="width: 1rem; height: 1rem; flex-shrink: 0;"></i>
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(notification)

  // Restaurar iconos en la notificación
  restoreAllIcons()

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, duration)

  notification.addEventListener("click", () => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  })
}

// ========================================
// ANIMACIONES EN SCROLL
// ========================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  }

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("is-visible")
        }, index * 100)
        animationObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)

  const animatedElements = document.querySelectorAll(
    ".animate-on-scroll, .animate-slide-from-left, .animate-slide-from-right, .animate-slide-from-bottom",
  )

  animatedElements.forEach((element) => {
    animationObserver.observe(element)
  })
}

// ========================================
// FOOTER - AÑO ACTUAL
// ========================================
function updateCurrentYear() {
  const yearElement = document.getElementById("currentYear")
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear()
  }
}

// ========================================
// RESTAURAR ICONOS
// ========================================
function initIcons() {
  // Función para inicializar iconos de Lucide
  if (typeof lucide !== 'undefined') {
    try {
      lucide.createIcons()
      console.log("✅ Iconos de Lucide inicializados correctamente")
    } catch (error) {
      console.error("❌ Error inicializando iconos:", error)
    }
  } else {
    console.warn("⚠️ Lucide no está disponible")
  }
}

function restoreAllIcons() {
  // Función para restaurar todos los iconos después de cambios dinámicos
  setTimeout(() => {
    initIcons()
  }, 100)
}

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("🚀 Iniciando Agrolinx...")

    // Inicializar iconos primero
    initIcons()

    // Inicializar componentes principales
    initHeader()
    initScrollProgress()
    initGallery() // ✅ Galería completamente nueva
    initScrollToTop()
    initContactForm()
    initScrollAnimations()
    updateCurrentYear()

    // Restaurar iconos después de que todo esté cargado
    setTimeout(() => {
      restoreAllIcons()
    }, 500)

    console.log("🌱 Agrolinx - Sitio web cargado exitosamente")

    // Mostrar notificación de bienvenida
    setTimeout(() => {
      if (sessionStorage.getItem("welcomeShown") !== "true") {
        showNotification("¡Bienvenido a Agrolinx! Explora nuestros servicios especializados.", "info", 3000)
        sessionStorage.setItem("welcomeShown", "true")
      }
    }, 2000)
  } catch (error) {
    console.error("❌ Error inicializando Agrolinx:", error)
    showNotification("Error cargando algunos componentes. Por favor recarga la página.", "error")
  }
})

// Restaurar iconos cuando la ventana se redimensiona o cambia
window.addEventListener('resize', utils.debounce(restoreAllIcons, 250))

// Restaurar iconos después de navegación
window.addEventListener('hashchange', restoreAllIcons)

// ========================================
// ERROR HANDLING
// ========================================
window.addEventListener("error", (e) => {
  console.error("Error en Agrolinx:", e.error)

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    showNotification(`Error: ${e.error.message}`, "error")
  }
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise rechazada:", e.reason)
  e.preventDefault()
})

// Exportar funciones para uso global
window.AgrolinxApp = {
  showNotification,
  utils,
  openLightbox,
  closeLightbox,
  goToSlide,
}