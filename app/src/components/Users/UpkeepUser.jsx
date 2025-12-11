import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User,
  Mail,
  Lock,
  Shield,
  Wrench,
  UserCircle,
  Save,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import UserService from '@/services/UserService';
import { useNotification } from '@/context/NotificationContext';

/**
 * Componente para crear y editar usuarios
 */
export default function UpkeepUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    idRol: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [roleAccordionOpen, setRoleAccordionOpen] = useState(false);

  const roles = [
    { id: '1', nameKey: 'users.roles.technician', icon: Wrench, color: 'text-blue-500', bgColor: 'bg-blue-500' },
    { id: '2', nameKey: 'users.roles.client', icon: UserCircle, color: 'text-green-500', bgColor: 'bg-green-500' },
    { id: '3', nameKey: 'users.roles.admin', icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  ];

  useEffect(() => {
    if (id && isEditing) {
      loadUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUserById(id);
      const user = response.data?.data || response.data;
      
      if (user) {
        setFormData({
          Username: user.Username || '',
          Email: user.Email || '',
          Password: '',
          ConfirmPassword: '',
          idRol: user.idRol?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err);
      setError(t('users.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    if (error) setError(null);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.Username.trim()) {
      errors.Username = t('users.validation.usernameRequired');
    } else if (formData.Username.trim().length < 3) {
      errors.Username = t('users.validation.usernameTooShort');
    }

    if (!formData.Email.trim()) {
      errors.Email = t('users.validation.emailRequired');
    } else if (!isValidEmail(formData.Email)) {
      errors.Email = t('users.validation.invalidEmail');
    }

    if (!isEditing) {
      if (!formData.Password) {
        errors.Password = t('users.validation.passwordRequired');
      } else if (formData.Password.length < 6) {
        errors.Password = t('users.validation.passwordTooShort');
      }

      if (!formData.ConfirmPassword) {
        errors.ConfirmPassword = t('users.validation.passwordRequired');
      } else if (formData.Password !== formData.ConfirmPassword) {
        errors.ConfirmPassword = t('users.validation.passwordMismatch');
      }
    }

    if (!formData.idRol) {
      errors.idRol = t('users.validation.roleRequired');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      let result;
      
      if (isEditing) {
        const updateData = {
          Username: formData.Username.trim(),
          Email: formData.Email.trim(),
          idRol: parseInt(formData.idRol),
        };
        const response = await UserService.updateUser(id, updateData);
        result = response.data?.data || response.data;
      } else {
        const createData = {
          Username: formData.Username.trim(),
          Email: formData.Email.trim(),
          Password: formData.Password,
          idRol: parseInt(formData.idRol),
        };
        const response = await UserService.createUser(createData);
        result = response.data?.data || response.data;
      }

      if (result.success) {
        showNotification(
          isEditing ? t('users.messages.updateSuccess') : t('users.messages.createSuccess'),
          'success'
        );
        navigate('/users');
      } else {
        if (result.message === 'emailExists') {
          setFieldErrors({ Email: t('users.validation.emailExists') });
        } else if (result.message === 'usernameExists') {
          setFieldErrors({ Username: t('users.validation.usernameExists') });
        } else {
          setError(t('users.messages.saveError'));
        }
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(t('users.messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/users');

  const getSelectedRole = () => roles.find(r => r.id === formData.idRol);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {isEditing ? t('users.editUser') : t('users.createUser')}
              </CardTitle>
              <CardDescription>
                {isEditing ? t('users.editUserSubtitle') : t('users.createUserSubtitle')}
              </CardDescription>
            </div>
            <Badge variant={isEditing ? 'secondary' : 'default'}>
              {isEditing ? t('common.edit') : t('common.new')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('users.fields.username')}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  placeholder={t('users.placeholders.username')}
                  value={formData.Username}
                  onChange={(e) => handleInputChange('Username', e.target.value.slice(0, 30))}
                  disabled={saving}
                  maxLength={30}
                  className={`w-full px-3 py-2 text-base border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                    fieldErrors.Username ? 'border-destructive' : 'border-input'
                  }`}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.Username.length}/30
                </div>
              </div>
              {fieldErrors.Username && (
                <p className="text-sm text-destructive">{fieldErrors.Username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('users.fields.email')}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder={t('users.placeholders.email')}
                  value={formData.Email}
                  onChange={(e) => handleInputChange('Email', e.target.value.slice(0, 50))}
                  disabled={saving}
                  maxLength={50}
                  className={`w-full px-3 py-2 text-base border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                    fieldErrors.Email ? 'border-destructive' : 'border-input'
                  }`}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.Email.length}/50
                </div>
              </div>
              {fieldErrors.Email && (
                <p className="text-sm text-destructive">{fieldErrors.Email}</p>
              )}
            </div>

            <Separator />

            {/* Password - Solo al crear */}
            {!isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('users.fields.password')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder={t('users.placeholders.password')}
                      value={formData.Password}
                      onChange={(e) => handleInputChange('Password', e.target.value)}
                      disabled={saving}
                      className={`w-full px-3 py-2 pr-10 text-base border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                        fieldErrors.Password ? 'border-destructive' : 'border-input'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.Password && (
                    <p className="text-sm text-destructive">{fieldErrors.Password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('users.fields.confirmPassword')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder={t('users.placeholders.confirmPassword')}
                      value={formData.ConfirmPassword}
                      onChange={(e) => handleInputChange('ConfirmPassword', e.target.value)}
                      disabled={saving}
                      className={`w-full px-3 py-2 pr-10 text-base border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                        fieldErrors.ConfirmPassword ? 'border-destructive' : 'border-input'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.ConfirmPassword && (
                    <p className="text-sm text-destructive">{fieldErrors.ConfirmPassword}</p>
                  )}
                </div>

                <Separator />
              </>
            )}

            {/* Rol - Estilo acordeón */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('users.fields.role')}
                <span className="text-red-500">*</span>
              </Label>
              
              <div className="space-y-3">
                <div className={`border rounded-md overflow-hidden transition-all duration-300 ${fieldErrors.idRol ? 'border-destructive' : ''}`}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer disabled:cursor-not-allowed border border-accent/30"
                    onClick={() => setRoleAccordionOpen(!roleAccordionOpen)}
                    disabled={saving}
                  >
                    <span className="text-sm font-medium">
                      {formData.idRol 
                        ? t(getSelectedRole()?.nameKey)
                        : t('users.placeholders.role')
                      }
                    </span>
                    <span className="text-xs">{roleAccordionOpen ? '▲' : '▼'}</span>
                  </button>
                  
                  {roleAccordionOpen && (
                    <div className="border-t p-2 space-y-1">
                      {roles.map((role) => {
                        const RoleIcon = role.icon;
                        const isSelected = formData.idRol === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded transition-colors text-sm flex items-center gap-2 ${
                              isSelected 
                                ? 'bg-accent text-accent-foreground' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                            } cursor-pointer`}
                            onClick={() => {
                              handleInputChange('idRol', role.id);
                              setRoleAccordionOpen(false);
                            }}
                          >
                            <RoleIcon className={`h-4 w-4 ${role.color}`} />
                            {t(role.nameKey)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {formData.idRol && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    {(() => {
                      const role = getSelectedRole();
                      if (!role) return null;
                      const RoleIcon = role.icon;
                      return (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${role.bgColor} text-white cursor-default`}>
                          <RoleIcon className="w-4 h-4 text-white/90" />
                          <div className="flex flex-col">
                            <span className="text-xs text-white/70">{t('users.fields.role')}</span>
                            <span className="leading-none">{t(role.nameKey)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              {fieldErrors.idRol && (
                <p className="text-sm text-destructive">{fieldErrors.idRol}</p>
              )}
            </div>

            {isEditing && (
              <>
                <Separator />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('users.passwordEditNote')}
                  </AlertDescription>
                </Alert>
              </>
            )}

            <Separator />

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? t('common.save') : t('users.createUser')}
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
