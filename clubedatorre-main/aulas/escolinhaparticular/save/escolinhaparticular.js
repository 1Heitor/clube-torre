window.addEventListener('load', function() {
  // Elementos do carrossel
  const carouselContainer = document.querySelector('.carousel-container');
  const cards = document.querySelector('.cards');
  const cardElements = cards.querySelectorAll('.card');
  const prevButton = document.querySelector('.carousel-button.prev');
  const nextButton = document.querySelector('.carousel-button.next');
  
  // Adicionar pontos de navegação
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  carouselContainer.appendChild(dotsContainer);
  
  // Variáveis de estado
  let currentGroup = 0;
  let isDragging = false;
  let startX = 0;
  let dragDistance = 0;
  let scrollStart = 0;
  let visibleCount = 3; // valor padrão para desktop
  let groupCount = 0;
  let isMobile = window.innerWidth <= 768;
  
  // 1. Duplicar cards para scroll infinito em desktop
  function setupDesktopCards() {
    // Verificar se já existem clones
    const existingCards = cards.querySelectorAll('.card');
    if (existingCards.length > cardElements.length) {
      return; // Já existem clones
    }
    
    // Adicionar clones para desktop
    Array.from(cardElements).forEach(card => {
      const clone = card.cloneNode(true);
      cards.appendChild(clone);
    });
    
    // Posicionar o scroll no início
    setTimeout(() => {
      cards.scrollLeft = 0;
    }, 100);
  }
  
  // Inicializar desktop
  if (!isMobile) {
    setupDesktopCards();
  }
  
  // 2. Funções para o modo desktop (original)
  // Teletransporte para desktop (loop infinito)
  function teleport() {
    if (isMobile) return;
    
    const half = cards.scrollWidth / 2;
    const threshold = 50;
    if (cards.scrollLeft <= threshold) {
      cards.scrollLeft += half - threshold;
    } else if (cards.scrollLeft >= half + threshold) {
      cards.scrollLeft -= half - threshold;
    }
  }
  
  // Scroll contínuo para desktop
  let scrollInterval;
  const scrollSpeed = 5;
  const intervalDelay = 10;
  
  function startScrolling(direction) {
    if (isMobile) {
      // Mobile: usar o comportamento do cardavaliacao.js
      if (direction < 0) {
        prevGroup();
      } else {
        nextGroup();
      }
    } else {
      // Desktop: scroll contínuo
      stopScrolling();
      scrollInterval = setInterval(() => {
        cards.scrollLeft += direction * scrollSpeed;
        teleport();
      }, intervalDelay);
    }
  }
  
  function stopScrolling() {
    clearInterval(scrollInterval);
  }
  
  // 3. Funções para o modo mobile (inspirado no cardavaliacao.js)
  function calculateVisibleCount() {
    const w = window.innerWidth;
    if (w >= 1024) {
      visibleCount = 3;
    } else if (w >= 768) {
      visibleCount = 2;
    } else {
      visibleCount = 1;
    }
    isMobile = w <= 768;
  }
  
  function calculateGroupCount() {
    groupCount = Math.ceil(cardElements.length / visibleCount);
  }
  
  function updateDots() {
    if (!isMobile) return;
    
    dotsContainer.innerHTML = '';
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
    
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentGroup);
    });
  }
  
  function updateSlidePosition() {
    if (!isMobile) return;
    
    const cardWidth = cardElements[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(cardElements[0]).marginRight) || 20;
    
    if (visibleCount === 1) {
      const position = -currentGroup * (cardWidth + gap);
      cards.style.transform = `translateX(${position}px)`;
      
      cardElements.forEach(card => {
        card.style.width = '90%';
        card.style.minWidth = '90%';
      });
    } else {
      cards.style.transform = `translateX(-${currentGroup * carouselContainer.offsetWidth}px)`;
    }
    
    updateDots();
  }
  
  function nextGroup() {
    if (isMobile) {
      currentGroup = (currentGroup + 1) % groupCount;
      updateSlidePosition();
    } else {
      startScrolling(1);
    }
  }
  
  function prevGroup() {
    if (isMobile) {
      currentGroup = (currentGroup - 1 + groupCount) % groupCount;
      updateSlidePosition();
    } else {
      startScrolling(-1);
    }
  }
  
  // 4. Evento de clique para os botões
  prevButton.addEventListener('click', prevGroup);
  nextButton.addEventListener('click', nextGroup);
  
  // Para desktop: eventos de iniciar/parar scrolling
  if (!isMobile) {
    prevButton.addEventListener('mousedown', () => startScrolling(-1));
    nextButton.addEventListener('mousedown', () => startScrolling(1));
    
    document.addEventListener('mouseup', () => {
      stopScrolling();
      if (!isDragging) teleport();
    });
    
    prevButton.addEventListener('mouseleave', stopScrolling);
    nextButton.addEventListener('mouseleave', stopScrolling);
  }
  
  // 5. Eventos de arraste (mouse)
  cards.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    dragDistance = 0;
    scrollStart = cards.scrollLeft;
    
    if (isMobile) {
      cards.style.transition = 'none';
    }
    
    cards.style.cursor = 'grabbing';
  });
  
  cards.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const distance = e.clientX - startX;
    dragDistance = distance;
    
    if (isMobile) {
      const cardWidth = cardElements[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(cardElements[0]).marginRight) || 20;
      const currentTransform = -currentGroup * (cardWidth + gap) + distance;
      cards.style.transform = `translateX(${currentTransform}px)`;
    } else {
      cards.scrollLeft = scrollStart - distance;
    }
  });
  
  function finishDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    cards.style.cursor = 'grab';
    
    if (isMobile) {
      cards.style.transition = 'transform 0.5s ease';
      
      const cardWidth = cardElements[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(cardElements[0]).marginRight) || 20;
      const threshold = (cardWidth + gap) / 4;
      
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
      teleport();
    }
  }
  
  cards.addEventListener('mouseup', finishDrag);
  cards.addEventListener('mouseleave', finishDrag);
  
  // 6. Eventos de toque (para mobile)
  cards.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    dragDistance = 0;
    scrollStart = cards.scrollLeft;
    
    if (isMobile) {
      cards.style.transition = 'none';
    }
  }, { passive: true });
  
  cards.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const distance = e.touches[0].clientX - startX;
    dragDistance = distance;
    
    if (isMobile) {
      const cardWidth = cardElements[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(cardElements[0]).marginRight) || 20;
      const currentTransform = -currentGroup * (cardWidth + gap) + distance;
      cards.style.transform = `translateX(${currentTransform}px)`;
    } else {
      cards.scrollLeft = scrollStart - distance;
    }
  }, { passive: true });
  
  cards.addEventListener('touchend', finishDrag);
  cards.addEventListener('touchcancel', finishDrag);
  
  // 7. Loop infinito para desktop
  if (!isMobile) {
    cards.addEventListener('scroll', () => {
      if (!isDragging) {
        teleport();
      }
    });
  }
  
  // 8. Inicialização e responsividade
  function initCarousel() {
    calculateVisibleCount();
    calculateGroupCount();
    
    if (isMobile) {
      // Modo mobile
      currentGroup = 0;
      dotsContainer.style.display = 'flex';
      cards.style.transform = 'translateX(0)';
      updateSlidePosition();
    } else {
      // Modo desktop
      dotsContainer.style.display = 'none';
      cards.style.transform = '';
      setupDesktopCards();
    }
  }
  
  // Evento de redimensionamento
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const wasMobile = isMobile;
      calculateVisibleCount();
      
      // Se mudou entre mobile e desktop, reiniciar o carrossel
      if (wasMobile !== isMobile) {
        initCarousel();
      } else if (isMobile) {
        // Atualizar apenas no mobile
        calculateGroupCount();
        currentGroup = 0;
        updateSlidePosition();
      }
    }, 250);
  });
  
  // Inicializar o carrossel
  initCarousel();
});