const express = require('express')
const router = express.Router()
const {getairesponse} = require('../controllers/ai.controller')

router.post('/', getairesponse)

module.exports = router;