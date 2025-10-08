// ========================================
// AGROLINX - Optimized JavaScript Bundle
// Version: 2.0 - Optimized for performance
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

const AppState = {
  currentSlide: 0,
  isLightboxOpen: false,
  lastScrollY: 0,
}

// ========================================
// UTILITIES - Optimized and consolidated
// ========================================
const utils = {
  debounce: (func, wait, immediate = false) => {
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
  },

  throttle: (func, limit) => {
    let inThrottle
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  validatePhone: (phone) => /^[+]?[0-9\s\-()]{10,}$/.test(phone),

  safeQuery: (selector, context = document) => {
    try {
      return context.querySelector(selector)
    } catch (error) {
      console.error(`Error querying selector: ${selector}`, error)
      return null
    }
  },

  safeQueryAll: (selector, context = document) => {
    try {
      return context.querySelectorAll(selector)
    } catch (error) {
      console.error(`Error querying selector: ${selector}`, error)
      return []
    }
  },
}

// ========================================
// HEADER AND NAVIGATION - Optimized
// ========================================
function initHeader() {
  const header = utils.safeQuery("#header")
  const navToggle = utils.safeQuery("#nav-toggle")
  const nav = utils.safeQuery("#nav")
  const overlay = utils.safeQuery("#nav-overlay")

  if (!header || !navToggle || !nav) {
    console.warn("Header elements not found")
    return
  }

  const handleScroll = utils.throttle(() => {
    const currentScrollY = window.scrollY

    // Add/remove scrolled class
    header.classList.toggle("scrolled", currentScrollY > 50)

    // Hide header on scroll down (mobile only)
    if (window.innerWidth <= 1023) {
      if (currentScrollY > AppState.lastScrollY && currentScrollY > 100) {
        header.style.transform = "translateY(-100%)"
      } else {
        header.style.transform = "translateY(0)"
      }
    }

    AppState.lastScrollY = currentScrollY
  }, 10)

  window.addEventListener("scroll", handleScroll, { passive: true })

  const toggleNavMenu = (isOpen) => {
    nav.classList.toggle("active", isOpen)
    navToggle.setAttribute("aria-expanded", isOpen)
    if (overlay) overlay.classList.toggle("active", isOpen)
    document.body.style.overflow = isOpen ? "hidden" : ""
  }

  const closeNavMenu = () => toggleNavMenu(false)

  // Mobile navigation toggle
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation()
    toggleNavMenu(!nav.classList.contains("active"))
  })

  // Close nav on overlay click
  if (overlay) overlay.addEventListener("click", closeNavMenu)

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

  const navLinks = utils.safeQueryAll('a[href^="#"]', nav)
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetElement = utils.safeQuery(`#${targetId}`)

      if (targetElement) {
        const headerHeight = header.offsetHeight
        const targetPosition = targetElement.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })

        if (nav.classList.contains("active")) closeNavMenu()
      }
    })
  })
}

// ========================================
// SCROLL PROGRESS BAR - Optimized
// ========================================
function initScrollProgress() {
  let scrollProgress = utils.safeQuery("#scrollProgress")

  if (!scrollProgress) {
    scrollProgress = document.createElement("div")
    scrollProgress.id = "scrollProgress"
    scrollProgress.className = "scroll-progress"
    scrollProgress.setAttribute("aria-hidden", "true")
    document.body.insertBefore(scrollProgress, document.body.firstChild)
  }

  const updateProgress = utils.throttle(() => {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    scrollProgress.style.width = `${scrollPercent}%`
  }, 10)

  window.addEventListener("scroll", updateProgress, { passive: true })
}

// ========================================
// GALLERY - Optimized with better performance and lazy loading
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
  initLazyLoadingForGallery()

  console.log(`✅ Gallery initialized with ${GALLERY_IMAGES.length} images`)
}

