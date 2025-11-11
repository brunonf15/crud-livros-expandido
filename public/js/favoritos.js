const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  window.location.href = 'login.html';
}

document.getElementById('nomeUsuario').textContent = usuario.nome;

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

async function carregarFavoritos() {
  try {
    const response = await fetch(`http://localhost:3000/favoritos/${usuario.id}`);
    const favoritos = await response.json();
    
    const container = document.getElementById('lista-favoritos');
    const mensagemVazio = document.getElementById('mensagem-vazio');
    
    if (favoritos.length === 0) {
      mensagemVazio.style.display = 'block';
      container.innerHTML = '';
      return;
    }
    
    mensagemVazio.style.display = 'none';
    container.innerHTML = '';
    
    favoritos.forEach(livro => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.onclick = () => window.location.href = `detalhes.html?id=${livro.id}`;
      card.innerHTML = `
        <img src="${livro.imagemUrl}" alt="${livro.nome}">
        <h3>${livro.nome}</h3>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Páginas:</strong> ${livro.paginas}</p>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
  }
}

carregarFavoritos();
