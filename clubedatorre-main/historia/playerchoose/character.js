  // Selecionar todos os cards
  const cards = document.querySelectorAll('.card-player');
  
  // Adicionar evento de clique para cada card
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Verificar se o card clicado já está selecionado
      if (card.classList.contains('selected')) {
        // Se já estiver selecionado, remove a classe 'selected'
        card.classList.remove('selected');
      } else {
        // Remover classe 'selected' de todos os cards
        cards.forEach(c => c.classList.remove('selected'));
        
        // Adicionar classe 'selected' ao card clicado
        card.classList.add('selected');
      }
    });
  });