import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import BookmarksPage from './pages/BookmarksPage';
import NotesPage from './pages/NotesPage';
import ArticleDetail from './pages/ArticleDetail';
import UserPreferences from './pages/UserPreferences';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from '../src/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/bookmarks" element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          } />
          
          <Route path="/notes" element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/article/:id" element={
            <ProtectedRoute>
              <ArticleDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/preferences" element={
            <ProtectedRoute>
              <UserPreferences />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;