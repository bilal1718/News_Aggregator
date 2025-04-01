const express = require('express');
const router = express.Router();
const { 
  addBookmark, 
  removeBookmark, 
  getUserBookmarks 
} = require('../controllers/bookmark.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', addBookmark);
router.delete('/:articleId', removeBookmark);
router.get('/', getUserBookmarks);

module.exports = router;