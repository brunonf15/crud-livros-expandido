const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// "Banco de dados" em memória
let usuarios = [
  { id: 1, nome: 'Admin', email: 'admin@biblioteca.com', senha: '123456' }
];

let livros = [
  { 
    id: 1, 
    nome: 'Clean Code', 
    autor: 'Robert C. Martin', 
    paginas: 464,
    descricao: 'Um guia completo sobre boas práticas de programação',
    imagemUrl: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
    dataCadastro: new Date().toISOString()
  },
  { 
    id: 2, 
    nome: 'Harry Potter', 
    autor: 'J.K. Rowling', 
    paginas: 309,
    descricao: 'O primeiro livro da saga do bruxinho mais famoso',
    imagemUrl: 'https://m.media-amazon.com/images/I/81ibfYk4qmL._SY466_.jpg',
    dataCadastro: new Date().toISOString()
  }
];

let favoritos = []; // { usuarioId, livroId }

let proximoIdUsuario = 2;
let proximoIdLivro = 3;

// Configuração Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Biblioteca',
      version: '2.0.0',
      description: 'API completa para gerenciamento de biblioteca com autenticação'
    },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==================== ROTAS DE AUTENTICAÇÃO ====================

/**
 * @swagger
 * /registro:
 *   post:
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Email já cadastrado
 */
app.post('/registro', (req, res) => {
  const { nome, email, senha } = req.body;
  
  // Verifica se email já existe
  const usuarioExistente = usuarios.find(u => u.email === email);
  if (usuarioExistente) {
    return res.status(400).json({ mensagem: 'Email já cadastrado' });
  }
  
  const novoUsuario = {
    id: proximoIdUsuario++,
    nome,
    email,
    senha
  };
  
  usuarios.push(novoUsuario);
  
  // Retorna usuário sem a senha
  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  res.status(201).json({
    mensagem: 'Usuário criado com sucesso',
    usuario: usuarioSemSenha
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
  }
  
  // Retorna usuário sem a senha
  const { senha: _, ...usuarioSemSenha } = usuario;
  res.json({
    mensagem: 'Login realizado com sucesso',
    usuario: usuarioSemSenha
  });
});

// ==================== ROTAS DE LIVROS ====================

/**
 * @swagger
 * /livros:
 *   get:
 *     summary: Lista todos os livros
 *     responses:
 *       200:
 *         description: Lista de livros retornada com sucesso
 */
app.get('/livros', (req, res) => {
  res.json(livros);
});

/**
 * @swagger
 * /livros/{id}:
 *   get:
 *     summary: Busca um livro por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro encontrado
 *       404:
 *         description: Livro não encontrado
 */
app.get('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === parseInt(req.params.id));
  if (!livro) {
    return res.status(404).json({ mensagem: 'Livro não encontrado' });
  }
  res.json(livro);
});

/**
 * @swagger
 * /livros:
 *   post:
 *     summary: Adiciona um novo livro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               autor:
 *                 type: string
 *               paginas:
 *                 type: integer
 *               descricao:
 *                 type: string
 *               imagemUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Livro adicionado com sucesso
 */
app.post('/livros', (req, res) => {
  const { nome, autor, paginas, descricao, imagemUrl } = req.body;
  
  const novoLivro = {
    id: proximoIdLivro++,
    nome,
    autor,
    paginas: parseInt(paginas),
    descricao: descricao || '',
    imagemUrl: imagemUrl || 'https://via.placeholder.com/150',
    dataCadastro: new Date().toISOString()
  };
  
  livros.push(novoLivro);
  res.status(201).json(novoLivro);
});

/**
 * @swagger
 * /livros/{id}:
 *   put:
 *     summary: Atualiza um livro existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Livro atualizado com sucesso
 *       404:
 *         description: Livro não encontrado
 */
app.put('/livros/:id', (req, res) => {
  const livro = livros.find(l => l.id === parseInt(req.params.id));
  if (!livro) {
    return res.status(404).json({ mensagem: 'Livro não encontrado' });
  }
  
  const { nome, autor, paginas, descricao, imagemUrl } = req.body;
  livro.nome = nome;
  livro.autor = autor;
  livro.paginas = parseInt(paginas);
  livro.descricao = descricao;
  livro.imagemUrl = imagemUrl;
  
  res.json(livro);
});

/**
 * @swagger
 * /livros/{id}:
 *   delete:
 *     summary: Remove um livro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro removido com sucesso
 *       404:
 *         description: Livro não encontrado
 */
app.delete('/livros/:id', (req, res) => {
  const index = livros.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ mensagem: 'Livro não encontrado' });
  }
  
  livros.splice(index, 1);
  res.json({ mensagem: 'Livro removido com sucesso' });
});

// ==================== ROTAS DE ESTATÍSTICAS ====================

/**
 * @swagger
 * /livros/recentes/ultimos:
 *   get:
 *     summary: Retorna os 5 últimos livros cadastrados
 *     responses:
 *       200:
 *         description: Lista dos livros mais recentes
 */
app.get('/livros/recentes/ultimos', (req, res) => {
  const livrosRecentes = livros
    .sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro))
    .slice(0, 5);
  res.json(livrosRecentes);
});

/**
 * @swagger
 * /estatisticas:
 *   get:
 *     summary: Retorna estatísticas gerais da biblioteca
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
app.get('/estatisticas', (req, res) => {
  const totalLivros = livros.length;
  const totalPaginas = livros.reduce((acc, livro) => acc + livro.paginas, 0);
  const totalUsuarios = usuarios.length;
  
  res.json({
    totalLivros,
    totalPaginas,
    totalUsuarios
  });
});

// ==================== ROTAS DE FAVORITOS ====================

/**
 * @swagger
 * /favoritos/{usuarioId}:
 *   get:
 *     summary: Lista os livros favoritos de um usuário
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de favoritos retornada
 */
app.get('/favoritos/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const favoritosUsuario = favoritos
    .filter(f => f.usuarioId === usuarioId)
    .map(f => livros.find(l => l.id === f.livroId))
    .filter(livro => livro !== undefined);
  
  res.json(favoritosUsuario);
});

/**
 * @swagger
 * /favoritos:
 *   post:
 *     summary: Adiciona um livro aos favoritos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               livroId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Livro favoritado com sucesso
 */
app.post('/favoritos', (req, res) => {
  const { usuarioId, livroId } = req.body;
  
  // Verifica se já está favoritado
  const jaFavoritado = favoritos.find(
    f => f.usuarioId === usuarioId && f.livroId === livroId
  );
  
  if (jaFavoritado) {
    return res.status(400).json({ mensagem: 'Livro já está nos favoritos' });
  }
  
  favoritos.push({ usuarioId, livroId });
  res.status(201).json({ mensagem: 'Livro adicionado aos favoritos' });
});

/**
 * @swagger
 * /favoritos:
 *   delete:
 *     summary: Remove um livro dos favoritos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               livroId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Livro removido dos favoritos
 */
app.delete('/favoritos', (req, res) => {
  const { usuarioId, livroId } = req.body;
  
  const index = favoritos.findIndex(
    f => f.usuarioId === usuarioId && f.livroId === livroId
  );
  
  if (index === -1) {
    return res.status(404).json({ mensagem: 'Favorito não encontrado' });
  }
  
  favoritos.splice(index, 1);
  res.json({ mensagem: 'Livro removido dos favoritos' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/login.html`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
