  // Selecionar todos os cards
  const cards = document.querySelectorAll('.card-player');
  
  // Adicionar evento de clique para cada card
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Remover classe 'selected' de todos os cards
      cards.forEach(c => c.classList.remove('selected'));
      
      // Adicionar classe 'selected' ao card clicado
      card.classList.add('selected');
    });
  });