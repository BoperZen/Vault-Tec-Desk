<?php
class specialty
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $specialty = new SpecialtyModel();
            $result = $specialty->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    public function getbyCat($param)
    {
        try {
            $response = new Response();
            $specialty = new SpecialtyModel();
            $result = $specialty->getbyCat($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function getbyTec($param)
    {
        try {
            $response = new Response();
            $specialty = new SpecialtyModel();
            $result = $specialty->getbyTec($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}