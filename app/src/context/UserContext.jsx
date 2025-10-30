import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Usuario configurado desde .env
  const [currentUser, setCurrentUser] = useState({
    idUser: parseInt(import.meta.env.VITE_USER_ID) || 5,
    username: import.meta.env.VITE_USER_NAME || 'Usuario',
    email: import.meta.env.VITE_USER_EMAIL || 'user@example.com',
    idRol: parseInt(import.meta.env.VITE_USER_ROLE) || 2, // 3: Admin, 2: Cliente, 1: Técnico
    roleName: import.meta.env.VITE_USER_ROLE_NAME || 'Usuario'
  });

  const changeUser = (user) => {
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider value={{ currentUser, changeUser }}>
      {children}
    </UserContext.Provider>
  );
};
