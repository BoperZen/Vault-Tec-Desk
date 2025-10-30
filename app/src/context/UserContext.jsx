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
  // Usuario Admin por defecto (para testing)
  const [currentUser, setCurrentUser] = useState({
    idUser: 1,
    username: 'Admin',
    email: 'admin@vaulttec.com',
    idRol: 1, // 1: Admin, 2: Cliente, 3: Técnico
    roleName: 'Administrador'
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
