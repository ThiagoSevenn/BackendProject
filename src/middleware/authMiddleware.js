const jwt = require('jsonwebtoken');
const createError = require('../utils/errors');

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;
    const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
        return next(createError('Token de autorização não enviado ou em formato inválido.', 401));
    }
    if (!process.env.JWT_SECRET) {
        return next(createError('A variável JWT_SECRET não foi configurada no servidor.', 500));
    }

    try {
        req.user = jwt.verify(match[1], process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return next(createError('Token inválido ou expirado.', 401));
    }
}

module.exports = authMiddleware;
