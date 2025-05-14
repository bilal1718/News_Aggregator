import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getUserPreferences, updateUserPreferences } from '../services/api';
import Footer from '../components/Footer';
import AIChatbot from '../components/AI_Chatbot';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    preferredCategories: [],
    notificationSettings: {
      comments: true,
      reactions: true,
      recommendations: true
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const availableCategories = [
    'business',
    'technology',
    'science',
    'entertainment',
    'sports',
    'general',
    'health'
  ];

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const data = await getUserPreferences();
        setPreferences({
          preferredCategories: data.preferredCategories || [],
          notificationSettings: data.notificationSettings || {
            comments: true,
            reactions: true,
            recommendations: true
          }
        });
      } catch (err) {
        toast.error(`Error fetching preferences: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        console.error('Error fetching preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleCategoryToggle = (category) => {
    setPreferences(prev => {
      const isSelected = prev.preferredCategories.includes(category);
      
      return {
        ...prev,
        preferredCategories: isSelected 
          ? prev.preferredCategories.filter(c => c !== category)
          : [...prev.preferredCategories, category]
      };
    });
  };

  const handleNotificationToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [type]: !prev.notificationSettings[type]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateUserPreferences(preferences);
      toast.success('Preferences updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (err) {
      toast.error(`Error updating preferences: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      console.error('Error updating preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h1>
          <p className="text-gray-600">
            Customize your news feed and notification settings.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Preferred Categories</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select the categories of news you're interested in. These will be prioritized in your feed.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableCategories.map(category => (
                    <div key={category} className="relative">
                      <input
                        id={`category-${category}`}
                        name={`category-${category}`}
                        type="checkbox"
                        className="sr-only"
                        checked={preferences.preferredCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className={`flex justify-center px-4 py-3 border rounded-md text-sm font-medium capitalize cursor-pointer transition-colors ${
                          preferences.preferredCategories.includes(category)
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Choose which notifications you want to receive.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="comments"
                        name="comments"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={preferences.notificationSettings.comments}
                        onChange={() => handleNotificationToggle('comments')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="comments" className="font-medium text-gray-700">Comment notifications</label>
                      <p className="text-gray-500">Receive notifications when someone comments on an article you've interacted with.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="reactions"
                        name="reactions"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={preferences.notificationSettings.reactions}
                        onChange={() => handleNotificationToggle('reactions')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="reactions" className="font-medium text-gray-700">Reaction notifications</label>
                      <p className="text-gray-500">Receive notifications about likes and other reactions on your comments.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="recommendations"
                        name="recommendations"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={preferences.notificationSettings.recommendations}
                        onChange={() => handleNotificationToggle('recommendations')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="recommendations" className="font-medium text-gray-700">Recommendation notifications</label>
                      <p className="text-gray-500">Receive notifications about articles we think you might be interested in.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 text-right">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer/>

      <AIChatbot darkMode={false}/>
    </div>
  );
};

export default UserPreferences;