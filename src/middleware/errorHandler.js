function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || 'Erro interno do servidor.';

    // Erros de validação e de campos únicos do Sequelize são erros enviados pelo cliente.
    if (!error.statusCode && [
        'SequelizeValidationError',
        'SequelizeUniqueConstraintError',
        'SequelizeForeignKeyConstraintError'
    ].includes(error.name)) {
        statusCode = 400;
        if (error.errors && error.errors.length) {
            message = error.errors.map(item => item.message).join(', ');
        }
    }

    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = 'Erro interno do servidor.';
    }

    return res.status(statusCode).json({ message });
}

module.exports = errorHandler;
