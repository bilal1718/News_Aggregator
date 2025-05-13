const axios = require('axios');
const { Article } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const categoryMapping = {
  'sport': 'sports',
  'football': 'sports',
  'soccer': 'sports',
  'rugby': 'sports',
  'tennis': 'sports',
  'cricket': 'sports',
  'f1': 'sports',
  'formula': 'sports',
  'science': 'science',
  'research': 'science',
  'study': 'science',
  'technology': 'technology',
  'tech': 'technology',
  'ai': 'technology',
  'movie': 'entertainment',
  'film': 'entertainment',
  'tv': 'entertainment',
  'music': 'entertainment',
  'celebrity': 'entertainment',
  'business': 'business',
  'economy': 'business',
  'finance': 'business',
  'market': 'business',
  'health': 'health',
  'medical': 'health',
  'disease': 'health',
  'treatment': 'health',
  'nhs': 'health',
  'politics': 'general', 
  'election': 'general',
  'government': 'general',
  'policy': 'general'
};

const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

/**
 * @param {string} externalCategory - Category from external source
 * @returns {string} - Mapped valid category
 */
function mapToValidCategory(externalCategory) {
  if (!externalCategory) return 'general';
  
  const lowerCategory = externalCategory.toLowerCase();
  
  if (validCategories.includes(lowerCategory)) {
    return lowerCategory;
  }
  
  for (const [keyword, category] of Object.entries(categoryMapping)) {
    if (lowerCategory.includes(keyword)) {
      return category;
    }
  }
  
  return 'general';
}

/**
 * Creates an article object that matches our schema
 * @param {Object} articleData - Raw article data
 * @returns {Object} 
 */
function createSchemaCompliantArticle(articleData) {
  return {
    articleId: articleData.articleId || uuidv4(),
    title: articleData.title || 'Untitled',
    content: articleData.content || articleData.description || 'No content available',
    source: articleData.source || 'Unknown',
    category: mapToValidCategory(articleData.category),
    publishedAt: articleData.publishedAt || new Date()
  };
}

