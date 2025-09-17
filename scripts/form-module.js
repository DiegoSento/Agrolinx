// Módulo de Formulario Optimizado - Carga bajo demanda
export class FormModule {
  constructor() {
    this.config = {
      serviceId: 'service_h2hvohe',
      templateId: 'template_t1491kb', 
      publicKey: 'bNqMyJVanAEZPXISP'
    };
    this.emailJSLoaded = false;
  }

  async init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    await this.loadEmailJS();
    this.bindEvents(form);
  }

  async loadEmailJS() {
    if (this.emailJSLoaded || typeof emailjs !== 'undefined') return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.onload = () => {
        emailjs.init(this.config.publicKey);
        this.emailJSLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  bindEvents(form) {
    // Validation on blur
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });

    // Form submission
    form.addEventListener('submit', e => this.handleSubmit(e));
  }

  validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    this.clearError(field);

    if (isRequired && !value) {
      this.showError(field, 'Este campo es obligatorio');
      return false;
    }

    if (field.type === 'email' && value && !this.isValidEmail(value)) {
      this.showError(field, 'Email inválido');
      return false;
    }

    if (field.type === 'tel' && value && !/^[+]?[0-9\s\-()]{10,}$/.test(value)) {
      this.showError(field, 'Teléfono inválido');
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showError(field, message) {
    field.classList.add('error');
    let errorEl = field.parentNode.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.style.cssText = 'color:var(--color-error);font-size:var(--font-size-xs);margin-top:var(--spacing-1);display:block;';
      field.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearError(field) {
    field.classList.remove('error');
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) errorEl.remove();
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitLoading = document.getElementById('submitLoading');

    // Validate all fields
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    inputs.forEach(input => {
      if (!this.validateField(input)) isValid = false;
    });

    if (!isValid) {
      this.showNotification('Corrige los errores en el formulario', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    if (submitText) submitText.style.display = 'none';
    if (submitLoading) submitLoading.style.display = 'flex';

    try {
      await this.loadEmailJS();
      
      const formData = new FormData(form);
      const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        position: formData.get('position') || 'No especificado',
        operation: this.getOperationLabel(formData.get('operation')),
        message: formData.get('message') || 'Sin mensaje adicional',
        to_email: 'diego.barrera@sento.tech',
        reply_to: formData.get('email'),
        current_date: new Date().toLocaleDateString('es-VE', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      };

      await emailjs.send(this.config.serviceId, this.config.templateId, templateParams);
      
      this.showNotification('¡Mensaje enviado exitosamente!', 'success');
      this.showSuccess();
      form.reset();

    } catch (error) {
      console.error('Error:', error);
      this.showNotification('Error al enviar. Contacta directamente a diego.barrera@sento.tech', 'error', 8000);
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      if (submitText) submitText.style.display = 'inline';
      if (submitLoading) submitLoading.style.display = 'none';
    }
  }

  getOperationLabel(operation) {
    const labels = {
      'avicola-engorde': 'Avícola - Pollos de engorde',
      'avicola-ponedoras': 'Avícola - Ponedoras',
      'porcina': 'Porcina - Cría y engorde',
      'planta-alimentos': 'Planta de alimentos',
      'planta-beneficio': 'Planta de beneficio',
      'distribuidor': 'Distribuidor',
      'otro': 'Otro'
    };
    return labels[operation] || operation || 'No especificado';
  }

  showSuccess() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('contactSuccess');
    if (form && success) {
      form.style.display = 'none';
      success.style.display = 'block';
    }
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
      position:fixed;top:20px;right:20px;background:var(--color-${type});color:white;
      padding:1rem 1.5rem;border-radius:var(--border-radius-lg);box-shadow:var(--shadow-xl);
      z-index:10000;max-width:350px;transform:translateX(100%);
      transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);font-size:var(--font-size-sm);
    `;
    notification.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;"><span>${message}</span></div>`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}