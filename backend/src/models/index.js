const User = require('./user.model');
const Article = require('./article.model');
const Bookmark = require('./bookmark.model');
const Comment = require('./comment.model');

// User-Article Relationship (Author)
User.hasMany(Article, { foreignKey: 'authorId' });
Article.belongsTo(User, { foreignKey: 'authorId' });

// Bookmark relationships
Bookmark.belongsTo(User, { foreignKey: 'userId' });
Bookmark.belongsTo(Article, { foreignKey: 'articleId' });
User.hasMany(Bookmark, { foreignKey: 'userId' });
Article.hasMany(Bookmark, { foreignKey: 'articleId' });

// Comment relationships
Comment.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'commenter'
});
Comment.belongsTo(Article, {
  foreignKey: 'articleId',
  as: 'article'
});
User.hasMany(Comment, { 
  foreignKey: 'userId',
  as: 'comments'
});
Article.hasMany(Comment, {
  foreignKey: 'articleId',
  as: 'comments'
});

module.exports = {
  User,
  Article,
  Bookmark,
  Comment 
};