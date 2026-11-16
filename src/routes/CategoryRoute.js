const express = require('express')

const router = express.Router();

const CategoryController = require('../controllers/CategoryController')
const categoryController = new CategoryController();

// CREATE
router.post('/', (req,res) => {
    return categoryController.create(req,res);
});
// READ
router.get('/search', (req, res) => {
    return categoryController.search(req, res);
});

router.get('/:id',(req,res) => {
    return categoryController.findById(req,res);
});
// UPDATE
router.put('/:id', (req,res) => {
    return categoryController.update(req,res);
});
// DELETE
router.delete('/:id', (req,res) => {
    return categoryController.delete(req,res);
})

module.exports = router;