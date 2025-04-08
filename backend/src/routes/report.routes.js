const express = require('express');
const router = express.Router();
const { 
  createReport,
  getReports,
  updateReportStatus
} = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createReport);

router.get('/', authMiddleware, getReports);
router.patch('/:reportId', authMiddleware, updateReportStatus);

module.exports = router;