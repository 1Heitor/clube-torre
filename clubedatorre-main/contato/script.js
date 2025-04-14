     // Script para animações
     document.addEventListener('DOMContentLoaded', function() {
        // Adiciona classe aos elementos com a classe 'animate'
        const animateElements = document.querySelectorAll('.animate');
        
        // Função para verificar se o elemento está visível na viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        }
        
        // Função para animar elementos quando ficarem visíveis
        function checkElements() {
            animateElements.forEach(element => {
                if (isElementInViewport(element) && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                }
            });
        }
        
        // Verificar elementos no carregamento da página
        checkElements();
        
        // Verificar elementos durante o scroll
        window.addEventListener('scroll', checkElements);

        // Ajusta o layout para dispositivos móveis
        function fixMobileLayout() {
            if (window.innerWidth <= 768) {
                // Ajusta o espaçamento entre elementos
                document.querySelector('.container-contato').style.paddingBottom = '30px';
                
                // Garante que o footer esteja visível e corretamente posicionado
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.style.position = 'relative';
                    footer.style.marginTop = '40px';
                    footer.style.zIndex = '1';
                }
            }
        }

        // Executa ao carregar e ao redimensionar
        fixMobileLayout();
        window.addEventListener('resize', fixMobileLayout);
    });