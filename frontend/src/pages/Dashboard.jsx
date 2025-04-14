import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ArticleCard from '../components/ArticleCard';
import { getArticles } from '../services/api';

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const articlesData = await getArticles();
        setArticles(articlesData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <ArticleCard
                key={article.articleId}
                article={article}
              />
            ))}
          </div>
        )}
      </div>
      // After the opening div with max-w-7xl class and before the conditional rendering:

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
    </div>
  );
};

export default Dashboard;