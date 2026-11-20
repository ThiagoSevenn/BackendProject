const UserService = require('../services/UserService');
const createError = require('../utils/errors');

class UserController {
    constructor() {
        this.userService = new UserService();
        this.token = this.token.bind(this);
        this.create = this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async token(req, res, next) {
        try { return res.status(200).json(await this.userService.login(req.body)); }
        catch (error) { return next(error); }
    }

    async create(req, res, next) {
        try { return res.status(201).json(await this.userService.create(req.body)); }
        catch (error) { return next(error); }
    }

    async findById(req, res, next) {
        try {
            const user = await this.userService.findById(req.params.id);
            if (!user) throw createError('Usuário não encontrado.', 404);
            return res.status(200).json(user);
        } catch (error) { return next(error); }
    }

    async update(req, res, next) {
        try {
            await this.userService.update(req.params.id, req.body);
            return res.status(204).end();
        } catch (error) { return next(error); }
    }

    async delete(req, res, next) {
        try {
            await this.userService.delete(req.params.id);
            return res.status(204).end();
        } catch (error) { return next(error); }
    }
}

module.exports = UserController;
