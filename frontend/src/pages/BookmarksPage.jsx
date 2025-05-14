import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ArticleCard from '../components/ArticleCard';
import { getUserBookmarks } from '../services/api';
import Footer from '../components/Footer';
import AIChatbot from '../components/AI_Chatbot';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      try {
        const data = await getUserBookmarks();
        setBookmarks(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bookmarks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleBookmarkChange = (articleId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.articleId !== articleId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Bookmarks</h1>
          <p className="text-gray-600">
            Articles you've saved for later reading.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading bookmarks: {error}
                </p>
              </div>
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 mb-6">You haven't saved any articles yet. Browse the dashboard and bookmark articles you want to read later.</p>
            <a href="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Explore Articles
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(bookmark => (
              <ArticleCard 
                key={bookmark.bookmarkId} 
                article={bookmark.Article} 
                isBookmarked={true}
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>
        )}
      
    </div>
    <Footer/>

    <AIChatbot darkMode={false}/>
    </div>
  );
};

export default BookmarksPage;