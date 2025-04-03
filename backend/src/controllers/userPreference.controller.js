const { UserPreference, User } = require('../models');

exports.initializePreferences = async (userId) => {
  return await UserPreference.create({
    userId,
    preferredCategories: ['general'],
    notificationSettings: {
      comments: true,
      reactions: true,
      recommendations: true
    }
  });
};

exports.getPreferences = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({
      where: { userId: req.user.userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['userId', 'name']
      }]
    });

    if (!preferences) {
      const newPrefs = await exports.initializePreferences(req.user.userId);
      return res.json(newPrefs);
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { preferredCategories, notificationSettings } = req.body;

    const [affectedCount, [updatedPrefs]] = await UserPreference.update({
      preferredCategories,
      notificationSettings
    }, {
      where: { userId: req.user.userId },
      returning: true
    });

    if (affectedCount === 0) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json(updatedPrefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};