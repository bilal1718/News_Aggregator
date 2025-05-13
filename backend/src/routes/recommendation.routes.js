const express = require('express');
const router = express.Router();
const { getRecommendedArticles, getAIRecommendations } = require('../controllers/recommendation.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, getRecommendedArticles);

router.post('/ai', authMiddleware, getAIRecommendations);

module.exports = router;