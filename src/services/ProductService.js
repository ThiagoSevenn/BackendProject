const Product = require('../models/ProductModel')

class ProductService{
    
    // CREATE
    async create(data){
        const { enable, name, slug, use_in_menu, stock, 
                description, price, price_with_discount} = data;
        if (!name || !slug || !price || !price_with_discount) {
            throw new Error('All fields are required.');
        }

        const productExist = await Product.findOne({
            where:{
                name: name,
                slug: slug
            }
        });
        if (productExist) {
            throw new Error('This product is already registered.');
        }

        const newProduct = { 
            enable, 
            name, 
            slug, 
            use_in_menu, 
            stock, 
            description, 
            price, 
            price_with_discount
        };

        return await Product.create(newProduct);
    }
    // READ
    async findById(id){
        return await Product.findByPk(id);
    }

    async search() {
        return await Product.findAll();
    }
    // UPDATE
    async update(id, data){
        const update = await Product.update(data,{
            where: {id}
        })
        return update[0];
    }
    // DELETE
    async delete(id){
        return await Product.destroy({where: {id}})
    }
}

module.exports = ProductService;