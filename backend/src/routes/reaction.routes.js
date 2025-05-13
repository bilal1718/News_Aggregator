const express = require('express');
const router = express.Router();
const { addReaction, getArticleReactions } = require('../controllers/reaction.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, addReaction);
router.get('/:articleId', getArticleReactions);

module.exports = router;