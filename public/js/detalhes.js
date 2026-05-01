const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  window.location.href = 'login.html';
}

document.getElementById('nomeUsuario').textContent = usuario.nome;

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const urlParams = new URLSearchParams(window.location.search);
const livroId = urlParams.get('id');

async function carregarDetalhes() {
  try {
    const response = await fetch(`/livros/${livroId}`);
    const livro = await response.json();
    
    // Verifica se está favoritado
    const favoritosResponse = await fetch(`/favoritos/${usuario.id}`);
    const favoritos = await favoritosResponse.json();
    const isFavorito = favoritos.some(f => f.id === livro.id);
    
    const container = document.getElementById('livro-detalhes');
    container.innerHTML = `
      <div class="book-details">
        <div class="book-image">
          <img src="${livro.imagemUrl}" alt="${livro.nome}">
        </div>
        <div class="book-info">
          <h2>${livro.nome}</h2>
          <div class="info-item">
            <strong>Autor:</strong> ${livro.autor}
          </div>
          <div class="info-item">
            <strong>Páginas:</strong> ${livro.paginas}
          </div>
          <div class="info-item">
            <strong>Descrição:</strong><br>
            ${livro.descricao || 'Sem descrição disponível'}
          </div>
          <div class="info-item">
            <strong>Data de Cadastro:</strong> ${new Date(livro.dataCadastro).toLocaleDateString('pt-BR')}
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="toggleFavorito(${livro.id}, ${isFavorito})">
              ${isFavorito ? '❤️ Remover dos Favoritos' : '🤍 Adicionar aos Favoritos'}
            </button>
            <button class="btn btn-danger" onclick="deletarLivro(${livro.id})">
              🗑️ Deletar Livro
            </button>
            <button class="btn btn-secondary" onclick="window.location.href='livros.html'">
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
  }
}

async function toggleFavorito(livroId, isFavorito) {
  try {
    const url = '/favoritos';
    const method = isFavorito ? 'DELETE' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuario.id, livroId })
    });
    
    if (response.ok) {
      alert(isFavorito ? 'Removido dos favoritos!' : 'Adicionado aos favoritos!');
      carregarDetalhes();
    }
  } catch (error) {
    alert('Erro ao atualizar favoritos');
  }
}

async function deletarLivro(livroId) {
  if (!confirm('Tem certeza que deseja deletar este livro?')) {
    return;
  }
  
  try {
    const response = await fetch(`/livros/${livroId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Livro deletado com sucesso!');
      window.location.href = 'livros.html';
    }
  } catch (error) {
    alert('Erro ao deletar livro');
  }
}

carregarDetalhes();