exports.getRecommendedArticles = async (req, res) => {
  try {
    const { keywords, categories } = req.body;
    
    if (!keywords || !keywords.length) {
      return res.status(400).json({ error: 'Keywords are required for recommendations' });
    }

    console.log('Recommendation request received:');
    console.log('- Keywords:', keywords);
    console.log('- Categories:', categories);

    const recommendedArticles = [];
    const processedArticleIds = new Set(); 
    const validRequestCategories = categories?.filter(cat => validCategories.includes(cat.toLowerCase())) || [];

    for (const keyword of keywords) {
      try {
        const processedKeyword = prepareSearchQuery(keyword);
        
        const guardianApiUrl = `https://content.guardianapis.com/search`;
        const params = {
          'api-key': process.env.GUARDIAN_API_KEY,
          'q': processedKeyword,
          'section': validRequestCategories.join('|') || '',
          'show-fields': 'headline,trailText,bodyText,thumbnail,wordcount,publication,lastModified',
          'page-size': 3,
          'order-by': 'relevance'
        };

        console.log(`Querying Guardian API for processed keyword: "${processedKeyword}"...`);
        const response = await axios.get(guardianApiUrl, { params });

        if (response.data?.response?.results) {
          for (const article of response.data.response.results) {
            if (!processedArticleIds.has(article.id)) {
              processedArticleIds.add(article.id);
              
              const articleData = {
                articleId: uuidv4(), 
                guardianId: article.id,
                title: article.webTitle || 'Untitled',
                description: article.fields?.trailText || 'No description available',
                content: article.fields?.bodyText || 'No content available',
                source: 'The Guardian',
                category: mapToValidCategory(article.sectionName),
                publishedAt: article.webPublicationDate ? new Date(article.webPublicationDate) : new Date(),
                url: article.webUrl,
                imageUrl: article.fields?.thumbnail || `https://source.unsplash.com/random/600x400?${getImageQuery(keyword)}`,
                viewCount: Math.floor(Math.random() * 500) 
              };
              
              const schemaArticle = createSchemaCompliantArticle(articleData);
              
              try {
                const newArticle = await Article.create(schemaArticle);
                console.log(`Saved recommended article to database: ${schemaArticle.title} (ID: ${newArticle.articleId})`);

                recommendedArticles.push({
                  ...newArticle.toJSON(),
                  metadata: {
                    guardianId: articleData.guardianId,
                    description: articleData.description,
                    url: articleData.url,
                    imageUrl: articleData.imageUrl,
                    viewCount: articleData.viewCount,
                    isRecommendation: true,
                    recommendationKeyword: keyword
                  }
                });
              } catch (dbError) {
                console.error('Error saving recommended article to database:', dbError);
                
                recommendedArticles.push({
                  ...schemaArticle,
                  metadata: {
                    guardianId: articleData.guardianId,
                    description: articleData.description,
                    url: articleData.url,
                    imageUrl: articleData.imageUrl,
                    viewCount: articleData.viewCount,
                    isRecommendation: true,
                    recommendationKeyword: keyword
                  }
                });
              }
            }
          }
        }
      } catch (keywordError) {
        console.error(`Error fetching articles for keyword "${keyword}":`, keywordError);
        
        try {
          const simpleKeywords = simplifyQuery(keyword);
          console.log(`Retrying with simplified keywords: ${simpleKeywords.join(', ')}`);
          
          for (const simpleKeyword of simpleKeywords) {
            if (!simpleKeyword || simpleKeyword.length < 3) continue;
            
            const guardianApiUrl = `https://content.guardianapis.com/search`;
            const params = {
              'api-key': process.env.GUARDIAN_API_KEY,
              'q': simpleKeyword,
              'section': validRequestCategories.join('|') || '',
              'show-fields': 'headline,trailText,bodyText,thumbnail,wordcount,publication,lastModified',
              'page-size': 2,
              'order-by': 'relevance'
            };

            console.log(`Querying Guardian API for simple keyword: "${simpleKeyword}"...`);
            const response = await axios.get(guardianApiUrl, { params });
            
            if (response.data?.response?.results) {
              for (const article of response.data.response.results) {
                if (!processedArticleIds.has(article.id)) {
                  processedArticleIds.add(article.id);
                  
                  const articleData = {
                    articleId: uuidv4(), 
                    guardianId: article.id,
                    title: article.webTitle || 'Untitled',
                    description: article.fields?.trailText || 'No description available',
                    content: article.fields?.bodyText || 'No content available',
                    source: 'The Guardian',
                    category: mapToValidCategory(article.sectionName),
                    publishedAt: article.webPublicationDate ? new Date(article.webPublicationDate) : new Date(),
                    url: article.webUrl,
                    imageUrl: article.fields?.thumbnail || `https://source.unsplash.com/random/600x400?${getImageQuery(simpleKeyword)}`,
                    viewCount: Math.floor(Math.random() * 500)
                  };
                  
                  const schemaArticle = createSchemaCompliantArticle(articleData);
                  
                  try {
                    const newArticle = await Article.create(schemaArticle);
                    console.log(`Saved simplified recommended article: ${schemaArticle.title} (ID: ${newArticle.articleId})`);
                    
                    recommendedArticles.push({
                      ...newArticle.toJSON(),
                      metadata: {
                        guardianId: articleData.guardianId,
                        description: articleData.description,
                        url: articleData.url,
                        imageUrl: articleData.imageUrl,
                        viewCount: articleData.viewCount,
                        isRecommendation: true,
                        recommendationKeyword: keyword,
                        simplifiedFrom: simpleKeyword
                      }
                    });
                  } catch (dbError) {
                    console.error('Error saving simplified article to database:', dbError);
                    recommendedArticles.push({
                      ...schemaArticle,
                      metadata: {
                        guardianId: articleData.guardianId,
                        description: articleData.description,
                        url: articleData.url,
                        imageUrl: articleData.imageUrl,
                        viewCount: articleData.viewCount,
                        isRecommendation: true,
                        recommendationKeyword: keyword,
                        simplifiedFrom: simpleKeyword
                      }
                    });
                  }
                }
              }
            }
          }
        } catch (simplifiedError) {
          console.error(`Error with simplified keywords for "${keyword}":`, simplifiedError);
        }
      }
    }

    if (recommendedArticles.length === 0) {
      console.log('No API results found, using database fallback...');
      
      let dbQuery = {};
      if (validRequestCategories && validRequestCategories.length) {
        dbQuery = { 
          category: { [Op.in]: validRequestCategories } 
        };
      }
      
      try {
        const dbArticles = await Article.findAll({
          where: dbQuery,
          order: [['publishedAt', 'DESC']],
          limit: 10
        });
        
        console.log(`Found ${dbArticles.length} articles in database for fallback`);
        
        dbArticles.forEach(article => {
          recommendedArticles.push({
            ...article.toJSON(),
            metadata: {
              isRecommendation: true,
              recommendationSource: 'database'
            }
          });
        });
      } catch (dbError) {
        console.error('Error fetching fallback articles from database:', dbError);
      }
    }

    if (recommendedArticles.length === 0) {
      console.log('No articles found in database either, generating fallback content');
      
      const effectiveKeywords = keywords.length > 0 ? keywords : 
                              (validRequestCategories.length > 0 ? validRequestCategories.map(c => `${c} news`) : ['general news']);
      
      for (let i = 0; i < Math.min(5, effectiveKeywords.length); i++) {
        const category = validRequestCategories && validRequestCategories.length ? 
          validRequestCategories[i % validRequestCategories.length] : 'general';
        
        const fallbackArticleData = {
          articleId: uuidv4(),
          title: `Latest news about ${effectiveKeywords[i]}`,
          content: `This article contains the latest news and developments about ${effectiveKeywords[i]}.`,
          source: 'Generated Content',
          category: category,
          publishedAt: new Date()
        };
        
        try {
          const fallbackArticle = await Article.create(fallbackArticleData);
          
          recommendedArticles.push({
            ...fallbackArticle.toJSON(),
            metadata: {
              guardianId: `fallback-${uuidv4().slice(0, 8)}`,
              description: `Discover the most recent information about ${effectiveKeywords[i]}`,
              url: '#',
              imageUrl: `https://source.unsplash.com/random/600x400?${getImageQuery(effectiveKeywords[i])}`,
              viewCount: Math.floor(Math.random() * 100),
              isRecommendation: true,
              recommendationKeyword: effectiveKeywords[i],
              recommendationSource: 'fallback'
            }
          });
        } catch (fallbackError) {
          console.error('Error saving fallback article:', fallbackError);
          recommendedArticles.push({
            ...fallbackArticleData,
            metadata: {
              guardianId: `fallback-${uuidv4().slice(0, 8)}`,
              description: `Discover the most recent information about ${effectiveKeywords[i]}`,
              url: '#',
              imageUrl: `https://source.unsplash.com/random/600x400?${getImageQuery(effectiveKeywords[i])}`,
              viewCount: Math.floor(Math.random() * 100),
              isRecommendation: true,
              recommendationKeyword: effectiveKeywords[i],
              recommendationSource: 'fallback'
            }
          });
        }
      }
    }

    console.log(`Returning ${recommendedArticles.length} recommended articles to frontend`);
    return res.status(200).json(recommendedArticles);
  
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to get article recommendations',
      details: error.message 
    });
  }
};

