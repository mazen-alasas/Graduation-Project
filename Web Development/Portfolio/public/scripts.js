document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
  
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        alert(`You clicked on ${card.querySelector('p').textContent}`);
      });
    });
  });
  