const { Product, ProductImage } = require('../models');
const createError = require('../utils/errors');
const { removeImageFile } = require('../utils/productFiles');

class ProductImageService {
    async create(data) {
        const { product_id, path, enabled = false } = data;
        if (!product_id || !path) throw createError('product_id e path são obrigatórios.');
        const product = await Product.findByPk(product_id);
        if (!product) throw createError('Produto não encontrado.', 404);
        return ProductImage.create({ product_id, path, enabled });
    }

    async findById(id) {
        return ProductImage.findByPk(id);
    }

    async search(query = {}) {
        const where = {};
        if (query.product_id) where.product_id = query.product_id;
        return ProductImage.findAll({ where, order: [['id', 'ASC']] });
    }

    async update(id, data) {
        const image = await ProductImage.findByPk(id);
        if (!image) throw createError('Imagem não encontrada.', 404);
        const updateData = {};
        if (data.path !== undefined) updateData.path = data.path;
        if (data.enabled !== undefined) updateData.enabled = data.enabled;
        if (!Object.keys(updateData).length) throw createError('Informe os campos que deseja atualizar.');
        const oldPath = image.path;
        await image.update(updateData);
        if (updateData.path && updateData.path !== oldPath) await removeImageFile(oldPath);
        return image;
    }

    async delete(id) {
        const image = await ProductImage.findByPk(id);
        if (!image) throw createError('Imagem não encontrada.', 404);
        const oldPath = image.path;
        await image.destroy();
        await removeImageFile(oldPath);
        return true;
    }
}

module.exports = ProductImageService;
