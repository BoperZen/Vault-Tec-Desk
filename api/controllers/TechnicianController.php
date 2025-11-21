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

    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            
            // Obtener los datos del request como JSON
            $data = $request->getJSON();
            
            // Crear el técnico
            $technician = new TechnicianModel();
            $result = $technician->create($data);
            
            // Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function update()
    {
        try {
            $response = new Response();
            $request = new Request();
            
            // Obtener los datos del request como JSON
            $data = $request->getJSON();
            
            // Actualizar el técnico
            $technician = new TechnicianModel();
            $result = $technician->update($data);
            
            // Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}