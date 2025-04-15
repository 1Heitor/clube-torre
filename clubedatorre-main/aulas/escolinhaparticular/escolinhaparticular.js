window.addEventListener('load', function() {
  // Elementos do carrossel
  const carouselContainer = document.querySelector('.carousel-container');
  const cards = document.querySelector('.cards');
  const cardElements = cards.querySelectorAll('.card');
  const prevButton = document.querySelector('.carousel-button.prev');
  const nextButton = document.querySelector('.carousel-button.next');
  
  // Obter apenas os cards originais
  const originalCards = Array.from(cards.querySelectorAll('.card'));
  
  // Variáveis para o carrossel
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let scrollStart = 0;
  let isMobile = window.innerWidth <= 768;
  let currentIndex = 0;
  
  // Criar container para bolinhas de navegação
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  carouselContainer.appendChild(dotsContainer);
  
  // Configuração para Desktop: duplicar cards para criar loop infinito
  function setupDesktop() {
    // Remover todos os elementos clones existentes
    const allCards = cards.querySelectorAll('.card');
    for (let i = originalCards.length; i < allCards.length; i++) {
      cards.removeChild(allCards[i]);
    }
    
    // Adicionar clones para desktop
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      cards.appendChild(clone);
    });
    
    // Configurar estilo para desktop
    cards.style.transform = '';
    cards.style.transition = '';
    cards.style.width = '';
    
    // Esconder bolinhas de navegação
    dotsContainer.style.display = 'none';
    
    // Garantir estilo original dos cards
    originalCards.forEach(card => {
      card.style.width = '';
      card.style.minWidth = '';
      card.style.margin = '';
    });
    
    // Posicionar scroll
    setTimeout(() => {
      cards.scrollLeft = 0;
    }, 100);
  }
  
  // Configuração para Mobile
  function setupMobile() {
    // Remover clones se existirem
    const allCards = cards.querySelectorAll('.card');
    for (let i = originalCards.length; i < allCards.length; i++) {
      cards.removeChild(allCards[i]);
    }
    
    // Resetar o índice
    currentIndex = 0;
    
    // Configurar layout para mobile - usar a largura do viewport como referência
    const viewportWidth = carouselContainer.offsetWidth;
    
    // Ajustar cada card para 90% da largura do viewport com margens automáticas
    originalCards.forEach((card, index) => {
      // Ajusta a largura do card baseado no viewport
      card.style.width = `${viewportWidth * 0.9}px`;
      card.style.minWidth = `${viewportWidth * 0.9}px`;

      // Margens específicas para cada viewport
      if (viewportWidth <= 480) {
        // Mobile pequeno
        if (index === 0) {
          card.style.margin = '0px 5px 0px 20px';
        } else if (index === 1) {
          card.style.margin = '0px 15px 0px 20px';
        } else if (index === 2) {
          card.style.margin = '0px 0px 0px 10px';
        } else {
          card.style.margin = '5px 15px';
        }
      } else if (viewportWidth <= 768) {
        // Tablet/Mobile maior
        if (index === 0) {
          card.style.margin = '0px 10px 0px 35px';
        } else if (index === 1) {
          card.style.margin = '0px 30px 0px 40px';
        } else if (index === 2) {
          card.style.margin = '0px 0px 0px 18px';
        } else {
          card.style.margin = '10px 27px';
        }
      } else {
        // Desktop
        if (index === 0) {
          card.style.margin = '0px 15px 0px 45px';
        } else if (index === 1) {
          card.style.margin = '0px 40px 0px 50px';
        } else if (index === 2) {
          card.style.margin = '0px 0px 0px 25px';
        } else {
          card.style.margin = '15px 35px';
        }
      }
    });
    
    // Definir a largura total do container para acomodar todos os slides
    cards.style.width = `${originalCards.length * viewportWidth}px`;
    
    // Mostrar bolinhas de navegação
    updateDots();
    dotsContainer.style.display = 'flex';
    
    // Mover para o primeiro card
    moveToCard(0);
  }
  
  // Função de teletransporte para desktop
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
  
  // Atualizar bolinhas de navegação
  function updateDots() {
    dotsContainer.innerHTML = '';
    
    if (!isMobile) return;
    
    for (let i = 0; i < originalCards.length; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      if (i === currentIndex) {
        dot.classList.add('active');
      }
      dot.addEventListener('click', () => moveToCard(i));
      dotsContainer.appendChild(dot);
    }
  }
  
  // Mover para um card específico (mobile)
  function moveToCard(index) {
    if (!isMobile) return;
    
    currentIndex = index;
    
    // Usar a largura do viewport para cálculos em vez de cardWidth + margins
    const viewportWidth = carouselContainer.offsetWidth;
    const position = index * viewportWidth;
    
    cards.style.transition = 'transform 0.5s ease';
    cards.style.transform = `translateX(-${position}px)`;
    
    updateDots();
  }
  
  // Próximo card
  function nextCard() {
    if (isMobile) {
      currentIndex = (currentIndex + 1) % originalCards.length;
      moveToCard(currentIndex);
    } else {
      // Desktop: scroll contínuo
      cards.scrollBy({
        left: 100,
        behavior: 'smooth'
      });
    }
  }
  
  // Card anterior
  function prevCard() {
    if (isMobile) {
      currentIndex = (currentIndex - 1 + originalCards.length) % originalCards.length;
      moveToCard(currentIndex);
    } else {
      // Desktop: scroll contínuo
      cards.scrollBy({
        left: -100,
        behavior: 'smooth'
      });
    }
  }
  
  // Variáveis para scroll contínuo (desktop)
  let scrollInterval;
  const scrollSpeed = 5;
  const intervalDelay = 10;
  
  function startScrolling(direction) {
    if (isMobile) return;
    
    stopScrolling();
    scrollInterval = setInterval(() => {
      cards.scrollLeft += direction * scrollSpeed;
      teleport();
    }, intervalDelay);
  }
  
  function stopScrolling() {
    clearInterval(scrollInterval);
  }
  
  // Event listeners para os botões
  prevButton.addEventListener('click', prevCard);
  nextButton.addEventListener('click', nextCard);
  
  // Desktop: eventos para manter pressionado
  prevButton.addEventListener('mousedown', () => {
    if (!isMobile) startScrolling(-1);
  });
  
  nextButton.addEventListener('mousedown', () => {
    if (!isMobile) startScrolling(1);
  });
  
  document.addEventListener('mouseup', () => {
    stopScrolling();
    if (!isDragging && !isMobile) teleport();
  });
  
  // Eventos de arraste (mouse)
  cards.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    scrollStart = cards.scrollLeft;
    
    if (isMobile) {
      cards.style.transition = 'none';
    }
    
    cards.style.cursor = 'grabbing';
  });
  
  // Variáveis para controlar a direção do movimento
  let isHorizontalDrag = false;
  let isVerticalDrag = false;
  
  cards.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX;
    const y = e.clientY;
    const walkX = (x - startX);
    const walkY = Math.abs(y - startY);
    
    // Determinar direção do movimento nos primeiros pixels de arrasto
    if (!isHorizontalDrag && !isVerticalDrag) {
      // Se o movimento horizontal for maior que o vertical com uma margem, é horizontal
      if (Math.abs(walkX) > walkY + 5) {
        isHorizontalDrag = true;
        e.preventDefault(); // Prevenir apenas para arrasto horizontal
      }
      // Se o movimento for mais vertical, não fazemos nada e deixamos a página rolar
      else if (walkY > Math.abs(walkX) + 5) {
        isVerticalDrag = true;
        isDragging = false; // Liberamos o controle de arrasto
        cards.style.cursor = 'default';
        return;
      }
    }
    
    // Se for identificado como arrasto vertical, não interferimos
    if (isVerticalDrag) return;
    
    // Se for arrasto horizontal, processamos normalmente
    if (isHorizontalDrag) {
      e.preventDefault(); // Impedir scroll da página apenas para arrasto horizontal
      
      if (isMobile) {
        // Usar a largura do viewport para cálculos
        const viewportWidth = carouselContainer.offsetWidth;
        const position = currentIndex * viewportWidth;
        cards.style.transform = `translateX(-${position - walkX}px)`;
      } else {
        cards.scrollLeft = scrollStart - walkX;
      }
    }
  });
  
  function endDrag(e) {
    if (!isDragging) return;
    
    isDragging = false;
    isHorizontalDrag = false;
    isVerticalDrag = false;
    cards.style.cursor = 'grab';
    
    if (isMobile) {
      cards.style.transition = 'transform 0.5s ease';
      
      const threshold = originalCards[0].offsetWidth * 0.2; // 20% da largura do card
      const endX = e && e.clientX ? e.clientX : startX;
      
      // Detectar direção do arrasto
      if (startX - endX > threshold) {
        nextCard();
      } else if (startX - endX < -threshold) {
        prevCard();
      } else {
        moveToCard(currentIndex);
      }
    } else {
      teleport();
    }
  }
  
  cards.addEventListener('mouseup', endDrag);
  cards.addEventListener('mouseleave', (e) => {
    if (isDragging) endDrag(e);
  });
  
  // Eventos de toque
  cards.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    
    if (isMobile) {
      cards.style.transition = 'none';
    }
  }, { passive: true });
  
  cards.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const walkX = (x - startX);
    const walkY = Math.abs(y - startY);
    
    // Determinar direção do movimento
    if (!isHorizontalDrag && !isVerticalDrag) {
      // Se o movimento horizontal for maior que o vertical, é horizontal
      if (Math.abs(walkX) > walkY + 5) {
        isHorizontalDrag = true;
      }
      // Se o movimento for mais vertical, liberamos para a página rolar
      else if (walkY > Math.abs(walkX) + 5) {
        isVerticalDrag = true;
        isDragging = false;
        return;
      }
    }
    
    // Se for identificado como arrasto vertical, não interferimos
    if (isVerticalDrag) return;
    
    // Processar apenas movimento horizontal
    if (isHorizontalDrag && e.cancelable) {
      e.preventDefault(); // Impedir comportamento padrão apenas para arrasto horizontal
      
      if (isMobile) {
        const viewportWidth = carouselContainer.offsetWidth;
        const position = currentIndex * viewportWidth;
        cards.style.transform = `translateX(-${position - walkX}px)`;
      } else {
        cards.scrollLeft = scrollStart - walkX;
      }
    }
  }, { passive: false });
  
  cards.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const threshold = originalCards[0].offsetWidth * 0.2; // 20% da largura do card
    
    cards.style.transition = 'transform 0.5s ease';
    
    isDragging = false;
    isHorizontalDrag = false;
    isVerticalDrag = false;
    
    // Detectar direção do arrasto
    if (startX - endX > threshold) {
      nextCard();
    } else if (startX - endX < -threshold) {
      prevCard();
    } else {
      moveToCard(currentIndex);
    }
  });
  
  // Loop infinito para desktop
  cards.addEventListener('scroll', () => {
    if (!isMobile && !isDragging) {
      teleport();
    }
  });
  
  // Detectar redimensionamento da janela
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const wasMobile = isMobile;
      isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== isMobile) {
        // Mudou de modo
        if (isMobile) {
          setupMobile();
        } else {
          setupDesktop();
        }
      } else if (isMobile) {
        // Continuou no mobile, mas redimensionou - atualizar posição
        moveToCard(currentIndex);
      }
    }, 250);
  });
  
  // Inicializar
  if (isMobile) {
    setupMobile();
  } else {
    setupDesktop();
  }
});