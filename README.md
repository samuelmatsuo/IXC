# Projeto IXC

Este repositório contém o backend e o frontend do projeto IXC.

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

Para conseguir acessar o frontend do projeto no navegador.
Acesse aqui [IXC](http://localhost:3001/login)
## Links Úteis

- [Instruções de Instalação](README_links.md)
