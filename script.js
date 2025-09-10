// =====================================
// 1. TIMELINE AUTOMÁTICO
// =====================================
function initTimelines() {
  // Seleccionar los timelines
  const timelines = document.querySelectorAll('.timeline-estudios, .timeline-laboral');
  
  // Configurar el Intersection Observer
  const observerOptions = {
    root: null, // usar el viewport
    rootMargin: '0px',
    threshold: 0.01 // activar cuando al menos 1% del elemento sea visible
  };
  
  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      // Si el elemento es visible
      if (entry.isIntersecting) {
        // Reiniciar las animaciones
        const tarjetas = entry.target.querySelectorAll('.tarjeta');
        const puntos = entry.target.querySelectorAll('.punto-conector, .punto-laboral');
        const linea = entry.target.querySelector('.linea-estudios, .linea-laboral');
        
        // Reiniciar animaciones
        tarjetas.forEach(tarjeta => {
          tarjeta.style.animation = 'none';
          setTimeout(() => {
            tarjeta.style.animation = '';
          }, 10);
        });
        
        puntos.forEach(punto => {
          punto.style.animation = 'none';
          setTimeout(() => {
            punto.style.animation = '';
          }, 10);
        });
        
        if (linea) {
          linea.style.animation = 'none';
          setTimeout(() => {
            linea.style.animation = '';
          }, 10);
        }
        
        // Marcar como visible
        entry.target.classList.remove('hidden');
        entry.target.classList.add('visible');
        
      } else {
        // Cuando sale del viewport
        entry.target.classList.add('hidden');
        entry.target.classList.remove('visible');
      }
    });
  }, observerOptions);
  
  // Comenzar a observar cada timeline
  timelines.forEach(timeline => {
    timeline.classList.add('hidden'); // Inicialmente oculto
    observer.observe(timeline);
  });
}

// =====================================
// 2. CARRUSEL AUTOMÁTICO MÓVIL
// =====================================
function initMobileCarousels() {
  // Solo ejecutar si estamos en móvil
  if (!isMobile()) return;
  
  const mobileCarousels = document.querySelectorAll('.mobile-carousel');
  
  mobileCarousels.forEach(function(carousel, carouselIndex) {
    // Limpiar carruseles existentes
    const existingButtons = carousel.querySelectorAll('.carousel-prev, .carousel-next, .carousel-indicators');
    existingButtons.forEach(btn => btn.remove());
    
    const carouselInner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    
    if (!carouselInner || items.length === 0) return;
    
    let currentIndex = 0;
    const totalItems = items.length;
    let intervalId;
    
    // Función para mover el carrusel a un índice específico
    function moveToIndex(index) {
      currentIndex = index;
      carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateIndicators();
    }
    
    // Función para mover al siguiente item
    function moveNext() {
      currentIndex = (currentIndex + 1) % totalItems;
      moveToIndex(currentIndex);
    }
    
    // Función para mover al item anterior
    function movePrev() {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      moveToIndex(currentIndex);
    }
    
    // Iniciar la reproducción automática
    function startAutoplay() {
      clearInterval(intervalId); // Limpiar cualquier intervalo existente
      intervalId = setInterval(moveNext, 3000); // Cambiar cada 3 segundos
    }
    
    // Detener la reproducción automática
    function stopAutoplay() {
      clearInterval(intervalId);
    }
    
    // Crear botones de navegación
    function createNavigationButtons() {
      // Botón anterior
      const prevButton = document.createElement('button');
      prevButton.className = 'carousel-prev';
      prevButton.innerHTML = '&#8249;';
      prevButton.setAttribute('aria-label', 'Anterior');
      prevButton.addEventListener('click', function() {
        stopAutoplay();
        movePrev();
        startAutoplay();
      });
      
      // Botón siguiente
      const nextButton = document.createElement('button');
      nextButton.className = 'carousel-next';
      nextButton.innerHTML = '&#8250;';
      nextButton.setAttribute('aria-label', 'Siguiente');
      nextButton.addEventListener('click', function() {
        stopAutoplay();
        moveNext();
        startAutoplay();
      });
      
      // Añadir los botones al carrusel
      carousel.appendChild(prevButton);
      carousel.appendChild(nextButton);
    }
    
    // Crear indicadores de posición
    function createIndicators() {
      const indicators = document.createElement('div');
      indicators.className = 'carousel-indicators';
      
      for (let i = 0; i < totalItems; i++) {
        const dot = document.createElement('span');
        dot.className = i === 0 ? 'active' : '';
        dot.dataset.index = i;
        dot.setAttribute('aria-label', `Ir a experiencia ${i + 1}`);
        dot.addEventListener('click', function() {
          const clickedIndex = parseInt(this.dataset.index);
          stopAutoplay();
          moveToIndex(clickedIndex);
          startAutoplay();
        });
        indicators.appendChild(dot);
      }
      
      carousel.appendChild(indicators);
    }
    
    // Actualizar los indicadores
    function updateIndicators() {
      const dots = carousel.querySelectorAll('.carousel-indicators span');
      dots.forEach((dot, i) => {
        dot.className = i === currentIndex ? 'active' : '';
      });
    }
    
    // Eventos de touch para móvil
    let startX, startY, currentX, currentY;
    let isDragging = false;
    
    carouselInner.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      stopAutoplay();
    });
    
    carouselInner.addEventListener('touchmove', function(e) {
      if (!startX || !startY) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        isDragging = true;
      }
    });
    
    carouselInner.addEventListener('touchend', function(e) {
      if (!isDragging) {
        startAutoplay();
        return;
      }
      
      const diffX = startX - currentX;
      
      if (Math.abs(diffX) > 50) { // Mínimo de 50px para activar
        if (diffX > 0) {
          moveNext();
        } else {
          movePrev();
        }
      }
      
      startX = startY = currentX = currentY = null;
      isDragging = false;
      startAutoplay();
    });
    
    // Detener autoplay al interactuar
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
    // Inicializar el carrusel
    createNavigationButtons();
    createIndicators();
    moveToIndex(0); // Inicializar en la primera posición
    startAutoplay();
  });
}

