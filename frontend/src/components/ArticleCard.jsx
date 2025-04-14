import React from 'react';
import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <Link to={`/article/${article.articleId}`} className="block">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800 mb-2">
                {article.category}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.content}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-500">
              <span>Source: {article.source}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ArticleCard;import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addBookmark, removeBookmark } from '../services/api';

const ArticleCard = ({ article, isBookmarked = false, onBookmarkChange }) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(article.articleId);
      } else {
        await addBookmark(article.articleId);
      }
      
      setBookmarked(!bookmarked);
      if (onBookmarkChange) {
        onBookmarkChange(article.articleId, !bookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <Link to={`/article/${article.articleId}`} className="block">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800 mb-2">
                {article.category}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.content}</p>
            </div>
            <button 
              onClick={handleBookmarkToggle}
              disabled={isLoading}
              className="ml-2 flex-shrink-0 text-gray-400 hover:text-blue-500 focus:outline-none"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : bookmarked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-500">
              <span>Source: {article.source}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ArticleCard;