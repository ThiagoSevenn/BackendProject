# BackendProject

API REST desenvolvida com **Node.js**, **Express**, **MySQL** e **Sequelize**, voltada ao gerenciamento de usuários, categorias e produtos.

## 📋 Tecnologias utilizadas

- Node.js
- Express
- MySQL
- Sequelize
- MySQL2
- JSON Web Token (JWT)
- bcrypt
- Swagger / OpenAPI
- Jest

## 🚀 Pré-requisitos

Antes de iniciar o projeto, certifique-se de possuir:

- [Node.js](https://nodejs.org/) instalado.
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) instalado e em execução.
- [Git](https://git-scm.com/) instalado.

Para verificar as instalações:

```bash
node --version
npm --version
mysql --version
```

## 📥 Instalação

Clone o repositório:

```bash
git clone https://github.com/ThiagoSevenn/BackendProject.git
```

Entre na pasta do projeto:

```bash
cd BackendProject
```

Instale as dependências:

```bash
npm install
```

## ⚙️ Configuração das variáveis de ambiente

Na raiz do projeto, crie um arquivo chamado `.env`, no mesmo nível do `package.json`.

Esse arquivo será responsável por armazenar as configurações de conexão com o banco de dados, inicialização do servidor e autenticação.

### Exemplo de configuração

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=DigitalCollageDB
DB_USERNAME=root
DB_PASSWORD=root

# Sincronização do banco
DB_SYNC_FORCE=false

# Servidor Express
EXPRESS_HOST=localhost
EXPRESS_PORT=3000

# Ambiente
NODE_ENV=development

# Armazenamento de imagens
IMAGE_STORAGE_MODE=placeholder

# Autenticação JWT
JWT_SECRET=COLOQUE_SEU_SEGREDO_AQUI
JWT_EXPIRES_IN=1d

# URL pública da API (opcional)
# APP_URL=http://localhost:3000
```

### Descrição das variáveis

| Variável | Descrição |
|---|---|
| `DB_HOST` | Endereço do servidor MySQL. Para ambiente local, utilize `localhost`. |
| `DB_PORT` | Porta utilizada pelo MySQL. O padrão é `3306`. |
| `DB_NAME` | Nome do banco de dados utilizado pela aplicação. |
| `DB_USERNAME` | Usuário responsável pelo acesso ao banco. |
| `DB_PASSWORD` | Senha do usuário do banco de dados. |
| `DB_SYNC_FORCE` | Define se as tabelas devem ser apagadas e recriadas durante a sincronização. |
| `EXPRESS_HOST` | Endereço de rede em que o servidor Express ficará disponível. |
| `EXPRESS_PORT` | Porta em que a API será executada. |
| `NODE_ENV` | Identifica o ambiente de execução, como desenvolvimento ou produção. |
| `IMAGE_STORAGE_MODE` | Configuração prevista para definir o modo de armazenamento de imagens. |
| `JWT_SECRET` | Chave secreta utilizada para assinar e validar os tokens JWT. |
| `JWT_EXPIRES_IN` | Tempo de validade dos tokens JWT. |
| `APP_URL` | URL pública da API, utilizada na montagem de URLs de imagens. |

> **Observação:** `NODE_ENV` e `IMAGE_STORAGE_MODE` estão previstos no arquivo de configuração, mas ainda não são utilizados diretamente pela implementação atual. `APP_URL` é opcional.

### 🔐 Como gerar o JWT_SECRET?

O `JWT_SECRET` não é o token que será enviado nas requisições. Ele é uma chave privada utilizada pelo servidor para assinar e validar os tokens de autenticação.

Para gerar uma chave segura, utilize o módulo nativo `crypto` do Node.js.

Execute o comando abaixo no terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Será gerada uma sequência hexadecimal aleatória, semelhante a:

```text
060c2d3d6b5a477cd50d9e749d25b824892f38777905c5fcc4ad664d6fac5bf3...
```

Copie o valor gerado e configure no arquivo `.env`:

```env
JWT_SECRET=VALOR_GERADO
JWT_EXPIRES_IN=1d
```

**Cuidados importantes:**

- Gere seu próprio segredo, não utilize o exemplo acima.
- Não compartilhe o `JWT_SECRET` com o frontend.
- Não publique essa chave no GitHub.
- Utilize segredos diferentes para desenvolvimento e produção.
- Caso a chave seja alterada, os tokens emitidos anteriormente deixarão de ser válidos.

O projeto já possui o arquivo `.env` configurado no `.gitignore`, evitando que as credenciais locais sejam enviadas ao repositório.

## 🗄️ Configuração do banco de dados

Após configurar o MySQL, crie o banco de dados definido na variável `DB_NAME`.

Exemplo:

```sql
CREATE DATABASE DigitalCollageDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Caso utilize outro nome, atualize também a variável `DB_NAME` no arquivo `.env`.

### Sincronização das tabelas

Com o banco criado e as credenciais configuradas, execute:

```bash
npm run database
```

Esse comando realiza a sincronização dos modelos definidos no Sequelize com o banco de dados.

A variável `DB_SYNC_FORCE` controla o comportamento da sincronização:

- `false`: sincroniza as tabelas sem solicitar a recriação destrutiva da estrutura.
- `true`: remove as tabelas existentes e recria a estrutura a partir dos modelos.

> ⚠️ **Atenção:** utilizar `DB_SYNC_FORCE=true` pode apagar todos os dados existentes. Utilize essa opção somente quando desejar realmente reinicializar um banco descartável.

## ▶️ Executando a aplicação

O projeto disponibiliza dois comandos para inicializar o servidor.

### Desenvolvimento

```bash
npm run dev
```

Utiliza o Nodemon para reiniciar automaticamente o servidor quando alterações forem realizadas nos arquivos monitorados.

### Execução normal

```bash
npm start
```

Após iniciar a aplicação, a API estará disponível, por padrão, em:

```text
http://localhost:3000
```

## 📚 Documentação da API

A aplicação disponibiliza uma interface Swagger para consultar e testar os endpoints.

Com o servidor em execução, acesse:

```text
http://localhost:3000/api-docs
```

A documentação apresenta os recursos disponíveis, parâmetros, estruturas de requisição e respostas esperadas.

## 🔑 Autenticação

A autenticação é realizada por meio de **JSON Web Token (JWT)**.

### 1. Cadastro de usuário

O primeiro passo é cadastrar um usuário:

`POST /v1/user`

Exemplo de corpo da requisição:

```json
{
  "firstname": "Nome",
  "surname": "Sobrenome",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

As senhas são armazenadas utilizando hash com bcrypt.

### 2. Login

Após o cadastro, realize o login:

`POST /v1/user/token`

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

A API retornará um token JWT:

```json
{
  "token": "eyJ..."
}
```

### 3. Utilização do token

Para acessar endpoints protegidos, envie o token no cabeçalho da requisição:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

O middleware de autenticação verifica a validade do token utilizando o `JWT_SECRET` configurado no servidor.

## 🛣️ Endpoints disponíveis

Todas as rotas possuem o prefixo `/v1`.

### Usuários

| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| POST | `/user` | Não | Cadastrar usuário |
| POST | `/user/token` | Não | Realizar login e obter JWT |
| GET | `/user/:id` | Não | Consultar usuário |
| PUT | `/user/:id` | Sim | Atualizar usuário |
| DELETE | `/user/:id` | Sim | Excluir usuário |

### Categorias

| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| GET | `/category/search` | Não | Pesquisar categorias |
| GET | `/category/:id` | Não | Consultar categoria |
| POST | `/category` | Sim | Cadastrar categoria |
| PUT | `/category/:id` | Sim | Atualizar categoria |
| DELETE | `/category/:id` | Sim | Excluir categoria |

### Produtos

| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| GET | `/product/search` | Não | Pesquisar produtos |
| GET | `/product/:id` | Não | Consultar produto |
| POST | `/product` | Sim | Cadastrar produto |
| PUT | `/product/:id` | Sim | Atualizar produto |
| DELETE | `/product/:id` | Sim | Excluir produto |

## 🧪 Testes

O projeto possui Jest configurado para execução dos testes automatizados.

Para executar:

```bash
npm test
```

## 📁 Estrutura do projeto

```text
BackendProject/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── syncforce.js
│   ├── controllers/
│   ├── docs/
│   │   └── openapi.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

## 📜 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm install` | Instala as dependências do projeto. |
| `npm start` | Inicia a aplicação. |
| `npm run dev` | Inicia a aplicação em modo de desenvolvimento. |
| `npm run database` | Sincroniza os modelos com o banco de dados. |
| `npm test` | Executa os testes automatizados. |

## 🔒 Segurança

- Não compartilhe ou versione o arquivo `.env`.
- Utilize um `JWT_SECRET` forte e exclusivo.
- Não utilize credenciais padrão em ambientes de produção.
- Evite habilitar `DB_SYNC_FORCE=true` em bancos com dados importantes.
- Em produção, configure as variáveis de ambiente diretamente na plataforma de hospedagem.
- Utilize HTTPS em ambientes públicos.
