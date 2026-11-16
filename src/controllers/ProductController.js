const ProductService = require('../services/ProductService')
const ProductImageService = require('../services/ProductImageService')
const ProductOptionService = require('../services/ProductOptionService')
const ProductCategoryService = require('../services/ProductCategoryService')

class ProductController{
    constructor(){
        this.productService = new ProductService();
        
        // Serão criadas funções específicas dentro desse controller para se responsabilizar dos registros correlacionados.
        // Service para ao efetuar o cadastro do produto, adicionar na tabela product_image o registro.
        this.productImageService = new ProductImageService();
        // Service para ao efetuar o cadastro do produto, adicionar na tabela product_option o registro.
        this.productOptionService = new ProductOptionService();
        // Service para ao efetuar o cadastro do produto, adicionar na tabela product_category o registro.
        this.productCategoryService = new ProductCategoryService();
    }

    // CREATE
    async create(req,res){
        try {
            const product = await this.productService.create(req.body);
            return res.status(201).json({
                message: 'Product created successfully!',
                product: product
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
            const product = await this.productService.findById(id);
            if(!product){
                throw new Error("Product not founded");
            }
            return res.status(200).json({
                product: product
            })
        } catch (error) {
            return res.status(404).json({
                message: error.message
            })
        }
    }

    async search(req, res) {
        try {
            const products = await this.productService.search();
            return res.status(200).json({
                products
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
            const updated = await this.productService.update(id, req.body);
            if (updated === 0) {
                throw new Error("Failed to update product.");
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
            const deleted = await this.productService.delete(id);
            if (deleted === 0) {
                throw new Error("Product not founded.");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({
                message: error.message
            });
        }
    }
}

module.exports = ProductController;