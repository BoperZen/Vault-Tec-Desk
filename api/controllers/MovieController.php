<?php
class movie
{
    // GET listar
    // localhost:81/appmovie/api/movie
    public function index()
    {
        try {
            $response = new Response();
            //Instancia modelo
            $movieM = new MovieModel;
            //Método del modelo
            $result = $movieM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
    //GET Obtener 
    // localhost:81/appmovie/api/movie/1
    public function get($id)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $movie = new MovieModel();
            //Acción del modelo a ejecutar
            $result = $movie->get($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
     //Obtener peliculas por tienda
    public function moviesByShopRental($idShopRental)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $movie = new MovieModel();
            //Acción del modelo a ejecutar
            $result = $movie->moviesByShopRental($idShopRental);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    //Obtener cantidad de peliculas por genero
    public function getCountByGenre($param)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $movie = new MovieModel();
            //Acción del modelo a ejecutar
            $result = $movie->getCountByGenre($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $movie = new MovieModel();
            //Acción del modelo a ejecutar
            $result = $movie->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    //PUT actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $movie = new MovieModel();
            //Acción del modelo a ejecutar
            $result = $movie->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
}
