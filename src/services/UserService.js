const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  { User }  = require('../models');

const createError = require('../utils/errors');

class UserService {
    async create(data) {
        const { firstname, surname, email, password, confirmPassword } = data;

        if (!firstname || !surname || !email || !password || !confirmPassword) {
            throw createError('Todos os campos são obrigatórios.');
        }
        if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
            throw createError('A senha deve ser um texto válido.');
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw createError('Informe um endereço de e-mail válido.');
        }
        if (password !== confirmPassword) {
            throw createError('A senha e a confirmação de senha são diferentes.');
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            throw createError('Este e-mail já está cadastrado.');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstname,
            surname,
            email,
            password: passwordHash
        });

        return this.removePassword(user);
    }

    async findById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        return user;
    }

    async update(id, data) {
        const user = await User.findByPk(id);
        if (!user) throw createError('Usuário não encontrado.', 404);

        const allowedFields = ['firstname', 'surname', 'email'];
        const updateData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) updateData[field] = data[field];
        }

        if (data.password !== undefined || data.confirmPassword !== undefined) {
            throw createError('A alteração de senha não faz parte deste endpoint.');
        }
        if (Object.keys(updateData).length === 0) {
            throw createError('Informe pelo menos um campo para atualizar.');
        }
        if (updateData.firstname !== undefined && !String(updateData.firstname).trim()) {
            throw createError('O primeiro nome é obrigatório.');
        }
        if (updateData.surname !== undefined && !String(updateData.surname).trim()) {
            throw createError('O sobrenome é obrigatório.');
        }
        if (updateData.email !== undefined) {
            if (!/^\S+@\S+\.\S+$/.test(updateData.email)) {
                throw createError('Informe um endereço de e-mail válido.');
            }
            const emailExists = await User.findOne({ where: { email: updateData.email } });
            if (emailExists && emailExists.id !== Number(id)) {
                throw createError('Este e-mail já está cadastrado.');
            }
        }

        await user.update(updateData);
        return true;
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if (!user) throw createError('Usuário não encontrado.', 404);
        await user.destroy();
        return true;
    }

    async login(data) {
        const { email, password } = data;
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            throw createError('E-mail e senha são obrigatórios e devem ser textos válidos.');
        }

        const user = await User.findOne({ where: { email } });
        if (!user) throw createError('E-mail ou senha inválidos.');

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) throw createError('E-mail ou senha inválidos.');

        if (!process.env.JWT_SECRET) {
            throw createError('A variável JWT_SECRET não foi configurada no servidor.', 500);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return { token };
    }

    removePassword(user) {
        const data = user.toJSON();
        delete data.password;
        return data;
    }
}

module.exports = UserService;
