const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
    Product,
    Category,
    ProductCategory,
    ProductImage,
    ProductOption
} = require('../models');
const createError = require('../utils/errors');
const { saveImage, removeImageFile, getPublicPath } = require('../utils/productFiles');

const PRODUCT_FIELDS = [
    'id', 'enabled', 'name', 'slug', 'use_in_menu', 'stock',
    'description', 'price', 'price_with_discount',
    'category_ids', 'images', 'options'
];

function parseIdList(value, fieldName) {
    if (value === undefined) return undefined;
    const values = Array.isArray(value) ? value : String(value).split(',');
    const ids = values.map(item => Number(item));
    if (ids.some(id => !Number.isInteger(id) || id <= 0)) {
        throw createError(`O parâmetro ${fieldName} contém um ID inválido.`);
    }
    return [...new Set(ids)];
}

function normalizeOptionValues(values) {
    if (Array.isArray(values)) return values.map(value => String(value).trim()).filter(Boolean).join(',');
    if (typeof values === 'string') return values.trim();
    return '';
}

function normalizeRadius(radius) {
    if (radius === undefined || radius === null || radius === '') return 0;
    // O exemplo do requisito envia "4px", mas a coluna no banco é INTEGER.
    const radiusText = String(radius);
    if (!/^\d+(?:px)?$/.test(radiusText)) {
        throw createError('radius deve ser um número inteiro maior ou igual a zero.');
    }
    const parsed = Number.parseInt(radiusText, 10);
    if (!Number.isInteger(parsed) || parsed < 0) throw createError('radius deve ser um número inteiro maior ou igual a zero.');
    return parsed;
}

function validateOption(data, current = {}) {
    const option = { ...current, ...data };
    const values = normalizeOptionValues(
        data.values !== undefined ? data.values :
            data.value !== undefined ? data.value : current.values
    );

    if (!option.title || !values) throw createError('Cada opção deve possuir title e values.');
    const shape = option.shape || 'square';
    const type = option.type || 'text';
    if (!['square', 'circle'].includes(shape)) throw createError('shape deve ser square ou circle.');
    if (!['text', 'color'].includes(type)) throw createError('type deve ser text ou color.');

    return {
        title: option.title,
        shape,
        radius: normalizeRadius(option.radius),
        type,
        values
    };
}

function validateProductData(data, current = {}) {
    const product = { ...current, ...data };
    if (!product.name || !String(product.name).trim()) throw createError('O nome do produto é obrigatório.');
    if (!product.slug || !String(product.slug).trim()) throw createError('O slug do produto é obrigatório.');

    for (const field of ['price', 'price_with_discount']) {
        const value = Number(product[field]);
        if (product[field] === undefined || product[field] === null || product[field] === '' || !Number.isFinite(value) || value < 0) {
            throw createError(`O campo ${field} deve ser um número maior ou igual a zero.`);
        }
        product[field] = value;
    }

    if (product.stock !== undefined && product.stock !== null) {
        const stock = Number(product.stock);
        if (!Number.isInteger(stock) || stock < 0) throw createError('stock deve ser um número inteiro maior ou igual a zero.');
        product.stock = stock;
    }
    for (const field of ['enabled', 'use_in_menu']) {
        if (product[field] !== undefined && product[field] !== null && ![true, false, 0, 1].includes(product[field])) {
            throw createError(`${field} deve ser booleano.`);
        }
    }

    return {
        enabled: product.enabled,
        name: product.name,
        slug: product.slug,
        use_in_menu: product.use_in_menu,
        stock: product.stock,
        description: product.description,
        price: product.price,
        price_with_discount: product.price_with_discount
    };
}

function parseOptionFilters(query) {
    const filters = {};
    if (query.option && typeof query.option === 'object') {
        Object.assign(filters, query.option);
    }
    for (const [key, value] of Object.entries(query)) {
        const match = key.match(/^option\[(\d+)\]$/);
        if (match) filters[match[1]] = value;
    }
    return Object.entries(filters);
}

class ProductService {
    async checkDuplicate(name, slug, ignoredId = null) {
        const conditions = [{ name }, { slug }];
        const where = { [Op.or]: conditions };
        if (ignoredId !== null) where.id = { [Op.ne]: ignoredId };
        const exists = await Product.findOne({ where });
        if (exists) throw createError('Já existe um produto com esse nome ou slug.');
    }

