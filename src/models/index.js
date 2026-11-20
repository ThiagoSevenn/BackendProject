const User = require('./UserModel')
const Product = require('./ProductModel');
const Category = require('./CategoryModel');
const ProductImage = require('./ProductImageModel');
const ProductOption = require('./ProductOptionModel');
const ProductCategory = require('./ProductCategoryModel');

// Relacionamento Product x ProductImage
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Relacionamento Product x ProductOption
Product.hasMany(ProductOption, { foreignKey: 'product_id', as: 'options' });
ProductOption.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Relacionamento ProductCategory x Product e Category
Product.hasMany(ProductCategory, { foreignKey: 'product_id', as: 'productCategories'});
ProductCategory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Category.hasMany(ProductCategory, { foreignKey: 'category_id', as: 'productCategories' });
ProductCategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = { User, Product, ProductImage, ProductOption, Category, ProductCategory };