// =====================================
// 3. CARRUSEL DE PYTHON
// =====================================
function initPythonCarousels() {
  const carousels = document.querySelectorAll('.python-carousel');  // Selecciona TODOS los carruseles (cambia a .clustering-carousel si no cambias clases)
  
  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.python-track');  // Cambia a .clustering-track si es necesario
    const images = carousel.querySelectorAll('.python-track img');  // Cambia a .clustering-track img
    const btnPrev = carousel.querySelector('.python-btn.prev');  // Cambia a .clustering-btn.prev
    const btnNext = carousel.querySelector('.python-btn.next');  // Cambia a .clustering-btn.next
    
    // Verificar que existan los elementos en este carrusel
    if (!track || images.length === 0 || !btnPrev || !btnNext) return;
    
    let index = 0;

    function updateCarousel() {
      const width = images[0].clientWidth;
      track.style.transform = `translateX(-${index * width}px)`;
    }

    function nextSlide() {
      index = (index + 1) % images.length;
      updateCarousel();
    }

    function prevSlide() {
      index = (index - 1 + images.length) % images.length;
      updateCarousel();
    }

    // Event listeners para los botones
    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);

    // Actualizar en resize (para este carrusel específico)
    window.addEventListener('resize', updateCarousel);

    // Pase automático cada 4 segundos
    setInterval(nextSlide, 4000);

    // Inicializar
    updateCarousel();
  });
}

// =====================================
// 4. MENÚ STICKY DE NAVEGACIÓN
// =====================================
function initStickyNav() {
  const nav = document.getElementById('sticky-nav');
  
  if (!nav) return;
  
  // Hacer el menú visible desde el principio
  nav.style.display = 'block';
  
  // Función para manejar el cambio de estilo al hacer scroll
  function handleScroll() {
    if (window.scrollY > 300) {
      nav.classList.add('sticky');
    } else {
      nav.classList.remove('sticky');
    }
  }
  
  // Ejecutar la función al cargar la página
  handleScroll();
  
  // Añadir el evento de scroll
  window.addEventListener('scroll', handleScroll);
}

// =====================================
// 5. MENÚ HAMBURGUESA MÓVIL
// =====================================
function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('#sticky-nav ul');
  
  if (!navToggle || !navMenu) return;
  
  navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('open');
  });
}

