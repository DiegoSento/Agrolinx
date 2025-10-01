// ========================================
// AGROLINX - Optimized JavaScript Bundle
// ========================================

// ========================================
// CONFIGURATION AND DATA
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

// Global variables
let currentSlide = 0
let isLightboxOpen = false

// Declare lucide variable
const lucide = window.lucide || {}

// ========================================
// UTILITIES
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
// HEADER AND NAVIGATION
// ========================================
function initHeader() {
  const header = document.getElementById("header")
  const navToggle = document.getElementById("nav-toggle")
  const nav = document.getElementById("nav")
  const overlay = document.getElementById("nav-overlay")

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

      if (window.innerWidth <= 1023) {
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

    if (overlay) {
      overlay.classList.toggle("active", isActive)
    }

    if (isActive) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  })

  // Close nav on overlay click
  if (overlay) {
    overlay.addEventListener("click", closeNavMenu)
  }

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
      if (window.innerWidth > 1023 && nav.classList.contains("active")) {
        closeNavMenu()
      }
    }, 250),
  )

  function closeNavMenu() {
    nav.classList.remove("active")
    navToggle.setAttribute("aria-expanded", "false")
    if (overlay) {
      overlay.classList.remove("active")
    }
    document.body.style.overflow = ""
  }

  // Smooth scroll for navigation links
  const navLinks = nav.querySelectorAll('a[href^="#"]')
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        const headerHeight = header.offsetHeight
        const targetPosition = targetElement.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })

        // Close mobile menu if open
        if (nav.classList.contains("active")) {
          closeNavMenu()
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
    scrollProgress.setAttribute("aria-hidden", "true")
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
// GALLERY - OPTIMIZED
// ========================================
function initGallery() {
  console.log("🎨 Initializing gallery...")

  if (GALLERY_IMAGES.length === 0) {
    console.error("❌ No images for gallery")
    return
  }

  renderGallery()
  initGalleryControls()
  initLightbox()

  console.log(`✅ Gallery initialized with ${GALLERY_IMAGES.length} images`)
}

function renderGallery() {
  const track = document.getElementById("carouselTrack")
  const thumbnails = document.getElementById("galleryThumbnails")
  const indicators = document.getElementById("carouselIndicators")

  if (!track) {
    console.error("❌ Carousel track not found")
    return
  }

  // Clear containers
  track.innerHTML = ""
  if (thumbnails) thumbnails.innerHTML = ""
  if (indicators) indicators.innerHTML = ""

  // Create slides
  GALLERY_IMAGES.forEach((image, index) => {
    // Main slide
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

    // Indicator
    if (indicators) {
      const indicator = document.createElement("button")
      indicator.className = `gallery-carousel__indicator ${index === 0 ? "active" : ""}`
      indicator.setAttribute("aria-label", `Go to image ${index + 1}`)
      indicator.addEventListener("click", () => goToSlide(index))
      indicators.appendChild(indicator)
    }
  })

  updateCarouselPosition()
}

function initGalleryControls() {
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const prevIndex = (currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
      goToSlide(prevIndex)
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const nextIndex = (currentSlide + 1) % GALLERY_IMAGES.length
      goToSlide(nextIndex)
    })
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (document.querySelector(".gallery").getBoundingClientRect().top < window.innerHeight) {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        const prevIndex = (currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        goToSlide(prevIndex)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        const nextIndex = (currentSlide + 1) % GALLERY_IMAGES.length
        goToSlide(nextIndex)
      }
    }
  })
}

function goToSlide(index) {
  currentSlide = index
  updateCarouselPosition()
  updateThumbnails()
  updateIndicators()
  updateImageInfo()
}

function updateCarouselPosition() {
  const track = document.getElementById("carouselTrack")
  if (!track) return

  const translateX = -currentSlide * 100
  track.style.transform = `translateX(${translateX}%)`
}

function updateThumbnails() {
  const thumbnails = document.querySelectorAll(".gallery-thumbnail")
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentSlide)
  })
}

function updateIndicators() {
  const indicators = document.querySelectorAll(".gallery-carousel__indicator")
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSlide)
  })
}

function updateImageInfo() {
  const categoryElement = document.getElementById("imageCategory")
  const counterElement = document.getElementById("imageCounter")

  if (categoryElement && GALLERY_IMAGES[currentSlide]) {
    categoryElement.textContent = GALLERY_IMAGES[currentSlide].category
  }

  if (counterElement) {
    counterElement.textContent = `${currentSlide + 1} / ${GALLERY_IMAGES.length}`
  }
}

