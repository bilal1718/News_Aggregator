const express = require('express');
const router = express.Router();
const { 
  addNote, 
  getUserNotes, 
  deleteNote 
} = require('../controllers/note.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', addNote);
router.get('/', getUserNotes);
router.delete('/:noteId', deleteNote);

module.exports = router;