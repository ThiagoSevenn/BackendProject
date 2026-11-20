const { Product, ProductOption } = require('../models');
const createError = require('../utils/errors');

function normalizeValues(values) {
    if (Array.isArray(values)) return values.map(value => String(value).trim()).filter(Boolean).join(',');
    if (typeof values === 'string') return values.trim();
    return '';
}

class ProductOptionService {
    async create(data) {
        const { product_id, title, shape = 'square', radius = 0, type = 'text' } = data;
        const values = normalizeValues(data.values !== undefined ? data.values : data.value);
        if (!product_id || !title || !values) {
            throw createError('product_id, title e values são obrigatórios.');
        }
        if (!['square', 'circle'].includes(shape)) throw createError('shape deve ser square ou circle.');
        if (!['text', 'color'].includes(type)) throw createError('type deve ser text ou color.');

        const product = await Product.findByPk(product_id);
        if (!product) throw createError('Produto não encontrado.', 404);
        const radiusText = String(radius);
        if (!/^\d+(?:px)?$/.test(radiusText)) throw createError('radius deve ser um número inteiro maior ou igual a zero.');
        const radiusValue = Number.parseInt(radiusText, 10);

        return ProductOption.create({ product_id, title, shape, radius: radiusValue, type, values });
    }

    async findById(id) {
        return ProductOption.findByPk(id);
    }

    async search(query = {}) {
        const where = {};
        if (query.product_id) where.product_id = query.product_id;
        return ProductOption.findAll({ where, order: [['id', 'ASC']] });
    }

    async update(id, data) {
        const option = await ProductOption.findByPk(id);
        if (!option) throw createError('Opção não encontrada.', 404);
        const updateData = {};

        for (const field of ['title', 'shape', 'type']) {
            if (data[field] !== undefined) updateData[field] = data[field];
        }
        if (data.radius !== undefined) {
            const radiusText = String(data.radius);
            if (!/^\d+(?:px)?$/.test(radiusText)) throw createError('radius deve ser um número inteiro maior ou igual a zero.');
            updateData.radius = Number.parseInt(radiusText, 10);
        }
        if (data.values !== undefined || data.value !== undefined) {
            updateData.values = normalizeValues(data.values !== undefined ? data.values : data.value);
            if (!updateData.values) throw createError('values não pode ficar vazio.');
        }
        if (updateData.shape && !['square', 'circle'].includes(updateData.shape)) throw createError('shape deve ser square ou circle.');
        if (updateData.type && !['text', 'color'].includes(updateData.type)) throw createError('type deve ser text ou color.');
        if (!Object.keys(updateData).length) throw createError('Informe os campos que deseja atualizar.');

        await option.update(updateData);
        return option;
    }

    async delete(id) {
        const option = await ProductOption.findByPk(id);
        if (!option) throw createError('Opção não encontrada.', 404);
        await option.destroy();
        return true;
    }
}

module.exports = ProductOptionService;
