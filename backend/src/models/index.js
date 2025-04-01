const User = require('./user.model');
const Article = require('./article.model');

// User-Article Relationship (Author)
User.hasMany(Article, { foreignKey: 'authorId' });
Article.belongsTo(User, { foreignKey: 'authorId' });

module.exports = {
  User,
  Article
};