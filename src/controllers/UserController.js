const UserSevice = require('../services/UserService')

class UserController{
    constructor(){
        this.userService = new UserSevice();
    }

    // CREATE
    async create(req,res){
        try {
            const user = await this.userService.create(req.body);
            return res.status(201).json({
                message: 'User created successfully!',
                user: user
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }
    // READ
    async findById(req,res){
        try {
            const id = req.params.id;
            const user = await this.userService.findById(id);
            if(!user){
                throw new Error("User not founded");
            }
            return res.status(200).json({
                user: user
            })
        } catch (error) {
            return res.status(404).json({
                message: error.message
            })
        }
    }

    async findAll(req, res) {
        try {
            const users = await this.userService.findAll();
            return res.status(200).json({
                users
            });
        } catch (error) {
            return res.status(404).json({
                message: error.message
            });
        }
    }
    // UPDATE
    async update(req,res) {
        try {
            const id = req.params.id;
            const updated = await this.userService.update(id, req.body);
            if (updated === 0) {
                throw new Error("Failed to update user.");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({
                message: error.message
            })
        }
    }
    // DELETE
    async delete(req,res){
        try {
            const id = req.params.id;
            const deleted = await this.userService.delete(id);
            if (deleted === 0) {
                throw new Error("User not founded.");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({
                message: error.message
            });
        }
    }
}

module.exports = UserController;