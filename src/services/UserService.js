const User = require('../models/UserModel')

class UserService{
    
    // CREATE
    async create(data){
        const { firstname, surname, email, password } = data;
        if (!firstname || !email || !surname || !password) {
            throw new Error('All fields are required.');
        }

        const userExists = await User.findOne({
            where:{
                email: email
            }
        });
        if (userExists) {
            throw new Error('This email is already registered.');
        }

        const newUser = {
            firstname,
            surname,
            email,
            password
        };

        return await User.create(newUser);
    }
    // READ
    async findById(id){
        return await User.findByPk(id);
    }

    async findAll() {
        return await User.findAll();
    }
    // UPDATE
    async update(id, data){
        const update = await User.update(data,{
            where: {id}
        })
        return update[0];
    }
    // DELETE
    async delete(id){
        return await User.destroy({where: {id}})
    }
}

module.exports = UserService;