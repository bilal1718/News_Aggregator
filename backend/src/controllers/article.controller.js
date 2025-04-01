const { Article } = require('../models');
const axios = require('axios');

exports.fetchNews = async (req, res) => {
  try {
    const categories = [
        'business',
        'technology',
        'science',
        'entertainment',
        'sports',
        'general',
        'health'
      ];
      let allArticles = [];

      for (const category of categories) {
        const response = await axios.get(
          `https://newsapi.org/v2/top-headlines?apiKey=${process.env.NEWS_API_KEY}&country=us&category=${category}`
        );

        const categoryArticles = response.data.articles.map(article => ({
            title: article.title,
            content: article.content || article.description,
            source: article.source?.name || 'NewsAPI',
            category: category,
            publishedAt: new Date(article.publishedAt)
          }));
          
          allArticles = [...allArticles, ...categoryArticles];
        }
    
        const createdArticles = await Article.bulkCreate(allArticles);
        res.json(createdArticles);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArticlesByCategory = async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await Article.findAll({ 
        where: { category },
        order: [['publishedAt', 'DESC']]
      });
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };