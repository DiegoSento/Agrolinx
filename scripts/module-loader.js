class ModuleLoader {
  constructor() {
    this.loadedModules = new Set()
    this.observers = new Map()
    this.imageCache = new Map()
  }

  initImageLazyLoading() {
    if (!("IntersectionObserver" in window)) {
      // Fallback for older browsers
      document.querySelectorAll("img[data-src]").forEach((img) => {
        img.src = img.dataset.src
        img.classList.add("loaded")
      })
      return
    }

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            this.loadImage(img)
            imageObserver.unobserve(img)
          }
        })
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      },
    )

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img)
    })
  }

  async loadImage(img) {
    const src = img.dataset.src
    if (!src) return

    try {
      // Check cache first
      if (this.imageCache.has(src)) {
        img.src = src
        img.classList.add("loaded")
        return
      }

      // Preload image
      const imageLoader = new Image()
      imageLoader.onload = () => {
        img.src = src
        img.classList.add("loaded")
        img.removeAttribute("data-src")
        this.imageCache.set(src, true)
      }
      imageLoader.onerror = () => {
        console.warn(`Failed to load image: ${src}`)
        img.classList.add("error")
      }
      imageLoader.src = src
    } catch (error) {
      console.error("Error loading image:", error)
    }
  }

  async loadModule(moduleName, condition) {
    if (this.loadedModules.has(moduleName)) return

    try {
      switch (moduleName) {
        case "gallery":
          if (condition()) {
            const { GalleryModule } = await import("./gallery-module.js")
            const gallery = new GalleryModule()
            gallery.init()
            this.loadedModules.add("gallery")
          }
          break

        case "form":
          if (condition()) {
            const { FormModule } = await import("./form-module.js")
            const form = new FormModule()
            await form.init()
            this.loadedModules.add("form")
          }
          break

        case "animations":
          if (condition()) {
            this.initScrollAnimations()
            this.loadedModules.add("animations")
          }
          break
      }
    } catch (error) {
      console.warn(`Error loading module ${moduleName}:`, error)
    }
  }

  setupObservers() {
    // Load gallery when visible
    this.observeElement("#galeria", () => {
      this.loadModule("gallery", () => document.getElementById("carouselTrack"))
    })

    // Load form when visible
    this.observeElement("#contacto", () => {
      this.loadModule("form", () => document.getElementById("contactForm"))
    })

    // Load animations after delay
    setTimeout(() => {
      this.loadModule("animations", () => true)
    }, 1000)
  }

  observeElement(selector, callback) {
    const element = document.querySelector(selector)
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
            observer.disconnect()
          }
        })
      },
      { rootMargin: "100px" },
    )

    observer.observe(element)
    this.observers.set(selector, observer)
  }

  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("is-visible")
          }, index * 50)
          animationObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    document
      .querySelectorAll(
        ".animate-on-scroll, .animate-slide-from-left, .animate-slide-from-right, .animate-slide-from-bottom",
      )
      .forEach((el) => animationObserver.observe(el))
  }

  initScrollToTop() {
    const scrollBtn = document.getElementById("scrollToTop")
    if (!scrollBtn) return

    let isVisible = false
    let ticking = false

    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 300
      if (shouldShow !== isVisible) {
        scrollBtn.classList.toggle("visible", shouldShow)
        isVisible = shouldShow
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            toggleVisibility()
            ticking = false
          })
          ticking = true
        }
      },
      { passive: true },
    )

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  updateCurrentYear() {
    const yearEl = document.getElementById("currentYear")
    if (yearEl) yearEl.textContent = new Date().getFullYear()
  }

  initIcons() {
    const lucide = window.lucide // Declare the lucide variable
    if (typeof lucide !== "undefined") {
      try {
        lucide.createIcons()
      } catch (error) {
        console.warn("Error initializing icons:", error)
      }
    }
  }

  init() {
    // Critical functionality first
    this.updateCurrentYear()
    this.initScrollToTop()
    this.initImageLazyLoading()

    // Setup observers for lazy module loading
    this.setupObservers()

    // Initialize icons when available
    if (typeof window.lucide !== "undefined") {
      // Check for lucide in window
      this.initIcons()
    } else {
      const checkLucide = () => {
        if (typeof window.lucide !== "undefined") {
          // Check for lucide in window
          this.initIcons()
        } else {
          setTimeout(checkLucide, 100)
        }
      }
      checkLucide()
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const loader = new ModuleLoader()
    loader.init()
  })
} else {
  const loader = new ModuleLoader()
  loader.init()
}
