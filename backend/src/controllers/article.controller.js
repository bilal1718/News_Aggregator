const { Article } = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');


exports.fetchNews = async (req, res) => {
  try {
    const categories = [
      'business',
      'technology',
      'science',
      'entertainment',
      'sports',
      'general',
      'health',
    ];
    let allArticles = [];

    for (const category of categories) {
      const response = await axios.get(
        `https://content.guardianapis.com/search?api-key=${process.env.GUARDIAN_API_KEY}&show-fields=bodyText&q=${category}`
      );

      if (!response.data || !response.data.response || !response.data.response.results) {
        console.error(`Invalid response for category: ${category}`);
        continue;
      }

      const categoryArticles = response.data.response.results.map((article) => ({
        title: article.webTitle || 'Untitled',
        content: article.fields?.bodyText || 'No content available',
        source: 'The Guardian',
        category: category.toLowerCase(), // Ensure category is lowercase and matches valid categories
        publishedAt: article.webPublicationDate ? new Date(article.webPublicationDate) : new Date(),
      }));

      allArticles = [...allArticles, ...categoryArticles];
    }

    // Log the articles being inserted
    console.log('Articles to insert:', allArticles);

    // Create articles in the database
    const createdArticles = await Article.bulkCreate(allArticles, { validate: true });
    res.json(createdArticles);
  } catch (error) {
    console.error('Error in fetchNews:', error.message);
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

    const validCategories = [
      'business',
      'technology',
      'science',
      'entertainment',
      'sports',
      'general',
      'health',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const articles = await Article.findAll({
      where: { category },
      order: [['publishedAt', 'DESC']],
    });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F-]{36}$/)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};