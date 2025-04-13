  window.addEventListener('load', function() {
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const cards = document.querySelector('.cards');
    
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;
    
    // Variáveis para scroll contínuo dos botões
    let scrollInterval;
    const scrollSpeed = 5; // pixels a cada intervalo
    const intervalDelay = 10; // milissegundos entre intervalos
    // 1) Duplicar os cards para criar o loop infinito
    const originalCards = Array.from(cards.children);
    originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    cards.appendChild(clone);
    });
    
    // 2) Posicionar o scroll no meio (início dos clones)
    setTimeout(() => {
    cards.scrollLeft = cards.scrollWidth / 4; // posiciona no meio dos clones
    }, 100);
    
    // Função de teletransporte com limiar para ambos os lados
    function teleport() {
    const half = cards.scrollWidth / 2;
    const threshold = 50; // 50px de margem
    if (cards.scrollLeft <= threshold) {
    cards.scrollLeft += half - threshold;
    } else if (cards.scrollLeft >= half + threshold) {
    cards.scrollLeft -= half - threshold;
    }
    }
    
    // 3) Funções para iniciar/pausar o scroll contínuo
    function startScrolling(direction) {
    stopScrolling(); // Garante que não existam múltiplos intervals
    scrollInterval = setInterval(() => {
    cards.scrollLeft += direction * scrollSpeed;
    teleport(); // Adiciona a função de teletransporte durante a rolagem contínua
    }, intervalDelay);
    }
    function stopScrolling() {
    clearInterval(scrollInterval);
    }
    
    // 4) Eventos dos botões de seta – resposta instantânea
    prevButton.addEventListener('mousedown', () => startScrolling(-1));
    nextButton.addEventListener('mousedown', () => startScrolling(1));
    // Para dispositivos de toque
    prevButton.addEventListener('touchstart', () => startScrolling(-1));
    nextButton.addEventListener('touchstart', () => startScrolling(1));
    
    // Para parar quando o usuário soltar o botão
    document.addEventListener('mouseup', () => {
    stopScrolling();
    if (!isDragging) teleport();
    });
    prevButton.addEventListener('mouseleave', stopScrolling);
    nextButton.addEventListener('mouseleave', stopScrolling);
    prevButton.addEventListener('touchend', () => {
    stopScrolling();
    if (!isDragging) teleport();
    });
    nextButton.addEventListener('touchend', () => {
    stopScrolling();
    if (!isDragging) teleport();
    });
    
    // 5) Arraste com mouse
    cards.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX;
    scrollStart = cards.scrollLeft;
    cards.style.cursor = 'grabbing';
    });
    cards.addEventListener('mouseleave', () => {
    isDragging = false;
    cards.style.cursor = 'grab';
    teleport();
    });
    cards.addEventListener('mouseup', () => {
    isDragging = false;
    cards.style.cursor = 'grab';
    teleport();
    });
    cards.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = x - startX; // Movimento livre
    cards.scrollLeft = scrollStart - walk;
    });
    
    // 6) Arraste com toque
    cards.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX;
    scrollStart = cards.scrollLeft;
    }, { passive: true });
    cards.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    const walk = x - startX;
    cards.scrollLeft = scrollStart - walk;
    }, { passive: true });
    cards.addEventListener('touchend', () => {
    isDragging = false;
    teleport();
    });
    cards.addEventListener('touchcancel', () => {
    isDragging = false;
    teleport();
    });
    
    // 7) Loop infinito: Teletransporta o scroll ao atingir os extremos (quando não estiver arrastando)
    cards.addEventListener('scroll', () => {
    if (!isDragging) {
    teleport();
    }
    });
    });