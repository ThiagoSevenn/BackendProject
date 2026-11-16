const ProductImage = require('../models/ProductImageModel')

class ProductImageService{
    
    // CREATE
    async create(data){
        const { enable, name, slug, use_in_menu, stock, 
                description, price, price_with_discount} = data;
        if (!name || !slug || !price || !price_with_discount) {
            throw new Error('All fields are required.');
        }

        const productExist = await ProductImage.findOne({
            where:{
                name: name,
                slug: slug
            }
        });
        if (productExist) {
            throw new Error('This product is already registered.');
        }

        const newProductImage = { 
            enable, 
            name, 
            slug, 
            use_in_menu, 
            stock, 
            description, 
            price, 
            price_with_discount
        };

        return await ProductImage.create(newProductImage);
    }
    // READ
    async findById(id){
        return await ProductImage.findByPk(id);
    }

    async search() {
        return await ProductImage.findAll();
    }
    // UPDATE
    async update(id, data){
        const update = await ProductImage.update(data,{
            where: {id}
        })
        return update[0];
    }
    // DELETE
    async delete(id){
        return await ProductImage.destroy({where: {id}})
    }
}

module.exports = ProductImageService;