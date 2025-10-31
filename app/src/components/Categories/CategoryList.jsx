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
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';
import { useNavigate } from 'react-router-dom';
import CategoryService from '@/services/CategoryService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function CategoryList() {
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Solo admins pueden ver categorías
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadCategories();
  }, [isAdmin, navigate]);

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
  const processedCategories = filteredCategories.map(category => ({
    ...category,
    LabelsArray: category.Labels ? category.Labels.split(', ').filter(l => l) : [],
    SpecialtiesArray: category.Specialties ? category.Specialties.split(', ').filter(s => s) : [],
  }));

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
          <Button className="gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedCategories.map((category) => (
            <Card 
              key={category.idCategory}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-primary" />
                      {category.Categoryname}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>Respuesta: {category.MaxAnswerTime || 'N/A'}</span>
                      <span>• Resolución: {category.MaxResolutionTime || 'N/A'}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Labels Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Etiquetas ({category.LabelsArray.length})
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
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Especialidades Requeridas ({category.SpecialtiesArray.length})
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
