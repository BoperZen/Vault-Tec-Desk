import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Ticket, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

export default function Dashboard() {
  const { currentUser } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      <div className="container max-w-7xl w-full space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-full max-w-xs sm:max-w-md md:max-w-xl h-48 sm:h-64 md:h-80 mb-1">
            <img 
              src="/vault-tec-logo.svg" 
              alt="Vault-Tec Logo" 
              className="w-full h-full object-contain drop-shadow-lg hover:scale-105 transition-transform"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Vault-Tec Desk
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema de gestión de tickets Help Desk. Bienvenido, <span className="text-primary font-semibold">{currentUser.username}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-primary/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>
                Gestiona y visualiza todos los tickets del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tickets">
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  Ver Tickets
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-accent/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Técnicos</CardTitle>
              <CardDescription>
                Consulta la información de los técnicos disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/technicians">
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent">
                  Ver Técnicos
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-vault-glow/50 transition-all duration-300 border-border/50 hover:border-primary/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-muted/80 transition-colors">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Ajusta las preferencias de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button variant="outline" className="w-full">
                  Configurar
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats (Optional) */}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">24</p>
            <p className="text-sm text-muted-foreground">Tickets Activos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">8</p>
            <p className="text-sm text-muted-foreground">Técnicos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">5</p>
            <p className="text-sm text-muted-foreground">Categorías</p>
          </div>
        </div>
      </div>
    </div>
  );
}
