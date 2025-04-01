const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Article = sequelize.define('Article', {
  articleId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING  // e.g., "NewsAPI", "UserSubmitted"
  },
  category: {
    type: DataTypes.STRING  // e.g., "technology", "politics"
  },
  publishedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Article;