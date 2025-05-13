const User = require('./user.model');
const Article = require('./article.model');
const Bookmark = require('./bookmark.model');
const Comment = require('./comment.model');
const Reaction = require('./reaction.model');
const Note = require('./note.model');
const Notification = require('./notification.model');
const UserPreference = require('./userPreference.model');
const Report = require('./report.model');



User.hasMany(Article, { foreignKey: 'authorId' });
Article.belongsTo(User, { foreignKey: 'authorId' });

Bookmark.belongsTo(User, { foreignKey: 'userId' });
Bookmark.belongsTo(Article, { foreignKey: 'articleId' });
User.hasMany(Bookmark, { foreignKey: 'userId' });
Article.hasMany(Bookmark, { foreignKey: 'articleId' });

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

Reaction.belongsTo(User, { foreignKey: 'userId', as: 'reactor' });
Reaction.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

User.hasMany(Reaction, { foreignKey: 'userId', as: 'reactions' });
Article.hasMany(Reaction, { foreignKey: 'articleId', as: 'reactions' });

Note.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Note.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
Article.hasMany(Note, { foreignKey: 'articleId', as: 'notes' });

Notification.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'recipient'
});

User.hasMany(Notification, { 
  foreignKey: 'userId',
  as: 'notifications'
});

User.hasOne(UserPreference, {
  foreignKey: 'userId',
  as: 'preferences'
});

UserPreference.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Report.belongsTo(User, {
  foreignKey: 'userId',
  as: 'reporter'
});

User.hasMany(Report, {
  foreignKey: 'userId',
  as: 'reports'
});


module.exports = {
  User,
  Article,
  Bookmark,
  Comment,
  Reaction,
  Note,
  Notification,
  UserPreference,
  Report
};