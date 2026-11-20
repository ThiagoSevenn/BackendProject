const { Product, Category, ProductCategory } = require('../models');
const createError = require('../utils/errors');

class ProductCategoryService {
    async create(data) {
        const { product_id, category_id } = data;
        if (!product_id || !category_id) {
            throw createError('product_id e category_id são obrigatórios.');
        }

        const product = await Product.findByPk(product_id);
        const category = await Category.findByPk(category_id);
        if (!product) throw createError('Produto não encontrado.', 404);
        if (!category) throw createError('Categoria não encontrada.', 404);

        const relationExists = await ProductCategory.findOne({ where: { product_id, category_id } });
        if (relationExists) throw createError('Esta categoria já está associada ao produto.');

        return ProductCategory.create({ product_id, category_id });
    }

    async findByIds(product_id, category_id) {
        return ProductCategory.findOne({ where: { product_id, category_id } });
    }

    async search(query = {}) {
        const where = {};
        if (query.product_id) where.product_id = query.product_id;
        if (query.category_id) where.category_id = query.category_id;
        return ProductCategory.findAll({ where, order: [['product_id', 'ASC'], ['category_id', 'ASC']] });
    }

    async delete(product_id, category_id) {
        const relation = await this.findByIds(product_id, category_id);
        if (!relation) throw createError('Relacionamento entre produto e categoria não encontrado.', 404);
        await relation.destroy();
        return true;
    }
}

module.exports = ProductCategoryService;