// ========================================
// LIGHTBOX
// ========================================
function initLightbox() {
  const lightbox = document.getElementById("galleryLightbox")
  const lightboxClose = document.getElementById("lightboxClose")
  const lightboxPrev = document.getElementById("lightboxPrev")
  const lightboxNext = document.getElementById("lightboxNext")

  if (!lightbox) return

  // Close lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox)
  }

  // Navigation
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => {
      const prevIndex = (currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
      openLightbox(prevIndex)
    })
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => {
      const nextIndex = (currentSlide + 1) % GALLERY_IMAGES.length
      openLightbox(nextIndex)
    })
  }

  // Close on backdrop click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("gallery-lightbox__backdrop")) {
      closeLightbox()
    }
  })

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!isLightboxOpen) return

    switch (e.key) {
      case "Escape":
        closeLightbox()
        break
      case "ArrowLeft":
        e.preventDefault()
        const prevIndex = (currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        openLightbox(prevIndex)
        break
      case "ArrowRight":
        e.preventDefault()
        const nextIndex = (currentSlide + 1) % GALLERY_IMAGES.length
        openLightbox(nextIndex)
        break
    }
  })

  // Touch gestures
  initTouchGestures(lightbox)
}

function openLightbox(index) {
  const lightbox = document.getElementById("galleryLightbox")
  const lightboxImage = document.getElementById("lightboxImage")
  const lightboxCategory = document.getElementById("lightboxCategory")
  const lightboxCounter = document.getElementById("lightboxCounter")

  if (!lightbox || !lightboxImage) return

  currentSlide = index
  isLightboxOpen = true

  const image = GALLERY_IMAGES[currentSlide]
  lightboxImage.src = image.src
  lightboxImage.alt = image.alt

  if (lightboxCategory) {
    lightboxCategory.textContent = image.category
  }

  if (lightboxCounter) {
    lightboxCounter.textContent = `${currentSlide + 1} / ${GALLERY_IMAGES.length}`
  }

  lightbox.classList.add("active")
  document.body.style.overflow = "hidden"

  // Sync main carousel with lightbox
  updateCarouselPosition()
  updateThumbnails()
  updateIndicators()
  updateImageInfo()
  preloadAdjacentImages(index)
}

function closeLightbox() {
  const lightbox = document.getElementById("galleryLightbox")
  if (!lightbox) return

  isLightboxOpen = false
  lightbox.classList.remove("active")
  document.body.style.overflow = ""
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
          // Swipe right = previous
          const prevIndex = (currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
          openLightbox(prevIndex)
        } else {
          // Swipe left = next
          const nextIndex = (currentSlide + 1) % GALLERY_IMAGES.length
          openLightbox(nextIndex)
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
    scrollToTopBtn.className = "scroll-to-top"
    scrollToTopBtn.innerHTML = '<i data-lucide="chevron-up"></i>'
    scrollToTopBtn.setAttribute("aria-label", "Back to top")
    scrollToTopBtn.setAttribute("title", "Back to top")
    document.body.appendChild(scrollToTopBtn)
  }

  // Show/hide button based on scroll position
  window.addEventListener(
    "scroll",
    utils.throttle(() => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add("visible")
      } else {
        scrollToTopBtn.classList.remove("visible")
      }
    }, 100),
  )

  // Scroll to top functionality
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    ".animate-slide-from-left, .animate-slide-from-right, .animate-slide-from-bottom, .animate-slide-up, .animate-fade-in, .animate-bounce-in, .animate-scale-in",
  )

  animatedElements.forEach((el) => observer.observe(el))
}

// ========================================
// CONTACT FORM
// ========================================
function initContactForm() {
  const contactForm = document.getElementById("contactForm")
  if (!contactForm) return

  // Real-time validation
  const formFields = contactForm.querySelectorAll("input, select, textarea")
  formFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field))
    field.addEventListener("input", () => {
      if (field.classList.contains("error")) {
        validateField(field)
      }
    })
  })

  // Form submission
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = document.getElementById("submitBtn")
    const submitText = document.getElementById("submitText")
    const submitLoading = document.getElementById("submitLoading")

    // Validate all fields
    let isFormValid = true
    formFields.forEach((field) => {
      if (!validateField(field)) {
        isFormValid = false
      }
    })

    // Check terms checkbox
    const termsCheckbox = document.getElementById("terms")
    if (termsCheckbox && !termsCheckbox.checked) {
      showFieldError(termsCheckbox, "Debes aceptar los términos y condiciones")
      isFormValid = false
    }

    if (!isFormValid) {
      showNotification("Por favor corrige los errores en el formulario", "error")
      return
    }

    // Show loading state
    if (submitBtn && submitText && submitLoading) {
      submitBtn.disabled = true
      submitText.style.display = "none"
      submitLoading.style.display = "inline-flex"
    }

    try {
      // Collect form data
      const formData = new FormData(contactForm)
      const data = Object.fromEntries(formData.entries())

      // Add operation label
      data.operationLabel = getOperationLabel(data.operation)

      // Simulate form submission (replace with actual EmailJS or API call)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      showContactSuccess()
      showNotification("¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.", "success")

      // Reset form
      contactForm.reset()
    } catch (error) {
      console.error("Error sending form:", error)
      showNotification("Error enviando el mensaje. Por favor intenta nuevamente.", "error")
    } finally {
      // Reset button state
      if (submitBtn && submitText && submitLoading) {
        submitBtn.disabled = false
        submitText.style.display = "inline"
        submitLoading.style.display = "none"
      }
    }
  })
}

