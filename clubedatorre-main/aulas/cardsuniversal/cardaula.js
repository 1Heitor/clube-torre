// Script específico para o carrossel
window.addEventListener("load", function () {
  console.log("Carousel Script Loaded"); // Log inicial
  const carouselContainer = document.querySelector(".carousel-container");
  const cards = document.querySelector(".cards");
  const originalCardElements = Array.from(cards.children); // Guarda os cards originais
  let cardList = originalCardElements; // Começa com os originais
  const prevButton = document.querySelector(".carousel-button.prev");
  const nextButton = document.querySelector(".carousel-button.next");
  const dotsContainer = document.querySelector(".carousel-dots");

  let isMobile = window.innerWidth <= 768;
  let currentIndex = 0; // Índice da página/card atual
  let totalPages = 0; // Total de páginas (varia entre mobile/desktop)

  // Variáveis Desktop (Scroll Infinito por Clone)
  let scrollInterval;
  const scrollSpeed = 5; 
  const intervalDelay = 10;
  let desktopDragging = false; // Flag específica para arraste desktop (se habilitado)
  let desktopStartX = 0;
  let desktopScrollStart = 0;

  // Variáveis Mobile (Transform e Arraste)
  let mobileDragging = false;
  let mobileStartX = 0;
  let mobileStartY = 0;
  let mobileDragDistance = 0;
  let mobileIsScrollingVertically = false;

  // --- Funções de Configuração de Layout --- 
  function calculateLayout() {
    const previousMode = isMobile ? 'Mobile' : 'Desktop';
    isMobile = window.innerWidth <= 768;
    const currentMode = isMobile ? 'Mobile' : 'Desktop';
    console.log(`Calculate Layout: Window Width=${window.innerWidth}px -> Mode: ${currentMode} (Previous: ${previousMode})`);
    
    // Limpa listeners antigos antes de configurar o novo modo
    removeMobileDragListeners();
    removeDesktopDragListeners();
    cards.removeEventListener('scroll', desktopScrollHandler);
    stopScrolling(); // Para scroll de botão residual
    
    if (isMobile) {
      configureMobileLayout();
      addMobileDragListeners(); // Adiciona listeners mobile
    } else {
      configureDesktopLayout();
      addDesktopDragListeners(); // Adiciona listeners desktop
      cards.addEventListener('scroll', desktopScrollHandler); // Adiciona listener scroll desktop
    }
    updateDots(); // Atualiza dots após configurar o layout
  }

  function configureMobileLayout() {
    console.log("Configuring Mobile Layout...");
    cards.innerHTML = '';
    originalCardElements.forEach(card => cards.appendChild(card));
    cardList = Array.from(cards.children);
    totalPages = cardList.length; 
    currentIndex = Math.min(currentIndex, totalPages - 1);

    const viewportWidth = carouselContainer.offsetWidth;
    cardList.forEach(card => {
        card.style.width = `${viewportWidth * 0.9}px`;
        card.style.margin = "0 auto";
        card.style.minWidth = '';
        card.style.cursor = 'grab'; // Cursor para mobile drag
    });
    cards.style.width = `${totalPages * viewportWidth}px`; 
    cards.style.gap = '0px';
    cards.style.overflow = 'hidden';
    cards.style.transform = ""; 
    cards.style.scrollBehavior = 'auto';
    cards.scrollLeft = 0;
    cards.style.scrollBehavior = 'smooth';
    console.log("Mobile Layout Configured. Applying initial transform.");
    updateMobileTransform(); 
  }

  function configureDesktopLayout() {
    console.log("Configuring Desktop Layout...");
    console.log("Cloning cards for desktop...");
    cards.innerHTML = '';
    originalCardElements.forEach(card => cards.appendChild(card));
    originalCardElements.forEach(card => cards.appendChild(card.cloneNode(true)));
    cardList = Array.from(cards.children); 
    totalPages = originalCardElements.length; 
    currentIndex = Math.min(currentIndex, totalPages - 1); 
    console.log(`Cloned ${originalCardElements.length} cards. Total elements: ${cardList.length}`);

    cardList.forEach(card => {
      card.style.width = ''; 
      card.style.margin = ''; 
      card.style.minWidth = '300px';
      card.style.cursor = 'grab'; // Cursor para desktop drag
    });
    cards.style.width = ''; 
    cards.style.gap = '30px'; 
    cards.style.overflowX = 'scroll';
    cards.style.overflowY = 'hidden'; 
    cards.style.transform = ""; 

    cards.style.scrollBehavior = 'auto';
    console.log("Setting initial scroll position for desktop...");
    setTimeout(() => {
        if (!isMobile) { 
            const targetScroll = cards.scrollWidth / 2;
            console.log(`Desktop Timeout: scrollWidth = ${cards.scrollWidth}, Target scrollLeft = ${targetScroll}`);
            cards.scrollLeft = targetScroll;
            cards.style.scrollBehavior = 'smooth';
            console.log(`Desktop scrollLeft set to: ${cards.scrollLeft}.`);
        } else {
             console.log("Desktop Timeout: Mode changed back to mobile, aborting scroll set.");
        }
    }, 200); 
  }

  // --- Lógica de Scroll Desktop (Clonagem) --- 
  function teleport() {
      if (isMobile || desktopDragging || scrollInterval) return; // Não teleporta se mobile, arrastando ou botão pressionado
      const scrollWidth = cards.scrollWidth;
      if (!scrollWidth || scrollWidth === 0) { 
          console.warn("Teleport: scrollWidth is 0 or invalid. Aborting.");
          return;
      }
      const contentWidth = scrollWidth / 2; 
      const currentScroll = cards.scrollLeft;
      const threshold = 50; 
      
      if (currentScroll <= threshold) {
          console.log(`Teleporting Forward: scrollLeft=${currentScroll} <= ${threshold}`);
          cards.style.scrollBehavior = 'auto'; 
          cards.scrollLeft += contentWidth; 
          // Força reflow para garantir que o scrollLeft seja aplicado antes de reativar smooth
          void cards.offsetWidth; 
          cards.style.scrollBehavior = 'smooth';
      } else if (currentScroll >= contentWidth - threshold) { // Ajustado limiar para ser mais simétrico
          console.log(`Teleporting Backward: scrollLeft=${currentScroll} >= ${contentWidth - threshold}`);
          cards.style.scrollBehavior = 'auto';
          cards.scrollLeft -= contentWidth;
          void cards.offsetWidth;
          cards.style.scrollBehavior = 'smooth';
      }
  }

  function startScrolling(direction) {
      if (isMobile) return;
      console.log(`Start Scrolling: Direction=${direction}`);
      stopScrolling(); 
      scrollInterval = setInterval(() => {
          cards.scrollLeft += direction * scrollSpeed;
          // O teleport é chamado pelo evento 'scroll' agora
      }, intervalDelay);
  }

  function stopScrolling() {
      if(scrollInterval) {
         console.log("Stop Scrolling");
         clearInterval(scrollInterval);
         scrollInterval = null; 
      }
  }
  
  const desktopScrollHandler = () => {
      if (!isMobile) { 
          // console.log("Scroll Event Triggered - Checking Teleport"); // Log frequente
          teleport(); // Chama teleport no scroll do desktop
      }
  };

  // --- Lógica de Movimento Mobile (Transform) --- 
  function updateMobileTransform() {
      if (!isMobile) return;
      const viewportWidth = carouselContainer.offsetWidth;
      const position = currentIndex * viewportWidth;
      cards.style.transform = `translateX(-${position}px)`;
  }

  function moveToPageMobile(pageIndex) {
      if (!isMobile) return;
      currentIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));
      console.log(`Move To Page Mobile: Index=${currentIndex}`);
      cards.style.transition = "transform 0.5s ease";
      updateMobileTransform();
      updateDots();
  }

  // --- Funções de Navegação (Chamadas pelos botões/drag) --- 
  function nextPage() {
      console.log("Next Page Called");
      if (isMobile) {
          const nextPage = (currentIndex + 1) % totalPages;
          moveToPageMobile(nextPage);
      } else {
          // Desktop: Scroll contínuo ao segurar botão (iniciado no handler)
          // Aqui só tratamos clique simples (se desejado) ou não faz nada
          // Poderia adicionar scrollBy simples se não quiser scroll contínuo
          console.log("Next button clicked (desktop) - relies on hold scroll");
      }
  }

  function prevPage() {
      console.log("Prev Page Called");
      if (isMobile) {
          const prevPage = (currentIndex - 1 + totalPages) % totalPages;
          moveToPageMobile(prevPage);
      } else {
          console.log("Prev button clicked (desktop) - relies on hold scroll");
      }
  }

  // --- Handlers de Eventos --- 
  
  // Botões (Lógica diferente para Mobile/Desktop)
  function handleNextButtonPress(e) {
      e.preventDefault(); // Previne comportamento padrão (ex: submit se for button)
      console.log("Next Button Press");
      if (isMobile) { nextPage(); } 
      else { startScrolling(1); } // Inicia scroll contínuo desktop
  }
  function handlePrevButtonPress(e) {
      e.preventDefault();
      console.log("Prev Button Press");
      if (isMobile) { prevPage(); } 
      else { startScrolling(-1); } // Inicia scroll contínuo desktop
  }
  function handleButtonRelease() {
      // Não precisa checar isMobile aqui, stopScrolling já checa
      console.log("Button Release");
      stopScrolling(); 
      if(!isMobile) { 
         // Não chama teleport imediatamente, deixa o listener de scroll cuidar
         // setTimeout(teleport, intervalDelay + 5); 
      }
  }

  // Removi listeners antigos e adicionei os novos com preventDefault onde aplicável
  nextButton.addEventListener("mousedown", handleNextButtonPress);
  prevButton.addEventListener("mousedown", handlePrevButtonPress);
  nextButton.addEventListener("touchstart", handleNextButtonPress, { passive: false }); // false para preventDefault
  prevButton.addEventListener("touchstart", handlePrevButtonPress, { passive: false });

  document.addEventListener("mouseup", handleButtonRelease);
  document.addEventListener("touchend", handleButtonRelease);
  // Mouseleave nos botões para parar se sair deles
  nextButton.addEventListener("mouseleave", handleButtonRelease); 
  prevButton.addEventListener("mouseleave", handleButtonRelease);


  // Arraste Mobile 
  function handleMobileDragStart(e) {
      if (!isMobile) return; 
      mobileDragging = true;
      mobileStartX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      mobileStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY; 
      mobileIsScrollingVertically = false; 
      cards.style.transition = "none"; 
      mobileDragDistance = 0;
  }

  function handleMobileDragMove(e) {
      if (!isMobile || !mobileDragging) return;
      const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
      const deltaX = currentX - mobileStartX;
      const deltaY = currentY - mobileStartY;

      if (mobileDragDistance === 0 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) { 
          mobileIsScrollingVertically = true;
          mobileDragging = false; 
          return; 
      }
      if (mobileIsScrollingVertically || !mobileDragging) return;
      if (e.cancelable) { e.preventDefault(); }

      mobileDragDistance = deltaX;
      const viewportWidth = carouselContainer.offsetWidth;
      const currentPixelPosition = currentIndex * viewportWidth;
      cards.style.transform = `translateX(-${currentPixelPosition - mobileDragDistance}px)`;
  }

  function handleMobileDragEnd() {
      if (!isMobile || !mobileDragging) {
          if (!mobileDragging) mobileIsScrollingVertically = false;
          return;
      }
      const wasScrollingVertically = mobileIsScrollingVertically;
      mobileDragging = false;

      if (!wasScrollingVertically) {
          cards.style.transition = "transform 0.5s ease"; 
          const viewportWidth = carouselContainer.offsetWidth;
          const threshold = viewportWidth * 0.2;
          if (mobileDragDistance < -threshold) { nextPage(); }
          else if (mobileDragDistance > threshold) { prevPage(); }
          else { moveToPageMobile(currentIndex); }
      } else {
          cards.style.transition = "transform 0.5s ease";
      }
      mobileDragDistance = 0;
      mobileIsScrollingVertically = false;
  }
  
  function addMobileDragListeners() {
      console.log("Adding Mobile Drag Listeners");
      cards.addEventListener("mousedown", handleMobileDragStart);
      cards.addEventListener("mousemove", handleMobileDragMove);
      document.addEventListener("mouseup", handleMobileDragEnd); 
      cards.addEventListener("mouseleave", handleMobileDragEnd);
      cards.addEventListener("touchstart", handleMobileDragStart, { passive: true }); 
      cards.addEventListener("touchmove", handleMobileDragMove, { passive: false }); 
      cards.addEventListener("touchend", handleMobileDragEnd);
      cards.addEventListener("touchcancel", handleMobileDragEnd); 
  }
  
  function removeMobileDragListeners() {
      console.log("Removing Mobile Drag Listeners");
      cards.removeEventListener("mousedown", handleMobileDragStart);
      cards.removeEventListener("mousemove", handleMobileDragMove);
      document.removeEventListener("mouseup", handleMobileDragEnd); 
      cards.removeEventListener("mouseleave", handleMobileDragEnd);
      cards.removeEventListener("touchstart", handleMobileDragStart);
      cards.removeEventListener("touchmove", handleMobileDragMove);
      cards.removeEventListener("touchend", handleMobileDragEnd);
      cards.removeEventListener("touchcancel", handleMobileDragEnd);
  }
  
  // --- Arraste Desktop --- 
  function handleDesktopDragStart(e) {
      if (isMobile) return;
      desktopDragging = true;
      desktopStartX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX; // Usa pageX para scroll
      desktopScrollStart = cards.scrollLeft;
      cards.style.cursor = 'grabbing';
      cards.style.scrollBehavior = 'auto'; // Drag manual, sem smooth
      console.log(`Desktop Drag Start: startX=${desktopStartX}, scrollStart=${desktopScrollStart}`);
  }

  function handleDesktopDragMove(e) {
      if (isMobile || !desktopDragging) return;
      e.preventDefault(); // Previne seleção de texto etc. durante drag
      const currentX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
      const walk = currentX - desktopStartX;
      cards.scrollLeft = desktopScrollStart - walk;
      // console.log(`Desktop Drag Move: walk=${walk}, scrollLeft=${cards.scrollLeft}`); // Log frequente
  }

  function handleDesktopDragEnd() {
      if (isMobile || !desktopDragging) return;
      desktopDragging = false;
      cards.style.cursor = 'grab';
      cards.style.scrollBehavior = 'smooth'; // Restaura smooth scroll
      console.log("Desktop Drag End");
      teleport(); // Ajusta posição após soltar
  }
  
  function addDesktopDragListeners() {
      console.log("Adding Desktop Drag Listeners");
      cards.addEventListener('mousedown', handleDesktopDragStart);
      cards.addEventListener('mousemove', handleDesktopDragMove);
      document.addEventListener('mouseup', handleDesktopDragEnd); // Listener no document
      cards.addEventListener('mouseleave', handleDesktopDragEnd);
      cards.addEventListener('touchstart', handleDesktopDragStart, { passive: true });
      cards.addEventListener('touchmove', handleDesktopDragMove, { passive: false }); // false p/ preventDefault
      cards.addEventListener('touchend', handleDesktopDragEnd);
      cards.addEventListener('touchcancel', handleDesktopDragEnd);
  }
  
  function removeDesktopDragListeners() {
      console.log("Removing Desktop Drag Listeners");
      cards.removeEventListener('mousedown', handleDesktopDragStart);
      cards.removeEventListener('mousemove', handleDesktopDragMove);
      document.removeEventListener('mouseup', handleDesktopDragEnd); 
      cards.removeEventListener('mouseleave', handleDesktopDragEnd);
      cards.removeEventListener('touchstart', handleDesktopDragStart);
      cards.removeEventListener('touchmove', handleDesktopDragMove);
      cards.removeEventListener('touchend', handleDesktopDragEnd);
      cards.removeEventListener('touchcancel', handleDesktopDragEnd);
  }

  // --- Dots --- (UpdateDots é chamado dentro do configureLayout)
  function updateDots() {
    dotsContainer.innerHTML = "";
    if (!isMobile) {
        dotsContainer.style.display = 'none';
        return;
    }
    dotsContainer.style.display = 'flex';
    originalCardElements.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.classList.add("dot");
        if (index === currentIndex) { 
            dot.classList.add("active");
        }
        dot.addEventListener("click", () => {
            console.log(`Dot ${index} clicked`);
            moveToPageMobile(index);
        });
        dotsContainer.appendChild(dot);
    });
     console.log(`Dots Updated: Index=${currentIndex}, Total=${originalCardElements.length}`);
  }
  
  // --- Redimensionamento e Inicialização ---
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    console.log("Resize Detected - Setting Timeout");
    resizeTimeout = setTimeout(() => {
        console.log("Resize Timeout Executing - Calculating Layout");
        calculateLayout(); // Recalcula, reconfigura e adiciona/remove listeners corretos
        console.log("Resize Handling Complete");
    }, 300); 
  });

  // Inicialização
  console.log("Initial Calculation...");
  calculateLayout(); 
  console.log("Carousel Initialized");

}); 
const conhecerBtn = document.querySelector('.conhecer');
if (conhecerBtn) {
  conhecerBtn.addEventListener('click', () => {
    const target = document.querySelector('.cards-container');
    if (target) {
      const isMobile = window.innerWidth <= 768;
      const offset = isMobile ? -60 : -90; // ajuste conforme seu layout

      const y = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: y + offset,
        behavior: 'smooth'
      });
    }
  });
}

