const sequelize = require('./database');

require('../models/UserModel')
require('../models/ProductModel')
require('../models/CategoryModel')
require('../models/ProductImageModel')
require('../models/ProductOptionModel')
require('../models/ProductCategoryModel')

async function syncDatabase() {
  try {
    // force: true limpa os dados e recria as tabelas
    const force = process.env.DB_SYNC_FORCE === 'true'
    await sequelize.sync({ force: force });
    console.log(force ? 'Banco de dados resetado e sincronizado!' : 'Banco de dados está sincronizado!');
  } catch (error) {
    console.error('Falha na sincronização:', error);
  }
}
// Para sincronizar o banco de dados.
// Utilizar do comando: node src/config/syncforce.js 
// OBS: Personalizei para apenas "npm run database"
syncDatabase();