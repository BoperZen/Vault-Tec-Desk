import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Componente de alerta de error.
 * @param {string} title - Título de la alerta
 * @param {string} message - Mensaje de la alerta
 */
export function ErrorAlert({ title = "Error", message }) {
    return (
        <div className="mx-auto max-w-3xl p-4">
            <Alert
                variant="destructive"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 shadow-md rounded-lg animate-fadeIn"
            >
                <div className="flex-1">
                    <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
                    <AlertDescription className="mt-1 text-sm text-muted-foreground">
                        {message}
                    </AlertDescription>
                </div>
            </Alert>
        </div>
    );
}
