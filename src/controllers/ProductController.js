const ProductService = require('../services/ProductService');
const createError = require('../utils/errors');

class ProductController {
    constructor() {
        this.productService = new ProductService();
        this.create = this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.search = this.search.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res, next) {
        try { return res.status(201).json(await this.productService.create(req.body)); }
        catch (error) { return next(error); }
    }

    async findById(req, res, next) {
        try {
            const product = await this.productService.findById(req.params.id);
            if (!product) throw createError('Produto não encontrado.', 404);
            return res.status(200).json(product);
        } catch (error) { return next(error); }
    }

    async search(req, res, next) {
        try { return res.status(200).json(await this.productService.search(req.query)); }
        catch (error) { return next(error); }
    }

    async update(req, res, next) {
        try {
            await this.productService.update(req.params.id, req.body);
            return res.status(204).end();
        } catch (error) { return next(error); }
    }

    async delete(req, res, next) {
        try {
            await this.productService.delete(req.params.id);
            return res.status(204).end();
        } catch (error) { return next(error); }
    }
}

module.exports = ProductController;
