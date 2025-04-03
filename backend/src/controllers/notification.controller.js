const { Notification, User, Article } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.userId },
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'recipient',
        attributes: ['userId', 'name']
      }]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const [affectedCount] = await Notification.update(
      { readStatus: true },
      { 
        where: { 
          notificationId,
          userId: req.user.userId 
        }
      }
    );

    if (affectedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNotification = async (userId, message, type, metadata = {}) => {
  return await Notification.create({
    userId,
    message,
    type,
    metadata,
    readStatus: false
  });
};