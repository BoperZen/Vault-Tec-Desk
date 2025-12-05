import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FolderKanban,
  Tag,
  Briefcase,
  Save,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Clock,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CategoryService from '@/services/CategoryService';
import LabelService from '@/services/LabelService';
import SpecialtyService from '@/services/SpecialtyService';

/**
 * Componente para crear y editar categorías
 * Formulario completo de mantenimiento de categorías
 */
export default function UpkeepCategory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Datos disponibles
  const [availableLabels, setAvailableLabels] = useState([]);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  
  // Estados de popover
  const [labelsPopoverOpen, setLabelsPopoverOpen] = useState(false);
  const [specialtiesPopoverOpen, setSpecialtiesPopoverOpen] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    idCategory: '',
    Categoryname: '',
    MaxAnswerTime: '',
    MaxResolutionTime: '',
    idPriority: '',
    selectedLabels: [],
    selectedSpecialties: [],
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
      // Cargar etiquetas y especialidades disponibles
      const [labelsRes, specialtiesRes] = await Promise.all([
        LabelService.getLabels(),
        SpecialtyService.getSpecialties()
      ]);

      const labelsData = labelsRes.data?.data || labelsRes.data || [];
      const specialtiesData = specialtiesRes.data?.data || specialtiesRes.data || [];

      setAvailableLabels(labelsData);
      setAvailableSpecialties(specialtiesData);

      // Si estamos editando, cargar la categoría
      if (isEditing) {
        const categoryRes = await CategoryService.getCategoryById(id);
        const category = categoryRes.data?.data || categoryRes.data;
        
        if (category) {
          // Convertir MaxAnswerTime y MaxResolutionTime (pueden venir como "8 h")
          const maxAnswerTime = typeof category.MaxAnswerTime === 'string' 
            ? parseInt(category.MaxAnswerTime.replace(' h', '')) 
            : category.MaxAnswerTime;
          const maxResolutionTime = typeof category.MaxResolutionTime === 'string' 
            ? parseInt(category.MaxResolutionTime.replace(' h', '')) 
            : category.MaxResolutionTime;

          // Convertir IDs de labels a objetos completos
          const selectedLabelObjects = [];
          if (category.LabelIds && Array.isArray(category.LabelIds)) {
            category.LabelIds.forEach((id) => {
              const label = labelsData.find(l => l.idLabel === id);
              if (label) {
                selectedLabelObjects.push({ id: label.idLabel, name: label.Description });
              }
            });
          }

          // Convertir IDs de specialties a objetos completos
          const selectedSpecialtyObjects = [];
          if (category.SpecialtyIds && Array.isArray(category.SpecialtyIds)) {
            category.SpecialtyIds.forEach((id) => {
              const specialty = specialtiesData.find(s => s.idSpecialty === id);
              if (specialty) {
                selectedSpecialtyObjects.push({ id: specialty.idSpecialty, name: specialty.Description });
              }
            });
          }

          setFormData({
            idCategory: category.idCategory,
            Categoryname: category.Categoryname || '',
            MaxAnswerTime: maxAnswerTime || '',
            MaxResolutionTime: maxResolutionTime || '',
            idPriority: category.idPriority?.toString() || '2',
            selectedLabels: selectedLabelObjects,
            selectedSpecialties: selectedSpecialtyObjects,
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || t('categories.messages.loadError'));
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
    if (success) setSuccess(null);
  };

  const handleSelectLabel = (label) => {
    if (!formData.selectedLabels.find(l => l && l.id === label.idLabel)) {
      setFormData(prev => ({
        ...prev,
        selectedLabels: [...prev.selectedLabels, { id: label.idLabel, name: label.Description }]
      }));
    }
    setLabelsPopoverOpen(false);
  };

  const handleRemoveLabel = (labelObj) => {
    setFormData(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.filter(l => l.id !== labelObj.id)
    }));
  };

  const handleSelectSpecialty = (specialty) => {
    if (!formData.selectedSpecialties.find(s => s && s.id === specialty.idSpecialty)) {
      setFormData(prev => ({
        ...prev,
        selectedSpecialties: [...prev.selectedSpecialties, { id: specialty.idSpecialty, name: specialty.Description }]
      }));
    }
    setSpecialtiesPopoverOpen(false);
  };

  const handleRemoveSpecialty = (specialtyObj) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.filter(s => s.id !== specialtyObj.id)
    }));
  };

  const validateForm = () => {
    // Validar nombre
    if (!formData.Categoryname.trim()) {
      setError(t('categories.validation.nameRequired'));
      return false;
    }

    // Validar tiempo de respuesta
    if (!formData.MaxAnswerTime || formData.MaxAnswerTime <= 0) {
      setError(t('categories.validation.responseTimeRequired'));
      return false;
    }

    // Validar tiempo de resolución
    if (!formData.MaxResolutionTime || formData.MaxResolutionTime <= 0) {
      setError(t('categories.validation.resolutionTimeRequired'));
      return false;
    }

    // Validar que tiempo de resolución sea mayor que tiempo de respuesta
    const answerTime = parseInt(formData.MaxAnswerTime);
    const resolutionTime = parseInt(formData.MaxResolutionTime);
    
    if (resolutionTime <= answerTime) {
      setError(t('categories.validation.resolutionGreaterThanResponse'));
      return false;
    }

    // Validar prioridad
    if (!formData.idPriority) {
      setError(t('categories.validation.priorityRequired'));
      return false;
    }

    // Validar etiquetas
    if (!formData.selectedLabels || formData.selectedLabels.length === 0) {
      setError(t('categories.validation.labelsRequired'));
      return false;
    }

    // Validar especialidades
    if (!formData.selectedSpecialties || formData.selectedSpecialties.length === 0) {
      setError(t('categories.validation.specialtiesRequired'));
      return false;
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
      // Extraer IDs de los objetos
      const labelIds = formData.selectedLabels.map(l => l.id);
      const specialtyIds = formData.selectedSpecialties.map(s => s.id);

      const categoryData = {
        Categoryname: formData.Categoryname.trim(),
        MaxAnswerTime: parseInt(formData.MaxAnswerTime),
        MaxResolutionTime: parseInt(formData.MaxResolutionTime),
        idPriority: parseInt(formData.idPriority),
        labels: labelIds,
        specialties: specialtyIds,
      };

      if (isEditing) {
        categoryData.idCategory = parseInt(formData.idCategory);
        await CategoryService.updateCategory(categoryData);
        navigate('/categories', { state: { notification: { message: t('categories.messages.updateSuccess'), type: 'success' } } });
      } else {
        await CategoryService.createCategory(categoryData);
        navigate('/categories', { state: { notification: { message: t('categories.messages.createSuccess'), type: 'success' } } });
      }
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError(err.response?.data?.message || t('categories.messages.saveError'));
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  const getAvailableLabelsFiltered = () => {
    const filtered = availableLabels.filter(label => 
      !formData.selectedLabels.find(l => l.id === label.idLabel)
    );
    // Eliminar duplicados por idLabel
    const uniqueMap = new Map();
    filtered.forEach(label => {
      if (!uniqueMap.has(label.idLabel)) {
        uniqueMap.set(label.idLabel, label);
      }
    });
    return Array.from(uniqueMap.values());
  };

  const getAvailableSpecialtiesFiltered = () => {
    const filtered = availableSpecialties.filter(specialty => 
      !formData.selectedSpecialties.find(s => s.id === specialty.idSpecialty)
    );
    // Eliminar duplicados por idSpecialty
    const uniqueMap = new Map();
    filtered.forEach(specialty => {
      if (!uniqueMap.has(specialty.idSpecialty)) {
        uniqueMap.set(specialty.idSpecialty, specialty);
      }
    });
    return Array.from(uniqueMap.values());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">{t('categories.loadingForm')}</p>
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
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {isEditing ? t('categories.form.editTitle') : t('categories.form.createTitle')}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? t('categories.form.editDescription')
                  : t('categories.form.createDescription')
                }
              </CardDescription>
            </div>
            <Badge variant={isEditing ? "secondary" : "default"}>
              {isEditing ? `ID: ${id}` : t('categories.new')}
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

            {/* Nombre de Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoryname" className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                {t('categories.fields.name')}
                <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                id="categoryname"
                placeholder={t('categories.fields.namePlaceholder')}
                value={formData.Categoryname}
                onChange={(e) => handleInputChange('Categoryname', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <Separator />

            {/* Tiempos y Prioridades */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tiempo de Respuesta */}
              <div className="space-y-2">
                <Label htmlFor="answertime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('categories.sla.responseTime')}
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  type="number"
                  id="answertime"
                  placeholder="2"
                  min="1"
                  value={formData.MaxAnswerTime}
                  onChange={(e) => handleInputChange('MaxAnswerTime', e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>

              {/* Tiempo de Resolución */}
              <div className="space-y-2">
                <Label htmlFor="resolutiontime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('categories.sla.resolutionTime')}
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  type="number"
                  id="resolutiontime"
                  placeholder="8"
                  min="1"
                  value={formData.MaxResolutionTime}
                  onChange={(e) => handleInputChange('MaxResolutionTime', e.target.value)}
                  disabled={saving}
                  className="w-full px-3 py-2 text-base border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {t('categories.priority.title')}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  {[
                    { id: '1', labelKey: 'categories.priority.low' },
                    { id: '2', labelKey: 'categories.priority.medium' },
                    { id: '3', labelKey: 'categories.priority.high' }
                  ].map((priority) => {
                    const isSelected = formData.idPriority == priority.id;
                    return (
                      <Badge
                        key={priority.id}
                        variant="outline"
                        className={`cursor-pointer transition-all px-3 py-1.5 text-xs font-semibold ${
                          isSelected 
                            ? priority.id === '1' ? 'bg-green-500 text-white border-green-600'
                              : priority.id === '3' ? 'bg-red-500 text-white border-red-600'
                              : 'bg-yellow-500 text-white border-yellow-600'
                            : priority.id === '1' ? 'border-green-500/50 text-green-600 hover:bg-green-500/10'
                              : priority.id === '3' ? 'border-red-500/50 text-red-600 hover:bg-red-500/10'
                              : 'border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !saving && handleInputChange('idPriority', priority.id)}
                      >
                        {t(priority.labelKey)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            <Separator />

            {/* Etiquetas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t('categories.labels.associated')}
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2 items-center">
                {formData.selectedLabels.map((label) => (
                  <Badge
                    key={`cat-${formData.idCategory || 'new'}-label-${label.id}`}
                    variant="outline"
                    className="cursor-pointer transition-all px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary gap-1.5"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    {label.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {/* Botón para agregar etiqueta */}
                <div className="relative">
                  <Badge
                    variant="outline"
                    className="cursor-pointer transition-all px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary gap-1.5"
                    onClick={() => !saving && getAvailableLabelsFiltered().length > 0 && setLabelsPopoverOpen(!labelsPopoverOpen)}
                  >
                    <Plus className="w-3 h-3" />
                    {t('categories.labels.addLabel')}
                  </Badge>
                  {labelsPopoverOpen && getAvailableLabelsFiltered().length > 0 && (
                    <div className="absolute left-full top-0 ml-2 z-50 w-80 bg-background border rounded-lg shadow-lg p-3 animate-in slide-in-from-left-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('categories.labels.selectLabel')}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setLabelsPopoverOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {getAvailableLabelsFiltered().map((label, idx) => (
                          <Button
                            key={`avail-label-${label.idLabel}-${idx}`}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-2 whitespace-normal"
                            onClick={() => handleSelectLabel(label)}
                          >
                            {label.Description}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Especialidades */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {t('categories.specialties.title')}
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col gap-2">
                {formData.selectedSpecialties.map((specialty) => (
                  <div
                    key={`cat-${formData.idCategory || 'new'}-spec-${specialty.id}`}
                    className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-accent/5 to-transparent border border-accent/20 cursor-pointer hover:bg-accent/10"
                    onClick={() => handleRemoveSpecialty(specialty)}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-sm font-medium flex-1">{specialty.name}</span>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
                {/* Botón para agregar especialidad */}
                <div className="relative">
                  <Badge
                    variant="outline"
                    className="cursor-pointer transition-all px-3 py-1.5 text-xs font-semibold bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent hover:text-accent-foreground hover:border-accent gap-1.5 w-full justify-center"
                    onClick={() => !saving && getAvailableSpecialtiesFiltered().length > 0 && setSpecialtiesPopoverOpen(!specialtiesPopoverOpen)}
                  >
                    <Plus className="w-3 h-3" />
                    {t('categories.specialties.addSpecialty')}
                  </Badge>
                  {specialtiesPopoverOpen && getAvailableSpecialtiesFiltered().length > 0 && (
                    <div className="absolute top-full left-0 mt-2 z-50 w-full bg-background border rounded-lg shadow-lg p-3 animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('categories.specialties.selectSpecialty')}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setSpecialtiesPopoverOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {getAvailableSpecialtiesFiltered().map((specialty, idx) => (
                          <Button
                            key={`avail-spec-${specialty.idSpecialty}-${idx}`}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-auto py-2"
                            onClick={() => handleSelectSpecialty(specialty)}
                          >
                            {specialty.Description}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? t('categories.form.updateCategory') : t('categories.form.createCategoryBtn')}
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
