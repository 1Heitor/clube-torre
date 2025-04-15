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
    // Limpar timeout de transição pendente e remover transição
    if (slides.transitionTimeout) {
        clearTimeout(slides.transitionTimeout);
        slides.transitionTimeout = null;
        slides.style.transition = 'none'; 
    }
    isDragging = true;
    startX = e.clientX;
    dragDistance = 0; 
    // slides.style.transition = 'none'; // Já definido acima ou no fim do timeout
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
    // Limpar timeout de transição pendente e remover transição
    if (slides.transitionTimeout) {
        clearTimeout(slides.transitionTimeout);
        slides.transitionTimeout = null;
        slides.style.transition = 'none'; 
    }
    isDragging = true;
    startX = e.touches[0].clientX;
    dragDistance = 0; 
    // slides.style.transition = 'none'; // Já definido acima ou no fim do timeout
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
    isDragging = false;

    const originalGroup = currentGroup; 

    if (visibleCount === 1) {
        // Mobile logic (posição final + rounding + WRAP-AROUND)
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0;
        const cardGap = 20;
        const slideWidth = cardWidth + cardGap;
        const threshold = slideWidth / 4;

        // Calcular o deslocamento relativo em termos de slides
        let slideShift = 0;
        if (slideWidth > 0) {
             slideShift = Math.round(dragDistance / slideWidth);
        }
        
        // Atualizar currentGroup APENAS se swipe foi significativo
        if (Math.abs(dragDistance) > threshold && slideShift !== 0) {
             // Calcula o novo índice com wrap-around usando módulo
             // (originalGroup - slideShift) porque dragDistance positivo é para a direita (anterior)
             // Adiciona groupCount antes do módulo para garantir resultado positivo
             currentGroup = (originalGroup - slideShift + groupCount) % groupCount; 
        }
        // Se não ultrapassou o threshold ou slideShift é 0, currentGroup não muda.

    } else {
      // Desktop/tablet logic (já usa módulo em next/prev)
      const carouselWidth = carousel.offsetWidth;
      const threshold = carouselWidth / 4;
      if (Math.abs(dragDistance) > threshold) {
        if (dragDistance < 0) {
          currentGroup = (currentGroup + 1) % groupCount;
        } else {
          currentGroup = (currentGroup - 1 + groupCount) % groupCount;
        }
      }
      // Se não ultrapassou o threshold, currentGroup não muda.
    }

    // SEMPRE aplicar a transição ANTES de atualizar a posição
    slides.style.transition = 'transform 0.5s ease';
    
    // Atualiza a posição para o currentGroup final (animado)
    updateSlidePosition();
    
    // SEMPRE agendar a limpeza da transição após a animação
    // Limpar timeout anterior se existir (segurança extra)
    if (slides.transitionTimeout) {
        clearTimeout(slides.transitionTimeout);
    }
    slides.transitionTimeout = setTimeout(() => {
        slides.style.transition = 'none'; 
        slides.transitionTimeout = null; // Limpar a referência
    }, 500); // Tempo igual à duração da transição CSS
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