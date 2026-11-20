const express = require('express');
const router = require('./routes/router');

const errorHandler = require('./middleware/errorHandler');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi');

const app = express();

app.use(express.json());

// Rotas que são declaradas no router.js
app.use('/v1', router);
// Rota para o swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Tratamento de rotas que não existem
app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

// Tratamento de erros
app.use(errorHandler);

module.exports = app;