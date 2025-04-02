const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
    bookmarkId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: { 
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId'
      }
    },
    articleId: {  
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Articles',
        key: 'articleId'
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

module.exports = Bookmark;