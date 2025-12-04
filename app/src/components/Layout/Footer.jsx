import { Heart, Zap } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function Footer() {
  const { open } = useSidebar();
  
  return (
    <footer 
      className="fixed bottom-0 right-0 z-30 border-t border-border/30 bg-background/80 backdrop-blur-sm transition-all duration-500 ease-in-out"
      style={{ left: open ? '20rem' : '5rem', height: '40px' }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Vault-Tec Industries</span>
          <span className="text-border">•</span>
          <span className="font-mono text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">v1.0.0</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden md:inline">Hecho con</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            <span className="hidden md:inline">para clientes del Vault</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span className="text-[10px] font-medium text-yellow-500">ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
