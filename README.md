# Projeto IXC

Este repositório abriga tanto o backend quanto o frontend do Projeto IXC, uma aplicação desenvolvida para fazer uma comunicação em tempo real utilizando Socket.IO. No backend é utilizado node.js e no frontend é utilizado o React. 

## Acesse o README do frontend e do backend
* [frontend](README_frontend.md)
* [backend](README_backend.md)

## Técnologias utilizadas

- <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React logo" height="20"/> [React](https://pt-br.react.dev/): Biblioteca para construir interfaces de usuário.
- <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" alt="Next.js logo" height="20"/> [Next.js](https://nextjs.org/docs): Framework para React que permite a renderização do lado do servidor e o suporte a rotas.
- <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Socket-io.svg" alt="Socket.IO logo" height="20"/> [Socket.IO](https://socket.io/pt-br/docs/v4/): Biblioteca para comunicação em tempo real entre cliente e servidor.
- <img src="https://avatars.githubusercontent.com/u/32372333?s=200&v=4" alt="Axios logo" height="20"/> [Axios](https://axios-http.com/ptbr/docs/intro): Biblioteca para fazer requisições HTTP.
- <img src="https://avatars.githubusercontent.com/u/45769491?s=200&v=4" alt="CSS Modules logo" height="20"/> [CSS Modules](https://github.com/css-modules/css-modules): Para estilos isolados e modularizados.
- <img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" alt="Node.js logo" height="20"/> [Node.js](https://nodejs.org/docs/latest/api/): Ambiente de execução JavaScript para o backend.
- <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png" alt="Express logo" height="20"/> [Express](https://expressjs.com/pt-br/): Framework para construir aplicações web com Node.js.
- <img src="https://1000logos.net/wp-content/uploads/2020/08/MongoDB-Logo.png" alt="MongoDB logo" height="20"/> [MongoDB](https://www.mongodb.com/pt-br/docs/): Banco de dados NoSQL para armazenamento de dados.
- <img src="https://avatars.githubusercontent.com/u/7552965?s=200&v=4" alt="Mongoose logo" height="20"/> [Mongoose](https://mongoosejs.com/docs/documents.html): Biblioteca para modelar objetos MongoDB em JavaScript.
- <img src="https://jwt.io/img/pic_logo.svg" alt="JWT logo" height="20"/> [JSON Web Tokens (JWT)](https://jwt.io/introduction): Para autenticação de usuários.
- <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Swagger-logo.png" alt="Swagger logo" height="20"/> [Swagger](https://swagger.io/docs/): Para documentação da API.


## Pré-requisitos

Antes de começar, você precisa ter o [Node.js](https://nodejs.org/) e o [Git](https://git-scm.com/) instalados no seu sistema. Para mais informações sobre como instalar, consulte [Instruções de Instalação](README_links.md).

## Clonando o Repositório

1. Abra o terminal.
2. Navegue até o diretório onde você deseja clonar o repositório:
   ```bash
   cd /caminho/para/seu/diretorio
   ```
3. Clone o repositório:
   ```bash
   git clone https://github.com/samuelmatsuo/IXC.git
   ```

## Instalando Dependências

Após clonar o repositório, você precisa instalar as dependências do projeto:

### Para o Backend

1. Navegue até o diretório do backend:
   ```bash
   cd IXC/projeto-ixc-backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Instale o nodemon:
   ```bash
   npm install -g nodemon

### Para o Frontend

1. Navegue até o diretório do frontend:
   ```bash
   cd ../projeto-ixc-frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
### Para a raiz do projeto
1. Navegue até a pasta raiz do projeto
   ```bash
   cd ..
  ```
2. Instale o concurrently para poder executar os dois projetos ao mesmo tempo
   ```bash
   npm install concurrently --save
   ```
## Iniciando projetos

Após fazer as instalações necessárias vamos executar os projetos

### Iniciar ambos os projetos
Para iniciar o backend e o frontend juntos:
#### Acesse a raiz do projeto 
   ```bash
   cd ..
   ```
   ```bash
   npm run ixc
   ```

### Iniciar apenas a API (backend)
Para iniciar apenas o servidor backend:

   ```bash
   cd IXC/projeto-ixc-backend
   npm run dev
   ```

### Iniciar apenas o front
Para iniciar apenas o frontend, abra outro terminal:

   ```bash
   cd IXC/projeto-ixc-frontend
   npm run dev
   ```

# Acessar o Programa IXC

Após completar todos os processos, você pode acessar o programa utilizando o link abaixo:

**[Clique aqui para acessar o IXC](http://localhost:3001/login)**

> **Atenção:** Certifique-se de que **ambos os projetos** (frontend e backend) estão rodando antes de acessar o link.

### Desenvolvido por Samuel Matsuo

<p align="center">
  <a href="https://github.com/samuelmatsuo">
    <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub logo" height="20"/>
  </a>
  &nbsp;&nbsp;
  <a href="https://www.linkedin.com/in/samuel-matsuo-672810232/">
    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn logo" height="20"/>
  </a>
</p>