function renderGallery() {
  const track = utils.safeQuery("#carouselTrack")
  const thumbnails = utils.safeQuery("#galleryThumbnails")
  const indicators = utils.safeQuery("#carouselIndicators")

  if (!track) {
    console.error("❌ Carousel track not found")
    return
  }

  const slideFragment = document.createDocumentFragment()
  const thumbnailFragment = document.createDocumentFragment()
  const indicatorFragment = document.createDocumentFragment()

  GALLERY_IMAGES.forEach((image, index) => {
    // Main slide
    const slide = document.createElement("div")
    slide.className = "gallery-carousel__slide"
    slide.innerHTML = `
      <img 
        ${index === 0 ? `src="${image.src}"` : `data-src="${image.src}"`}
        alt="${image.alt}"
        class="gallery-carousel__image ${index === 0 ? "" : "lazy-load"}"
        loading="${index === 0 ? "eager" : "lazy"}"
        decoding="async"
      >
    `
    slide.addEventListener("click", () => openLightbox(index))
    slideFragment.appendChild(slide)

    // Thumbnail
    if (thumbnails) {
      const thumbnail = document.createElement("div")
      thumbnail.className = `gallery-thumbnail ${index === 0 ? "active" : ""}`
      thumbnail.innerHTML = `<img ${index < 3 ? `src="${image.src}"` : `data-src="${image.src}"`} alt="${image.alt}" loading="lazy" decoding="async" class="${index < 3 ? "" : "lazy-load"}">`
      thumbnail.addEventListener("click", () => goToSlide(index))
      thumbnailFragment.appendChild(thumbnail)
    }

    // Indicator
    if (indicators) {
      const indicator = document.createElement("button")
      indicator.className = `gallery-carousel__indicator ${index === 0 ? "active" : ""}`
      indicator.setAttribute("aria-label", `Go to image ${index + 1}`)
      indicator.addEventListener("click", () => goToSlide(index))
      indicatorFragment.appendChild(indicator)
    }
  })

  track.innerHTML = ""
  track.appendChild(slideFragment)
  if (thumbnails) {
    thumbnails.innerHTML = ""
    thumbnails.appendChild(thumbnailFragment)
  }
  if (indicators) {
    indicators.innerHTML = ""
    indicators.appendChild(indicatorFragment)
  }

  updateCarouselPosition()
}

function initLazyLoadingForGallery() {
  if (!("IntersectionObserver" in window)) {
    // Fallback for browsers without IntersectionObserver
    loadAllImages()
    return
  }

  const lazyImageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          loadImage(img)
          observer.unobserve(img)
        }
      })
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.01,
    },
  )

  const lazyImages = utils.safeQueryAll(".lazy-load")
  lazyImages.forEach((img) => lazyImageObserver.observe(img))

  console.log(`✅ Lazy loading initialized for ${lazyImages.length} images`)
}

function loadImage(img) {
  const src = img.getAttribute("data-src")
  if (!src) return

  img.src = src
  img.removeAttribute("data-src")
  img.classList.remove("lazy-load")
  img.classList.add("lazy-loaded")

  img.addEventListener("load", () => {
    img.style.opacity = "1"
  })

  img.addEventListener("error", () => {
    console.warn(`Failed to lazy load image: ${src}`)
    img.classList.add("lazy-error")
  })
}

function loadAllImages() {
  const lazyImages = utils.safeQueryAll(".lazy-load")
  lazyImages.forEach((img) => loadImage(img))
  console.log("⚠️ IntersectionObserver not supported, loading all images")
}

function initGalleryControls() {
  const prevBtn = utils.safeQuery("#prevBtn")
  const nextBtn = utils.safeQuery("#nextBtn")

  const navigate = (direction) => {
    const newIndex =
      direction === "prev"
        ? (AppState.currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        : (AppState.currentSlide + 1) % GALLERY_IMAGES.length
    goToSlide(newIndex)
  }

  if (prevBtn) prevBtn.addEventListener("click", () => navigate("prev"))
  if (nextBtn) nextBtn.addEventListener("click", () => navigate("next"))

  document.addEventListener("keydown", (e) => {
    const gallery = utils.safeQuery(".gallery")
    if (!gallery) return

    const galleryRect = gallery.getBoundingClientRect()
    const isGalleryVisible = galleryRect.top < window.innerHeight && galleryRect.bottom > 0

    if (isGalleryVisible) {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        navigate("prev")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        navigate("next")
      }
    }
  })
}

function goToSlide(index) {
  AppState.currentSlide = index
  updateCarouselPosition()
  updateThumbnails()
  updateIndicators()
  updateImageInfo()
  preloadAdjacentImages(index)
}

function updateCarouselPosition() {
  const track = utils.safeQuery("#carouselTrack")
  if (!track) return

  const translateX = -AppState.currentSlide * 100
  track.style.transform = `translateX(${translateX}%)`
}

function updateThumbnails() {
  const thumbnails = utils.safeQueryAll(".gallery-thumbnail")
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === AppState.currentSlide)
  })
}

function updateIndicators() {
  const indicators = utils.safeQueryAll(".gallery-carousel__indicator")
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === AppState.currentSlide)
  })
}

