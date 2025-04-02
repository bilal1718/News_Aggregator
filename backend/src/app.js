require('dotenv').config();
const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const commentRoutes = require('./routes/comment.routes');
const reactionRoutes = require('./routes/reaction.routes');
const noteRoutes = require('./routes/note.routes');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/notes', noteRoutes);



sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('Connection error:', err));