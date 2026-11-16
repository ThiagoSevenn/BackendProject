const express = require('express')

const router = express.Router();

const UserController = require('../controllers/UserController')
const userController = new UserController();

// CREATE
router.post('/', (req,res) => {
    return userController.create(req,res);
});
// READ
router.get('/', (req, res) => {
    return userController.findAll(req, res);
});

router.get('/:id',(req,res) => {
    return userController.findById(req,res);
});
// UPDATE
router.put('/:id', (req,res) => {
    return userController.update(req,res);
});
// DELETE
router.delete('/:id', (req,res) => {
    return userController.delete(req,res);
})

module.exports = router;