function updateImageInfo() {
  const categoryElement = utils.safeQuery("#imageCategory")
  const counterElement = utils.safeQuery("#imageCounter")
  const currentImage = GALLERY_IMAGES[AppState.currentSlide]

  if (categoryElement && currentImage) {
    categoryElement.textContent = currentImage.category
  }

  if (counterElement) {
    counterElement.textContent = `${AppState.currentSlide + 1} / ${GALLERY_IMAGES.length}`
  }
}

// ========================================
// LIGHTBOX - Optimized
// ========================================
function initLightbox() {
  const lightbox = utils.safeQuery("#galleryLightbox")
  if (!lightbox) return

  const lightboxClose = utils.safeQuery("#lightboxClose")
  const lightboxPrev = utils.safeQuery("#lightboxPrev")
  const lightboxNext = utils.safeQuery("#lightboxNext")

  const navigateLightbox = (direction) => {
    const newIndex =
      direction === "prev"
        ? (AppState.currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        : (AppState.currentSlide + 1) % GALLERY_IMAGES.length
    openLightbox(newIndex)
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox)
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => navigateLightbox("prev"))
  if (lightboxNext) lightboxNext.addEventListener("click", () => navigateLightbox("next"))

  // Close on backdrop click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("gallery-lightbox__backdrop")) {
      closeLightbox()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (!AppState.isLightboxOpen) return

    switch (e.key) {
      case "Escape":
        closeLightbox()
        break
      case "ArrowLeft":
        e.preventDefault()
        navigateLightbox("prev")
        break
      case "ArrowRight":
        e.preventDefault()
        navigateLightbox("next")
        break
    }
  })

  // Touch gestures
  initTouchGestures(lightbox)
}

function openLightbox(index) {
  const lightbox = utils.safeQuery("#galleryLightbox")
  const lightboxImage = utils.safeQuery("#lightboxImage")
  const lightboxCategory = utils.safeQuery("#lightboxCategory")
  const lightboxCounter = utils.safeQuery("#lightboxCounter")

  if (!lightbox || !lightboxImage) return

  AppState.currentSlide = index
  AppState.isLightboxOpen = true

  const image = GALLERY_IMAGES[AppState.currentSlide]
  lightboxImage.src = image.src
  lightboxImage.alt = image.alt

  if (lightboxCategory) lightboxCategory.textContent = image.category
  if (lightboxCounter) lightboxCounter.textContent = `${AppState.currentSlide + 1} / ${GALLERY_IMAGES.length}`

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
  const lightbox = utils.safeQuery("#galleryLightbox")
  if (!lightbox) return

  AppState.isLightboxOpen = false
  lightbox.classList.remove("active")
  document.body.style.overflow = ""
}

function preloadAdjacentImages(index) {
  const preloadIndexes = [
    (index - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length,
    (index + 1) % GALLERY_IMAGES.length,
  ]

  preloadIndexes.forEach((i) => {
    if (GALLERY_IMAGES[i]) {
      const slideImg = utils.safeQuery(`.gallery-carousel__slide:nth-child(${i + 1}) img`)
      if (slideImg && slideImg.classList.contains("lazy-load")) {
        loadImage(slideImg)
      }

      // Preload for lightbox
      const img = new Image()
      img.src = GALLERY_IMAGES[i].src
      img.onerror = () => console.warn(`Failed to preload image: ${GALLERY_IMAGES[i].src}`)
    }
  })
}

// ========================================
// TOUCH GESTURES - Optimized
// ========================================
function initTouchGestures(lightbox) {
  if (!("ontouchstart" in window) || !lightbox) return

  const touchState = { startX: 0, startY: 0, endX: 0, endY: 0 }

  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchState.startX = e.touches[0].clientX
      touchState.startY = e.touches[0].clientY
    },
    { passive: true },
  )

  lightbox.addEventListener(
    "touchend",
    (e) => {
      touchState.endX = e.changedTouches[0].clientX
      touchState.endY = e.changedTouches[0].clientY

      const deltaX = touchState.endX - touchState.startX
      const deltaY = touchState.endY - touchState.startY

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50
      const isVerticalSwipe = Math.abs(deltaY) > 100 && Math.abs(deltaX) < 50

      if (isHorizontalSwipe) {
        const direction = deltaX > 0 ? "prev" : "next"
        const newIndex =
          direction === "prev"
            ? (AppState.currentSlide - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
            : (AppState.currentSlide + 1) % GALLERY_IMAGES.length
        openLightbox(newIndex)
      } else if (isVerticalSwipe && deltaY > 0) {
        closeLightbox()
      }
    },
    { passive: true },
  )
}

