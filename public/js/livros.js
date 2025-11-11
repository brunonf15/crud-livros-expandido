const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  window.location.href = 'login.html';
}

document.getElementById('nomeUsuario').textContent = usuario.nome;

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

const formAdicionar = document.getElementById('form-adicionar');

formAdicionar.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const autor = document.getElementById('autor').value;
  const paginas = document.getElementById('paginas').value;
  const descricao = document.getElementById('descricao').value;
  const imagemUrl = document.getElementById('imagemUrl').value;
  
  try {
    const response = await fetch('http://localhost:3000/livros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, autor, paginas, descricao, imagemUrl })
    });
    
    if (response.ok) {
      alert('Livro adicionado com sucesso!');
      formAdicionar.reset();
      carregarLivros();
    } else {
      alert('Erro ao adicionar livro');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor');
  }
});

async function carregarLivros() {
  try {
    const response = await fetch('http://localhost:3000/livros');
    const livros = await response.json();
    
    const container = document.getElementById('lista-livros');
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
    console.error('Erro ao carregar livros:', error);
  }
}

carregarLivros();
