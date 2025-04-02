const { Reaction, Article, User } = require('../models');

exports.addReaction = async (req, res) => {
  try {
    const { articleId, type } = req.body;
    
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const article = await Article.findByPk(articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const [reaction, created] = await Reaction.upsert({
      userId: req.user.userId,
      articleId,
      type
    }, {
      returning: true
    });

    res.status(created ? 201 : 200).json(reaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArticleReactions = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const reactions = await Reaction.findAll({
      where: { articleId },
      include: [{
        model: User,
        as: 'reactor',
        attributes: ['userId', 'name']
      }],
      order: [['created_at', 'DESC']]
    });

    const likeCount = await Reaction.count({ 
      where: { articleId, type: 'like' }
    });
    const dislikeCount = await Reaction.count({ 
      where: { articleId, type: 'dislike' }
    });

    res.json({
      reactions,
      counts: { likeCount, dislikeCount }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};