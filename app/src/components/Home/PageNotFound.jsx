import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import error from "../../assets/error.jpg";

export function PageNotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="mx-auto mt-20 mb-6 max-w-4xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Imagen */}
        <div className="md:col-span-4 flex justify-center">
          <img
            src={error}
            alt="404 Error"
            className="rounded-lg w-full h-auto max-w-xs"
          />
        </div>

        {/* Texto */}
        <div className="md:col-span-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('errors.pageNotFound')}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {t('errors.pageNotFoundDesc')}
          </p>

          {/* Botón volver */}
          <Button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    </main>
  );
}