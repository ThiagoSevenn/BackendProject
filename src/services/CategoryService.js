const Category = require('../models/CategoryModel')

class CategoryService{
    
    // CREATE
    async create(data){
        const { name, slug, use_in_menu } = data;
        if (!name || !slug ) {
            throw new Error('All fields are required.');
        }

        const categoryExists = await Category.findOne({
            where:{
                name: name
            }
        });
        if (categoryExists) {
            throw new Error('This category is already registered.');
        }

        const newCategory = {
            name,
            slug,
            use_in_menu
        };

        return await Category.create(newCategory);
    }
    // READ
    async findById(id){
        return await Category.findByPk(id);
    }

    async search() {
        return await Category.findAll();
    }
    // UPDATE
    async update(id, data){
        const update = await Category.update(data,{
            where: {id}
        })
        return update[0];
    }
    // DELETE
    async delete(id){
        return await Category.destroy({where: {id}})
    }
}

module.exports = CategoryService;