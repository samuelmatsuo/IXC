# Projeto IXC

Este repositório abriga tanto o backend quanto o frontend do Projeto IXC, uma aplicação desenvolvida para fazer uma comunicação em tempo real utilizando Socket.IO. No backend é utilizado node.js e no frontend é utilizado o React. 

## Acesse o README do frontend e do backend
* [frontend.ds](README_frontend.md)
* [backend](README_backend.md)

## Técnologias utilizadas

- [React](https://pt-br.react.dev/): Biblioteca para construir interfaces de usuário.
- [Next.js](https://nextjs.org/docs): Framework para React que permite a renderização do lado do servidor e o suporte a rotas.
- [Socket.IO](https://socket.io/pt-br/docs/v4/): Biblioteca para comunicação em tempo real entre cliente e servidor.
- [Axios](https://axios-http.com/ptbr/docs/intro): Biblioteca para fazer requisições HTTP.
- [CSS Modules](https://github.com/css-modules/css-modules): Para estilos isolados e modularizados.
- [Node.js](https://nodejs.org/docs/latest/api/): Ambiente de execução JavaScript para o backend.
- [Express](https://expressjs.com/pt-br/): Framework para construir aplicações web com Node.js.
- [MongoDB](https://www.mongodb.com/pt-br/docs/): Banco de dados NoSQL para armazenamento de dados.
- [Mongoose](https://mongoosejs.com/docs/documents.html): Biblioteca para modelar objetos MongoDB em JavaScript.
- [JSON Web Tokens (JWT)](https://jwt.io/introduction): Para autenticação de usuários.
- [Socket.IO](https://socket.io/pt-br/docs/v4/): Para comunicação em tempo real entre usuários.
- [Swagger](https://swagger.io/docs/): Para documentação da API.

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

## Links Úteis

- [Instruções de Instalação](README_links.md)
