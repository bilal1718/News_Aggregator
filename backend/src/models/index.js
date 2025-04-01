const User = require('./user.model');
const Article = require('./article.model');
const Bookmark = require('./bookmark.model');

// User-Article Relationship (Author)
User.hasMany(Article, { foreignKey: 'authorId' });
Article.belongsTo(User, { foreignKey: 'authorId' });


Bookmark.belongsTo(User, { foreignKey: 'userId' });
Bookmark.belongsTo(Article, { foreignKey: 'articleId' });

User.hasMany(Bookmark, { foreignKey: 'userId' });
Article.hasMany(Bookmark, { foreignKey: 'articleId' });

module.exports = {
    User,
    Article,
    Bookmark
  };