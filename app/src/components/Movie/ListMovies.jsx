import React, { useEffect, useState } from "react";
import MovieService from "../../services/MovieService";
import { ListCardMovies } from "./ListCardMovies";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

export function ListMovies({ idShopRental = 1 }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoaded] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await MovieService.getMovieByShopRental(idShopRental)
                // Si la petición es exitosa, se guardan los datos                 
                console.log(response.data)
                setData(response.data);
                if (!response.data.success) {
                    setError(response.data.message)
                }
            } catch (err) {
                // Si el error no es por cancelación, se registra                 
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                // Independientemente del resultado, se actualiza el loading                 
                setLoaded(false);
            }
        };
        fetchData()
    }, [idShopRental]);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar películas" message={error} />;
    if (!data || data.data.length === 0)
        return <EmptyState message="No se encontraron películas en esta tienda." />;

    return (
        <div className="mx-auto max-w-7xl p-6">
            <ListCardMovies data={data.data} isShopping={true} />
        </div>
    );
}
