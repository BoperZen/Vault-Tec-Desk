<?php
class assign
{    
    public function get($param)
    {
        try {
            $response = new Response();
            $assign = new AssignModel();
            $result = $assign->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}