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
}
