const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reaction = sequelize.define('Reaction', {
  reactionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('like', 'dislike'),
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'articleId']
    }
  ]
});

module.exports = Reaction;