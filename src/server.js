const router = require('../src/routes/router')

const express = require('express')

const port = process.env.EXPRESS_PORT;
const host = process.env.EXPRESS_HOST;

const app = express();

app.use(express.json())

app.use(require('./middleware/authMiddleware'))
app.use(require('./middleware/responseMiddleware'))

app.use('/', router)

app.listen(port, host, ()=>{
    console.log(`A aplicação está rodando no endereço: http://${host}:${port}`)
})

