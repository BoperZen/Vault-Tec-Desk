import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import { Layout } from './components/Layout/Layout';
import { Home } from './components/Home/Home';
import { PageNotFound } from './components/Home/PageNotFound';
import TableMovies from './components/Movie/TableMovies';
import { ListMovies } from './components/Movie/ListMovies';
import { DetailMovie } from './components/Movie/DetailMovie';
const rutas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },
      // Ruta comodín (404)
      { path: '*', element: <PageNotFound /> },
      //Rutas componentes
      { path: "movie", element: <ListMovies /> },// lista peliculas
      { path: "movie/table", element: <TableMovies /> },   // lista peliculas ADMIN       
      { path: "movie/detail/:id", element: <DetailMovie /> }, // detalle pelicula 
    ],
  },
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>
);