function getOperationLabel(operation) {
  const labels = {
    "avicola-engorde": "Avícola - Pollos de engorde",
    "avicola-ponedoras": "Avícola - Ponedoras",
    porcina: "Porcina - Cría y engorde",
    "planta-alimentos": "Planta de alimentos",
    "planta-beneficio": "Planta de beneficio",
    distribuidor: "Distribuidor",
    otro: "Otro",
  }
  return labels[operation] || operation || "No especificado"
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

  let errorElement = field.parentNode.querySelector(".form-error")
  if (!errorElement) {
    errorElement = document.createElement("div")
    errorElement.className = "form-error"
    field.parentNode.appendChild(errorElement)
  }

  errorElement.textContent = message
}

function clearFieldError(field) {
  field.classList.remove("error")
  const errorElement = field.parentNode.querySelector(".form-error")
  if (errorElement) {
    errorElement.textContent = ""
  }
}

// ========================================
// NOTIFICATIONS
// ========================================
function showNotification(message, type = "info", duration = 5000) {
  const notification = document.createElement("div")
  notification.className = `notification notification--${type}`

  const colors = {
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-primary)",
  }

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-modal);
    max-width: 400px;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
  `

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i data-lucide="${type === "success" ? "check-circle" : type === "error" ? "x-circle" : "info"}"></i>
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(notification)

  // Trigger animation
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Auto remove
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, duration)

  // Initialize icons for notification
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function updateCurrentYear() {
  const yearElement = document.getElementById("currentYear")
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear()
  }
}

// ========================================
// ICONS INITIALIZATION
// ========================================
function initIcons() {
  if (typeof lucide !== "undefined") {
    try {
      lucide.createIcons()
      console.log("✅ Lucide icons initialized correctly")
    } catch (error) {
      console.error("❌ Error initializing icons:", error)
    }
  } else {
    console.warn("⚠️ Lucide is not available")
  }
}

function restoreAllIcons() {
  setTimeout(() => {
    initIcons()
  }, 100)
}

// ========================================
// MAIN INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("🚀 Starting Agrolinx...")

    // Initialize icons first
    initIcons()

    // Initialize main components
    initHeader()
    initScrollProgress()
    initGallery()
    initScrollToTop()
    initContactForm()
    initScrollAnimations()
    updateCurrentYear()

    // Restore icons after everything is loaded
    setTimeout(() => {
      restoreAllIcons()
    }, 500)

    console.log("🌱 Agrolinx - Website loaded successfully")

    // Show welcome notification
    setTimeout(() => {
      if (sessionStorage.getItem("welcomeShown") !== "true") {
        showNotification("¡Bienvenido a Agrolinx! Explora nuestros servicios especializados.", "info", 3000)
        sessionStorage.setItem("welcomeShown", "true")
      }
    }, 2000)
  } catch (error) {
    console.error("❌ Error initializing Agrolinx:", error)
    showNotification("Error cargando algunos componentes. Por favor recarga la página.", "error")
  }
})

// Restore icons on window events
window.addEventListener("resize", utils.debounce(restoreAllIcons, 250))
window.addEventListener("hashchange", restoreAllIcons)

// ========================================
// ERROR HANDLING
// ========================================
window.addEventListener("error", (e) => {
  console.error("Error in Agrolinx:", e.error)

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    showNotification(`Error: ${e.error.message}`, "error")
  }
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise rejected:", e.reason)
  e.preventDefault()
})

// Export functions for global use
window.AgrolinxApp = {
  showNotification,
  utils,
  openLightbox,
  closeLightbox,
  goToSlide,
}
