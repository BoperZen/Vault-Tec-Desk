import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/context/UserContext';
import { useRole } from '@/hooks/use-role';
import { useSystemNotifications } from '@/context/SystemNotificationContext';
import { 
  Ticket, 
  User, 
  FolderKanban, 
  MessageSquare,
  Image as ImageIcon,
  Star,
  Save,
  X,
  Loader2,
  AlertCircle,
  Upload,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import TicketService from '@/services/TicketService';
import CategoryService from '@/services/CategoryService';
import LabelService from '@/services/LabelService';
import { formatUtcToLocalDateTime } from '@/lib/utils';

const formatDateTimeForDB = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return formatDateTimeForDB(new Date());
  }

  const pad = (num) => String(num).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/**
 * Componente para crear tickets
 * Formulario completo de creación de tickets
 */
export default function UpkeepTicket() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { isAdmin, isClient, isLoadingRole } = useRole();
  const { refresh: refreshSystemNotifications } = useSystemNotifications();

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [labelAccordionOpen, setLabelAccordionOpen] = useState(false);

  // Datos para los selects
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);

  // Datos del formulario
  const [formData, setFormData] = useState({
    idTicket: '',
    Title: '',
    Description: '',
    CreationDate: formatDateTimeForDB(),
    idCategory: '',
    idState: '1', // Por defecto: Pendiente
    idLabel: '',
    Priority: '',
    idUser: '', // ID del usuario que crea el ticket
    Image: null,
    ImagePreview: null
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoadingRole) return;
    if (!isAdmin && !isClient) {
      navigate('/tickets');
    }
  }, [isAdmin, isClient, isLoadingRole, navigate]);

  // Detectar categoría y prioridad cuando se selecciona una etiqueta
  useEffect(() => {
    if (formData.idLabel && labels.length > 0 && categories.length > 0) {
      const selectedLabel = labels.find(l => l.idLabel == formData.idLabel);
      
      if (selectedLabel && selectedLabel.idCategory) {
        // Buscar la categoría completa para obtener su prioridad
        const category = categories.find(c => c.idCategory == selectedLabel.idCategory);
        
        // Establecer la categoría y su prioridad automáticamente
        setFormData(prev => ({
          ...prev,
          idCategory: selectedLabel.idCategory?.toString(),
          Priority: category?.idPriority?.toString() || ''
        }));
      }
    }
  }, [formData.idLabel, labels, categories]);

  /**
   * Carga las categorías, estados, etiquetas y el ticket si está editando
   */
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos para los selects con manejo individual de errores
      let categoriesData = [];
      let labelsData = [];

      try {
        const categoriesRes = await CategoryService.getCategories();
        categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      } catch (err) {
        console.error('Error cargando categorías:', err);
        throw new Error(t('tickets.errors.loadCategories'));
      }

      try {
        const labelsRes = await LabelService.getLabels();
        labelsData = labelsRes.data?.data || labelsRes.data || [];
      } catch (err) {
        console.error('Error cargando etiquetas:', err);
        throw new Error(t('tickets.errors.loadLabels'));
      }

      // Filtrar solo las 4 primeras categorías (principales)
      const mainCategories = categoriesData.slice(0, 4).map(c => c.idCategory);
      
      // Filtrar labels que pertenezcan a esas categorías y eliminar duplicados
      const uniqueLabels = new Map();
      labelsData.forEach(label => {
        if (mainCategories.includes(label.idCategory) && !uniqueLabels.has(label.idLabel)) {
          uniqueLabels.set(label.idLabel, label);
        }
      });

      setCategories(categoriesData);
      setLabels(Array.from(uniqueLabels.values()));
    } catch (err) {
      console.error('Error al cargar datos:', err);
      console.error('Detalle del error:', err.response || err.message);
      setError(err.message || t('tickets.errors.loadFormData'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleInputChange = (field, value) => {
    const processedValue = field === 'CreationDate' ? formatDateTimeForDB(value) : value;
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    // Limpiar mensajes al editar
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  /**
   * Maneja la carga de imágenes
   */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError(t('tickets.errors.invalidImage'));
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('tickets.errors.imageTooLarge'));
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          Image: file,
          ImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Limpia la imagen seleccionada
   */
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      Image: null,
      ImagePreview: null
    }));
  };

  /**
   * Valida el formulario antes de enviar
   */
  const validateForm = () => {
    // Validar título
    if (!formData.Title.trim()) {
      setError(t('tickets.errors.titleRequired'));
      return false;
    }
    
    if (formData.Title.trim().length < 5) {
      setError(t('tickets.errors.titleMinLength'));
      return false;
    }

    // Validar descripción
    if (!formData.Description.trim()) {
      setError(t('tickets.errors.descriptionRequired'));
      return false;
    }
    
    if (formData.Description.trim().length < 10) {
      setError(t('tickets.errors.descriptionMinLength'));
      return false;
    }

    // Validar etiqueta
    if (!formData.idLabel) {
      setError(t('tickets.errors.labelRequired'));
      return false;
    }

    // Validar que se haya asignado categoría automáticamente
    if (!formData.idCategory) {
      setError(t('tickets.errors.categoryAutoAssign'));
      return false;
    }

    // Validar prioridad
    if (!formData.Priority) {
      setError(t('tickets.errors.priorityAutoAssign'));
      return false;
    }

    return true;
  };

  /**
   * Guarda el ticket (crear o actualizar)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Si hay imagen, usar FormData
      if (formData.Image) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.Title.trim());
        formDataToSend.append('Description', formData.Description.trim());
        formDataToSend.append('CreationDate', formatDateTimeForDB(formData.CreationDate));
        formDataToSend.append('idCategory', parseInt(formData.idCategory));
        formDataToSend.append('idState', parseInt(formData.idState));
        formDataToSend.append('Priority', parseInt(formData.Priority));
        formDataToSend.append('idUser', parseInt(currentUser.idUser));
        formDataToSend.append('image', formData.Image);

        await TicketService.createTicket(formDataToSend);
      } else {
        // Sin imagen, enviar JSON normal
        const ticketData = {
          title: formData.Title.trim(),
          Description: formData.Description.trim(),
          CreationDate: formatDateTimeForDB(formData.CreationDate),
          idCategory: parseInt(formData.idCategory),
          idState: parseInt(formData.idState),
          Priority: parseInt(formData.Priority),
          idUser: parseInt(currentUser.idUser),
        };

        await TicketService.createTicket(ticketData);
      }
      
      // Refrescar notificaciones del sistema inmediatamente
      refreshSystemNotifications();
      
      navigate('/tickets', { state: { notification: { message: t('tickets.createSuccess'), type: 'success' } } });

    } catch (err) {
      console.error('Error al guardar ticket:', err);
      setError(err.response?.data?.message || t('tickets.errors.saveTicket'));
      setSaving(false); // Solo resetear si hay error
    }
  };

  /**
   * Cancela y vuelve a la lista
   */
  const handleCancel = () => {
    navigate('/tickets');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">{t('tickets.loadingForm')}</p>
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
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {t('tickets.createNewTicket')}
              </CardTitle>
              <CardDescription>
                {t('tickets.createNewTicketDescription')}
              </CardDescription>
            </div>
            <Badge variant="default">
              {t('common.new')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensajes de error y éxito */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('tickets.fields.ticketTitle')}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  placeholder={t('tickets.placeholders.ticketTitle')}
                  value={formData.Title}
                  onChange={(e) => handleInputChange('Title', e.target.value.slice(0, 45))}
                  disabled={saving}
                  maxLength={45}
                  className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.Title.length}/45
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('tickets.fields.detailedDescription')}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <textarea
                  id="description"
                  placeholder={t('tickets.placeholders.describeProblem')}
                  value={formData.Description}
                  onChange={(e) => handleInputChange('Description', e.target.value.slice(0, 150))}
                  disabled={saving}
                  rows={5}
                  maxLength={150}
                  className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.Description.length}/150
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t('tickets.fields.relatedLabel')}
                <span className="text-red-500">*</span>
              </Label>
              
              <div className="space-y-3">
                <div className="border rounded-md overflow-hidden transition-all duration-300">
                  {/* Botón para abrir/cambiar etiqueta */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer disabled:cursor-not-allowed border border-accent/30"
                    onClick={() => setLabelAccordionOpen(!labelAccordionOpen)}
                    disabled={saving}
                  >
                    <span className="text-sm font-medium">
                      {formData.idLabel 
                        ? (() => {
                            const label = labels.find(l => l.idLabel == formData.idLabel);
                            return label?.Description || label?.LabelName || t('tickets.fields.selectedLabel');
                          })()
                        : t('tickets.fields.selectLabel')
                      }
                    </span>
                    <span className="text-xs">{labelAccordionOpen ? '▲' : '▼'}</span>
                  </button>
                  
                  {/* Lista de etiquetas - renderizada solo una vez */}
                  {labelAccordionOpen && (
                    <div className="border-t p-2 space-y-1 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-yellow-600/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-yellow-600/80" 
                      style={{ maxHeight: '250px', scrollbarWidth: 'thin', scrollbarColor: 'rgb(202 138 4 / 0.6) transparent' }}
                    >
                      {labels.map((label) => {
                        const displayName = label.Description || label.LabelName || `${t('tickets.fields.label')} ${label.idLabel}`;
                        const isSelected = formData.idLabel == label.idLabel;
                        return (
                          <button
                            key={`label-item-${label.idLabel}`}
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                              isSelected 
                                ? 'bg-accent text-accent-foreground' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                            } cursor-pointer disabled:cursor-not-allowed`}
                            onClick={() => {
                              handleInputChange('idLabel', label.idLabel?.toString());
                              setLabelAccordionOpen(false);
                            }}
                          >
                            {displayName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Categoría debajo cuando hay etiqueta seleccionada */}
                {formData.idLabel && formData.idCategory && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    {/* Category badge with icon */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium bg-slate-800 text-white cursor-default">
                      {/* Icon: folder/category */}
                      <FolderKanban className="w-4 h-4 text-white/90" aria-hidden="true" />

                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">{t('tickets.fields.category')}</span>
                        <span className="leading-none">{(() => {
                          const cat = categories.find(c => c.idCategory == formData.idCategory);
                          return cat?.Categoryname || t('tickets.fields.category');
                        })()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('tickets.fields.attachedImage')}
              </Label>
              
              {!formData.ImagePreview ? (
                <div className="flex items-center gap-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="text-base
                    cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button className="cursor-pointer disabled:cursor-not-allowed"
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={saving}
                    onClick={() => document.getElementById('image').click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={formData.ImagePreview}
                    alt="Preview"
                    className="max-w-sm h-auto rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {t('tickets.imageFormats')}
              </p>
            </div>

            <Separator />

            {/* Botones de acción y Fecha */}
            <div className="flex justify-between items-center">
              {/* Fecha de Creación */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatUtcToLocalDateTime(formData.CreationDate)}</span>
              </div>
              
              {/* Botones */}
              <div className="flex gap-3">
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
                    {t('tickets.createTicket')}
                  </>
                )}
              </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