// ========================================
// SCROLL TO TOP - Optimized
// ========================================
function initScrollToTop() {
  let scrollToTopBtn = utils.safeQuery("#scrollToTop")

  if (!scrollToTopBtn) {
    scrollToTopBtn = document.createElement("button")
    scrollToTopBtn.id = "scrollToTop"
    scrollToTopBtn.className = "scroll-to-top"
    scrollToTopBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>'
    scrollToTopBtn.setAttribute("aria-label", "Volver arriba")
    scrollToTopBtn.setAttribute("title", "Volver arriba")
    document.body.appendChild(scrollToTopBtn)
  }

  const toggleVisibility = utils.throttle(() => {
    scrollToTopBtn.classList.toggle("visible", window.pageYOffset > 300)
  }, 100)

  window.addEventListener("scroll", toggleVisibility, { passive: true })

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
}

// ========================================
// SCROLL ANIMATIONS - Optimized with IntersectionObserver
// ========================================
function initScrollAnimations() {
  if (!("IntersectionObserver" in window)) {
    console.warn("IntersectionObserver not supported, skipping animations")
    return
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.animationDelay || 0

        setTimeout(() => {
          entry.target.classList.add("animate-in")
        }, delay)

        cardObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Select all card elements
  const pillarCards = utils.safeQueryAll(".pillar-card")
  const partnerCards = utils.safeQueryAll(".partner-card")
  const leaderCards = utils.safeQueryAll(".leader-card")
  const featureCards = utils.safeQueryAll(".feature-card")
  const contactMethods = utils.safeQueryAll(".contact-method")

  // Apply alternating slide animations to pillar cards
  pillarCards.forEach((card, index) => {
    const animationClass = index % 2 === 0 ? "animate-slide-from-left" : "animate-slide-from-right"
    card.classList.add(animationClass)
    card.dataset.animationDelay = index * 150
    cardObserver.observe(card)
  })

  // Apply alternating slide animations to partner cards
  partnerCards.forEach((card, index) => {
    const animationClass = index % 2 === 0 ? "animate-slide-from-left" : "animate-slide-from-right"
    card.classList.add(animationClass)
    card.dataset.animationDelay = index * 150
    cardObserver.observe(card)
  })

  // Apply slide from bottom animation to leader cards
  leaderCards.forEach((card, index) => {
    card.classList.add("animate-slide-from-bottom")
    card.dataset.animationDelay = index * 100
    cardObserver.observe(card)
  })

  // Apply alternating slide animations to feature cards
  featureCards.forEach((card, index) => {
    const animationClass = index % 2 === 0 ? "animate-slide-from-left" : "animate-slide-from-right"
    card.classList.add(animationClass)
    card.dataset.animationDelay = index * 100
    cardObserver.observe(card)
  })

  // Apply slide from bottom animation to contact methods
  contactMethods.forEach((card, index) => {
    card.classList.add("animate-slide-from-bottom")
    card.dataset.animationDelay = index * 100
    cardObserver.observe(card)
  })

  // Observe other animated elements
  const animatedElements = utils.safeQueryAll(
    ".animate-slide-from-left, .animate-slide-from-right, .animate-slide-from-bottom, .animate-slide-up, .animate-fade-in, .animate-bounce-in, .animate-scale-in",
  )

  const nonCardElements = Array.from(animatedElements).filter(
    (el) =>
      !el.classList.contains("pillar-card") &&
      !el.classList.contains("partner-card") &&
      !el.classList.contains("leader-card") &&
      !el.classList.contains("feature-card") &&
      !el.classList.contains("contact-method"),
  )

  nonCardElements.forEach((el) => observer.observe(el))

  const totalCards =
    pillarCards.length + partnerCards.length + leaderCards.length + featureCards.length + contactMethods.length

  console.log(
    `✅ Scroll animations initialized: ${totalCards} cards with alternating slide directions and staggered delays, ${nonCardElements.length} other elements`,
  )
}

// ========================================
// CONTACT FORM - Optimized with better validation
// ========================================
function initContactForm() {
  const contactForm = utils.safeQuery("#contactForm")
  if (!contactForm) return

  const formFields = utils.safeQueryAll("input, select, textarea", contactForm)
  formFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field))
    field.addEventListener("input", () => {
      if (field.classList.contains("error")) validateField(field)
    })
  })

  // Form submission
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = utils.safeQuery("#submitBtn")
    const submitText = utils.safeQuery("#submitText")
    const submitLoading = utils.safeQuery("#submitLoading")

    let isFormValid = true
    formFields.forEach((field) => {
      if (!validateField(field)) isFormValid = false
    })

    // Check terms checkbox
    const termsCheckbox = utils.safeQuery("#terms")
    if (termsCheckbox && !termsCheckbox.checked) {
      showFieldError(termsCheckbox, "Debes aceptar los términos y condiciones")
      isFormValid = false
    }

    if (!isFormValid) {
      showNotification("Por favor corrige los errores en el formulario", "error")
      return
    }

    if (submitBtn && submitText && submitLoading) {
      submitBtn.disabled = true
      submitText.style.display = "none"
      submitLoading.style.display = "inline-flex"
    }

    try {
      // Collect form data
      const formData = new FormData(contactForm)
      const data = Object.fromEntries(formData.entries())
      data.operationLabel = getOperationLabel(data.operation)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      showContactSuccess()
      showNotification("¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.", "success")
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
  const contactForm = utils.safeQuery("#contactForm")
  const contactSuccess = utils.safeQuery("#contactSuccess")
  const sendAnotherBtn = utils.safeQuery("#sendAnotherBtn")

  if (contactForm && contactSuccess) {
    contactForm.style.display = "none"
    contactSuccess.style.display = "block"

    if (sendAnotherBtn) {
      sendAnotherBtn.addEventListener(
        "click",
        () => {
          contactForm.style.display = "block"
          contactSuccess.style.display = "none"
        },
        { once: true },
      )
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
  } else if (field.type === "tel" && value && !utils.validatePhone(value)) {
    errorMessage = "Por favor ingresa un teléfono válido"
    isValid = false
  }

  if (!isValid) showFieldError(field, errorMessage)

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
  if (errorElement) errorElement.textContent = ""
}

// ========================================
// NOTIFICATIONS - Optimized
// ========================================
function showNotification(message, type = "info", duration = 5000) {
  const notification = document.createElement("div")
  notification.className = `notification notification--${type}`
  notification.setAttribute("role", "alert")
  notification.setAttribute("aria-live", "polite")

  const colors = {
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-primary)",
  }

  const icons = {
    success:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
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
    z-index: var(--z-toast);
    max-width: 400px;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
  `

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      ${icons[type] || icons.info}
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(notification)

  // Trigger animation
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)"
  })

  // Auto remove
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, duration)
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function updateCurrentYear() {
  const yearElement = utils.safeQuery("#currentYear")
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear()
  }
}

// ========================================
// IMAGE ERROR HANDLING - Optimized with lazy loading support
// ========================================
function initImageErrorHandling() {
  const images = utils.safeQueryAll("img")

  images.forEach((img) => {
    img.addEventListener(
      "error",
      function handleImageError() {
        console.warn(`Failed to load image: ${this.src || this.getAttribute("data-src")}`)

        this.classList.add("image-error")
        this.style.opacity = "0.5"
        this.style.filter = "grayscale(100%)"

        if ((this.fetchPriority === "high" || this.loading === "eager") && !this.dataset.retried) {
          this.dataset.retried = "true"
          setTimeout(() => {
            const originalSrc = this.src || this.getAttribute("data-src")
            this.src = ""
            this.src = originalSrc
            console.log(`Retrying critical image: ${originalSrc}`)
          }, 3000)
        }
      },
      { once: false },
    )
  })

  console.log(`✅ Image error handling initialized for ${images.length} images`)
}

// ========================================
// MAIN INITIALIZATION - Optimized
// ========================================
function initializeApp() {
  try {
    console.log("🚀 Starting Agrolinx...")

    // Initialize main components
    initHeader()
    initScrollProgress()
    initGallery()
    initScrollToTop()
    initContactForm()
    initScrollAnimations()
    initImageErrorHandling()
    updateCurrentYear()

    console.log("🌱 Agrolinx - Website loaded successfully")

    setTimeout(() => {
      if (!sessionStorage.getItem("welcomeShown")) {
        showNotification("¡Bienvenido a Agrolinx! Explora nuestros servicios especializados.", "info", 3000)
        sessionStorage.setItem("welcomeShown", "true")
      }
    }, 2000)
  } catch (error) {
    console.error("❌ Error initializing Agrolinx:", error)
    showNotification("Error cargando algunos componentes. Por favor recarga la página.", "error")
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}

// ========================================
// ERROR HANDLING - Improved
// ========================================
window.addEventListener("error", (e) => {
  console.error("Global error in Agrolinx:", e.error)

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    showNotification(`Error: ${e.error?.message || "Unknown error"}`, "error")
  }
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
  e.preventDefault()
})

window.AgrolinxApp = {
  showNotification,
  utils,
  openLightbox,
  closeLightbox,
  goToSlide,
  version: "2.0",
}

console.log("✅ Agrolinx App v2.0 - Optimized and ready")
