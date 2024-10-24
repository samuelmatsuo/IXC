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
