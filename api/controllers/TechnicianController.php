<?php
class technician
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $technician = new TechnicianModel();
            $result = $technician->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
    
    public function get($param)
    {
        try {
            $response = new Response();
            $technician = new TechnicianModel();
            $result = $technician->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function Simple($param)
    {
        try {
            $response = new Response();
            $technician = new TechnicianModel();
            $result = $technician->Simple($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}