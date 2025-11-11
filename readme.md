# CRUD de Livros

Projeto simples para demonstrar testes de API utilizando Node.js e um front-end em HTML, CSS e JavaScript para interagir com a API. Agora a aplicação é servida por meio de um servidor Express, garantindo um ambiente HTTP adequado para consumo correto dos recursos e para a realização de testes.

## Funcionalidades

- **Adicionar Livro:** Cria um novo livro com informações de nome, autor e número de páginas.
- **Listar Livros:** Exibe todos os livros cadastrados.
- **Buscar Livro por ID:** Permite buscar e exibir as informações de um livro específico através do seu ID.
- **Atualizar e Deletar Livro:** Endpoints disponíveis para atualizar ou deletar um livro (não expostos na interface do front-end).

## Tecnologias Utilizadas

- **Backend:** Node.js, Express, CORS, Swagger UI Express, Swagger JSDoc.
- **Frontend:** HTML, CSS e JavaScript.

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão LTS recomendada).
- Gerenciador de pacotes NPM ou Yarn.

## Como Executar

1. **Clone o repositório:**

   ```bash
   git clone <https://github.com/brunonf15/crud-livros.git>
   cd <crud-livros>
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Inicie o servidor:**

   ```bash
   npm start
   ```

   O servidor iniciará na porta `3000` por padrão.

4. **Acessando a Aplicação:**


   - **Documentação Swagger:** Disponível em [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
   - **API:** Acesse os endpoints via `http://localhost:3000`.
   - **Front-end:** A aplicação é servida via Express; acesse [http://localhost:3000/index.html](http://localhost:3000/index.html) para visualizar a interface.

## Estrutura do Projeto

```
crud-livros/
├── package.json        # Configurações e scripts do projeto
├── server.js           # API REST em Node.js - e documentação em Swagger
└── public/             # Arquivos estáticos (HTML, CSS e JavaScript)
    ├── index.html      # Interface do front-end
    └── app.js          # Lógica do front-end para consumir a API
```

## Uso

- **Adicionar Livro:** Preencha os campos do formulário "Adicionar Livro" e clique em **Adicionar**.  
  A ação enviará uma requisição POST para criar um novo livro na API.
- **Listar Livros:** Clique no botão **Listar Todos os Livros** para ver a lista de livros cadastrados.
- **Buscar Livro por ID:** Insira o ID desejado e clique em **Buscar** para exibir os dados do livro correspondente.

## Documentação da API

A documentação completa da API está disponível via Swagger em:  
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Contribuições

Sinta-se à vontade para enviar sugestões, correções e melhorias através de _pull requests_.