    async validateCategories(categoryIds) {
        if (categoryIds === undefined) return;
        if (!Array.isArray(categoryIds)) throw createError('category_ids deve ser uma lista de IDs.');
        const uniqueIds = [...new Set(categoryIds)];
        if (uniqueIds.length !== categoryIds.length) throw createError('category_ids não deve possuir IDs repetidos.');
        if (!uniqueIds.length) return;
        const categories = await Category.findAll({ where: { id: { [Op.in]: uniqueIds } } });
        if (categories.length !== uniqueIds.length) throw createError('Uma ou mais categorias informadas não existem.');
    }

    async saveProductImages(productId, images, transaction, createdFiles) {
        if (!Array.isArray(images)) throw createError('images deve ser uma lista.');
        for (const image of images) {
            if (image.id) throw createError('Não informe id de imagem na criação de um produto.');
            const savedImage = await saveImage(image);
            if (savedImage.createdFile) createdFiles.push(savedImage.fullPath);
            await ProductImage.create({
                product_id: productId,
                path: savedImage.path,
                enabled: image.enabled === undefined ? false : image.enabled
            }, { transaction });
        }
    }

    async saveProductOptions(productId, options, transaction) {
        if (!Array.isArray(options)) throw createError('options deve ser uma lista.');
        for (const optionData of options) {
            if (optionData.id) throw createError('Não informe id de opção na criação de um produto.');
            const option = validateOption(optionData);
            await ProductOption.create({ product_id: productId, ...option }, { transaction });
        }
    }

    async create(data) {
        const validatedData = validateProductData(data);
        const productData = Object.fromEntries(
            Object.entries(validatedData).filter(([, value]) => value !== undefined)
        );
        await this.checkDuplicate(productData.name, productData.slug);

        const categoryIds = parseIdList(data.category_ids, 'category_ids') || [];
        await this.validateCategories(categoryIds);
        const createdFiles = [];

        try {
            const product = await sequelize.transaction(async transaction => {
                const newProduct = await Product.create(productData, { transaction });

                if (categoryIds.length) {
                    await ProductCategory.bulkCreate(
                        categoryIds.map(category_id => ({ product_id: newProduct.id, category_id })),
                        { transaction }
                    );
                }
                if (data.images !== undefined) {
                    await this.saveProductImages(newProduct.id, data.images, transaction, createdFiles);
                }
                if (data.options !== undefined) {
                    await this.saveProductOptions(newProduct.id, data.options, transaction);
                }
                return newProduct;
            });

            return this.findById(product.id);
        } catch (error) {
            await Promise.all(createdFiles.map(file => require('fs').promises.unlink(file).catch(() => {})));
            throw error;
        }
    }

    async findById(id) {
        const product = await Product.findByPk(id, {
            include: [
                { model: ProductImage, as: 'images' },
                { model: ProductOption, as: 'options' }
            ]
        });
        if (!product) return null;

        const relations = await ProductCategory.findAll({
            where: { product_id: product.id },
            attributes: ['category_id']
        });
        return this.formatProduct(product, relations.map(item => item.category_id));
    }

