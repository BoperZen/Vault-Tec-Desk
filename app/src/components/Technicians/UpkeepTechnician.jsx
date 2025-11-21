import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User,
  Briefcase,
  Save,
  X,
  Loader2,
  AlertCircle,
  Mail,
  Key,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import TechnicianService from '@/services/TechnicianService';
import SpecialtyService from '@/services/SpecialtyService';

/**
 * Componente para crear y editar técnicos
 * Formulario completo de mantenimiento de técnicos
 */
export default function UpkeepTechnician() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Datos disponibles
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  
  // Estados de popover
  const [specialtiesPopoverOpen, setSpecialtiesPopoverOpen] = useState(false);

  // Estilos de avatar disponibles
  const avatarStyles = [
    { id: 'avataaars', name: 'Avatar 1' },
    { id: 'bottts', name: 'Avatar 2' },
    { id: 'personas', name: 'Avatar 3' },
    { id: 'lorelei', name: 'Avatar 4' },
    { id: 'adventurer', name: 'Avatar 5' },
    { id: 'pixel-art', name: 'Avatar 6' },
    { id: 'micah', name: 'Avatar 7' },
    { id: 'miniavs', name: 'Avatar 8' },
  ];

  // Datos del formulario
  const [formData, setFormData] = useState({
    idTechnician: '',
    Username: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    selectedSpecialties: [], // Array de nombres de especialidades
    avatarStyle: 'avataaars', // Estilo de avatar por defecto
    avatarSeed: Math.random().toString(36).substring(7), // Seed aleatorio del avatar
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar especialidades disponibles
      const specialtiesRes = await SpecialtyService.getSpecialties();
      const specialtiesData = specialtiesRes.data?.data || specialtiesRes.data || [];
      setAvailableSpecialties(specialtiesData);

      // Si estamos editando, cargar el técnico
      if (isEditing) {
        const technicianRes = await TechnicianService.getTechnicianById(id);
        const technician = technicianRes.data?.data || technicianRes.data;
        
        if (technician) {
          // Convertir IDs de especialidades a nombres
          const selectedSpecialtyNames = [];
          if (technician.SpecialtyIds && Array.isArray(technician.SpecialtyIds)) {
            technician.SpecialtyIds.forEach((id) => {
              const specialty = specialtiesData.find(s => s.idSpecialty === id);
              if (specialty) {
                selectedSpecialtyNames.push(specialty.Description);
              }
            });
          }

          setFormData({
            idTechnician: technician.idTechnician,
            Username: technician.Username || '',
            Email: technician.Email || '',
            Password: '',
            ConfirmPassword: '',
            selectedSpecialties: selectedSpecialtyNames,
            avatarStyle: technician.AvatarStyle || 'avataaars',
            avatarSeed: technician.AvatarSeed || Math.random().toString(36).substring(7),
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos del formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleSelectSpecialty = (specialty) => {
    if (!formData.selectedSpecialties.includes(specialty.Description)) {
      setFormData(prev => ({
        ...prev,
        selectedSpecialties: [...prev.selectedSpecialties, specialty.Description] // Múltiples especialidades
      }));
    }
    setSpecialtiesPopoverOpen(false);
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.filter(s => s !== specialty)
    }));
  };

  const getAvailableSpecialtiesFiltered = () => {
    return availableSpecialties.filter(specialty => 
      !formData.selectedSpecialties.includes(specialty.Description)
    );
  };

  const validateForm = () => {
    // Validar nombre de usuario
    if (!formData.Username.trim()) {
      setError('El nombre de usuario es obligatorio');
      return false;
    }

    if (formData.Username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    // Validar email
    if (!formData.Email.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setError('El correo electrónico no es válido');
      return false;
    }

    // Validar especialidades
    if (!formData.selectedSpecialties || formData.selectedSpecialties.length === 0) {
      setError('Debe seleccionar al menos una especialidad');
      return false;
    }
    
    // Validar contraseña solo si no estamos editando o si se está cambiando
    if (!isEditing || formData.Password) {
      if (!formData.Password) {
        setError('La contraseña es obligatoria');
        return false;
      }

      if (formData.Password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      // Validar confirmación de contraseña
      if (!formData.ConfirmPassword) {
        setError('Debe confirmar la contraseña');
        return false;
      }

      if (formData.Password !== formData.ConfirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Convertir nombres de specialties a IDs
      const specialtyIds = formData.selectedSpecialties.map(specialtyName => {
        const specialty = availableSpecialties.find(s => s.Description === specialtyName);
        return specialty ? specialty.idSpecialty : null;
      }).filter(id => id !== null);

      if (specialtyIds.length === 0) {
        setError('Especialidades no válidas');
        setSaving(false);
        return;
      }

      const technicianData = {
        Username: formData.Username.trim(),
        Email: formData.Email.trim(),
        avatarStyle: formData.avatarStyle,
        avatarSeed: formData.avatarSeed,
        specialties: specialtyIds,
      };

      // Solo incluir contraseña si se está creando o si se cambió en edición
      if (!isEditing || formData.Password) {
        technicianData.Password = formData.Password;
      }

      if (isEditing) {
        technicianData.idTechnician = parseInt(formData.idTechnician);
        await TechnicianService.updateTechnician(technicianData);
        navigate('/technicians', { state: { notification: { message: 'Técnico actualizado correctamente', type: 'success' } } });
      } else {
        await TechnicianService.createTechnician(technicianData);
        navigate('/technicians', { state: { notification: { message: 'Técnico creado correctamente', type: 'success' } } });
      }
    } catch (err) {
      console.error('Error al guardar técnico:', err);
      setError(err.response?.data?.message || 'Error al guardar el técnico');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/technicians');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {isEditing ? 'Editar Técnico' : 'Crear Nuevo Técnico'}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Actualiza la información del técnico existente'
                  : 'Complete el formulario para registrar un nuevo técnico en el sistema'
                }
              </CardDescription>
            </div>
            <Badge variant={isEditing ? "secondary" : "default"}>
              {isEditing ? `ID: ${id}` : 'Nuevo'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensajes de error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nombre de Usuario */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre de Usuario
                <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                id="username"
                placeholder="Nombre del técnico"
                value={formData.Username}
                onChange={(e) => handleInputChange('Username', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
                <span className="text-red-500">*</span>
              </Label>
              <input
                type="email"
                id="email"
                placeholder="correo@ejemplo.com"
                value={formData.Email}
                onChange={(e) => handleInputChange('Email', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Selección de Avatar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Estilo de Avatar
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-xs"
                  onClick={() => {
                    const newSeed = Math.random().toString(36).substring(7);
                    handleInputChange('avatarSeed', newSeed);
                  }}
                  disabled={saving}
                >
                  <RefreshCw className="h-3 w-3" />
                  Actualizar
                </Button>
              </div>
              <div className="flex gap-3 items-center flex-wrap justify-center">
                {avatarStyles.map((style) => (
                  <Badge
                    key={style.id}
                    variant="outline"
                    className={`cursor-pointer transition-all p-1 ${
                      formData.avatarStyle === style.id
                        ? 'ring-2 ring-primary bg-primary/10 border-primary'
                        : 'hover:bg-accent/10 border-border'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !saving && handleInputChange('avatarStyle', style.id)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${formData.avatarSeed}`} 
                      />
                      {/* <AvatarFallback className="bg-accent/10 text-accent text-sm font-bold">
                        {formData.Username ? formData.Username.substring(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback> */}
                    </Avatar>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Especialidades */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Especialidades Requeridas
                <span className="text-red-500">*</span>
              </Label>
              
              <div className="flex flex-col gap-2">
                {formData.selectedSpecialties.map((specialty, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-accent/5 to-transparent border border-accent/20 cursor-pointer hover:bg-accent/10"
                    onClick={() => handleRemoveSpecialty(specialty)}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-sm font-medium flex-1">{specialty}</span>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
                {/* Botón para agregar especialidad */}
                <div className="relative">
                  <Popover open={specialtiesPopoverOpen} onOpenChange={setSpecialtiesPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full bg-accent hover:bg-accent/80"
                        disabled={saving || getAvailableSpecialtiesFiltered().length === 0}
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Especialidad
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="center" side="bottom" sideOffset={4}>
                      <div className="max-h-64 overflow-y-auto p-1">
                        <div className="space-y-1">
                          {getAvailableSpecialtiesFiltered().map((specialty) => (
                            <button
                              key={specialty.idSpecialty}
                              type="button"
                              onClick={() => handleSelectSpecialty(specialty)}
                              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                            >
                              {specialty.Description}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                {!isEditing && <span className="text-red-500">*</span>}
              </Label>
              <input
                type="password"
                id="password"
                placeholder={isEditing ? 'Dejar en blanco para mantener actual' : 'Mínimo 6 caracteres'}
                value={formData.Password}
                onChange={(e) => handleInputChange('Password', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Confirmar Contraseña */}
            {(!isEditing || formData.Password) && (
              <div className="space-y-2">
                <Label htmlFor="confirmpassword" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Confirmar Contraseña
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  type="password"
                  id="confirmpassword"
                  placeholder="Confirme la contraseña"
                  value={formData.ConfirmPassword}
                  onChange={(e) => handleInputChange('ConfirmPassword', e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>
            )}

            <Separator />

            {/* Botones de acción */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Técnico' : 'Crear Técnico'}
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
