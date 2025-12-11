import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/context/UserContext';
import { useNotification } from '@/context/NotificationContext';
import { 
  User,
  Mail,
  Shield,
  Wrench,
  UserCircle,
  Loader2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UserService from '@/services/UserService';

/**
 * Página de perfil del usuario
 */
export default function ProfilePage() {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const { showNotification } = useNotification();

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Datos de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getRoleInfo = (idRol) => {
    const roles = {
      1: { nameKey: 'users.roles.technician', icon: Wrench, color: 'text-blue-500', bgColor: 'bg-blue-500' },
      2: { nameKey: 'users.roles.client', icon: UserCircle, color: 'text-green-500', bgColor: 'bg-green-500' },
      3: { nameKey: 'users.roles.admin', icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-500' },
    };
    return roles[idRol] || roles[2];
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      setPasswordError(t('profile.currentPasswordRequired'));
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError(t('users.validation.passwordRequired'));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError(t('users.validation.passwordTooShort'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('users.validation.passwordMismatch'));
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);

    try {
      const response = await UserService.changePassword({
        idUser: currentUser.idUser,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      const result = response.data?.data || response.data;

      if (result.success) {
        showNotification(t('profile.passwordChanged'), 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        if (result.message === 'wrongPassword') {
          setPasswordError(t('profile.wrongCurrentPassword'));
        } else {
          setPasswordError(t('profile.passwordChangeError'));
        }
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setPasswordError(t('profile.passwordChangeError'));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleInfo = getRoleInfo(currentUser.idRol);
  const RoleIcon = roleInfo.icon;
  const username = currentUser.Username || currentUser.username || 'Usuario';
  const email = currentUser.Email || currentUser.email || '';
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header con avatar y datos del usuario */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className={`${roleInfo.bgColor} text-white text-2xl`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{username}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {email}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${roleInfo.bgColor} text-white`}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {t(roleInfo.nameKey)}
                </Badge>
                {currentUser.LastSesion && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('profile.lastLogin')}: {new Date(currentUser.LastSesion).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('profile.changePassword')}</CardTitle>
              <CardDescription>{t('profile.changePasswordDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6">
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {/* Contraseña actual */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t('profile.currentPassword')}
              </Label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  disabled={savingPassword}
                  placeholder={t('profile.enterCurrentPassword')}
                  className="w-full px-3 py-2 pr-10 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Separator />

            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t('profile.newPassword')}
              </Label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  disabled={savingPassword}
                  placeholder={t('users.placeholders.password')}
                  className="w-full px-3 py-2 pr-10 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t('users.fields.confirmPassword')}
              </Label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmNewPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  disabled={savingPassword}
                  placeholder={t('users.placeholders.confirmPassword')}
                  className="w-full px-3 py-2 pr-10 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    {t('profile.changePassword')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
