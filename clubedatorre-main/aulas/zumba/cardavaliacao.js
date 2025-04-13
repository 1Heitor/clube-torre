window.addEventListener('load', function() {
    const section = document.querySelector('.testimonials-section');
    const carousel = section.querySelector('.testimonials-carousel');
    const slides = section.querySelector('.testimonials-slides');
    const cards = section.querySelectorAll('.testimonial-card');
    const dotsContainer = section.querySelector('.carousel-dots');
    const prevButton = section.querySelector('.prev');
    const nextButton = section.querySelector('.next');

    let currentGroup = 0;
    let isDragging = false, startX = 0, dragDistance = 0;
    let visibleCount = 4; // valor padrão para desktop
    let groupCount = 0;

    // Função para calcular quantos cards estão visíveis de acordo com a viewport
    function calculateVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) {
        visibleCount = 4;
      } else if (w >= 768) {
        visibleCount = 2;
      } else {
        visibleCount = 1;
      }
    }

    // Calcular o total de grupos (cada grupo representa os cards visíveis de uma vez)
    function calculateGroupCount() {
      groupCount = Math.ceil(cards.length / visibleCount);
    }

    // Atualizar os dots (bolinhas) de navegação de acordo com os grupos
    function updateDots() {
      dotsContainer.innerHTML = ''; // Limpa os dots
      for (let i = 0; i < groupCount; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.setAttribute('aria-label', `Ir para o grupo ${i + 1}`);
        dot.addEventListener('click', () => {
          currentGroup = i;
          updateSlidePosition();
        });
        dotsContainer.appendChild(dot);
      }
      // Atualiza a classe "active"
      const dots = section.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentGroup);
      });
    }

    // Atualizar a posição dos slides com base no grupo atual
    function updateSlidePosition() {
      const carouselWidth = carousel.offsetWidth;
      // Desloca de um grupo em cada vez (a largura do carousel equivale à área visível)
      slides.style.transform = `translateX(-${currentGroup * carouselWidth}px)`;
      updateDots();
    }

    function nextGroup() {
      currentGroup = (currentGroup + 1) % groupCount;
      updateSlidePosition();
    }

    function prevGroup() {
      currentGroup = (currentGroup - 1 + groupCount) % groupCount;
      updateSlidePosition();
    }

    // Eventos de clique para os botões
    prevButton.addEventListener('click', () => {
      prevGroup();
    });

    nextButton.addEventListener('click', () => {
      nextGroup();
    });

    // Eventos de arraste (mouse)
    slides.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      dragDistance = 0;
      slides.style.transition = 'none';
    });

    slides.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const distance = e.clientX - startX;
      dragDistance = distance;
      const carouselWidth = carousel.offsetWidth;
      const currentTransform = -currentGroup * carouselWidth + distance;
      slides.style.transform = `translateX(${currentTransform}px)`;
    });

    slides.addEventListener('mouseup', finishDrag);
    slides.addEventListener('mouseleave', finishDrag);

    function finishDrag() {
      if (!isDragging) return;
      slides.style.transition = 'transform 0.5s ease';
      isDragging = false;
      const carouselWidth = carousel.offsetWidth;
      
      if (Math.abs(dragDistance) > carouselWidth / 4) {
        if (dragDistance < 0) {
          nextGroup();
        } else {
          prevGroup();
        }
      } else {
        updateSlidePosition();
      }
    }

    // Eventos de toque (touch) para mobile
    slides.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      dragDistance = 0;
      slides.style.transition = 'none';
    });

    slides.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const distance = e.touches[0].clientX - startX;
      dragDistance = distance;
      const carouselWidth = carousel.offsetWidth;
      const currentTransform = -currentGroup * carouselWidth + distance;
      slides.style.transform = `translateX(${currentTransform}px)`;
    });

    slides.addEventListener('touchend', () => {
      finishDrag();
    });

    // Função inicial para configurar o carrossel
    function initCarousel() {
      calculateVisibleCount();
      calculateGroupCount();
      updateDots();
      updateSlidePosition();
    }

    // Iniciar quando carregar e também atualizar na mudança de tamanho da janela
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculateVisibleCount();
        calculateGroupCount();
        currentGroup = 0; // Reset para o primeiro grupo
        updateDots();
        updateSlidePosition();
      }, 250); // Aguarda 250ms após a última mudança de tamanho
    });

    initCarousel();
  });