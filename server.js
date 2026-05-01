const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const pool = require('./db');
const resetDatabase = require('./scripts/reset');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const LIVRO_COLUMNS = `id, nome, autor, paginas, descricao,
  imagem_url AS imagemUrl, data_cadastro AS dataCadastro`;

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
app.post('/registro', async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    const hash = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: { id: result.insertId, nome, email }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }
    next(err);
  }
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
app.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const [rows] = await pool.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = ?',
      [email]
    );

    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
    }

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (err) {
    next(err);
  }
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
app.get('/livros', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT ${LIVRO_COLUMNS} FROM livros`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /livros/recentes/ultimos:
 *   get:
 *     summary: Retorna os 5 últimos livros cadastrados
 *     responses:
 *       200:
 *         description: Lista dos livros mais recentes
 */
app.get('/livros/recentes/ultimos', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${LIVRO_COLUMNS} FROM livros ORDER BY data_cadastro DESC, id DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
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
app.get('/livros/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${LIVRO_COLUMNS} FROM livros WHERE id = ?`,
      [parseInt(req.params.id)]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
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
app.post('/livros', async (req, res, next) => {
  try {
    const { nome, autor, paginas, descricao, imagemUrl } = req.body;

    const [result] = await pool.query(
      `INSERT INTO livros (nome, autor, paginas, descricao, imagem_url)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome,
        autor,
        parseInt(paginas),
        descricao || '',
        imagemUrl || 'https://via.placeholder.com/150'
      ]
    );

    const [rows] = await pool.query(
      `SELECT ${LIVRO_COLUMNS} FROM livros WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
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
app.put('/livros/:id', async (req, res, next) => {
  try {
    const { nome, autor, paginas, descricao, imagemUrl } = req.body;
    const id = parseInt(req.params.id);

    const [result] = await pool.query(
      `UPDATE livros
       SET nome = ?, autor = ?, paginas = ?, descricao = ?, imagem_url = ?
       WHERE id = ?`,
      [nome, autor, parseInt(paginas), descricao, imagemUrl, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    const [rows] = await pool.query(
      `SELECT ${LIVRO_COLUMNS} FROM livros WHERE id = ?`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
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
app.delete('/livros/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM livros WHERE id = ?', [
      parseInt(req.params.id)
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }
    res.json({ mensagem: 'Livro removido com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ==================== ROTAS DE ESTATÍSTICAS ====================

/**
 * @swagger
 * /estatisticas:
 *   get:
 *     summary: Retorna estatísticas gerais da biblioteca
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
app.get('/estatisticas', async (req, res, next) => {
  try {
    const [[livrosRow]] = await pool.query(
      'SELECT COUNT(*) AS totalLivros, COALESCE(SUM(paginas), 0) AS totalPaginas FROM livros'
    );
    const [[usuariosRow]] = await pool.query(
      'SELECT COUNT(*) AS totalUsuarios FROM usuarios'
    );
    res.json({
      totalLivros: Number(livrosRow.totalLivros),
      totalPaginas: Number(livrosRow.totalPaginas),
      totalUsuarios: Number(usuariosRow.totalUsuarios)
    });
  } catch (err) {
    next(err);
  }
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
app.get('/favoritos/:usuarioId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id, l.nome, l.autor, l.paginas, l.descricao,
              l.imagem_url AS imagemUrl, l.data_cadastro AS dataCadastro
       FROM livros l
       JOIN favoritos f ON f.livro_id = l.id
       WHERE f.usuario_id = ?`,
      [parseInt(req.params.usuarioId)]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
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
app.post('/favoritos', async (req, res, next) => {
  try {
    const { usuarioId, livroId } = req.body;
    await pool.query(
      'INSERT INTO favoritos (usuario_id, livro_id) VALUES (?, ?)',
      [usuarioId, livroId]
    );
    res.status(201).json({ mensagem: 'Livro adicionado aos favoritos' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ mensagem: 'Livro já está nos favoritos' });
    }
    next(err);
  }
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
app.delete('/favoritos', async (req, res, next) => {
  try {
    const { usuarioId, livroId } = req.body;
    const [result] = await pool.query(
      'DELETE FROM favoritos WHERE usuario_id = ? AND livro_id = ?',
      [usuarioId, livroId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Favorito não encontrado' });
    }
    res.json({ mensagem: 'Livro removido dos favoritos' });
  } catch (err) {
    next(err);
  }
});

// Error handler genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/login.html`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);

  const RESET_INTERVAL_MS = 60 * 60 * 1000;
  setInterval(() => {
    resetDatabase().catch((err) => console.error('[reset] Falhou:', err));
  }, RESET_INTERVAL_MS);
  console.log('Reset automático agendado a cada 1 hora');
});
