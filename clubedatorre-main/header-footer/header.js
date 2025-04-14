document.addEventListener('DOMContentLoaded', function () {
    // Toggle do menu mobile e dropdowns
    const dropdownItems = document.querySelectorAll('.dropdown__item');
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
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('show-menu'); // Isso já está fazendo a alternância do menu
    this.classList.toggle('show-icon');
    navMenu.style.visibility = 'visible'; // Força a visibilidade do menu ao ser aberto
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
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
  });
  
  
  
    