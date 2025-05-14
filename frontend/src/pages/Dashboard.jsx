import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ArticleCard from '../components/ArticleCard';
import AIChatbot from '../components/AI_Chatbot';
import { getArticles, getArticlesByCategory, getUserPreferences, getUserBookmarks } from '../services/api';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(9);
  const [sortBy, setSortBy] = useState('newest');

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const prefsData = await getUserPreferences();
        setPreferences(prefsData);
        if (prefsData && prefsData.darkMode !== undefined) {
          setDarkMode(prefsData.darkMode);
        }

        const bookmarksData = await getUserBookmarks();
        const bookmarkSet = new Set(bookmarksData.map(bookmark => bookmark.articleId));
        setBookmarkedArticleIds(bookmarkSet);

        let articlesData;
        if (activeCategory === 'all') {
          articlesData = await getArticles();
        } else {
          articlesData = await getArticlesByCategory(activeCategory);
        }
        setArticles(articlesData);
        setCurrentPage(1); 
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

  const sortArticles = (articlesToSort) => {
    const sortedArticles = [...articlesToSort];
    
    switch(sortBy) {
      case 'newest':
        return sortedArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      case 'oldest':
        return sortedArticles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
      case 'popular':
        return sortedArticles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'title-asc':
        return sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sortedArticles.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sortedArticles;
    }
  };

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const sortedArticles = sortArticles(articles);
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
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
                  <button className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300">
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
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                {activeCategory === 'all' ? (
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" clipRule="evenodd"></path>
                  </svg>
                )}
                {activeCategory === 'all' ? 'Latest News' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News`}
                <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{articles.length}</span>
              </h2>
              <div className="mt-3 sm:mt-0">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <button 
                    onClick={() => setSortBy('newest')}
                    className={`px-3 py-1 text-sm rounded-md ${sortBy === 'newest' ? 'bg-white shadow-sm font-medium text-blue-600' : 'hover:bg-white hover:shadow-sm font-medium text-gray-600 transition-all duration-300'}`}
                  >
                    Newest
                  </button>
                  <button 
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1 text-sm rounded-md ${sortBy === 'popular' ? 'bg-white shadow-sm font-medium text-blue-600' : 'hover:bg-white hover:shadow-sm font-medium text-gray-600 transition-all duration-300'}`}
                  >
                    Popular
                  </button>
                  <button 
                    onClick={() => setSortBy('title-asc')}
                    className={`px-3 py-1 text-sm rounded-md ${sortBy === 'title-asc' ? 'bg-white shadow-sm font-medium text-blue-600' : 'hover:bg-white hover:shadow-sm font-medium text-gray-600 transition-all duration-300'}`}
                  >
                    A-Z
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.map(article => (
                <ArticleCard
                  key={article.articleId}
                  article={article}
                  isBookmarked={bookmarkedArticleIds.has(article.articleId)}
                  onBookmarkChange={handleBookmarkChange}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {getPaginationNumbers().map((number, index) => (
                    <React.Fragment key={index}>
                      {number === '...' ? (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border ${currentPage === number ? 'bg-blue-50 border-blue-500 text-blue-600 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                        >
                          {number}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="text-center mt-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages} • Showing {indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, articles.length)} of {articles.length} articles
              </div>
            )}
          </>
        )}
      </div>

      <Footer/>

      <AIChatbot darkMode={darkMode} />
    </div>
  );
};

export default Dashboard;