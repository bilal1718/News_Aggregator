const express = require('express');
const router = express.Router();
const { 
  getNotifications,
  markAsRead
} = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/:notificationId/read', markAsRead);

module.exports = router;