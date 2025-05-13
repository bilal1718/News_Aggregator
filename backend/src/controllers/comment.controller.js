const { Comment, User, Article } = require('../models');
const { createNotification } = require('./notification.controller');

const sequelize = require('../config/db');

exports.addComment = async (req, res) => {
  const { articleId, content } = req.body;

  const transaction = await sequelize.transaction(); // begin transaction

  try {
    const article = await Article.findByPk(articleId, { transaction });
    if (!article) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Article not found' });
    }

    const comment = await Comment.create({
      content,
      userId: req.user.userId,
      articleId
    }, { transaction });

    const commentWithUser = await Comment.findByPk(comment.commentId, {
      include: [{
        model: User,
        as: 'commenter',
        attributes: ['userId', 'name']
      }],
      transaction
    });

    // Optional: Create notification inside transaction
    if (article.authorId) {
      await createNotification(
        article.authorId,
        `New comment on your article "${article.title}"`,
        'new_comment',
        {
          articleId: article.articleId,
          commentId: comment.commentId
        }
      );
    }

    await transaction.commit(); // All good!
    return res.status(201).json(commentWithUser);
  } catch (error) {
    await transaction.rollback(); // Something went wrong
    return res.status(500).json({ error: error.message });
  }
};


  exports.getArticleComments = async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const comments = await Comment.findAll({
        where: { articleId },
        include: [{
          model: User,
          as: 'commenter', 
          attributes: ['userId', 'name']
        }],
        order: [['created_at', 'DESC']]
      });
  
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };