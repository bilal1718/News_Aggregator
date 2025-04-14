import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Something went wrong');
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return await response.json();
};

export const getArticles = () => fetchWithAuth('/articles');
export const getArticlesByCategory = (category) => fetchWithAuth(`/articles/${category}`);