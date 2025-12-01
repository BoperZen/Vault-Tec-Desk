import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import UserService from '@/services/UserService';
import TechnicianService from '@/services/TechnicianService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const configuredUserId = parseInt(import.meta.env.VITE_USER_ID);

  const fallbackUser = {
    idUser: configuredUserId || 0,
    username: import.meta.env.VITE_USER_NAME || 'Usuario',
    email: import.meta.env.VITE_USER_EMAIL || 'user@example.com',
    idRol: null,
    roleName: 'Cargando rol...'
  };

  const [currentUser, setCurrentUser] = useState(fallbackUser);
  const [isUserLoading, setIsUserLoading] = useState(!!configuredUserId);
  const [userError, setUserError] = useState(null);
  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [isTechnicianLoading, setIsTechnicianLoading] = useState(false);
  const [technicianError, setTechnicianError] = useState(null);

  const toNumberOrNull = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const mapApiUserToState = (apiUser) => {
    if (!apiUser) return fallbackUser;

    const normalizedIdUser = toNumberOrNull(apiUser.idUser) ?? fallbackUser.idUser;
    const normalizedRole =
      toNumberOrNull(apiUser.idRol ?? apiUser.rol?.idRol) ?? fallbackUser.idRol;

    return {
      idUser: normalizedIdUser,
      username: apiUser.Username ?? apiUser.username ?? fallbackUser.username,
      email: apiUser.Email ?? apiUser.email ?? fallbackUser.email,
      idRol: normalizedRole,
      roleName: apiUser.rol?.description ?? fallbackUser.roleName,
    };
  };

  const changeUser = (user) => {
    setCurrentUser(mapApiUserToState(user));
  };

  const fetchTechnicianProfile = useCallback(async (user) => {
    const isTechnicianUser = user && user.idRol === 1 && user.idUser;

    if (!isTechnicianUser) {
      setTechnicianProfile(null);
      setTechnicianError(null);
      setIsTechnicianLoading(false);
      return;
    }

    try {
      setIsTechnicianLoading(true);
      setTechnicianError(null);
      const response = await TechnicianService.getTechnicianByUser(user.idUser);
      setTechnicianProfile(response.data?.data ?? null);
    } catch (error) {
      console.error('Error al obtener el técnico actual:', error);
      setTechnicianError(error.message || 'No se pudo cargar la información del técnico');
      setTechnicianProfile(null);
    } finally {
      setIsTechnicianLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!configuredUserId) {
      setUserError('No se ha configurado VITE_USER_ID en el entorno.');
      setIsUserLoading(false);
      return;
    }

    try {
      setIsUserLoading(true);
      setUserError(null);
      const response = await UserService.getUserById(configuredUserId);
      const apiUser = response.data?.data;

      if (!apiUser) {
        throw new Error('Usuario no encontrado');
      }

      setCurrentUser(mapApiUserToState(apiUser));
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      setUserError(error.message || 'No se pudo cargar el usuario');
    } finally {
      setIsUserLoading(false);
    }
  }, [configuredUserId]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchTechnicianProfile(currentUser);
  }, [currentUser, fetchTechnicianProfile]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        changeUser,
        refreshUser: fetchCurrentUser,
        isUserLoading,
        userError,
        technicianProfile,
        isTechnicianLoading,
        technicianError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
