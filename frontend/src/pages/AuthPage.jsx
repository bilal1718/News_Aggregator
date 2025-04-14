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
    return <Navigate to="/dashboard" />;
  }

};



export default AuthPage;