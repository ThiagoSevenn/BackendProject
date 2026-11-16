const express = require('express')
const router = express.Router();

const userRoute = require('../routes/UserRoute')
const categoryRoute = require('../routes/CategoryRoute')
const productRoute = require('../routes/ProductRoute')

router.use('/users', userRoute)
router.use('/category', categoryRoute)
router.use('/product', productRoute)

module.exports = router;