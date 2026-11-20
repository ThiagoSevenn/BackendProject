const app = require('./app');

const port = process.env.EXPRESS_PORT;
const host = process.env.EXPRESS_HOST;

app.listen(port, host, () => {
    console.log(`A aplicação está rodando no endereço: http://${host}:${port}`);
});