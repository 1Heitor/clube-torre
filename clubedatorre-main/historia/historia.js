window.addEventListener('load', function() {
  // Código para pré-carregamento da imagem do hero
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const screenWidth = window.innerWidth;
    const imgSrc = screenWidth <= 768 ? 'historiaimgs/fundobackmenor.webp' : 'historiaimgs/fundobackmaior.webp';
    
    // Função para carregar a imagem em segundo plano
    const preloadImage = (url) => {
      const img = new Image();
      img.src = url;
    };
    
    // Inicia o pré-carregamento
    preloadImage(imgSrc);
  }
  
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  const cards = document.querySelector('.cards');
  
  // Verificar elementos antes de trabalhar com eles
  if (cards) {
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
    
    // Função de teletransporte com limiar para ambos os dos
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
    if (prevButton && nextButton) {
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
    }
    
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
  }
  
  // Função para verificar elementos visíveis durante o scroll
  function checkVisibility() {
    const missaoSection = document.querySelector('.missao');
    const waveTop = document.querySelector('.wave');
    const waveBtm = document.querySelector('.custom-shape-divider');
    const foto = document.querySelector('.foto');
    const texto = document.querySelector('.texto');
    
    const windowHeight = window.innerHeight;
    
    if (missaoSection) {
      const missaoTop = missaoSection.getBoundingClientRect().top;
      if (missaoTop < windowHeight * 0.8) {
        missaoSection.classList.add('visible');
      }
    }
    
    if (waveTop) {
      const waveTopPos = waveTop.getBoundingClientRect().top;
      if (waveTopPos < windowHeight * 0.9) {
        waveTop.classList.add('visible');
      }
    }
    
    if (waveBtm) {
      const waveBtmPos = waveBtm.getBoundingClientRect().top;
      if (waveBtmPos < windowHeight * 0.9) {
        waveBtm.classList.add('visible');
      }
    }
    
    if (foto) {
      const fotoPos = foto.getBoundingClientRect().top;
      if (fotoPos < windowHeight * 0.8) {
        foto.classList.add('visible');
      }
    }
    
    if (texto) {
      const textoPos = texto.getBoundingClientRect().top;
      if (textoPos < windowHeight * 0.8) {
        texto.classList.add('visible');
      }
    }
  }
  
  // Adicionar classes de animação a elementos
  const elementsToAnimate = document.querySelectorAll('.missao, .wave, .custom-shape-divider, .foto, .texto');
  elementsToAnimate.forEach(element => {
    element.classList.add('animate');
  });
  
  // Verificar visibilidade inicial
  checkVisibility();
  
  // Verificar visibilidade durante o scroll
  window.addEventListener('scroll', checkVisibility);
});

document.addEventListener('DOMContentLoaded', function() {
  // Menu mobile
  const menuIcon = document.querySelector('.menu-icon');
  if (menuIcon) {
    menuIcon.addEventListener('click', function() {
      document.querySelector('nav ul').classList.toggle('show');
    });
  }
  
  // Adiciona classe animate a todos elementos que devem ter lazy loading
  function prepararAnimacoes() {
    const seletores = [
      'p',                   // Todos os parágrafos
      'h1, h2, h3, h4',      // Todos os títulos
      '.hero-content',       
      '.about h2',
      '.about p',
      '.texto-missao',       
      '.texto-missao p',
      '.texto-missao h2',
      '.metodologia-container',
      '.texto-metodologia',
      '.texto-metodologia h1',
      '.texto-metodologia p',
      '.card',
      '.bola',
      '.projeto-titulo',
      '.projeto-titulo p',
      '.projeto-text-column',
      '.projeto-text-column h2',
      '.projeto-text-column p',
      '.projeto-img-column',
      '.textocompromisso h1',
      '.textocompromisso h3',
      '.textocompromisso p',
      '.graficos',
      '.graficos h2',
      '.grafico',
      '.numeros',
      'button'               // Todos os botões
    ];
    
    // Concatena todos os seletores em uma única string
    const todosElementos = document.querySelectorAll(seletores.join(', '));
    
    todosElementos.forEach((elemento) => {
      // Evita adicionar a classe duas vezes
      if (!elemento.classList.contains('animate')) {
        elemento.classList.add('animate');
      }
    });
  }
  
  // Animação ao scrollar - usando Intersection Observer para melhor performance
  function configurarObservador() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.15 // elemento é considerado visível quando 15% dele estiver visível
    });
    
    // Observar todos os elementos com a classe animate
    document.querySelectorAll('.animate').forEach(element => {
      observer.observe(element);
    });
  }
  
  // Preparar todos os elementos com a classe animate
  prepararAnimacoes();
  
  // Configurar o observador de interseção
  configurarObservador();
  
  // Manter compatibilidade com o código existente
  function checkVisibility() {
    const elements = document.querySelectorAll('.animate:not(.visible)');
    
    elements.forEach((element) => {
      const position = element.getBoundingClientRect();
      if (position.top < window.innerHeight * 0.85) {
        element.classList.add('visible');
      }
    });
  }
  
  // Verificar uma vez ao carregar a página
  checkVisibility();
  
  // Também verificar ao rolar (backup para o Intersection Observer)
  window.addEventListener('scroll', checkVisibility);
  
  // Botão "Saiba mais" da metodologia rola para a seção de projeto
  const saibaMaisBtn = document.querySelector('.texto-metodologia button');
if (saibaMaisBtn) {
  saibaMaisBtn.addEventListener('click', () => {
    const target = document.querySelector('.projeto-header');
    if (target) {
      const isMobile = window.innerWidth <= 768;
      const offset = isMobile ? -440 : -290; // ajuste conforme seu layout

      const y = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: y + offset,
        behavior: 'smooth'
      });
    }
  });
}
const conhecerBtn = document.querySelector('.conhecer-hero');
if (conhecerBtn) {
  conhecerBtn.addEventListener('click', () => {
    const target = document.querySelector('.section-title');
    if (target) {
      const isMobile = window.innerWidth <= 768;
      const offset = isMobile ? -230 : -290; // ajuste conforme seu layout

      const y = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: y + offset,
        behavior: 'smooth'
      });
    }
  });
}

  // Botão "Venha conhecer" do projeto abre a página de contato
  const venhaConhecerBtn = document.querySelector('.projeto-text-column button');
  if (venhaConhecerBtn) {
    venhaConhecerBtn.addEventListener('click', function() {
      window.location.href = '../contato/contato.html';
    });
  }
  
  // Contador animado para os números
  const numeros = document.querySelectorAll('.numeros h1');
  numeros.forEach(numero => {
    const valor = +numero.textContent.replace(/\D/g, '');
    let contador = 0;
    const incremento = Math.ceil(valor / 150); // Ajuste para animação mais lenta (aumentado de 50 para 150)
    
    const animarContador = () => {
      if (contador < valor) {
        contador += incremento;
        if (contador > valor) contador = valor;
        numero.textContent = `+${contador}`;
        setTimeout(() => {
          requestAnimationFrame(animarContador);
        }, 30); // Adiciona um pequeno delay entre cada incremento
      }
    };
    
    // Observe when the number enters the viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animarContador();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(numero);
  });
});
