module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'BackendProject API',
    version: '1.0.0',
    description: 'API REST de usuários, categorias e produtos. Rotas de escrita protegidas por JWT Bearer.'
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    parameters: {
      id: { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }
    },
    schemas: {
      Error: { type: 'object', properties: { message: { type: 'string' } } },
      UserInput: {
        type: 'object', required: ['firstname', 'surname', 'email', 'password', 'confirmPassword'],
        properties: {
          firstname: { type: 'string' }, surname: { type: 'string' },
          email: { type: 'string', format: 'email' }, password: { type: 'string' }, confirmPassword: { type: 'string' }
        }
      },
      Credentials: {
        type: 'object', required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } }
      },
      CategoryInput: {
        type: 'object', required: ['name', 'slug'],
        properties: { name: { type: 'string' }, slug: { type: 'string' }, use_in_menu: { type: 'boolean', default: false } }
      },
      ProductInput: {
        type: 'object', required: ['name', 'slug', 'price', 'price_with_discount'],
        properties: {
          enabled: { type: 'boolean', default: false }, name: { type: 'string' }, slug: { type: 'string' },
          use_in_menu: { type: 'boolean', default: false }, stock: { type: 'integer', default: 0 },
          description: { type: 'string' }, price: { type: 'number' }, price_with_discount: { type: 'number' },
          category_ids: { type: 'array', items: { type: 'integer' } },
          images: { type: 'array', items: { type: 'object', properties: { type: { type: 'string' }, content: { type: 'string', description: 'URL ou Base64' } } } },
          options: { type: 'array', items: { type: 'object', required: ['title', 'values'], properties: {
            title: { type: 'string' }, shape: { type: 'string', enum: ['square', 'circle'] },
            radius: { type: 'string', example: '4px' }, type: { type: 'string', enum: ['text', 'color'] },
            values: { type: 'array', items: { type: 'string' } }
          } } }
        }
      }
    }
  },
  paths: {
    '/v1/user': {
      post: {
        tags: ['Usuários'], summary: 'Cadastrar usuário',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
        responses: { 201: { description: 'Usuário criado' }, 400: { description: 'Dados inválidos' } }
      }
    },
    '/v1/user/token': {
      post: {
        tags: ['Usuários'], summary: 'Gerar token JWT',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } } },
        responses: { 200: { description: 'Token gerado' }, 400: { description: 'Credenciais inválidas' } }
      }
    },
    '/v1/user/{id}': {
      get: { tags: ['Usuários'], summary: 'Obter usuário pelo ID', parameters: [{ $ref: '#/components/parameters/id' }], responses: { 200: { description: 'Usuário encontrado' }, 404: { description: 'Não encontrado' } } },
      put: { tags: ['Usuários'], summary: 'Atualizar usuário', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { firstname: { type: 'string' }, surname: { type: 'string' }, email: { type: 'string', format: 'email' } } } } } }, responses: { 204: { description: 'Atualizado sem corpo' }, 401: { description: 'Não autorizado' }, 404: { description: 'Não encontrado' } } },
      delete: { tags: ['Usuários'], summary: 'Excluir usuário', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/id' }], responses: { 204: { description: 'Excluído sem corpo' }, 401: { description: 'Não autorizado' }, 404: { description: 'Não encontrado' } } }
    },
    '/v1/category/search': {
      get: { tags: ['Categorias'], summary: 'Pesquisar categorias', parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'fields', in: 'query', schema: { type: 'string' } },
        { name: 'use_in_menu', in: 'query', schema: { type: 'boolean' } }
      ], responses: { 200: { description: 'Lista paginada de categorias' }, 400: { description: 'Parâmetros inválidos' } } }
    },
    '/v1/category': {
      post: { tags: ['Categorias'], summary: 'Criar categoria', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } }, responses: { 201: { description: 'Criada' }, 400: { description: 'Dados inválidos' }, 401: { description: 'Não autorizado' } } }
    },
    '/v1/category/{id}': {
      get: { tags: ['Categorias'], summary: 'Obter categoria', parameters: [{ $ref: '#/components/parameters/id' }], responses: { 200: { description: 'Encontrada' }, 404: { description: 'Não encontrada' } } },
      put: { tags: ['Categorias'], summary: 'Atualizar categoria', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } }, responses: { 204: { description: 'Atualizada' }, 401: { description: 'Não autorizado' }, 404: { description: 'Não encontrada' } } },
      delete: { tags: ['Categorias'], summary: 'Excluir categoria', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/id' }], responses: { 204: { description: 'Excluída' }, 401: { description: 'Não autorizado' }, 404: { description: 'Não encontrada' } } }
    },
    '/v1/product/search': {
      get: { tags: ['Produtos'], summary: 'Pesquisar produtos', parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'fields', in: 'query', schema: { type: 'string' } },
        { name: 'match', in: 'query', schema: { type: 'string' } },
        { name: 'category_ids', in: 'query', schema: { type: 'string', example: '1,15,24' } },
        { name: 'price-range', in: 'query', schema: { type: 'string', example: '100-200' } },
        { name: 'option[ID]', in: 'query', schema: { type: 'string', example: 'GG,PP' } }
      ], responses: { 200: { description: 'Lista paginada de produtos' }, 400: { description: 'Parâmetros inválidos' } } }
    },
    '/v1/product': {
      post: { tags: ['Produtos'], summary: 'Criar produto', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } }, responses: { 201: { description: 'Criado' }, 400: { description: 'Dados inválidos' }, 401: { description: 'Não autorizado' } } }
    },
    '/v1/product/{id}': {
      get: { tags: ['Produtos'], summary: 'Obter produto', parameters: [{ $ref: '#/components/parameters/id' }], responses: { 200: { description: 'Encontrado' }, 404: { description: 'Não encontrado' } } },
      put: { tags: ['Produtos'], summary: 'Atualizar produto', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } }, responses: { 204: { description: 'Atualizado' }, 401: { description: 'Não autorizado' }, 404: { description: 'Não encontrado' } } },
      delete: { tags: ['Produtos'], summary: 'Excluir produto', security: [{ bearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/id' }], responses: { 204: { description: 'Excluído' }, 401: { description: 'Não autorizado' }, 404: { description: 'Não encontrado' } } }
    }
  }
};
