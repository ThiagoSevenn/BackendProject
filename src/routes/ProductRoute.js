const express = require('express')

const router = express.Router();

const ProductController = require('../controllers/ProductController')
const productController = new ProductController();

// CREATE
router.post('/', (req,res) => {
    return productController.create(req,res);
});
// READ
router.get('/search', (req, res) => {
    return productController.search(req, res);
});

router.get('/:id',(req,res) => {
    return productController.findById(req,res);
});
// UPDATE
router.put('/:id', (req,res) => {
    return productController.update(req,res);
});
// DELETE
router.delete('/:id', (req,res) => {
    return productController.delete(req,res);
})

module.exports = router;