// Verifica se está logado
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  window.location.href = 'login.html';
}

document.getElementById('nomeUsuario').textContent = usuario.nome;

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// Carrega estatísticas
async function carregarEstatisticas() {
  try {
    const response = await fetch('http://localhost:3000/estatisticas');
    const stats = await response.json();
    
    document.getElementById('stats').innerHTML = `
      <div class="stat-card">
        <h3>Total de Livros</h3>
        <div class="number">${stats.totalLivros}</div>
      </div>
      <div class="stat-card">
        <h3>Total de Páginas</h3>
        <div class="number">${stats.totalPaginas.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <h3>Usuários Cadastrados</h3>
        <div class="number">${stats.totalUsuarios}</div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

// Carrega livros recentes
async function carregarLivrosRecentes() {
  try {
    const response = await fetch('http://localhost:3000/livros/recentes/ultimos');
    const livros = await response.json();
    
    const container = document.getElementById('livros-recentes');
    container.innerHTML = '';
    
    livros.forEach(livro => {
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
    console.error('Erro ao carregar livros recentes:', error);
  }
}

carregarEstatisticas();
carregarLivrosRecentes();
