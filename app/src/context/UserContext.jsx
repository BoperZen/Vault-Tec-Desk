import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import UserService from '@/services/UserService';
import TechnicianService from '@/services/TechnicianService';

const UserContext = createContext();

// Clave para localStorage
const AUTH_TOKEN_KEY = 'vault_tec_auth_token';
const AUTH_USER_KEY = 'vault_tec_auth_user';

// Backdoor: ID de usuario desde .env para desarrollo
const ENV_USER_ID = import.meta.env.VITE_USER_ID ? parseInt(import.meta.env.VITE_USER_ID) : null;

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  const fallbackUser = {
    idUser: 0,
    username: 'Usuario',
    email: 'user@example.com',
    idRol: null,
    roleName: 'Sin rol'
  };

  const [currentUser, setCurrentUser] = useState(fallbackUser);
  const [isUserLoading, setIsUserLoading] = useState(false);
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

  /**
   * Login de usuario
   * @param {object} credentials - { identifier, password }
   * @returns {object} - { success, message, errorCode, identifierType }
   */
  const login = async (credentials) => {
    try {
      // NO usar setAuthLoading aquí - el componente AuthPanel maneja su propio loading
      setUserError(null);
      
      const response = await UserService.login(credentials);
      // La API envuelve la respuesta en data, así que el resultado real está en response.data.data
      const apiResponse = response.data;
      const result = apiResponse.data || apiResponse; // Manejar ambos casos
      
      if (result.success) {
        // Guardar token y usuario
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
        
        setAuthToken(result.token);
        setCurrentUser(mapApiUserToState(result.data));
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        // Devolver código de error y tipo de identificador para mensajes específicos
        return { 
          success: false, 
          errorCode: result.message,
          identifierType: result.identifierType,
          message: result.message || apiResponse.message 
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      // Intentar extraer información de error del response
      const errorData = error.response?.data?.data || error.response?.data;
      return { 
        success: false, 
        errorCode: errorData?.message,
        identifierType: errorData?.identifierType,
        message: errorData?.message || 'Error al iniciar sesión'
      };
    }
    // NO hay finally con setAuthLoading - evita re-render que resetea el estado del AuthPanel
  };

  /**
   * Registro de nuevo usuario
   * @param {object} userData - { Username, Email, Password }
   * @returns {object} - { success, message }
   */
  const register = async (userData) => {
    try {
      setAuthLoading(true);
      setUserError(null);
      
      const response = await UserService.register(userData);
      // La API envuelve la respuesta en data
      const apiResponse = response.data;
      const result = apiResponse.data || apiResponse;
      
      if (result.success) {
        // Auto-login después del registro
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
        
        setAuthToken(result.token);
        setCurrentUser(mapApiUserToState(result.data));
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, message: result.message || apiResponse.message };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      const message = error.response?.data?.message || error.response?.data?.data?.message || 'Error al registrar usuario';
      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setAuthToken(null);
    setCurrentUser(fallbackUser);
    setIsAuthenticated(false);
    setTechnicianProfile(null);
  };

  /**
   * Verificar token almacenado al cargar la aplicación
   * También verifica el backdoor de VITE_USER_ID si no hay token
   */
  const verifyStoredAuth = useCallback(async () => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    
    // 1. Primero intentar con token almacenado (login normal)
    if (storedToken && storedUser && storedToken !== 'backdoor') {
      try {
        // Verificar token con el servidor
        const response = await UserService.verifyToken(storedToken);
        // La API envuelve la respuesta en data
        const apiResponse = response.data;
        const result = apiResponse.data || apiResponse;
        
        if (result.success) {
          setAuthToken(storedToken);
          setCurrentUser(mapApiUserToState(result.data));
          setIsAuthenticated(true);
          setAuthLoading(false);
          return;
        } else {
          // Token inválido, limpiar
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        // En caso de error de red, intentar usar datos almacenados
        try {
          const parsedUser = JSON.parse(storedUser);
          setAuthToken(storedToken);
          setCurrentUser(mapApiUserToState(parsedUser));
          setIsAuthenticated(true);
          setAuthLoading(false);
          return;
        } catch {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
    }
    
    // 2. Si no hay token válido, verificar backdoor de .env
    if (ENV_USER_ID && ENV_USER_ID > 0) {
      console.log('[Auth Backdoor] Usando VITE_USER_ID:', ENV_USER_ID);
      try {
        const response = await UserService.getUserById(ENV_USER_ID);
        const apiUser = response.data?.data;
        
        if (apiUser) {
          setCurrentUser(mapApiUserToState(apiUser));
          setIsAuthenticated(true);
          setAuthToken('backdoor'); // Marcador especial
          console.log('[Auth Backdoor] Usuario cargado:', apiUser.Username);
        }
      } catch (error) {
        console.error('[Auth Backdoor] Error al cargar usuario:', error);
      }
    }
    
    setAuthLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const refreshUser = useCallback(async () => {
    if (!currentUser?.idUser || currentUser.idUser === 0) {
      return;
    }

    try {
      setIsUserLoading(true);
      setUserError(null);
      const response = await UserService.getUserById(currentUser.idUser);
      const apiUser = response.data?.data;

      if (apiUser) {
        setCurrentUser(mapApiUserToState(apiUser));
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      setUserError(error.message || 'No se pudo cargar el usuario');
    } finally {
      setIsUserLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.idUser]);

  // Verificar autenticación al montar
  useEffect(() => {
    verifyStoredAuth();
  }, [verifyStoredAuth]);

  // Cargar perfil de técnico cuando cambia el usuario
  useEffect(() => {
    if (isAuthenticated) {
      fetchTechnicianProfile(currentUser);
    }
  }, [currentUser, isAuthenticated, fetchTechnicianProfile]);

  return (
    <UserContext.Provider
      value={{
        // Autenticación
        isAuthenticated,
        authLoading,
        authToken,
        login,
        register,
        logout,
        // Usuario
        currentUser,
        changeUser,
        refreshUser,
        isUserLoading,
        userError,
        // Técnico
        technicianProfile,
        isTechnicianLoading,
        technicianError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
