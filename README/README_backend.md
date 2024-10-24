# Projeto IXC Backend

Bem-vindo ao **Projeto IXC Backend**! Este README fornece informações detalhadas sobre a API que serve como a base do nosso sistema. Aqui, você encontrará detalhes sobre a estrutura do projeto, as tecnologias utilizadas, as rotas disponíveis e exemplos de código que demonstram como interagir com a API. Este backend foi desenvolvido para oferecer suporte a funcionalidades essenciais, como registro de usuários, autenticação e troca de mensagens em tempo real.

## Estrutura de arquivos
```
Projeto IXC
├── projeto-ixc-backend
│   ├── controllers
│   │   └── userControllers.js
│   ├── middlewares
│   │   └── authMiddleware.js
│   ├── models
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes
│   │   └── userRoutes.js
│   ├── .env
│   ├── app.js
│   ├── package-lock.json
│   └── package.json
```
## Técnologias utilizadas

- [Node.js](https://nodejs.org/docs/latest/api/): Ambiente de execução JavaScript para o backend.
- [Express](https://expressjs.com/pt-br/): Framework para construir aplicações web com Node.js.
- [MongoDB](https://www.mongodb.com/pt-br/docs/): Banco de dados NoSQL para armazenamento de dados.
- [Mongoose](https://mongoosejs.com/docs/documents.html): Biblioteca para modelar objetos MongoDB em JavaScript.
- [JSON Web Tokens (JWT)](https://jwt.io/introduction): Para autenticação de usuários.
- [Socket.IO](https://socket.io/pt-br/docs/v4/): Para comunicação em tempo real entre usuários.
- [Swagger](https://swagger.io/docs/): Para documentação da API.

## Estrutura do Projeto

### Rotas da API
As seguintes rotas estão disponíveis para interagir com a API:

- `POST /register`: Cadastro de um novo usuário.
- `POST /login`: Autenticação de um usuário existente.
- `GET /users`: Retorna a lista de todos os usuários (autenticado).
- `POST /messages`: Envia uma nova mensagem (autenticado).
- `GET /messages/:senderId/:recipientId`: Retorna mensagens entre dois usuários (autenticado).
- `PUT /users/:id`: Atualiza informações do usuário (autenticado).

### Exemplo de Código

**Controller para listar usuários:**
***É utilizado o controller para fazer a requisição ao banco de dados e retornar a lista de usuários.***

```javascript
const getUsers = async (req, res) => {
  try {
    const usersList = await users.find();
    res.json(usersList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
```
**Modelo de usuário:**
***É utilizado o modelo para criar a estrutura de dados do usuário no banco de dados.***
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true, // Nome de usuário deve ser único
  },
  password: {
    type: String,
    required: true,
  },
});
// Cria o modelo de usuário
const User = mongoose.model('User', userSchema);

module.exports = User;
```
**Autenticação com JWT:**
***É utilizado o middleware para autenticar o usuário e gerar o token JWT.***
```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Não autorizado

  jwt.verify(token, process.env.SECRET_KEY || 'your_secret_key', (err, user) => {
    if (err) return res.sendStatus(403); // Proibido
    req.user = user;
    next();
  });
};


module.exports = { authenticateToken };
```
**Configuração do servidor (app.js):**
***É utilizado o arquivo de configuração (app.js) para definir as configurações do servidor.***
```javascript
// Configuração de servidor e Socket.IO
const serve = http.createServer(app);
const io = require('socket.io')(serve, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

// Conexão com o MongoDB
mongoose.connect('mongodb+srv://{username}:{password}@{nomedobanco}.hhi33.mongodb.net/?retryWrites=true&w=majority&appName=samuelmatsuo')
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));
// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Básica de Usuários',
            version: '1.0.0',
            description: 'Uma API simples para gerenciar usuários com autenticação JWT',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/userRoutes.js'],
};
```

