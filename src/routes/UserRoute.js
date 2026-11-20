const express = require('express')

const auth = require('../middleware/authMiddleware');

const UserController = require('../controllers/UserController')
const userController = new UserController();

const router = express.Router();

// Cadastro e login são públicos para permitir o primeiro acesso.
router.post('/token', userController.token);
router.post('/', userController.create);
router.get('/:id', userController.findById);
router.put('/:id', auth, userController.update);
router.delete('/:id', auth, userController.delete);

module.exports = router;