// =====================================
// 6. TRACKING DE EVENTOS (Google Analytics)
// =====================================
function initEventTracking() {
  document.addEventListener('click', function(event) {
    let element = event.target;
    
    // Navegar hacia arriba para encontrar el enlace si se hizo clic en un hijo
    while (element && element.tagName !== 'A') {
      element = element.parentElement;
    }
    
    // Verificar si el elemento es un enlace de seguimiento
    if (element && element.getAttribute('data-tracking') === 'true') {
      const category = element.getAttribute('data-event-category');
      const action = element.getAttribute('data-event-action');
      const label = element.getAttribute('data-event-label');
      
      // Enviar evento a GA4 (solo si gtag está disponible)
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          'event_category': category,
          'event_label': label
        });
        
        console.log('Evento rastreado:', category, action, label);
      }
    }
  });
}

// =====================================
// 7. INICIALIZACIÓN PRINCIPAL
// =====================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando Portfolio...');
  
  // Inicializar todos los módulos
  initTimelines();
  initMobileCarousels();
  initPythonCarousels();
  initStickyNav();
  initMobileMenu();
  initEventTracking();
  initJobFunctions();
  
  // Manejar cambios de tamaño de ventana
  window.addEventListener('resize', debounce(handleResize, 250));
  
  console.log('✅ Portfolio inicializado correctamente');
});
// =====================================
// 8. BOTONES DE FUNCIONES - EXPERIENCIA
// =====================================
function initJobFunctions() {
  const funcionesBotones = document.querySelectorAll('.btn-funciones');
  
  funcionesBotones.forEach(boton => {
    boton.addEventListener('click', function() {
      const jobId = this.getAttribute('data-job');
      const funcionesDetalle = document.getElementById(jobId);
      const isActive = this.classList.contains('active');
      
      // Cerrar todas las otras funciones abiertas
      funcionesBotones.forEach(otroBoton => {
        if (otroBoton !== this) {
          otroBoton.classList.remove('active');
          const otroJobId = otroBoton.getAttribute('data-job');
          const otrasFunciones = document.getElementById(otroJobId);
          if (otrasFunciones) {
            otrasFunciones.style.display = 'none';
            otrasFunciones.classList.remove('closing');
          }
        }
      });
      
      if (!isActive) {
        // Mostrar funciones
        this.classList.add('active');
        if (funcionesDetalle) {
          funcionesDetalle.style.display = 'block';
          funcionesDetalle.classList.remove('closing');
          
          // Scroll suave hacia el elemento si es necesario
          setTimeout(() => {
            const rect = funcionesDetalle.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            if (!isVisible) {
              funcionesDetalle.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
              });
            }
          }, 300);
        }
      } else {
        // Ocultar funciones con animación
        this.classList.remove('active');
        if (funcionesDetalle) {
          funcionesDetalle.classList.add('closing');
          setTimeout(() => {
            funcionesDetalle.style.display = 'none';
            funcionesDetalle.classList.remove('closing');
          }, 300);
        }
      }
    });
  });
}

// =====================================
// 9. FUNCIONES DE UTILIDAD
// =====================================

// Función para hacer scroll suave a una sección
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Función para detectar si el usuario está en móvil
function isMobile() {
  return window.innerWidth <= 768;
}


// Función para debounce (útil para eventos como resize o scroll)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
// Manejar cambios de tamaño de ventana
function handleResize() {
  // Cerrar todas las funciones cuando cambie el tamaño de pantalla
  closeAllJobFunctions();
  
  // Reinicializar carruseles si es necesario
  if (isMobile()) {
    // Asegurar que los carruseles funcionen correctamente en móvil
    initMobileCarousels();
  }
}

function getContextButtons(button) {
  // Determinar si estamos en timeline o carrusel móvil
  const timelineContainer = button.closest('.timeline-laboral, .timeline-estudios');
  const carouselContainer = button.closest('.mobile-carousel');
  
  if (timelineContainer) {
    // Si estamos en timeline, solo considerar botones del timeline
    return timelineContainer.querySelectorAll('.btn-funciones');
  } else if (carouselContainer) {
    // Si estamos en carrusel móvil, solo considerar botones del carrusel
    return carouselContainer.querySelectorAll('.btn-funciones');
  } else {
    // Fallback: todos los botones
    return document.querySelectorAll('.btn-funciones');
  }
}

// Función para cerrar todas las funciones abiertas
function closeAllJobFunctions() {
  const funcionesBotones = document.querySelectorAll('.btn-funciones');
  const funcionesDetalles = document.querySelectorAll('.funciones-detalle');
  
  funcionesBotones.forEach(boton => {
    boton.classList.remove('active');
  });
  
  funcionesDetalles.forEach(detalle => {
    detalle.style.display = 'none';
    detalle.classList.remove('closing');
  });
}