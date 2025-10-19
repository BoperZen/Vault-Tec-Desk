export function EmptyState({ message = "No se encontraron resultados." }) {
    return (
        <div className="mx-auto max-w-3xl p-6 text-center text-muted-foreground">
            {message}
        </div>
    );
}
