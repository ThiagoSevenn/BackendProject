const express = require('express')

const auth = require('../middleware/authMiddleware');

const ProductController = require('../controllers/ProductController')
const productController = new ProductController();

const router = express.Router();

router.get('/search', productController.search);
router.get('/:id', productController.findById);
router.post('/', auth, productController.create);
router.put('/:id', auth, productController.update);
router.delete('/:id', auth, productController.delete);


module.exports = router;