<?php
class servicereview
{
    /**
     * GET /servicereview/{idTicket} - Obtener reseña de un ticket
     */
    public function get($idTicket)
    {
        try {
            $response = new Response();
            $model = new ServiceReviewModel();
            $result = $model->get($idTicket);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * POST /servicereview - Crear una nueva reseña
     */
    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            $data = $request->getJSON();
            
            $model = new ServiceReviewModel();
            $result = $model->create($data);
            
            $response->toJSON($result, "Valoración creada correctamente");
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
