-- Seed apenas para dev/teste. Senha do admin = "123456" (bcrypt 10 rounds).

INSERT INTO usuarios (id, nome, email, senha) VALUES
  (1, 'Admin', 'admin@biblioteca.com', '$2a$10$wnLJSLabCio14Wcm/5POp.iO7/bm7ke1JmMDM3O3JuH61WT5jDHVe');

INSERT INTO livros (id, nome, autor, paginas, descricao, imagem_url) VALUES
  (1, 'Clean Code', 'Robert C. Martin', 464,
   'Um guia completo sobre boas práticas de programação',
   'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg'),
  (2, 'Harry Potter', 'J.K. Rowling', 309,
   'O primeiro livro da saga do bruxinho mais famoso',
   'https://m.media-amazon.com/images/I/81ibfYk4qmL._SY466_.jpg');