    formatProduct(product, categoryIds, fields) {
        const plain = product.get({ plain: true });
        const result = {
            id: plain.id,
            enabled: plain.enabled,
            name: plain.name,
            slug: plain.slug,
            use_in_menu: plain.use_in_menu,
            stock: plain.stock,
            description: plain.description,
            price: plain.price,
            price_with_discount: plain.price_with_discount,
            category_ids: categoryIds,
            images: (plain.images || []).map(image => ({
                id: image.id,
                content: getPublicPath(image.path)
            })),
            options: (plain.options || []).map(option => ({
                id: option.id,
                title: option.title,
                shape: option.shape,
                radius: option.radius,
                type: option.type,
                values: option.values.split(',').map(value => value.trim())
            }))
        };

        if (!fields) return result;
        const selected = {};
        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(result, field)) selected[field] = result[field];
        }
        return selected;
    }

    async search(query = {}) {
        const limit = query.limit === undefined ? 12 : Number(query.limit);
        const page = query.page === undefined ? 1 : Number(query.page);
        if (!Number.isInteger(limit) || limit === 0 || limit < -1) {
            throw createError('O parâmetro limit deve ser -1 ou um número inteiro positivo.');
        }
        if (!Number.isInteger(page) || page < 1) throw createError('O parâmetro page deve ser maior que zero.');

        let fields;
        if (query.fields !== undefined) {
            fields = String(query.fields).split(',').map(field => field.trim()).filter(Boolean);
            if (!fields.length || fields.some(field => !PRODUCT_FIELDS.includes(field))) {
                throw createError('Um ou mais campos informados em fields são inválidos.');
            }
        }

        const where = {};
        if (query.match !== undefined) {
            const match = String(query.match).trim();
            if (!match) throw createError('O parâmetro match não pode ficar vazio.');
            where[Op.or] = [
                { name: { [Op.like]: `%${match}%` } },
                { description: { [Op.like]: `%${match}%` } }
            ];
        }

        const priceRange = query['price-range'] !== undefined ? query['price-range'] : query.price_range;
        if (priceRange !== undefined) {
            const match = String(priceRange).match(/^\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*$/);
            if (!match) throw createError('price-range deve seguir o formato valor-inicial-valor-final, por exemplo 100-200.');
            const minimum = Number(match[1]);
            const maximum = Number(match[2]);
            if (minimum > maximum) throw createError('O valor inicial de price-range não pode ser maior que o valor final.');
            where.price = { [Op.between]: [minimum, maximum] };
        }

        // Os filtros por categoria e opção precisam ser combinados: o produto
        // deve atender a todos os filtros enviados na mesma pesquisa.
        let filteredProductIds = null;
        const categoryIds = parseIdList(query.category_ids, 'category_ids');
        if (categoryIds !== undefined) {
            if (!categoryIds.length) throw createError('Informe pelo menos um ID em category_ids.');
            const relations = await ProductCategory.findAll({
                where: { category_id: { [Op.in]: categoryIds } },
                attributes: ['product_id']
            });
            filteredProductIds = new Set(relations.map(item => Number(item.product_id)));
        }

        const optionFilters = parseOptionFilters(query);
        for (const [optionId, rawValues] of optionFilters) {
            if (!/^\d+$/.test(optionId)) throw createError('O ID informado no filtro option é inválido.');
            const requestedValues = String(rawValues).split(',').map(value => value.trim()).filter(Boolean);
            if (!requestedValues.length) throw createError(`Informe valores para a opção ${optionId}.`);
            const option = await ProductOption.findByPk(optionId);
            const availableValues = option ? option.values.split(',').map(value => value.trim()) : [];
            const optionMatches = option && requestedValues.some(value => availableValues.includes(value));

            if (!optionMatches) {
                filteredProductIds = new Set();
            } else if (filteredProductIds === null) {
                filteredProductIds = new Set([Number(option.product_id)]);
            } else {
                filteredProductIds = new Set(
                    [...filteredProductIds].filter(id => id === Number(option.product_id))
                );
            }
        }

        if (filteredProductIds !== null) {
            const productIds = [...filteredProductIds];
            where.id = { [Op.in]: productIds.length ? productIds : [-1] };
        }

        const total = await Product.count({ where });
        const include = [];
        if (!fields || fields.includes('images')) include.push({ model: ProductImage, as: 'images' });
        if (!fields || fields.includes('options')) include.push({ model: ProductOption, as: 'options' });

        const findOptions = {
            where,
            order: [['id', 'ASC']],
            distinct: true
        };
        if (include.length) findOptions.include = include;
        if (limit !== -1) {
            findOptions.limit = limit;
            findOptions.offset = (page - 1) * limit;
        }
        const products = await Product.findAll(findOptions);

        const ids = products.map(product => product.id);
        const relations = ids.length ? await ProductCategory.findAll({
            where: { product_id: { [Op.in]: ids } },
            attributes: ['product_id', 'category_id']
        }) : [];
        const categoriesByProduct = new Map();
        for (const relation of relations) {
            if (!categoriesByProduct.has(relation.product_id)) categoriesByProduct.set(relation.product_id, []);
            categoriesByProduct.get(relation.product_id).push(relation.category_id);
        }

        const data = products.map(product => this.formatProduct(
            product,
            categoriesByProduct.get(product.id) || [],
            fields
        ));

        return { data, total, limit, page: limit === -1 ? 1 : page };
    }

    async updateImages(productId, images, transaction, createdFiles, filesToDelete) {
        if (!Array.isArray(images)) throw createError('images deve ser uma lista.');

        for (const imageData of images) {
            if (imageData.id) {
                const image = await ProductImage.findOne({
                    where: { id: imageData.id, product_id: productId },
                    transaction
                });
                if (!image) throw createError(`A imagem ${imageData.id} não pertence a este produto.`, 404);

                if (imageData.deleted === true) {
                    filesToDelete.push(image.path);
                    await image.destroy({ transaction });
                    continue;
                }

                const updateData = {};
                if (imageData.content !== undefined) {
                    const savedImage = await saveImage(imageData);
                    if (savedImage.createdFile) createdFiles.push(savedImage.fullPath);
                    updateData.path = savedImage.path;
                    filesToDelete.push(image.path);
                }
                if (imageData.enabled !== undefined) updateData.enabled = imageData.enabled;
                if (Object.keys(updateData).length) await image.update(updateData, { transaction });
            } else {
                if (imageData.deleted === true) throw createError('Não é possível excluir uma imagem sem informar seu id.');
                const savedImage = await saveImage(imageData);
                if (savedImage.createdFile) createdFiles.push(savedImage.fullPath);
                await ProductImage.create({
                    product_id: productId,
                    path: savedImage.path,
                    enabled: imageData.enabled === undefined ? false : imageData.enabled
                }, { transaction });
            }
        }
    }

    async updateOptions(productId, options, transaction) {
        if (!Array.isArray(options)) throw createError('options deve ser uma lista.');

        for (const optionData of options) {
            if (optionData.id) {
                const option = await ProductOption.findOne({
                    where: { id: optionData.id, product_id: productId },
                    transaction
                });
                if (!option) throw createError(`A opção ${optionData.id} não pertence a este produto.`, 404);
                if (optionData.deleted === true) {
                    await option.destroy({ transaction });
                    continue;
                }
                const updateData = validateOption(optionData, option.get({ plain: true }));
                await option.update(updateData, { transaction });
            } else {
                if (optionData.deleted === true) throw createError('Não é possível excluir uma opção sem informar seu id.');
                const option = validateOption(optionData);
                await ProductOption.create({ product_id: productId, ...option }, { transaction });
            }
        }
    }

    async update(id, data) {
        const createdFiles = [];
        const filesToDelete = [];

        try {
            await sequelize.transaction(async transaction => {
                const product = await Product.findByPk(id, { transaction });
                if (!product) throw createError('Produto não encontrado.', 404);

                const allowedFields = ['enabled', 'name', 'slug', 'use_in_menu', 'stock', 'description', 'price', 'price_with_discount'];
                const productInput = {};
                for (const field of allowedFields) {
                    if (data[field] !== undefined) productInput[field] = data[field];
                }
                const updatedProduct = validateProductData(productInput, product.get({ plain: true }));
                await this.checkDuplicate(updatedProduct.name, updatedProduct.slug, Number(id));
                await product.update(updatedProduct, { transaction });

                if (data.category_ids !== undefined) {
                    const categoryIds = parseIdList(data.category_ids, 'category_ids');
                    await this.validateCategories(categoryIds);
                    await ProductCategory.destroy({ where: { product_id: id }, transaction });
                    if (categoryIds.length) {
                        await ProductCategory.bulkCreate(
                            categoryIds.map(category_id => ({ product_id: id, category_id })),
                            { transaction }
                        );
                    }
                }
                if (data.images !== undefined) {
                    await this.updateImages(id, data.images, transaction, createdFiles, filesToDelete);
                }
                if (data.options !== undefined) {
                    await this.updateOptions(id, data.options, transaction);
                }
            });

            await Promise.all(filesToDelete.map(imagePath => removeImageFile(imagePath)));
            return true;
        } catch (error) {
            await Promise.all(createdFiles.map(file => require('fs').promises.unlink(file).catch(() => {})));
            throw error;
        }
    }

    async delete(id) {
        const imagePaths = [];
        await sequelize.transaction(async transaction => {
            const product = await Product.findByPk(id, {
                include: [{ model: ProductImage, as: 'images' }],
                transaction
            });
            if (!product) throw createError('Produto não encontrado.', 404);

            imagePaths.push(...(product.images || []).map(image => image.path));
            await ProductImage.destroy({ where: { product_id: id }, transaction });
            await ProductOption.destroy({ where: { product_id: id }, transaction });
            await ProductCategory.destroy({ where: { product_id: id }, transaction });
            await product.destroy({ transaction });
        });

        await Promise.all(imagePaths.map(imagePath => removeImageFile(imagePath)));
        return true;
    }
}

module.exports = ProductService;
