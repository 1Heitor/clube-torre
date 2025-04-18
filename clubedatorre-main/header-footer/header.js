document.addEventListener('DOMContentLoaded', function () {
    // Toggle do menu mobile e dropdowns
    const dropdownItems = document.querySelectorAll('.dropdown__item');
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    dropdownItems.forEach(item => {
      const link = item.querySelector('.nav__link');
      link.addEventListener('click', function () {
        // Fecha outros dropdowns
        dropdownItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherMenu = otherItem.querySelector('.dropdown__menu');
            if (otherMenu) {
              otherMenu.style.maxHeight = null;
            }
          }
        });
        // Alterna dropdown
        const menu = item.querySelector('.dropdown__menu');
        if (item.classList.contains('active')) {
          item.classList.remove('active');
          menu.style.maxHeight = null;
        } else {
          item.classList.add('active');
          menu.style.maxHeight = menu.scrollHeight + 'px';
        }
      });
    });
  
  // Toggle menu mobile
  navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('show-menu');
    this.classList.toggle('show-icon');
    navMenu.style.visibility = 'visible';
    
    // Adiciona ou remove a classe 'menu-open' no header quando o menu é aberto/fechado
    if (navMenu.classList.contains('show-menu')) {
      header.classList.add('menu-open');
    } else {
      // Só remove a classe 'menu-open' se não estiver com scroll
      if (window.scrollY <= 50) {
        header.classList.remove('menu-open');
        header.classList.remove('scrolled'); // Também remove a classe scrolled para garantir que fique transparente
      }
    }
  });
  
  
    // Adiciona classe 'visible' aos elementos em view via Intersection Observer
    const animateElements = document.querySelectorAll('.animate');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
  
    animateElements.forEach(el => {
      observer.observe(el);
    });
  
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
          // Se não tiver menu aberto, remover menu-open também
          if (!navMenu.classList.contains('show-menu')) {
            header.classList.remove('menu-open');
          }
        }
      });
      
    // Remover classe menu-open quando redimensionar para desktop
    window.addEventListener('resize', () => {
      // Se estiver em viewport desktop (> 1118px conforme breakpoint no CSS)
      if (window.innerWidth >= 1118) {
        // Remover classes do menu mobile
        navMenu.classList.remove('show-menu');
        navToggle.classList.remove('show-icon');
        
        // Só remove a classe menu-open se não tiver scroll
        if (window.scrollY <= 50) {
          header.classList.remove('menu-open');
        }
      }
    });
  });
  
  
  
    