exports.getAIRecommendations = async (req, res) => {
  try {
    const { recommendations } = req.body;
    
    if (!recommendations || !Array.isArray(recommendations) || !recommendations.length) {
      return res.status(400).json({ error: 'Valid recommendations array is required' });
    }

    console.log('AI recommendations received:', recommendations);
    
    const titles = recommendations.map(rec => rec.title || '');
    const categories = [...new Set(recommendations.map(rec => rec.category || '').filter(Boolean))];
    
    const filteredCategories = categories.filter(cat => 
      validCategories.includes(cat.toLowerCase())
    );
    
    req.body.keywords = titles;
    req.body.categories = filteredCategories;
    
    return await exports.getRecommendedArticles(req, res);
    
  } catch (error) {
    console.error('Error processing AI recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to process AI recommendations',
      details: error.message 
    });
  }
};

function prepareSearchQuery(keyword) {
  let query = keyword;
  
  query = query.replace(/[:;'"!@#$%^&*()+=<>?\\|{}[\]~]/g, ' ');
  
  query = query.replace(/\s+/g, ' ').trim();
  
  if (query.length > 50) {
    const words = query.split(' ');
    let shortQuery = '';
    for (const word of words) {
      if ((shortQuery + ' ' + word).length <= 50) {
        shortQuery += (shortQuery ? ' ' : '') + word;
      } else {
        break;
      }
    }
    query = shortQuery;
  }
  
  return query;
}

function simplifyQuery(keyword) {
  const cleaned = keyword
    .replace(/latest|update on|review of|coverage|this week's|guide to/gi, '')
    .replace(/[:;'"!@#$%^&*()+=<>?\\|{}[\]~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleaned.split(' ').filter(word => word.length >= 3);
  
  const importantWords = words.filter(word => !commonWords.includes(word.toLowerCase()));
  
  if (importantWords.length >= 2) {
    return [importantWords.slice(0, 3).join(' ')].concat(importantWords.slice(0, 2));
  }
  
  return [words.slice(0, 3).join(' ')].concat(words.slice(0, 2));
}

function getImageQuery(keyword) {
  const words = keyword.split(/\W+/).filter(w => w.length >= 3);
  return words.slice(0, 2).join(' ');
}

const commonWords = [
  'the', 'and', 'but', 'for', 'not', 'you', 'with', 'from', 'this', 'that',
  'are', 'have', 'has', 'had', 'was', 'were', 'will', 'would', 'should', 'could',
  'can', 'may', 'might', 'must', 'about', 'like', 'very', 'just', 'how'
];