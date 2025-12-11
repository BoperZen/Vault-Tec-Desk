import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, UserPlus, AlertCircle } from 'lucide-react';

/**
 * Panel de autenticación con dos estados: Login y Registro
 * Sigue la paleta de colores del sistema (primary/muted)
 */
export default function AuthPanel() {
  const { t } = useTranslation();
  const { login, register } = useUser();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado del formulario de login
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: ''
  });
  
  // Estado del formulario de registro
  const [registerForm, setRegisterForm] = useState({
    Username: '',
    Email: '',
    Password: '',
    confirmPassword: ''
  });

  /**
   * Manejar cambios en el formulario de login
   */
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  /**
   * Manejar cambios en el formulario de registro
   */
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  /**
   * Obtener mensaje de error traducido según el tipo de identificador
   * Por seguridad, no revelamos si el usuario existe o no
   */
  const getLoginErrorMessage = (errorCode, identifierType) => {
    // Mensaje genérico por seguridad - no revelar si el usuario existe
    if (errorCode === 'userNotFound' || errorCode === 'wrongPassword') {
      return identifierType === 'email'
        ? t('auth.errors.wrongPasswordEmail')
        : t('auth.errors.wrongPasswordUsername');
    }
    return t('auth.errors.loginFailed');
  };

  /**
   * Enviar formulario de login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginForm.identifier || !loginForm.password) {
      setError(t('auth.errors.requiredFields'));
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(loginForm);
      
      if (!result.success) {
        // Usar mensaje genérico por seguridad
        const errorMessage = getLoginErrorMessage(result.errorCode, result.identifierType);
        setError(errorMessage);
      }
      // Si es exitoso, el contexto redirigirá automáticamente
    } catch (err) {
      console.error('Login catch error:', err); // DEBUG
      setError(t('auth.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enviar formulario de registro
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (!registerForm.Username || !registerForm.Email || !registerForm.Password) {
      setError(t('auth.errors.requiredFields'));
      return;
    }
    
    if (registerForm.Password !== registerForm.confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }
    
    if (registerForm.Password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.Email)) {
      setError(t('auth.errors.invalidEmail'));
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({
        Username: registerForm.Username,
        Email: registerForm.Email,
        Password: registerForm.Password
      });
      
      if (!result.success) {
        setError(result.message || t('auth.errors.registerFailed'));
      }
    } catch {
      setError(t('auth.errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      <Card className="w-full max-w-md shadow-lg relative z-10">
        <CardHeader className="text-center pb-2">
          {/* Logo Vault-Tec desde SVG */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 flex items-center justify-center">
              <img 
                src="/vault-tec-logo.svg" 
                alt="Vault-Tec Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Vault-Tec Desk
          </CardTitle>
          <CardDescription>
            {t('auth.welcomeMessage')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('auth.register')}
              </TabsTrigger>
            </TabsList>
            
            {/* Mensaje de error */}
            {error && (
              <Alert variant="destructive" className="mt-4 border-red-500 bg-red-50 dark:bg-red-950/50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 dark:text-red-400 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Tab de Login */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="flex items-center gap-2">
                    {t('auth.emailOrUsername')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder={t('auth.emailOrUsernamePlaceholder')}
                    value={loginForm.identifier}
                    onChange={handleLoginChange}
                    className="bg-background border-input focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2">
                    {t('auth.password')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className="bg-background border-input focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('auth.loginButton')}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Tab de Registro */}
            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="Username" className="flex items-center gap-2">
                    {t('auth.username')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Username"
                    name="Username"
                    type="text"
                    placeholder={t('auth.usernamePlaceholder')}
                    value={registerForm.Username}
                    onChange={handleRegisterChange}
                    className="bg-background border-input focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="Email" className="flex items-center gap-2">
                    {t('auth.email')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Email"
                    name="Email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={registerForm.Email}
                    onChange={handleRegisterChange}
                    className="bg-background border-input focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="flex items-center gap-2">
                    {t('auth.password')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-password"
                    name="Password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={registerForm.Password}
                    onChange={handleRegisterChange}
                    className="bg-background border-input focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    {t('auth.confirmPassword')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    className="bg-background border-input focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('auth.registerButton')}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              {t('auth.termsNotice')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
