import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings,
  Languages,
  Bell,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/context/NotificationContext';

/**
 * Toggle switch personalizado
 */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/**
 * Página de configuración
 */
export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();

  // Estados
  const [language, setLanguage] = useState(i18n.language || 'es');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    ticketUpdates: true,
    assignments: true,
  });

  // Cargar configuración inicial
  useEffect(() => {
    // Ya no es necesario cargar tema
  }, []);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    showNotification(t('settings.languageChanged'), 'success');
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const languages = [
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Idioma */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('settings.language')}</CardTitle>
              <CardDescription>{t('settings.languageDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                    {lang.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('settings.notifications')}</CardTitle>
              <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.emailNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.emailNotificationsDesc')}</p>
            </div>
            <Toggle
              checked={notifications.email}
              onChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.pushNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.pushNotificationsDesc')}</p>
            </div>
            <Toggle
              checked={notifications.push}
              onChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.ticketUpdates')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.ticketUpdatesDesc')}</p>
            </div>
            <Toggle
              checked={notifications.ticketUpdates}
              onChange={(checked) => handleNotificationChange('ticketUpdates', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.assignmentNotifications')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.assignmentNotificationsDesc')}</p>
            </div>
            <Toggle
              checked={notifications.assignments}
              onChange={(checked) => handleNotificationChange('assignments', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
