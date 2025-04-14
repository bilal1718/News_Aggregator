import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ArticleCard from '../components/ArticleCard';
import { getArticles, getArticlesByCategory } from '../services/api';

// Assuming these functions exist elsewhere in your application
// If not, you'll need to implement them
import { getUserBookmarks, getUserPreferences } from '../services/api';

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState(new Set());
  const [preferences, setPreferences] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    'all',
    'business',
    'technology',
    'science',
    'entertainment',
    'sports',
    'general',
    'health'
  ];

  // Combined useEffect to fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get user preferences and bookmarks
        const prefsData = await getUserPreferences();
        setPreferences(prefsData);
  
        const bookmarksData = await getUserBookmarks();
        const bookmarkSet = new Set(bookmarksData.map(bookmark => bookmark.articleId));
        setBookmarkedArticleIds(bookmarkSet);
  
        // Get articles based on active category
        let articlesData;
        if (activeCategory === 'all') {
          articlesData = await getArticles();
        } else {
          articlesData = await getArticlesByCategory(activeCategory);
        }
        setArticles(articlesData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [activeCategory]);

  const handleBookmarkChange = (articleId, isBookmarked) => {
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
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome to your News Dashboard</h1>
            <p className="text-blue-100 text-xl max-w-2xl leading-relaxed">
              Stay informed with the latest news tailored for you. Get personalized stories based on your interests.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:bg-opacity-30">
                <svg className="w-5 h-5 mr-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-semibold">Curated news feeds</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:bg-opacity-30">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-semibold">Personalized recommendations</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:bg-opacity-30">
                <svg className="w-5 h-5 mr-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-semibold">Save articles for later</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-100 transform transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Browse Categories
          </h2>

          <div className="sm:hidden">
            <label htmlFor="category-select" className="sr-only">Select a category</label>
            <div className="relative">
              <select
                id="category-select"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg appearance-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="capitalize">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <nav className="flex flex-wrap gap-3" aria-label="Categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-300 ${activeCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </nav>
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
              <p className="text-gray-600 mt-4 font-medium">Loading your personalized news feed...</p>
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
                  <h3 className="text-lg font-semibold text-gray-900">Unable to load articles</h3>
                  <p className="mt-2 text-gray-600">
                    Error loading articles: {error}
                  </p>
                  <button 
                    onClick={() => setActiveCategory(activeCategory)} 
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
        ) : articles.length === 0 ? (
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
                  <h3 className="text-lg font-semibold text-gray-900">No articles found</h3>
                  <p className="mt-2 text-gray-600">
                    There are currently no articles available in this category.
                  </p>
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                    View All Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isBookmarked={bookmarkedArticleIds.has(article.id)}
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;