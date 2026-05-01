if (require.main === module) {
  require('dotenv').config({
    path: process.env.DOTENV_PATH || '.env.local'
  });
}

const pool = require('../db');

const ADMIN_HASH = '$2a$10$wnLJSLabCio14Wcm/5POp.iO7/bm7ke1JmMDM3O3JuH61WT5jDHVe';
const HARRY_POTTER = {
  nome: 'Harry Potter',
  autor: 'J.K. Rowling',
  paginas: 309,
  descricao: 'O primeiro livro da saga do bruxinho mais famoso',
  imagemUrl: 'https://m.media-amazon.com/images/I/81ibfYk4qmL._SY466_.jpg'
};

async function resetDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE favoritos');
    await conn.query('TRUNCATE TABLE livros');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    await conn.query(
      `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE senha = VALUES(senha)`,
      ['Admin', 'admin@biblioteca.com', ADMIN_HASH]
    );

    await conn.query(
      'INSERT INTO livros (nome, autor, paginas, descricao, imagem_url) VALUES (?, ?, ?, ?, ?)',
      [
        HARRY_POTTER.nome,
        HARRY_POTTER.autor,
        HARRY_POTTER.paginas,
        HARRY_POTTER.descricao,
        HARRY_POTTER.imagemUrl
      ]
    );

    console.log(`[reset] Banco resetado em ${new Date().toISOString()}`);
  } finally {
    conn.release();
  }
}

module.exports = resetDatabase;

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[reset] Erro:', err);
      process.exit(1);
    });
}
