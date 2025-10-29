<?php
class label
{ /*
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
    }*/
    
    public function getbyCat($param)
    {
        try {
            $response = new Response();
            $label = new LabelModel();
            $result = $label->getbyCat($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}