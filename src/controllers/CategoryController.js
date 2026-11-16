const CategoryService = require('../services/CategoryService')

class CategoryController{
    constructor(){
        this.categoryService = new CategoryService();
    }

    // CREATE
    async create(req,res){
        try {
            const category = await this.categoryService.create(req.body);
            return res.status(201).json({
                message: 'Category created successfully!',
                category: category
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
            const category = await this.categoryService.findById(id);
            if(!category){
                throw new Error("Category not founded");
            }
            return res.status(200).json({
                category: category
            })
        } catch (error) {
            return res.status(404).json({
                message: error.message
            })
        }
    }

    async search(req, res) {
        try {
            const categories = await this.categoryService.search();
            console.log(categories)
            return res.status(200).json({
                categories
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
            const updated = await this.categoryService.update(id, req.body);
            if (updated === 0) {
                throw new Error("Failed to update category.");
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
            const deleted = await this.categoryService.delete(id);
            if (deleted === 0) {
                throw new Error("Category not founded.");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({
                message: error.message
            });
        }
    }
}

module.exports = CategoryController;