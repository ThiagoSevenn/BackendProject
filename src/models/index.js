const Product = require('./ProductModel');
const Category = require('./CategoryModel');
const ProductImage = require('./ProductImageModel');
const ProductOption = require('./ProductOptionModel');
const ProductCategory = require('./ProductCategoryModel');

// Relacionamento Product x ProductImage
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// Relacionamento Product x ProductOption
Product.hasMany(ProductOption, { foreignKey: 'product_id' });
ProductOption.belongsTo(Product, { foreignKey: 'product_id' });

// Relacionamento ProductCategory x Product e Category
Product.hasMany(ProductCategory, { foreignKey: 'product_id' });
ProductCategory.belongsTo(Product, { foreignKey: 'product_id' });

Category.hasMany(ProductCategory, { foreignKey: 'category_id' });
ProductCategory.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = { Product, ProductImage, ProductOption, Category, ProductCategory };