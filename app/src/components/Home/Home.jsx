import React from "react";
import { useTranslation } from 'react-i18next';
import ticketImg from "../../assets/ticket.jpg";

export function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${ticketImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5)",
        }}
      />

      {/* Contenido principal */}
      <div className="px-4 max-w-2xl text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          {t('home.title')}
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-6 drop-shadow">
          {t('home.subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/movies"
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg hover:bg-primary/90 transition"
          >
            {t('home.viewCatalog')}
          </a> 
          <a
            href="/user/login"
            className="px-6 py-3 bg-secondary text-white rounded-lg font-semibold shadow-lg hover:bg-secondary/90 transition"
          >
            {t('auth.login')}
          </a>
        </div>
      </div>

    </div>
  );
}

