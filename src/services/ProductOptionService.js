const ProductOption = require('../models/ProductOptionModel')

class ProductOptionService{
    
    // CREATE
    async create(data){
        const { enable, name, slug, use_in_menu, stock, 
                description, price, price_with_discount} = data;
        if (!name || !slug || !price || !price_with_discount) {
            throw new Error('All fields are required.');
        }

        const productExist = await ProductOption.findOne({
            where:{
                name: name,
                slug: slug
            }
        });
        if (productExist) {
            throw new Error('This product is already registered.');
        }

        const newProductOption = { 
            enable, 
            name, 
            slug, 
            use_in_menu, 
            stock, 
            description, 
            price, 
            price_with_discount
        };

        return await ProductOption.create(newProductOption);
    }
    // READ
    async findById(id){
        return await ProductOption.findByPk(id);
    }

    async search() {
        return await ProductOption.findAll();
    }
    // UPDATE
    async update(id, data){
        const update = await ProductOption.update(data,{
            where: {id}
        })
        return update[0];
    }
    // DELETE
    async delete(id){
        return await ProductOption.destroy({where: {id}})
    }
}

module.exports = ProductOptionService;