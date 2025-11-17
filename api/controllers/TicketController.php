<?php
class ticket
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $ticket = new TicketModel();
            $result = $ticket->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
    public function UTicket($idUser)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->UTicket($idUser);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            
            // Obtener los datos del request
            $data = $request->getBody();
            
            // Crear el ticket
            $ticket = new TicketModel();
            $result = $ticket->create($data);
            
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
            
            // Obtener los datos del request
            $data = $request->getBody();
            
            // Actualizar el ticket
            $ticket = new TicketModel();
            $result = $ticket->update($data);
            
            // Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
