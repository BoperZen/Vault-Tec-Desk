import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

/**
 * Componente para crear y editar tickets
 * Formulario completo de mantenimiento de tickets
 */
export default function UpkeepTicket() {
  const navigate = useNavigate();
  const { id } = useParams(); // Si hay ID, estamos editando
  const isEditing = !!id;

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false); // Constante de estado para modo edición
  const [categoryAccordionOpen, setCategoryAccordionOpen] = useState(false);

  // Datos para los selects
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]); // Etiquetas filtradas por categoría

  // Datos del formulario
  const [formData, setFormData] = useState({
    idTicket: '',
    Title: '',
    Description: '',
    CreationDate: new Date().toISOString().slice(0, 16), // formato datetime-local
    idCategory: '',
    idState: '1', // Por defecto: Pendiente
    idLabel: '',
    idUser: '', // ID del usuario que crea el ticket
    Image: null,
    ImagePreview: null
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Filtrar etiquetas cuando cambia la categoría
  useEffect(() => {
    if (formData.idCategory && categories.length > 0) {
      const category = categories.find(c => c.idCategory == formData.idCategory);
      console.log('Categoría encontrada:', category);
      console.log('Labels de la categoría:', category?.Labels);
      
      if (category && category.Labels) {
        let labelsArray = [];
        
        // Si Labels es un string, parsearlo
        if (typeof category.Labels === 'string') {
          // Los labels vienen como string separados por coma
          const labelNames = category.Labels.split(',').map(l => l.trim());
          // Buscar los objetos completos de label en el array de todos los labels
          labelsArray = labels.filter(label => 
            labelNames.includes(label.Description || label.LabelName)
          );
          console.log('Labels como string parseados:', labelsArray);
        } else if (Array.isArray(category.Labels)) {
          labelsArray = category.Labels;
          console.log('Labels como array:', labelsArray);
        }
        
        setFilteredLabels(labelsArray);
        
        // Si la etiqueta actual no está en las filtradas, resetearla
        if (formData.idLabel && !labelsArray.some(l => l.idLabel == formData.idLabel)) {
          setFormData(prev => ({ ...prev, idLabel: '' }));
        }
      } else {
        console.log('No hay labels en la categoría');
        setFilteredLabels([]);
      }
    } else {
      setFilteredLabels([]);
    }
  }, [formData.idCategory, categories, labels, formData.idLabel]);

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
        console.log('Categorías response:', categoriesRes);
        categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
        console.log('Categorías procesadas:', categoriesData);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        throw new Error('No se pudieron cargar las categorías');
      }

      try {
        const labelsRes = await LabelService.getLabels();
        console.log('Labels response:', labelsRes);
        labelsData = labelsRes.data?.data || labelsRes.data || [];
      } catch (err) {
        console.error('Error cargando etiquetas:', err);
        throw new Error('No se pudieron cargar las etiquetas');
      }

      setCategories(categoriesData);
      setLabels(labelsData);

      console.log('Datos cargados:', { categoriesData, labelsData });
      console.log('Primera categoría completa:', categoriesData[0]);
      console.log('Propiedades de la primera categoría:', Object.keys(categoriesData[0] || {}));

      // Si estamos editando, cargar los datos del ticket
      if (isEditing) {
        const ticketRes = await TicketService.getTickets();
        const ticketsData = ticketRes.data?.data || ticketRes.data || [];
        const ticket = ticketsData.find(t => t.idTicket === parseInt(id));
        
        if (ticket) {
          setFormData({
            idTicket: ticket.idTicket,
            Title: ticket.Title || '',
            Description: ticket.Description || '',
            CreationDate: ticket.CreationDate ? 
              new Date(ticket.CreationDate).toISOString().slice(0, 16) : 
              new Date().toISOString().slice(0, 16),
            idCategory: ticket.idCategory || '',
            idState: '1', // Siempre Pendiente
            idLabel: ticket.idLabel || '',
            idUser: ticket.idUser || '',
            Image: null,
            ImagePreview: ticket.Image || null
          });
          setIsUpdate(true); // Activar modo actualización
          
          // Filtrar etiquetas de la categoría del ticket
          if (ticket.idCategory) {
            const categoryLabels = labelsData.filter(label => 
              label.idCategory === ticket.idCategory || 
              (categoriesData.find(c => c.idCategory === ticket.idCategory)?.Labels || []).some(l => l.idLabel === label.idLabel)
            );
            setFilteredLabels(categoryLabels);
          }
        } else {
          setError('Ticket no encontrado');
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      console.error('Detalle del error:', err.response || err.message);
      setError(err.message || 'Error al cargar los datos del formulario');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        setError('Por favor seleccione un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
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
    if (!formData.Title.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    if (!formData.Description.trim()) {
      setError('La descripción es obligatoria');
      return false;
    }
    if (!formData.idCategory) {
      setError('Debe seleccionar una categoría');
      return false;
    }
    if (!formData.idLabel) {
      setError('Debe seleccionar una etiqueta');
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
      // Preparar datos para enviar
      const ticketData = {
        Title: formData.Title.trim(),
        Description: formData.Description.trim(),
        CreationDate: formData.CreationDate,
        idCategory: parseInt(formData.idCategory),
        idState: parseInt(formData.idState),
        idLabel: parseInt(formData.idLabel),
        idUser: parseInt(formData.idUser) || 1, // TODO: Obtener del contexto de usuario
      };

      if (isUpdate) {
        ticketData.idTicket = parseInt(formData.idTicket);
        await TicketService.updateTicket(ticketData);
        setSuccess('Ticket actualizado correctamente');
      } else {
        await TicketService.createTicket(ticketData);
        setSuccess('Ticket creado correctamente');
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);

    } catch (err) {
      console.error('Error al guardar ticket:', err);
      setError(err.response?.data?.message || 'Error al guardar el ticket');
    } finally {
      setSaving(false);
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
          <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
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
                {isUpdate ? 'Editar Ticket' : 'Crear Nuevo Ticket'}
              </CardTitle>
              <CardDescription>
                {isUpdate 
                  ? 'Actualiza la información del ticket existente'
                  : 'Complete el formulario para registrar un nuevo ticket en el sistema'
                }
              </CardDescription>
            </div>
            <Badge variant={isUpdate ? "secondary" : "default"}>
              {isUpdate ? `ID: ${id}` : 'Nuevo'}
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
                Título del Ticket
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Error en sistema de pagos"
                value={formData.Title}
                onChange={(e) => handleInputChange('Title', e.target.value)}
                disabled={saving}
                className="text-base"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Descripción Detallada
                <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                placeholder="Describe el problema o solicitud con el mayor detalle posible..."
                value={formData.Description}
                onChange={(e) => handleInputChange('Description', e.target.value)}
                disabled={saving}
                rows={5}
                className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <Separator />

            {/* Categoría con Accordion */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Categoría
                <span className="text-red-500">*</span>
              </Label>
              
              <div className="space-y-3">
                <div className="border rounded-md overflow-hidden transition-all duration-300">
                  {!formData.idCategory ? (
                    <>
                      {/* Botón para abrir accordion */}
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                        onClick={() => setCategoryAccordionOpen(!categoryAccordionOpen)}
                        disabled={saving}
                      >
                        <span className="text-sm font-medium">Seleccionar categoría</span>
                        <span className="text-xs">{categoryAccordionOpen ? '▲' : '▼'}</span>
                      </button>
                      
                      {/* Lista de categorías */}
                      <div className={`transition-all duration-300 ease-in-out ${
                        categoryAccordionOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="border-t p-2 space-y-1 overflow-y-auto" style={{ maxHeight: '250px' }}>
                          {categories.map((category) => {
                            const displayName = category.Categoryname || category.CategoryName || `Categoría ${category.idCategory}`;
                            return (
                              <button
                                key={category.idCategory}
                                type="button"
                                className="w-full text-left px-3 py-2 rounded transition-colors text-sm hover:bg-slate-800 hover:text-white"
                                onClick={() => {
                                  handleInputChange('idCategory', category.idCategory?.toString());
                                  setCategoryAccordionOpen(false);
                                }}
                              >
                                {displayName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Botón para cambiar categoría */}
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                        onClick={() => setCategoryAccordionOpen(!categoryAccordionOpen)}
                        disabled={saving}
                      >
                        <span className="text-sm font-medium">
                          {(() => {
                            const cat = categories.find(c => c.idCategory == formData.idCategory);
                            return cat?.Categoryname || 'Categoría seleccionada';
                          })()}
                        </span>
                        <span className="text-xs">{categoryAccordionOpen ? '▲' : '▼'}</span>
                      </button>
                      
                      {/* Lista de categorías con selección */}
                      <div className={`transition-all duration-300 ease-in-out ${
                        categoryAccordionOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="border-t p-2 space-y-1 overflow-y-auto" style={{ maxHeight: '250px' }}>
                          {categories.map((category) => {
                            const displayName = category.Categoryname || category.CategoryName || `Categoría ${category.idCategory}`;
                            const isSelected = formData.idCategory == category.idCategory;
                            return (
                              <button
                                key={category.idCategory}
                                type="button"
                                className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                                  isSelected 
                                    ? 'bg-slate-800 text-white' 
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`}
                                onClick={() => {
                                  handleInputChange('idCategory', category.idCategory?.toString());
                                  setCategoryAccordionOpen(false);
                                }}
                              >
                                {displayName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Etiquetas debajo cuando hay categoría seleccionada */}
                {formData.idCategory && filteredLabels.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-left-2 duration-500">
                    {filteredLabels.map(label => {
                      const labelId = label.idLabel?.toString() || label.idLabel;
                      const labelText = label.Description || label.LabelName || 'Etiqueta';
                      
                      return (
                        <div
                          key={labelId}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground"
                        >
                          {labelText}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Imagen Adjunta (Opcional)
              </Label>
              
              {!formData.ImagePreview ? (
                <div className="flex items-center gap-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="text-base"
                  />
                  <Button
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
                Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
              </p>
            </div>

            <Separator />

            {/* Botones de acción y Fecha */}
            <div className="flex justify-between items-center">
              {/* Fecha de Creación */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(formData.CreationDate).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* Botones */}
              <div className="flex gap-3">
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
                    {isUpdate ? 'Actualizar Ticket' : 'Crear Ticket'}
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
