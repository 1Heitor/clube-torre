document.addEventListener('DOMContentLoaded', function () {
    const dropdownItems = document.querySelectorAll('.dropdown__item');
  
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav__link');
        link.addEventListener('click', function () {
            const menu = item.querySelector('.dropdown__menu');
  
            // Fecha outros menus que possam estar abertos
            dropdownItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherMenu = otherItem.querySelector('.dropdown__menu');
                    if (otherMenu) {
                        otherMenu.style.maxHeight = null;
                    }
                }
            });
  
            // Alterna o menu do item clicado
            if (menu.style.maxHeight) {
                menu.style.maxHeight = null;
            } else {
                menu.style.maxHeight = menu.scrollHeight + 'px';
            }
        });
    });
  
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
  
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('show-menu');
        this.classList.toggle('show-icon');
    });
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os itens de dropdown
    const dropdownItems = document.querySelectorAll('.dropdown__item');
    
    dropdownItems.forEach(item => {
      item.addEventListener('click', function() {
        // Remove a classe 'active' de todos os itens
        dropdownItems.forEach(el => {
          if (el !== item) {
            el.classList.remove('active');
          }
        });
        // Alterna a classe 'active' no item clicado
        item.classList.toggle('active');
      });
    });
  });


let currentSlide = [0, 0, 0];

 function showSlide(index, carouselIndex) {
     const carousels = document.querySelectorAll('.carousel-inner');
     const totalSlides = carousels[carouselIndex].children.length;

     if (index >= totalSlides) {
         currentSlide[carouselIndex] = 0;
     } else if (index < 0) {
         currentSlide[carouselIndex] = totalSlides - 1;
     } else {
         currentSlide[carouselIndex] = index;
     }

     carousels[carouselIndex].style.transform = `translateX(-${currentSlide[carouselIndex] * 100}%)`;
 }

 function nextSlide(carouselIndex) {
     showSlide(currentSlide[carouselIndex] + 1, carouselIndex);
 }

 function prevSlide(carouselIndex) {
     showSlide(currentSlide[carouselIndex] - 1, carouselIndex);
 }

 // Initialize the carousels
 document.querySelectorAll('.carousel').forEach((carousel, index) => {
     showSlide(0, index);
 });
