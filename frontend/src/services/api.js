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

  return response.status === 204 ? null : await response.json();
};

// Articles
export const getArticleById = (id) => fetchWithAuth(`/articles/id/${id}`);
export const getArticles = () => fetchWithAuth('/articles/fetch');
export const getArticlesByCategory = (category) => fetchWithAuth(`/articles/${category}`);

// Bookmarks
export const addBookmark = (articleId) => fetchWithAuth('/bookmarks', {
  method: 'POST',
  body: JSON.stringify({ articleId }),
});

export const removeBookmark = (articleId) => fetchWithAuth(`/bookmarks/${articleId}`, {
  method: 'DELETE',
});

export const getUserBookmarks = () => fetchWithAuth('/bookmarks');

// Comments
export const addComment = (articleId, content) => fetchWithAuth('/comments', {
  method: 'POST',
  body: JSON.stringify({ articleId, content }),
});

export const getArticleComments = (articleId) => fetchWithAuth(`/comments/${articleId}`);

// Notes
export const addNote = (articleId, content) => fetchWithAuth('/notes', {
  method: 'POST',
  body: JSON.stringify({ articleId, content }),
});

export const getUserNotes = () => fetchWithAuth('/notes');

export const deleteNote = (noteId) => fetchWithAuth(`/notes/${noteId}`, {
  method: 'DELETE',
});

// Notifications
export const getNotifications = () => fetchWithAuth('/notifications');

export const markNotificationAsRead = (notificationId) => fetchWithAuth(`/notifications/${notificationId}/read`, {
  method: 'PATCH',
});

export const addReaction = (articleId, type) => fetchWithAuth('/reactions', {
  method: 'POST',
  body: JSON.stringify({ articleId, type }),
});

export const getArticleReactions = (articleId) => fetchWithAuth(`/reactions/${articleId}`);

export const createReport = (entityType, entityId, reportType, details) => fetchWithAuth('/reports', {
  method: 'POST',
  body: JSON.stringify({ entityType, entityId, reportType, details }),
});

export const getReports = () => fetchWithAuth('/reports');

export const updateReportStatus = (reportId, status) => fetchWithAuth(`/reports/${reportId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});

export const getUserPreferences = () => fetchWithAuth('/preferences');

export const updateUserPreferences = (preferences) => fetchWithAuth('/preferences', {
  method: 'PUT',
  body: JSON.stringify(preferences),
});


export const sendAIMessage = (message) => fetchWithAuth('/ai', {
  method: 'POST',
  body: JSON.stringify({ text: message }),
});

export const getRecommendedArticles = async (recommendations) => {
  try {
    const response = await fetchWithAuth('/recommendations/ai', {
      method: 'POST',
      body: JSON.stringify({ recommendations }),
    });
    
    console.log('API response for recommendations:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};



export const subscribeToNewsletter = (email) => fetch(`${API_URL}/newsletter/subscribe`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email }),
}).then(async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to subscribe');
  }
  return response.json();
});