const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  notificationId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  readStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'new_comment',
      'new_reply',
      'reaction',
      'system'
    ),
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB, 
    defaultValue: {}
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['userId', 'readStatus'] 
    }
  ]
});

module.exports = Notification;