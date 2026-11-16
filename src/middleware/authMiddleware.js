const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (token === 'meu-token-secreto') {
    next(); // Chave correta! Pode passar.
  } else {
    res.status(403).json({ msg: 'Acesso Negado!' });
  }
};

module.exports = authMiddleware;