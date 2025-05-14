import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../services/auth';
import { getNotifications } from '../services/api';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const admin = isAdmin();

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const data = await getNotifications();
  //       setNotifications(data);
  //     } catch (error) {
  //       console.error('Failed to fetch notifications:', error);
  //     }
  //   };

  //   fetchNotifications();
  //   // Set up a polling mechanism to check for new notifications
  //   const interval = setInterval(fetchNotifications, 60000); // Check every minute
    
  //   return () => clearInterval(interval);
  // }, []);
  
  const unreadCount = notifications.filter(notification => !notification.readStatus).length;

  return (
    <nav className="bg-gray-900 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-white mr-1">News</span>
                <span className="text-xl font-bold text-blue-400">Aggregator</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  location.pathname === '/dashboard' 
                    ? 'border-blue-400 text-white' 
                    : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                } transition-all duration-200 inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/recommendations"
                className={`${
                  location.pathname === '/recommendations' 
                    ? 'border-blue-400 text-white' 
                    : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                } transition-all duration-200 inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium`}
              >
                Recommendations
              </Link>
              
              <Link
                to="/bookmarks"
                className={`${
                  location.pathname === '/bookmarks' 
                    ? 'border-blue-400 text-white' 
                    : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                } transition-all duration-200 inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium`}
              >
                Bookmarks
              </Link>
              
              <Link
                to="/notes"
                className={`${
                  location.pathname === '/notes' 
                    ? 'border-blue-400 text-white' 
                    : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                } transition-all duration-200 inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium`}
              >
                Notes
              </Link>
              
              <Link
                to="/preferences"
                className={`${
                  location.pathname === '/preferences' 
                    ? 'border-blue-400 text-white' 
                    : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                } transition-all duration-200 inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium`}
              >
                Preferences
              </Link>
              
              {admin && (
                <Link
                  to="/admin"
                  className={`${
                    location.pathname === '/admin' 
                      ? 'border-blue-400 text-white' 
                      : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
                  } transition-all duration-200 inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium`}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-300 hover:text-white focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-800"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs animate-pulse shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 z-20 mt-3 w-80 bg-white rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden max-h-96 transform transition-all duration-200 origin-top-right">
                  <div className="px-4 py-3 text-sm font-medium text-gray-700 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold rounded-full px-2 py-1">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto max-h-64">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.notificationId} 
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-l-4 ${!notification.readStatus ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
                          onClick={() => {
                          }}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                      <Link 
                        to="/notifications" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center transition-colors duration-150"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-white font-medium text-sm shadow-inner">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {currentUser?.role || `User`}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden bg-gray-800 shadow-lg transform transition-all ease-in-out duration-200 absolute w-full z-10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`${
                location.pathname === '/dashboard' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-all duration-150 block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link
              to="/recommendations"
              className={`${
                location.pathname === '/recommendations' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-all duration-150 block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Recommendations
            </Link>
            
            <Link
              to="/bookmarks"
              className={`${
                location.pathname === '/bookmarks' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-all duration-150 block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Bookmarks
            </Link>
            
            <Link
              to="/notes"
              className={`${
                location.pathname === '/notes' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-all duration-150 block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Notes
            </Link>
            
            <Link
              to="/preferences"
              className={`${
                location.pathname === '/preferences' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-all duration-150 block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Preferences
            </Link>
            
            {admin && (
              <Link
                to="/admin"
                className={`${
                  location.pathname === '/admin' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-all duration-150 block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-white font-medium text-sm shadow-inner">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{currentUser?.role || `User`}</div>
                  <div className="text-sm font-medium leading-none text-gray-400 mt-1">{currentUser?.email || ''}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-auto px-3 py-1 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;