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
    const cardGap = 20; // Corresponder ao CSS

    if (visibleCount === 1) {
        // Quando estiver em visualização móvel (1 card)
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0; // Lê a largura do primeiro card após CSS aplicado
        // Calcula a posição baseado no índice do card (currentGroup)
        const position = -currentGroup * (cardWidth + cardGap); 
        slides.style.transform = `translateX(${position}px)`;
        
        // NÃO definir a largura do card aqui via JS

    } else {
        // Para desktop/tablet, usa a lógica de grupos baseada na largura do carrossel
        slides.style.transform = `translateX(-${currentGroup * carouselWidth}px)`;
    }

    updateDots(); // Atualiza os dots para refletir o grupo atual
  }

  function nextGroup() {
    // Lógica original com wrap-around (%) funciona bem para desktop/tablet
    // Para mobile, finishDrag já limita, mas usar % aqui não prejudica
    currentGroup = (currentGroup + 1) % groupCount;
    updateSlidePosition();
  }

  function prevGroup() {
    // Lógica original com wrap-around (%)
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
    // Impede o comportamento padrão do navegador (ex: rolar a página) durante o arraste do slide
    e.preventDefault(); 
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
  }, { passive: false }); // Adiciona passive: false para permitir preventDefault

  slides.addEventListener('touchend', () => {
    finishDrag();
  });

  // Adiciona listener para touchcancel
  slides.addEventListener('touchcancel', () => {
    if (isDragging) {
      // Trata cancelamento como fim do toque para garantir estado consistente
      finishDrag();
    }
  });

  function finishDrag() {
    if (!isDragging) return;
    slides.style.transition = 'transform 0.5s ease';
    isDragging = false;

    if (visibleCount === 1) {
        // Lógica revisada (v3) para mobile (1 card visível) - Foco na Direção + Limites
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0;
        const cardGap = 20; // Deve corresponder ao gap no CSS
        const slideWidth = cardWidth + cardGap;
        const threshold = slideWidth / 4; // Limite para swipe válido

        if (Math.abs(dragDistance) > threshold) {
             // Swipe foi significativo, determinar direção e calcular novo grupo com limites
            if (dragDistance < 0) {
                // Arrastou para esquerda (próximo)
                currentGroup = Math.min(currentGroup + 1, groupCount - 1);
            } else {
                // Arrastou para direita (anterior)
                currentGroup = Math.max(currentGroup - 1, 0);
            }
        } 
        // Se não foi significativo (else implícito), currentGroup não muda.
        // Sempre chama updateSlidePosition para animar para a posição final (nova ou a mesma)
        updateSlidePosition();

    } else {
      // Lógica original para desktop/tablet (grupos maiores)
      const carouselWidth = carousel.offsetWidth;
      const threshold = carouselWidth / 4;
      if (Math.abs(dragDistance) > threshold) {
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
    calculateGroupCount(); // groupCount será cards.length no mobile

    // Confiar no CSS para a largura dos cards no mobile e desktop
    cards.forEach(card => {
      card.style.width = ''; // Limpa qualquer estilo inline de largura pré-existente
    });

    updateDots(); // Recalcula os dots com base no novo groupCount
    currentGroup = 0; // Garante que começa no primeiro grupo
    updateSlidePosition(); // Atualiza a posição inicial
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