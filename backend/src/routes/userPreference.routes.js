const express = require('express');
const router = express.Router();
const { 
  getPreferences,
  updatePreferences
} = require('../controllers/userPreference.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getPreferences);
router.put('/', updatePreferences);

module.exports = router;