import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [mounted, setMounted] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (currentUser) {
    console.log('Current User: ',currentUser)
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            News <span className="text-blue-600">Aggregator</span>
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Stay informed with the latest news tailored for you
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="hidden md:block w-2/5 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white relative">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6">Welcome Back!</h2>
                <p className="text-blue-100 mb-4">
                  Your personalized news experience awaits. Get access to:
                </p>
                <ul className="space-y-3">
                  {['Curated news feeds', 'Personalized recommendations', 'Save articles for later', 'Dark mode reading'].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
                      className="flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-blue-200 italic">
                  "Stay informed, stay ahead. Your trusted source for reliable news."
                </p>
              </div>
            </div>
            
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-500 opacity-20"></div>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-indigo-400 opacity-20"></div>
          </div>

          <div className="w-full md:w-3/5 p-8">
            <div className="flex space-x-2 mb-8">
              <TabButton 
                active={activeTab === 'login'} 
                onClick={() => setActiveTab('login')}
                label="Sign In"
              />
              <TabButton 
                active={activeTab === 'signup'} 
                onClick={() => setActiveTab('signup')}
                label="Create Account"
              />
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {activeTab === 'login' ? (
                    <div>
                      <LoginForm onSuccess={() => {}} />
                      <div className="mt-6 text-center">
                        <p className="text-gray-600">
                          New to News Aggregator?{' '}
                          <button
                            onClick={() => setActiveTab('signup')}
                            className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none transition-colors"
                          >
                            Create an account
                          </button>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <SignupForm onSwitch={() => setActiveTab('login')} />
                      <div className="mt-6 text-center">
                        <p className="text-gray-600">
                          Already have an account?{' '}
                          <button
                            onClick={() => setActiveTab('login')}
                            className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none transition-colors"
                          >
                            Sign in
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          © {new Date().getFullYear()} News Aggregator. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-300 ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

export default AuthPage;