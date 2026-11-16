const ProductCategory = require('../models/ProductCategoryModel')

class ProductCategoryService{
    
    // CREATE
    async create(data){
        const { enable, name, slug, use_in_menu, stock, 
                description, price, price_with_discount} = data;
        if (!name || !slug || !price || !price_with_discount) {
            throw new Error('All fields are required.');
        }

        const productExist = await ProductCategory.findOne({
            where:{
                name: name,
                slug: slug
            }
        });
        if (productExist) {
            throw new Error('This product is already registered.');
        }

        const newProductCategory = { 
            enable, 
            name, 
            slug, 
            use_in_menu, 
            stock, 
            description, 
            price, 
            price_with_discount
        };

        return await ProductCategory.create(newProductCategory);
    }
    // READ
    async findById(id){
        return await ProductCategory.findByPk(id);
    }

    async search() {
        return await ProductCategory.findAll();
    }
    // UPDATE
    async update(id, data){
        const update = await ProductCategory.update(data,{
            where: {id}
        })
        return update[0];
    }
    // DELETE
    async delete(id){
        return await ProductCategory.destroy({where: {id}})
    }
}

module.exports = ProductCategoryService;