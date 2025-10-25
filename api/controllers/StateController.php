<?php
class state
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $state = new StateModel();
            $result = $state->all();
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
            $state = new StateModel();
            $result = $state->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
