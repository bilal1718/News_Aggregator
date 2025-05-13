require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// Route modules
const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const commentRoutes = require('./routes/comment.routes');
const reactionRoutes = require('./routes/reaction.routes');
const noteRoutes = require('./routes/note.routes');
const notificationRoutes = require('./routes/notification.routes');
const userPreferenceRoutes = require('./routes/userPreference.routes');
const reportRoutes = require('./routes/report.routes');
const airoutes = require('./routes/ai.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const newsletterRoutes = require('./routes/newsletter.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',       
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true                     
}));

app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences', userPreferenceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', airoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/newsletter', newsletterRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
