import { Skeleton } from "@/components/ui/skeleton";

/**
 * Componente de carga flexible.
 * 
 * @param {number} count - Cantidad de elementos de carga a mostrar.
 * @param {"grid" | "list" | "table"} type - Tipo de presentación del loading.
 */
export function LoadingGrid({ count = 6, type = "grid" }) {
    if (type === "list") {
        return (
            <ul className="mx-auto max-w-3xl p-6 space-y-4">
                {Array.from({ length: count }).map((_, i) => (
                    <li key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </li>
                ))}
            </ul>
        );
    }

    if (type === "table") {
        return (
            <div className="overflow-x-auto mx-auto max-w-5xl p-6">
                <table className="w-full table-auto border-collapse divide-y">
                    <thead >
                        <tr>
                            <th className="px-4 py-2 text-left"><Skeleton className="h-6 w-full rounded-md" /></th>
                            <th className="px-4 py-2 text-left"><Skeleton className="h-6 w-full rounded-md" /></th>
                            <th className="px-4 py-2 text-left"><Skeleton className="h-6 w-full rounded-md" /></th>
                        </tr>
                    </thead>
                    <tbody >
                        {Array.from({ length: count }).map((_, i) => (
                            <tr key={i} >
                                <td className="px-4 py-3"><Skeleton className="h-4 w-full rounded-md" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-4 w-full rounded-md" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-4 w-full rounded-md" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        );
    }

    // Default: grid (tarjetas)
    return (
        <div className="mx-auto max-w-5xl p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    );
}
