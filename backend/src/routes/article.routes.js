const express = require('express');
const router = express.Router();
const { fetchNews, getArticles, getArticlesByCategory } = require('../controllers/article.controller');

router.get('/fetch', fetchNews);
router.get('/', getArticles);
router.get('/:category', getArticlesByCategory); 

module.exports = router;