const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  reportId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entityType: {
    type: DataTypes.ENUM('article', 'comment'),
    allowNull: false
  },
  reportedEntityId: { 
    type: DataTypes.UUID,
    allowNull: false
  },
  reportType: {
    type: DataTypes.ENUM(
      'spam', 
      'hate_speech', 
      'misinformation',
      'harassment',
      'inappropriate_content'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
    defaultValue: 'pending',
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['entityType', 'reportedEntityId'] 
    }
  ]
});

module.exports = Report;