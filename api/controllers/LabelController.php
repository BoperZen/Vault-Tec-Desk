<?php
class label
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $label = new LabelModel();
            $result = $label->all();
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
            $label = new LabelModel();
            $result = $label->getbyCat($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}