import React, { useState, useEffect } from 'react';
import { 
  getUserBookmarks, 
  getArticleReactions, 
  getArticleComments, 
  sendAIMessage, 
  getArticleById,
  getRecommendedArticles 
} from '../services/api';
import ArticleCard from '../components/ArticleCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIChatbot from '../components/AI_Chatbot';
import { v4 as uuidv4 } from 'uuid'; // 

const Recommendations = () => {
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState(new Set());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchUserInteractions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bookmarks = await getUserBookmarks();
        console.log('User bookmarks:', bookmarks);
        
        const bookmarkSet = new Set(bookmarks.map(bookmark => bookmark.articleId));
        setBookmarkedArticleIds(bookmarkSet);
        
        const interactedArticles = [];
        const addedIds = new Set();

        for (const bookmark of bookmarks) {
          if (!addedIds.has(bookmark.articleId)) {
            try {
              const articleDetails = await getArticleById(bookmark.articleId);
              console.log(`Fetched article details for ID ${bookmark.articleId}:`, articleDetails);
              
              if (articleDetails) {
                interactedArticles.push({
                  articleId: bookmark.articleId,
                  title: articleDetails.title,
                  category: articleDetails.category,
                  interactionType: 'bookmark'
                });
                addedIds.add(bookmark.articleId);
              }
            } catch (fetchError) {
              console.error(`Failed to fetch article details for ID ${bookmark.articleId}:`, fetchError);
            }
          }
        }

        console.log('Processed interaction articles:', interactedArticles);

        for (const article of interactedArticles) {
          try {
            const reactionsResponse = await getArticleReactions(article.articleId);
            const comments = await getArticleComments(article.articleId);
            
            console.log(`Article ${article.articleId} reactions:`, reactionsResponse);
            console.log(`Article ${article.articleId} comments:`, comments);
            
            const reactions = reactionsResponse.reactions || [];
            
            const userLiked = reactions.some(reaction => reaction.type === 'like');
            const userCommented = comments && comments.length > 0;
            
            if (userLiked) {
              article.interactionType = 'like';
              console.log(`User liked article: ${article.title} (${article.articleId})`);
            }
            if (userCommented) {
              article.interactionType = 'comment';
              console.log(`User commented on article: ${article.title} (${article.articleId})`);
            }
          } catch (e) {
            console.error(`Error fetching interactions for article ${article.articleId}:`, e);
          }
        }
        
        if (interactedArticles.length > 0) {
          await getRecommendations(interactedArticles);
        } else {
          console.log('No user interactions found, skipping recommendations');
          setIsLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Error fetching user interactions');
        console.error('Error fetching user interactions:', err);
        setIsLoading(false);
      }
    };

    fetchUserInteractions();
  }, []);

  const cleanJsonString = (jsonStr) => {
    try {
      return jsonStr.replace(/\[[^\]]*\]/g, "Upcoming Event");
    } catch (err) {
      console.error("Error cleaning JSON string:", err);
      return jsonStr;
    }
  };

  const safeJsonParse = (jsonStr) => {
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      console.log("Error parsing raw JSON, attempting to clean:", err);
      try {
        const cleanedJson = cleanJsonString(jsonStr);
        return JSON.parse(cleanedJson);
      } catch (err2) {
        console.error("Error parsing cleaned JSON:", err2);
        throw err2;
      }
    }
  };

  const extractRecommendationsFromText = (text, categories) => {
    console.log('Manually extracting recommendations from text');
    const recommendations = [];
    
    const lines = text.split('\n');
    let currentRecommendation = null;
    
    for (let line of lines) {
      line = line.trim();
      
      if (line.includes('"title"')) {
        const titleMatch = line.match(/"title":\s*"([^"]*)"/);
        if (titleMatch && titleMatch[1]) {
          currentRecommendation = { title: titleMatch[1] };
        }
      } 
      else if (line.includes('"category"') && currentRecommendation) {
        const categoryMatch = line.match(/"category":\s*"([^"]*)"/);
        if (categoryMatch && categoryMatch[1]) {
          currentRecommendation.category = categoryMatch[1];
          recommendations.push({...currentRecommendation});
          currentRecommendation = null;
        }
      }
    }
    
    if (recommendations.length > 0) {
      return recommendations;
    }
    
    const defaultCategories = categories.split(',').map(c => c.trim()).filter(Boolean);
    return defaultCategories.map(category => ({
      title: `Latest ${category} news and updates`,
      category
    }));
  };

  const prepareArticlesForDisplay = (articlesData) => {
    return articlesData.map(article => {
      const articleId = article.articleId || article.id || uuidv4();
      
      return {
        articleId: articleId,
        title: article.title || 'Untitled Article',
        description: article.description || article.summary || 'No description available',
        content: article.content || article.body || '',
        source: article.source || 'The Guardian',
        publishedAt: article.publishedAt || article.published_at || new Date().toISOString(),
        url: article.url || '#',
        category: article.category || 'general',
        imageUrl: article.imageUrl || article.image || `https://source.unsplash.com/random/600x400?${article.category || 'news'}`,
        isRecommendation: true,
        viewCount: article.viewCount || Math.floor(Math.random() * 1000) 
      };
    });
  };

  const getRecommendations = async (interactions) => {
    try {
      if (!interactions || interactions.length === 0) {
        console.log('No interactions to base recommendations on');
        setIsLoading(false);
        return;
      }

      const titles = interactions.map(item => item.title || 'Unknown article').join(', ');
      const categories = [...new Set(interactions.filter(item => item.category).map(item => item.category))];
      const interactionTypes = interactions.map(item => item.interactionType).join(', ');
      
      console.log('Generating AI prompt with user interaction data:');
      console.log('- Interaction titles:', titles);
      console.log('- Interaction categories:', categories);
      console.log('- Interaction types:', interactionTypes);
      
      const aiPrompt = `Based on the following articles that the user has interacted with:
        Titles: ${titles}
        Categories: ${categories.join(', ') || 'Various'}
        Interaction Types: ${interactionTypes}
        
        Please recommend 5-10 relevant article topics that this user might be interested in. 
        Format each recommendation as a JSON object with 'title' and 'category' fields.
        Important: Do not use placeholders like [Latest Race Name]. Instead use generic titles like "Formula 1 Grand Prix Review".`;
      
      console.log('Sending AI prompt:', aiPrompt);
      
      const aiResponse = await sendAIMessage(aiPrompt);
      console.log('Raw AI response:', aiResponse);
      
      if (!aiResponse || !aiResponse.text) {
        throw new Error('Received empty response from AI service');
      }
      
      let recommendations = [];
      try {
        const jsonRegex = /\[([\s\S]*?)\]/;
        const responseText = aiResponse.text;
        const match = responseText.match(jsonRegex);
        
        if (match && match[0]) {
          const jsonString = match[0];
          console.log('Extracted JSON string:', jsonString);
          
          try {
            recommendations = safeJsonParse(jsonString);
            console.log('Successfully parsed JSON recommendations from AI:', recommendations);
          } catch (jsonError) {
            console.error('JSON parsing failed:', jsonError);
            recommendations = extractRecommendationsFromText(responseText, categories.join(', '));
            console.log('Manually extracted recommendations:', recommendations);
          }
        } else {
          console.log('Could not extract JSON from AI response, attempting text extraction');
          recommendations = extractRecommendationsFromText(responseText, categories.join(', '));
          console.log('Extracted recommendations from text:', recommendations);
        }
        
        if (!recommendations || recommendations.length === 0) {
          throw new Error('Could not extract any recommendations from AI response');
        }
        
        recommendations = recommendations.map(rec => ({
          ...rec,
          title: rec.title.replace(/\[[^\]]*\]/g, "").trim(),
          category: rec.category || categories[0] || 'General'
        }));
        
        console.log('Fetching real articles based on AI recommendations');
        try {
          const realArticles = await getRecommendedArticles(recommendations);
          console.log('Received real articles from API:', realArticles);
          
          if (realArticles && realArticles.length > 0) {
            const preparedArticles = prepareArticlesForDisplay(realArticles);
            setRecommendedArticles(preparedArticles);
          } else {
            console.log('No real articles returned, falling back to simulated articles');
            const simulatedArticles = recommendations.map(rec => ({
              articleId: uuidv4(),
              title: rec.title || 'Recommended Article',
              description: `A recommended article about ${rec.title || 'your interests'}`,
              content: `Detailed content about ${rec.title || 'this topic'} would appear here.`,
              source: 'The Guardian',
              publishedAt: new Date().toISOString(),
              url: '#',
              category: rec.category || 'General',
              imageUrl: `https://source.unsplash.com/random/600x400?${rec.category || 'article'}`,
              isRecommendation: true,
              viewCount: Math.floor(Math.random() * 1000) 
            }));
            setRecommendedArticles(simulatedArticles);
          }
        } catch (apiError) {
          console.error('Error fetching real articles:', apiError);
          
          const simulatedArticles = recommendations.map(rec => ({
            articleId: uuidv4(),
            title: rec.title || 'Recommended Article',
            description: `A recommended article about ${rec.title || 'your interests'}`,
            content: `Detailed content about ${rec.title || 'this topic'} would appear here.`,
            source: 'The Guardian',
            publishedAt: new Date().toISOString(),
            url: '#',
            category: rec.category || 'General',
            imageUrl: `https://source.unsplash.com/random/600x400?${rec.category || 'article'}`,
            isRecommendation: true,
            viewCount: Math.floor(Math.random() * 1000)
          }));
          setRecommendedArticles(simulatedArticles);
        }
      } catch (parseError) {
        console.error('Error parsing AI recommendations:', parseError);
        console.error('AI response that failed parsing:', aiResponse.text);
        
        const fallbackRecommendations = categories.map((category) => ({
          articleId: uuidv4(),
          title: `Top stories in ${category}`,
          description: `Recent and trending stories in ${category}`,
          content: `This article contains the latest news and developments in ${category}.`,
          source: 'The Guardian',
          publishedAt: new Date().toISOString(),
          url: '#',
          category: category,
          imageUrl: `https://source.unsplash.com/random/600x400?${category}`,
          isRecommendation: true,
          viewCount: Math.floor(Math.random() * 1000) 
        }));
        
        setRecommendedArticles(fallbackRecommendations);
        setError(null); 
      }
    } catch (err) {
      setError('Failed to get recommendations: ' + (err.message || 'Unknown error'));
      console.error('Error getting recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkChange = (articleId, isBookmarked) => {
    console.log(`Bookmark change: Article ${articleId}, isBookmarked: ${isBookmarked}`);
    setBookmarkedArticleIds(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.add(articleId);
      } else {
        newSet.delete(articleId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl shadow-xl p-10 mb-10 text-white relative overflow-hidden transform transition-all duration-300">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Personalized Recommendations</h1>
            <p className="text-blue-100 text-xl max-w-2xl leading-relaxed">
              Discover new articles tailored to your interests based on your reading history and preferences.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:bg-opacity-30">
                <svg className="w-5 h-5 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-black font-semibold">AI-powered suggestions</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:bg-opacity-30">
                <svg className="w-5 h-5 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-black font-semibold">Based on your interests</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:bg-opacity-30">
                <svg className="w-5 h-5 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-black font-semibold">Daily fresh content</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Finding articles you'll love...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-red-500 h-2"></div>
            <div className="p-8">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-900">Unable to load recommendations</h3>
                  <p className="mt-2 text-gray-600">
                    Error: {error}
                  </p>
                  <button 
                    onClick={() => {
                      console.log('Retry button clicked');
                      window.location.reload();
                    }}
                    className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : recommendedArticles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-yellow-400 h-2"></div>
            <div className="p-8">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-900">No recommendations available</h3>
                  <p className="mt-2 text-gray-600">
                    We don't have enough information about your preferences yet. Try interacting with more articles to get personalized recommendations.
                  </p>
                  <button
                    onClick={() => {
                      console.log('Browse Articles button clicked');
                      window.location.href = '/dashboard';
                    }}
                    className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                    Browse Articles
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                Recommended For You
                <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{recommendedArticles.length}</span>
              </h2>
              <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                <span className="italic">Powered by AI based on your reading history</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedArticles.map(article => {
                console.log(`Rendering recommended article: ${article.title} (ID: ${article.articleId})`);
                return (
                  <ArticleCard
                    key={article.articleId}
                    article={article}
                    isBookmarked={bookmarkedArticleIds.has(article.articleId)}
                    onBookmarkChange={handleBookmarkChange}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />

      <AIChatbot darkMode={darkMode} />
    </div>
  );
};

export default Recommendations;