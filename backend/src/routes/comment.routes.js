const express = require('express');
const router = express.Router();
const { addComment, getArticleComments } = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, addComment);
router.get('/:articleId', getArticleComments);

module.exports = router;