<?php
class category
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $category = new CategoryModel();
            $result = $category->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    public function get($param)
    {
        try {
            $response = new Response();
            $category = new CategoryModel();
            $result = $category->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}