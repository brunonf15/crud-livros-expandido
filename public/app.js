//app.js
const formAdicionar = document.getElementById('form-adicionar');
const listaLivros = document.getElementById('lista-livros');
const btnListar = document.getElementById('btn-listar');
const btnBuscar = document.getElementById('btn-buscar');
const idBuscar = document.getElementById('id-buscar');
const livroEncontrado = document.getElementById('livro-encontrado');

// Adicionar livro
formAdicionar.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const autor = document.getElementById('autor').value;
  const paginas = document.getElementById('paginas').value;

  fetch('http://localhost:3000/livros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, autor, paginas })
  })
  .then(res => res.json())
  .then(data => {
    alert('Livro adicionado com sucesso!');
    formAdicionar.reset();
  });
});

// Listar todos os livros
btnListar.addEventListener('click', () => {
  fetch('http://localhost:3000/livros')
  .then(res => res.json())
  .then(data => {
    listaLivros.innerHTML = '';
    data.forEach(livro => {
      const li = document.createElement('li');
      li.textContent = `ID: ${livro.id}, Nome: ${livro.nome}, Autor: ${livro.autor}, Páginas: ${livro.paginas}`;
      listaLivros.appendChild(li);
    });
  });
});

// Buscar livro por ID
btnBuscar.addEventListener('click', () => {
  const id = idBuscar.value;
  fetch(`http://localhost:3000/livros/${id}`)
  .then(res => res.json())
  .then(data => {
    if (data.mensagem) {
      livroEncontrado.textContent = data.mensagem;
    } else {
      livroEncontrado.textContent = `ID: ${data.id}, Nome: ${data.nome}, Autor: ${data.autor}, Páginas: ${data.paginas}`;
    }
  });
});

module.exports = app;

