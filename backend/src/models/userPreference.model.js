const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserPreference = sequelize.define('UserPreference', {
  preferenceId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  preferredCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['general'],
    validate: {
      isValidCategories(value) {
        const validCategories = [
          'business', 'entertainment', 'general', 
          'health', 'science', 'sports', 'technology'
        ];
        if (value.some(cat => !validCategories.includes(cat))) {
          throw new Error('Invalid news category');
        }
      }
    }
  },
  notificationSettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      comments: true,
      reactions: true,
      recommendations: true
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserPreference;