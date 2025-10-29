<?php
class ticket
{
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
