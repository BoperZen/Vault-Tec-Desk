import { useState, useEffect } from 'react';
import { 
  FolderKanban,
  Tag,
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import CategoryService from '@/services/CategoryService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function CategoryList() {
  const { isAdmin, isLoadingRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Mostrar notificación si viene del formulario de creación/edición
  useEffect(() => {
    if (location.state?.notification) {
      const { message, type } = location.state.notification;
      showNotification(message, type);
      // Limpiar el estado para que no se muestre de nuevo al recargar
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoadingRole) return;
    // Solo admins pueden ver categorías
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadCategories();
  }, [isAdmin, isLoadingRole, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await CategoryService.getCategories();
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.Categoryname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Procesar las categorías para convertir strings a arrays
  const processedCategories = filteredCategories.map(category => {
    // Determinar color de prioridad
    let priorityColor = 'bg-yellow-500'; // Media por defecto
    let priorityText = 'Media';
    
    if (category.idPriority === 1 || category.idPriority === '1') {
      priorityColor = 'bg-green-500';
      priorityText = 'Baja';
    } else if (category.idPriority === 3 || category.idPriority === '3') {
      priorityColor = 'bg-red-500';
      priorityText = 'Alta';
    }
    
    return {
      ...category,
      LabelsArray: category.Labels ? category.Labels.split(', ').filter(l => l) : [],
      SpecialtiesArray: category.Specialties ? category.Specialties.split(', ').filter(s => s) : [],
      PriorityColor: priorityColor,
      PriorityText: priorityText,
    };
  });

  const getPriorityBadgeColor = (priority) => {
    if (priority === 1 || priority === '1') {
      return 'border-green-500/50 text-green-600 bg-green-500/10';
    } else if (priority === 3 || priority === '3') {
      return 'border-red-500/50 text-red-600 bg-red-500/10';
    }
    return 'border-yellow-500/50 text-yellow-600 bg-yellow-500/10';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FolderKanban className="w-8 h-8 text-primary" />
              Gestión de Categorías
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra las categorías del sistema de tickets
            </p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => navigate('/categories/create')}
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar categorías..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Categorías</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Etiquetas</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => {
                    const labelsCount = cat.Labels ? cat.Labels.split(', ').filter(l => l).length : 0;
                    return sum + labelsCount;
                  }, 0)}
                </p>
              </div>
              <Tag className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Especialidades Únicas</p>
                <p className="text-2xl font-bold">
                  {new Set(categories.flatMap(cat => 
                    cat.Specialties ? cat.Specialties.split(', ').filter(s => s) : []
                  )).size}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {processedCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron categorías</p>
              <p className="text-sm mt-2">
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primera categoría'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedCategories.map((category) => (
            <Collapsible
              key={category.idCategory}
              open={expandedCategory === category.idCategory}
              onOpenChange={() => setExpandedCategory(expandedCategory === category.idCategory ? null : category.idCategory)}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 text-left">
                        <FolderKanban className="w-4 h-4 text-primary flex-shrink-0" />
                        <CardTitle className="text-base font-semibold truncate">
                          {category.Categoryname}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-semibold ${getPriorityBadgeColor(category.idPriority)}`}
                        >
                          {category.PriorityText}
                        </Badge>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                            expandedCategory === category.idCategory ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs mt-2">
                      <Clock className="w-3 h-3" />
                      <span>Resp: {category.MaxAnswerTime || 'N/A'}</span>
                      <span>• Resol: {category.MaxResolutionTime || 'N/A'}</span>
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <Separator />

                    {/* Labels Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Etiquetas
                        </span>
                      </div>
                      {category.LabelsArray.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {category.LabelsArray.map((label, index) => (
                            <Badge 
                              key={`${category.idCategory}-label-${index}`}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Sin etiquetas asignadas
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Specialties Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Especialidades Requeridas
                        </span>
                      </div>
                      {category.SpecialtiesArray.length > 0 ? (
                        <div className="space-y-2">
                          {category.SpecialtiesArray.map((specialty, index) => (
                            <div
                              key={`${category.idCategory}-specialty-${index}`}
                              className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-accent/5 to-transparent border border-accent/20"
                            >
                              <div className="w-2 h-2 rounded-full bg-accent"></div>
                              <span className="text-sm font-medium">{specialty}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 border-2 border-dashed border-border/50 rounded-lg">
                          <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground">
                            Sin especialidades requeridas
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <Separator />
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/categories/edit/${category.idCategory}`);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
