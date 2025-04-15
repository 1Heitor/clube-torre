window.addEventListener('load', function() {
  const section = document.querySelector('.testimonials-section');
  const carousel = section.querySelector('.testimonials-carousel');
  const slides = section.querySelector('.testimonials-slides');
  const cards = section.querySelectorAll('.testimonial-card');
  const dotsContainer = section.querySelector('.carousel-dots');
  const prevButton = section.querySelector('.prev');
  const nextButton = section.querySelector('.next');

  let currentGroup = 0;
  let isDragging = false, startX = 0, startY = 0, dragDistance = 0;
  let isScrollingVertically = false; // Flag para scroll vertical
  let visibleCount = 4;
  let groupCount = 0;
  let isMobile = window.innerWidth <= 768;

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

  function calculateGroupCount() {
    // No mobile, cada card é um "grupo"
    groupCount = (visibleCount === 1) ? cards.length : Math.ceil(cards.length / visibleCount);
  }

  function updateDots() {
    dotsContainer.innerHTML = '';
    if (groupCount <= 1) {
        dotsContainer.style.display = 'none';
        return;
    }
    dotsContainer.style.display = 'flex';

    for (let i = 0; i < groupCount; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Ir para o grupo ${i + 1}`);
      dot.addEventListener('click', () => {
        currentGroup = i;
        // Aplica transição ao clicar no dot
        slides.style.transition = 'transform 0.5s ease';
        updateSlidePosition();
      });
      dotsContainer.appendChild(dot);
    }

    const dots = section.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentGroup);
    });
  }

  function updateSlidePosition() {
    const carouselWidth = carousel.offsetWidth;
    let position = 0;

    if (visibleCount === 1) {
        // Mobile: Calcula baseado na largura do viewport (área visível)
        // Não na largura do card + gap, pois cada card preenche o viewport
        position = -currentGroup * carouselWidth;
    } else {
        // Desktop: Calcula baseado na largura do carrossel (área visível do grupo)
        position = -currentGroup * carouselWidth;
    }
    slides.style.transform = `translateX(${position}px)`;

    // Atualiza a classe ativa dos dots
    const dots = section.querySelectorAll('.dot');
     dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentGroup);
     });

    // Não limpar a transição aqui, será feito no próximo start
  }

  function nextGroup() {
    if (groupCount <= 1) return; // Não faz nada se não há grupos suficientes
    currentGroup = (currentGroup + 1) % groupCount;
    slides.style.transition = 'transform 0.5s ease'; // Animação p/ botão
    updateSlidePosition();
  }

  function prevGroup() {
     if (groupCount <= 1) return; // Não faz nada se não há grupos suficientes
    currentGroup = (currentGroup - 1 + groupCount) % groupCount;
    slides.style.transition = 'transform 0.5s ease'; // Animação p/ botão
    updateSlidePosition();
  }

  // --- Event Listeners -- -

  prevButton.addEventListener('click', prevGroup);
  nextButton.addEventListener('click', nextGroup);

  // --- Arraste (Comum para Mouse e Touch) ---

  function handleDragStart(e) {
    // Ignora clique direito do mouse
    if (e.type === 'mousedown' && e.button !== 0) return;

    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragDistance = 0;
    isScrollingVertically = false;
    slides.style.transition = 'none'; // Remove transição p/ arraste direto
    // Previne seleção de texto no desktop durante arraste
    if (e.type === 'mousedown') {
        slides.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    }
  }

  function handleDragMove(e) {
    if (!isDragging) return;

    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Deteção inicial de scroll vertical
    // Só considera scroll vertical se ainda não começou a arrastar horizontalmente significativamente
    if (!isScrollingVertically && dragDistance === 0 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
        isScrollingVertically = true;
        // Se detectou scroll vertical, LIBERA o drag para permitir scroll da página
        isDragging = false;
        if (e.type === 'mousedown') {
             slides.style.cursor = 'grab';
             document.body.style.userSelect = '';
        }
        return;
    }

    if (isScrollingVertically) return; // Ignora se scroll vertical

    // Previne comportamento padrão (scroll da página, etc.) SE estivermos arrastando horizontalmente
    // Requer passive: false no touchmove
    if (e.cancelable && !isScrollingVertically) e.preventDefault();

    dragDistance = deltaX;

    // Aplica transform direto SEM transição
    const carouselWidth = carousel.offsetWidth;
    let currentPixelOffset = 0;
    if (visibleCount === 1) {
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0;
        const cardGap = 20;
        currentPixelOffset = -currentGroup * (cardWidth + cardGap);
    } else {
         currentPixelOffset = -currentGroup * carouselWidth;
    }
    slides.style.transform = `translateX(${currentPixelOffset + dragDistance}px)`;
  }

  function handleDragEnd(e) {
    // Se não estava arrastando OU se era scroll vertical, não faz nada aqui
    if (!isDragging || isScrollingVertically) {
       // Restaura cursor e seleção de texto no desktop se necessário
        if (e.type === 'mouseup' || e.type === 'mouseleave') {
            slides.style.cursor = 'grab';
            document.body.style.userSelect = '';
        }
        isDragging = false; // Garante reset
        isScrollingVertically = false; // Garante reset
        return;
    }

    isDragging = false;
    const originalGroup = currentGroup;

    let threshold = 0;
    if (visibleCount === 1) {
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0;
        threshold = cardWidth * 0.25; // Threshold de 25% da largura do card
    } else {
        const carouselWidth = carousel.offsetWidth;
        threshold = carouselWidth * 0.2; // Threshold de 20% da largura do container
    }

    // Determina o novo grupo baseado no arraste e threshold
    if (dragDistance < -threshold) {
        currentGroup = (currentGroup + 1) % groupCount;
    } else if (dragDistance > threshold) {
        currentGroup = (currentGroup - 1 + groupCount) % groupCount;
    }
    // Se não atingiu threshold, currentGroup permanece o mesmo

    // Aplica transição PARA O SNAP/MOVIMENTO
    slides.style.transition = 'transform 0.5s ease';
    updateSlidePosition(); // Anima (ou não) para a posição final

    // Restaura cursor e seleção de texto no desktop
    if (e.type === 'mouseup' || e.type === 'mouseleave') {
        slides.style.cursor = 'grab';
        document.body.style.userSelect = '';
    }

    dragDistance = 0; // Reseta para a próxima interação
  }


  // --- Adicionar Listeners ---
  slides.addEventListener('mousedown', handleDragStart);
  // Adiciona mousemove e mouseup ao *document* para capturar mesmo fora do elemento
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
  slides.addEventListener('mouseleave', handleDragEnd); // Considera fim se sair do elemento

  slides.addEventListener('touchstart', handleDragStart, { passive: true });
  slides.addEventListener('touchmove', handleDragMove, { passive: false }); // NECESSÁRIO para preventDefault
  slides.addEventListener('touchend', handleDragEnd);
  slides.addEventListener('touchcancel', handleDragEnd); // Trata cancelamento

  // Prevenir arrastar imagens dentro dos cards (comportamento padrão chato)
  section.querySelectorAll('.testimonial-card img').forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // --- Configuração Inicial e Redimensionamento ---
  function initCarousel() {
    calculateVisibleCount();
    calculateGroupCount();

    // CONFIGURAR LAYOUT BASEADO NO MODO (MOBILE/DESKTOP)
    if (visibleCount === 1) {
        // Mobile Layout (como carousel.js)
        const viewportWidth = carousel.offsetWidth;
        const cardWidthPercentage = 0.9; // Usar 90% como no carousel.js
        const calculatedCardWidth = viewportWidth * cardWidthPercentage;
        const cardGap = 0; // Sem gap no mobile, usamos margin
        
        slides.style.gap = `${cardGap}px`; // Define gap como 0
        slides.style.overflow = 'hidden'; // Garante overflow hidden

        cards.forEach(card => {
            card.style.width = `${calculatedCardWidth}px`;
            card.style.margin = `0 auto`; // Centraliza o card único
            card.style.minWidth = ''; // Limpa min-width
        });

        // Calcula e define a largura total do container de slides
        // Neste caso, a largura visível * número de cards (já que não há clones)
        const totalWidth = groupCount * viewportWidth; // Cada card ocupa a largura do viewport
        slides.style.width = `${totalWidth}px`;
        
    } else {
        // Desktop Layout (Reset para CSS padrão)
        slides.style.gap = '20px'; // Restaura gap do CSS (ou valor desejado)
        slides.style.overflowX = 'scroll'; // Permitir scroll desktop (se necessário)
        slides.style.overflowY = 'hidden';
        slides.style.width = ''; // Deixa o CSS/browser calcular

        cards.forEach(card => {
            card.style.width = ''; // Limpa width inline
            card.style.margin = ''; // Limpa margin inline
            card.style.minWidth = '280px'; // Restaura min-width desktop do CSS
        });
    }

    updateDots();
    currentGroup = 0;
    slides.style.transition = 'none';
    updateSlidePosition(); // Chama após configurar o layout
    slides.style.cursor = 'grab';
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Guarda o índice do primeiro card visível atualmente (aproximado)
      let firstVisibleCardIndex = 0;
      if (visibleCount === 1) {
           firstVisibleCardIndex = currentGroup;
      } else {
          // Tenta estimar qual era o primeiro card do grupo atual
          firstVisibleCardIndex = currentGroup * visibleCount;
      }

      calculateVisibleCount();
      calculateGroupCount();

      // Tenta restaurar para o grupo que contém o card que estava visível
       if (visibleCount === 1) {
           currentGroup = Math.min(firstVisibleCardIndex, groupCount - 1); // groupCount é cards.length aqui
       } else {
           // Calcula o novo grupo baseado no índice do card e nova contagem visível
           currentGroup = Math.min(Math.floor(firstVisibleCardIndex / visibleCount), groupCount - 1);
       }
       currentGroup = Math.max(0, currentGroup); // Garante que não é negativo

      // RE-CONFIGURAR LAYOUT APÓS RESIZE
      if (visibleCount === 1) {
          const viewportWidth = carousel.offsetWidth;
          const cardWidthPercentage = 0.9;
          const calculatedCardWidth = viewportWidth * cardWidthPercentage;
          const cardGap = 0;

          slides.style.gap = `${cardGap}px`;
          slides.style.overflow = 'hidden';

          cards.forEach(card => {
              card.style.width = `${calculatedCardWidth}px`;
              card.style.margin = `0 auto`;
              card.style.minWidth = '';
          });

          const totalWidth = groupCount * viewportWidth;
          slides.style.width = `${totalWidth}px`;
      } else {
          slides.style.gap = '20px';
          slides.style.overflowX = 'scroll';
          slides.style.overflowY = 'hidden';
          slides.style.width = '';

          cards.forEach(card => {
              card.style.width = '';
              card.style.margin = '';
              card.style.minWidth = '280px';
          });
      }

      updateDots();
      slides.style.transition = 'none';
      updateSlidePosition();
    }, 250);
  });

  initCarousel();
});