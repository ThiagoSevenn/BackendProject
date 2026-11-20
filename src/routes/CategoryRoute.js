const express = require('express')

const auth = require('../middleware/authMiddleware');

const CategoryController = require('../controllers/CategoryController')
const categoryController = new CategoryController();

const router = express.Router();

router.get('/search', categoryController.search);
router.get('/:id', categoryController.findById);
router.post('/', auth, categoryController.create);
router.put('/:id', auth, categoryController.update);
router.delete('/:id', auth, categoryController.delete);


module.exports = router;