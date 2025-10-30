import axios from 'axios';
//http://localhost:81/appmovie/api/movie/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'movie';
class MovieService {
  //Definición para Llamar al API y obtener el listado de películas

  //Listas peliculas
  //http://localhost:81/appmovie/api/movie
  getMovies() {
    return axios.get(BASE_URL);
  }
  //Obtener pelicula
  //http://localhost:81/appmovie/api/movie/1
  getMovieById(MovieId){
    return axios.get(BASE_URL+'/'+MovieId);
  }
  //Obtener peliculas por tienda
  //http://localhost:81/appmovie/api/movie/moviesByShopRental/1
  getMovieByShopRental(ShopRentalId){
    return axios.get(BASE_URL+'/moviesByShopRental/'+ShopRentalId);
  }
  createMovie(Movie) {
    return axios.post(BASE_URL, JSON.stringify(Movie));
  }
  
  updateMovie(Movie) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Movie)

    })
  }
}
export default new MovieService();
