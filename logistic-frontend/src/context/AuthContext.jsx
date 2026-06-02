import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const Đong_Bo_User_Data = (savedUserInfo, token) => {
    try {
      const decoded = jwtDecode(token); 
      return {
        ...savedUserInfo,
        id: decoded.id,     
        role: decoded.role, 
        sub: decoded.sub
      };
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      return savedUserInfo;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('userInfo');
    
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(Đong_Bo_User_Data(parsedUser, token));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    localStorage.setItem('userInfo', JSON.stringify(userData));

    const fullUserData = Đong_Bo_User_Data(userData, userData.accessToken);
    setUser(fullUserData);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};