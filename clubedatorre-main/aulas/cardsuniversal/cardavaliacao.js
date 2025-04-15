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
  let isMobile = window.innerWidth <= 768;

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
    isMobile = w <= 768;
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
    // Define a largura total necessária para todos os cards, considerando o gap
    const cardWidth = cards[0].offsetWidth;
    const cardGap = 20; // Este é o valor do gap entre os cards definido no CSS
    
    // Calcula a posição correta para cada card
    if (visibleCount === 1) {
      // Quando estiver em visualização móvel, posicionamos cada card individualmente
      const position = -currentGroup * (cardWidth + cardGap);
      slides.style.transform = `translateX(${position}px)`;
      
      // Ajuste para garantir que o card ocupe toda a largura disponível
      cards.forEach(card => {
        card.style.width = `${carouselWidth - cardGap}px`;
      });
    } else {
      // Para desktop/tablet, mantenha o comportamento original
      slides.style.transform = `translateX(-${currentGroup * carouselWidth}px)`;
    }
    
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
    
    // Ajustes para visualização móvel
    if (visibleCount === 1) {
      const cardWidth = cards[0].offsetWidth;
      const cardGap = 20;
      const currentTransform = -currentGroup * (cardWidth + cardGap) + distance;
      slides.style.transform = `translateX(${currentTransform}px)`;
    } else {
      const carouselWidth = carousel.offsetWidth;
      const currentTransform = -currentGroup * carouselWidth + distance;
      slides.style.transform = `translateX(${currentTransform}px)`;
    }
  });

  slides.addEventListener('touchend', () => {
    finishDrag();
  });

  function finishDrag() {
    if (!isDragging) return;
    slides.style.transition = 'transform 0.5s ease';
    isDragging = false;
    
    if (visibleCount === 1) {
      const cardWidth = cards[0].offsetWidth;
      const cardGap = 20;
      const threshold = (cardWidth + cardGap) / 4;
      
      if (Math.abs(dragDistance) > threshold) {
        if (dragDistance < 0) {
          // Deslizando para a esquerda (próximo)
          if (currentGroup < groupCount - 1) {
            nextGroup();
          } else {
            // Se estiver no último grupo, vá para o primeiro
            currentGroup = 0;
            updateSlidePosition();
          }
        } else {
          // Deslizando para a direita (anterior)
          if (currentGroup > 0) {
            prevGroup();
          } else {
            // Se estiver no primeiro grupo, vá para o último
            currentGroup = groupCount - 1;
            updateSlidePosition();
          }
        }
      } else {
        updateSlidePosition();
      }
    } else {
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
  }

  // Função inicial para configurar o carrossel
  function initCarousel() {
    calculateVisibleCount();
    calculateGroupCount();
    
    // Ajustar o tamanho dos cards para visualização móvel
    if (visibleCount === 1) {
      const cardGap = 20;
      const carouselWidth = carousel.offsetWidth;
      cards.forEach(card => {
        // Define a largura do card para preencher o carrossel, menos o gap
        card.style.width = `${carouselWidth - cardGap}px`;
      });
    }
    
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