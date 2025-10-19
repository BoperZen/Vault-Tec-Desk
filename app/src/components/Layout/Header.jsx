"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Film,
  BookOpen,
  Filter,
  Wrench,
  LogIn,
  UserPlus,
  LogOut,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Clapperboard,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

const userData = { email: "demo@correo.com" };

const navItems = [
  { title: "Películas", href: "/movie", icon: <Film className="h-4 w-4" /> },
  {
    title: "Catálogo de Películas",
    href: "/movie/",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Filtrar Películas",
    href: "/movie/filter",
    icon: <Filter className="h-4 w-4" />,
  },
];

const mantItems = [
  {
    title: "Mantenimiento Películas",
    href: "movie/table",
    icon: <Wrench className="h-4 w-4" />,
  },
];

const userItems = [
  { title: "Login", href: "/user/login", icon: <LogIn className="h-4 w-4" /> },
  {
    title: "Registrarse",
    href: "/user/create",
    icon: <UserPlus className="h-4 w-4" />,
  },
  {
    title: "Logout",
    href: "/user/logout",
    icon: <LogOut className="h-4 w-4" />,
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 left-0 z-50 backdrop-blur-xl bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80 border-b border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1280px] mx-auto text-white">

        {/* -------- Logo -------- */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-wide hover:opacity-90 transition"
        >
          <Clapperboard className="h-6 w-6" />
          <span className="hidden sm:inline">MoviesApp</span>
        </Link>

        {/* -------- Menú escritorio -------- */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menubar className="w-auto bg-transparent border-none shadow-none space-x-6">
            {/* Películas */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-secondary transition">
                <Film className="h-4 w-4" /> Películas
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {navItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-accent/10 transition"
      >
        
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Mantenimientos */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-secondary transition">
                <Layers className="h-4 w-4" /> Mantenimientos
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {mantItems.map((item) => (
                  <MenubarItem key={item.href} asChild> 
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-accent/10 transition"
                    >
                    {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Usuario */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-secondary transition">
                <User className="h-4 w-4" /> {userData.email}
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {userItems.map((item) => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-accent/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* -------- Carrito + Menú móvil -------- */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative hover:opacity-80">
            <ShoppingCart className="h-6 w-6" />
            <Badge
              className="absolute -top-2 -right-3 rounded-full px-2 py-0 text-xs font-semibold"
              variant="secondary"
            >
              3
            </Badge>
          </Link>

          {/* Menú móvil */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-accent/10 transition text-white backdrop-blur-lg w-72">
              <nav className="mt-8 px-4 space-y-6">
                <div>
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                    <Clapperboard /> MoviesApp
                  </Link>
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">
                    <Film /> Películas
                  </h4>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  ))}
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">
                    <Layers /> Mantenimientos
                  </h4>
                  {mantItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  ))}
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold flex items-center gap-2">
                    <User /> {userData.email}
                  </h4>
                  {userItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-white/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
