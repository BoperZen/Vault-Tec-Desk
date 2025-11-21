<?php
class priority
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $priority = new PriorityModel();
            $result = $priority->all();
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
            $priority = new PriorityModel();
            $result = $priority->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}