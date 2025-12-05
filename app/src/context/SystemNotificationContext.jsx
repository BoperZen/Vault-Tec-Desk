import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import NotificationService from '@/services/NotificationService';
import { useUser } from './UserContext';

const SystemNotificationContext = createContext();

export const useSystemNotifications = () => {
  const context = useContext(SystemNotificationContext);
  if (!context) {
    throw new Error('useSystemNotifications must be used within a SystemNotificationProvider');
  }
  return context;
};

// Estados de lectura (de la tabla state)
const STATE_READ = 6;    // Leído
const STATE_UNREAD = 7;  // Sin leer

export const SystemNotificationProvider = ({ children }) => {
  const { currentUser } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // Cargar notificaciones del usuario actual
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.idUser) return;

    try {
      setIsLoading(true);
      const response = await NotificationService.getAll(currentUser.idUser);
      console.log('Notifications response:', response);
      // La respuesta puede venir como response.data.data o response.data directamente
      const data = response.data?.data || response.data || [];
      const notifs = Array.isArray(data) ? data : [];
      console.log('Parsed notifications:', notifs);
      setNotifications(notifs);
      // Calcular unread count desde los datos (comparar como number)
      setUnreadCount(notifs.filter(n => parseInt(n.idState) === STATE_UNREAD).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.idUser]);

  // Marcar una notificación como leída
  const markAsRead = useCallback(async (idNotification) => {
    try {
      await NotificationService.markAsRead(idNotification);
      setNotifications(prev => 
        prev.map(n => 
          n.idNotification === idNotification 
            ? { ...n, idState: STATE_READ } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.idUser) return;

    try {
      await NotificationService.markAllAsRead(currentUser.idUser);
      setNotifications(prev => prev.map(n => ({ ...n, idState: STATE_READ })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [currentUser?.idUser]);

  // Cargar al inicio y cuando cambie el usuario
  useEffect(() => {
    if (currentUser?.idUser) {
      fetchNotifications();
    }
  }, [currentUser?.idUser, fetchNotifications]);

  // Polling cada 30 segundos (solo si está habilitado)
  useEffect(() => {
    if (!currentUser?.idUser || !pollingEnabled) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser?.idUser, fetchNotifications, pollingEnabled]);

  return (
    <SystemNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
        setPollingEnabled,
      }}
    >
      {children}
    </SystemNotificationContext.Provider>
  );
};
