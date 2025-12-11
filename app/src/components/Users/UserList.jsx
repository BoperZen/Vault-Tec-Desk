import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Shield,
  Wrench,
  UserCircle,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  KeyRound,
  Clock,
  Plus,
  Pencil,
  Eye,
  EyeOff,
} from 'lucide-react';
import UserService from '@/services/UserService';
import { useNotification } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Colores y iconos por rol
const getRoleInfo = (idRol) => {
  const roles = {
    1: { 
      nameKey: 'users.roles.technician',
      icon: Wrench, 
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      bgColor: 'bg-blue-500'
    },
    2: { 
      nameKey: 'users.roles.client',
      icon: UserCircle, 
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      bgColor: 'bg-green-500'
    },
    3: { 
      nameKey: 'users.roles.admin',
      icon: Shield, 
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      bgColor: 'bg-purple-500'
    },
  };
  return roles[idRol] || roles[2];
};

export default function UserList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states para restablecer contraseña
  const [resetDialog, setResetDialog] = useState({ open: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    let filtered = [...users];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.Username?.toLowerCase().includes(term) ||
        user.Email?.toLowerCase().includes(term)
      );
    }
    
    // Filtro por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.idRol === parseInt(roleFilter));
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers();
      
      if (response.data?.data) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(t('users.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetDialog.user || !newPassword) return;
    
    if (newPassword.length < 6) {
      showNotification(t('users.validation.passwordMinLength'), 'error');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await UserService.resetPassword(resetDialog.user.idUser, newPassword);
      const result = response.data?.data || response.data;
      
      if (result.success) {
        showNotification(t('users.messages.resetSuccess'), 'success');
        setResetDialog({ open: false, user: null });
        setNewPassword('');
      } else {
        showNotification(t('users.messages.resetError'), 'error');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      showNotification(t('users.messages.resetError'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="space-y-6 container mx-auto px-4">
        <div className="flex items-center justify-between mt-4">
          <div className="space-y-2">
            <div className="h-9 w-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-destructive">{error}</p>
          <Button onClick={loadUsers}>{t('common.refresh')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('users.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('users.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-4 py-2">
            {filteredUsers.length} {t('users.totalCount')}
          </Badge>
          <Button onClick={() => navigate('/users/create')} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('users.createUser')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">Clear</span>
              ×
            </button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t('users.filterByRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="1">{t('users.roles.technician')}</SelectItem>
            <SelectItem value="2">{t('users.roles.client')}</SelectItem>
            <SelectItem value="3">{t('users.roles.admin')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('users.noUsersFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const roleInfo = getRoleInfo(user.idRol);
            const RoleIcon = roleInfo.icon;
            const initials = user.Username?.substring(0, 2).toUpperCase() || 'U';

            return (
              <Card key={user.idUser} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`${roleInfo.bgColor} text-white`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-semibold">{user.Username}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[180px]">{user.Email}</span>
                        </div>
                        <Badge variant="outline" className={roleInfo.color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {t(roleInfo.nameKey)}
                        </Badge>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => navigate(`/users/edit/${user.idUser}`)}
                        title={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setResetDialog({ open: true, user })}
                        title={t('users.resetPassword')}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {user.LastSesion && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                      <Clock className="h-3 w-3" />
                      {t('users.lastSession')}: {new Date(user.LastSesion).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reset Password Dialog */}
      <Dialog 
        open={resetDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setResetDialog({ open: false, user: null });
            setNewPassword('');
            setShowPassword(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.resetPasswordTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.resetPasswordFor', { username: resetDialog.user?.Username })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('users.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('users.enterNewPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{t('users.validation.passwordMinLength')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setResetDialog({ open: false, user: null });
                setNewPassword('');
              }}
              disabled={actionLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={actionLoading || !newPassword}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t('users.changePassword')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
