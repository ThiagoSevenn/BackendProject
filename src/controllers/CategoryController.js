const CategoryService = require('../services/CategoryService');
const createError = require('../utils/errors');

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
        this.create = this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.search = this.search.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res, next) {
        try { return res.status(201).json(await this.categoryService.create(req.body)); }
        catch (error) { return next(error); }
    }

    async findById(req, res, next) {
        try {
            const category = await this.categoryService.findById(req.params.id);
            if (!category) throw createError('Categoria não encontrada.', 404);
            return res.status(200).json(category);
        } catch (error) { return next(error); }
    }

    async search(req, res, next) {
        try { return res.status(200).json(await this.categoryService.search(req.query)); }
        catch (error) { return next(error); }
    }

    async update(req, res, next) {
        try {
            await this.categoryService.update(req.params.id, req.body);
            return res.status(204).end();
        } catch (error) { return next(error); }
    }

    async delete(req, res, next) {
        try {
            await this.categoryService.delete(req.params.id);
            return res.status(204).end();
        } catch (error) { return next(error); }
    }
}

module.exports = CategoryController;
