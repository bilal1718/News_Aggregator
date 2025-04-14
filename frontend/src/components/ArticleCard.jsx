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

export default ArticleCard;