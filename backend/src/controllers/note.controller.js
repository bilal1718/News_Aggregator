const { Note, Article } = require('../models');

exports.addNote = async (req, res) => {
  try {
    const { articleId, content } = req.body;
    
    if (!content.trim()) {
      return res.status(400).json({ error: 'Note content cannot be empty' });
    }

    const article = await Article.findByPk(articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const [note, created] = await Note.upsert({
      userId: req.user.userId,
      articleId,
      content
    }, {
      returning: true
    });

    res.status(created ? 201 : 200).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.user.userId },
      include: [{
        model: Article,
        as: 'article',
        attributes: ['articleId', 'title', 'category']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const deleted = await Note.destroy({
      where: {
        noteId,
        userId: req.user.userId 
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};