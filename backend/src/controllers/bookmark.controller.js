const { Bookmark, Article, User } = require('../models');

exports.addBookmark = async (req, res) => {
  try {
    const { articleId } = req.body;
    
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const existingBookmark = await Bookmark.findOne({
      where: {
        userId: req.user.userId,
        articleId
      }
    });

    if (existingBookmark) {
      return res.status(409).json({ error: 'Article already bookmarked' });
    }

    const bookmark = await Bookmark.create({
      userId: req.user.userId,
      articleId
    });

    res.status(201).json(bookmark);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Already bookmarked' });
    }
    return res.status(500).json({ error: error.message });

    }
};

exports.removeBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const deleted = await Bookmark.destroy({
      where: {
        userId: req.user.userId,
        articleId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.userId },
      include: [{
        model: Article,
        as:'Article',
        attributes: ['articleId', 'title', 'content', 'source','category', 'publishedAt']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};