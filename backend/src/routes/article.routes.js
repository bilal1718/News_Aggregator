const express = require('express');
const router = express.Router();
const { fetchNews, getArticles, getArticlesByCategory, getArticleById } = require('../controllers/article.controller');

router.get('/fetch', fetchNews);
router.get('/', getArticles);
router.get('/:category', getArticlesByCategory); 
router.get('/id/:id', getArticleById);


module.exports = router;