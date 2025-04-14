export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const isAdmin = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.role === 'admin';
    } catch (error) {
      return false;
    }
  };