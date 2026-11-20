const { Op } = require('sequelize');
const { Category } = require('../models');
const createError = require('../utils/errors');

class CategoryService {
    async create(data) {
        const { name, slug, use_in_menu = false } = data;
        if (!name || !slug) throw createError('Nome e slug são obrigatórios.');
        if (typeof use_in_menu !== 'boolean' && use_in_menu !== 0 && use_in_menu !== 1) {
            throw createError('O campo use_in_menu deve ser booleano.');
        }

        const categoryExists = await Category.findOne({
            where: { [Op.or]: [{ name }, { slug }] }
        });
        if (categoryExists) throw createError('Esta categoria já está cadastrada.');

        return Category.create({ name, slug, use_in_menu });
    }

    async findById(id) {
        return Category.findByPk(id);
    }

    async search(query = {}) {
        const limit = query.limit === undefined ? 12 : Number(query.limit);
        const page = query.page === undefined ? 1 : Number(query.page);

        if (!Number.isInteger(limit) || limit === 0 || limit < -1) {
            throw createError('O parâmetro limit deve ser -1 ou um número inteiro positivo.');
        }
        if (!Number.isInteger(page) || page < 1) {
            throw createError('O parâmetro page deve ser um número inteiro maior que zero.');
        }

        const where = {};
        if (query.use_in_menu !== undefined) {
            if (!['true', 'false', '1', '0'].includes(String(query.use_in_menu).toLowerCase())) {
                throw createError('O parâmetro use_in_menu deve ser true ou false.');
            }
            where.use_in_menu = ['true', '1'].includes(String(query.use_in_menu).toLowerCase());
        }

        const allowedFields = ['id', 'name', 'slug', 'use_in_menu'];
        let attributes;
        if (query.fields !== undefined) {
            attributes = String(query.fields).split(',').map(field => field.trim()).filter(Boolean);
            if (!attributes.length || attributes.some(field => !allowedFields.includes(field))) {
                throw createError('Um ou mais campos informados em fields são inválidos.');
            }
        }

        const total = await Category.count({ where });
        const findOptions = { where, order: [['id', 'ASC']] };
        if (attributes) findOptions.attributes = attributes;
        if (limit !== -1) {
            findOptions.limit = limit;
            findOptions.offset = (page - 1) * limit;
        }

        const data = await Category.findAll(findOptions);
        return { data, total, limit, page: limit === -1 ? 1 : page };
    }

    async update(id, data) {
        const category = await Category.findByPk(id);
        if (!category) throw createError('Categoria não encontrada.', 404);

        const updateData = {};
        for (const field of ['name', 'slug', 'use_in_menu']) {
            if (data[field] !== undefined) updateData[field] = data[field];
        }
        if (!Object.keys(updateData).length) throw createError('Informe os campos que deseja atualizar.');
        if (updateData.name !== undefined && !String(updateData.name).trim()) {
            throw createError('O nome da categoria é obrigatório.');
        }
        if (updateData.slug !== undefined && !String(updateData.slug).trim()) {
            throw createError('O slug da categoria é obrigatório.');
        }
        if (updateData.use_in_menu !== undefined && ![true, false, 0, 1].includes(updateData.use_in_menu)) {
            throw createError('O campo use_in_menu deve ser booleano.');
        }

        if (updateData.name || updateData.slug) {
            const duplicateConditions = [];
            if (updateData.name) duplicateConditions.push({ name: updateData.name });
            if (updateData.slug) duplicateConditions.push({ slug: updateData.slug });
            const duplicate = await Category.findOne({
                where: { [Op.or]: duplicateConditions, id: { [Op.ne]: id } }
            });
            if (duplicate) throw createError('Já existe uma categoria com esse nome ou slug.');
        }

        await category.update(updateData);
        return true;
    }

    async delete(id) {
        const category = await Category.findByPk(id);
        if (!category) throw createError('Categoria não encontrada.', 404);
        await category.destroy();
        return true;
    }
}

module.exports = CategoryService;
