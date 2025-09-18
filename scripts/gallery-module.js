export class GalleryModule {
  constructor() {
    this.images = [
      {
        id: 1,
        src: "/imag/granja4.webp",
        alt: "Granja avícola moderna en Venezuela",
        title: "Granja Avícola Moderna",
        description: "Instalaciones avícolas de última generación",
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
        alt: "Equipo Agrolinx en granja porcina",
        title: "Equipo Técnico Agrolinx",
        description: "Nuestro equipo trabajando en campo",
        category: "servicios",
      },
    ]
    this.currentSlide = 0
    this.isLightboxOpen = false
    this.preloadedImages = new Set()
  }

  init() {
    if (!document.getElementById("carouselTrack")) return
    this.render()
    this.bindEvents()
    this.preloadCurrentAndAdjacent()
  }

  render() {
    const track = document.getElementById("carouselTrack")
    const thumbnails = document.getElementById("galleryThumbnails")
    const indicators = document.getElementById("carouselIndicators")

    if (!track) return

    // Render slides with lazy loading
    track.innerHTML = this.images
      .map(
        (img, i) =>
          `<div class="gallery-carousel__slide" data-index="${i}">
        <img ${i === 0 ? "src" : "data-src"}="${img.src}" alt="${img.alt}" class="gallery-carousel__image" loading="lazy">
      </div>`,
      )
      .join("")

    // Render thumbnails with lazy loading
    if (thumbnails) {
      thumbnails.innerHTML = this.images
        .map(
          (img, i) =>
            `<div class="gallery-thumbnail ${i === 0 ? "active" : ""}" data-index="${i}">
          <img ${i < 4 ? "src" : "data-src"}="${img.src}" alt="${img.alt}" loading="lazy">
        </div>`,
        )
        .join("")
    }

    // Render indicators
    if (indicators) {
      indicators.innerHTML = this.images
        .map(
          (_, i) =>
            `<button class="gallery-carousel__indicator ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="Ir a imagen ${i + 1}"></button>`,
        )
        .join("")
    }

    this.updateInfo()
  }

  bindEvents() {
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    if (prevBtn) prevBtn.addEventListener("click", () => this.prev())
    if (nextBtn) nextBtn.addEventListener("click", () => this.next())

    // Delegated event handling for better performance
    document.addEventListener("click", (e) => {
      const thumb = e.target.closest(".gallery-thumbnail")
      const indicator = e.target.closest(".gallery-carousel__indicator")
      const slide = e.target.closest(".gallery-carousel__slide")

      if (thumb) this.goTo(+thumb.dataset.index)
      if (indicator) this.goTo(+indicator.dataset.index)
      if (slide) this.openLightbox(+slide.dataset.index)
    })

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!this.isLightboxOpen && document.activeElement?.closest(".gallery")) {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          this.prev()
        }
        if (e.key === "ArrowRight") {
          e.preventDefault()
          this.next()
        }
      }
    })
  }

  goTo(index) {
    if (index < 0 || index >= this.images.length) return
    this.currentSlide = index
    this.updateCarousel()
    this.updateInfo()
    this.updateActive()
    this.preloadCurrentAndAdjacent()
  }

  next() {
    this.goTo((this.currentSlide + 1) % this.images.length)
  }

  prev() {
    this.goTo((this.currentSlide - 1 + this.images.length) % this.images.length)
  }

  updateCarousel() {
    const track = document.getElementById("carouselTrack")
    if (track) {
      track.style.transform = `translateX(-${this.currentSlide * 100}%)`
    }
  }

  updateInfo() {
    const img = this.images[this.currentSlide]
    const elements = {
      title: document.getElementById("imageTitle"),
      description: document.getElementById("imageDescription"),
      category: document.getElementById("imageCategory"),
      counter: document.getElementById("imageCounter"),
    }

    if (elements.title) elements.title.textContent = img.title
    if (elements.description) elements.description.textContent = img.description
    if (elements.category) elements.category.textContent = this.getCategoryLabel(img.category)
    if (elements.counter) elements.counter.textContent = `${this.currentSlide + 1} / ${this.images.length}`
  }

  updateActive() {
    document.querySelectorAll(".gallery-thumbnail, .gallery-carousel__indicator").forEach((el, i) => {
      el.classList.toggle("active", i === this.currentSlide)
    })
  }

  preloadCurrentAndAdjacent() {
    const preloadIndexes = [this.currentSlide - 1, this.currentSlide, this.currentSlide + 1]

    preloadIndexes.forEach((i) => {
      if (i >= 0 && i < this.images.length && !this.preloadedImages.has(i)) {
        const img = new Image()
        img.onload = () => {
          this.preloadedImages.add(i)
          // Update any lazy-loaded images
          const slideImg = document.querySelector(`[data-index="${i}"] img[data-src]`)
          if (slideImg) {
            slideImg.src = slideImg.dataset.src
            slideImg.removeAttribute("data-src")
            slideImg.classList.add("loaded")
          }
        }
        img.src = this.images[i].src
      }
    })
  }

  getCategoryLabel(category) {
    const labels = {
      avicola: "Avícola",
      porcina: "Porcina",
      servicios: "Servicios",
      procesamiento: "Procesamiento",
      laboratorio: "Laboratorio",
    }
    return labels[category] || category
  }

  openLightbox(index) {
    console.log("Opening lightbox for image", index)
    // Lightbox implementation would go here
  }
}
