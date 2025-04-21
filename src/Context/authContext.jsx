import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedToken && storedRole) {
  
      setUser({ role: storedRole, token: storedToken });
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('userRole', userData.role); 
    localStorage.setItem('token', token); 
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
