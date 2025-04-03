const { Comment, User, Article } = require('../models');
const { createNotification } = require('./notification.controller');

exports.addComment = async (req, res) => {
    try {
      const { articleId, content } = req.body;
      
      const article = await Article.findByPk(articleId);
      if (!article) return res.status(404).json({ error: 'Article not found' });
  
      const comment = await Comment.create({
        content,
        userId: req.user.userId,
        articleId
      });
  
      const commentWithUser = await Comment.findByPk(comment.commentId, {
        include: [{
          model: User,
          as: 'commenter',
          attributes: ['userId', 'name']
        }]
      });
      if (commentWithUser) {
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
  
      res.status(201).json(commentWithUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
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