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

export const addBookmark = (articleId) => fetchWithAuth('/bookmarks', {
  method: 'POST',
  body: JSON.stringify({ articleId }),
});

export const removeBookmark = (articleId) => fetchWithAuth(`/bookmarks/${articleId}`, {
  method: 'DELETE',
});

export const getUserBookmarks = () => fetchWithAuth('/bookmarks');

export const addComment = (articleId, content) => fetchWithAuth('/comments', {
  method: 'POST',
  body: JSON.stringify({ articleId, content }),
});

export const getArticleComments = (articleId) => fetchWithAuth(`/comments/${articleId}`);

export const addNote = (articleId, content) => fetchWithAuth('/notes', {
  method: 'POST',
  body: JSON.stringify({ articleId, content }),
});

export const getUserNotes = () => fetchWithAuth('/notes');

export const deleteNote = (noteId) => fetchWithAuth(`/notes/${noteId}`, {
  method: 'DELETE',
});

export const addReaction = (articleId, type) => fetchWithAuth('/reactions', {
  method: 'POST',
  body: JSON.stringify({ articleId, type }),
});

export const getArticleReactions = (articleId) => fetchWithAuth(`/reactions/${articleId}`);