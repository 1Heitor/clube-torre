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
    const cardGap = 20; // Corresponder ao CSS

    let position = 0;
    if (visibleCount === 1) {
        // Calcula a largura do card visível (considera o gap)
        const cardWidth = cards.length > 0 ? cards[0].offsetWidth : 0;
        position = -currentGroup * (cardWidth + cardGap);
    } else {
        // Calcula a posição baseada na largura do carrossel para visualização em grupo
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
        // Se detectou scroll vertical, podemos liberar o drag para permitir scroll da página
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

    // Limpa estilos inline de largura que podem ter sido definidos antes
    cards.forEach(card => {
      card.style.width = '';
    });

    updateDots();
    currentGroup = 0;
    // Define posição inicial SEM transição
    slides.style.transition = 'none';
    updateSlidePosition();
    slides.style.cursor = 'grab'; // Cursor inicial
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


      updateDots();
      // Atualiza posição SEM transição após resize
      slides.style.transition = 'none';
      updateSlidePosition();
    }, 250);
  });

  initCarousel();
});