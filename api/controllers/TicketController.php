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

    public function get($idTicket)
    {
        try {
            $response = new Response();
            $ticket = new TicketModel();
            $result = $ticket->get($idTicket);
            
            // toJSON maneja null automáticamente con status 404
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
            
            // Verificar si hay imagen en el request
            $hasImage = isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK;
            
            if ($hasImage) {
                // Procesar FormData
                $data = (object)[
                    'title' => $_POST['title'] ?? '',
                    'Description' => $_POST['Description'] ?? '',
                    'CreationDate' => $_POST['CreationDate'] ?? '',
                    'idCategory' => $_POST['idCategory'] ?? '',
                    'idState' => $_POST['idState'] ?? 1,
                    'Priority' => $_POST['Priority'] ?? '',
                    'idUser' => $_POST['idUser'] ?? '',
                ];
                
                // Leer el contenido del archivo como BLOB
                $imageContent = file_get_contents($_FILES['image']['tmp_name']);
                
                if ($imageContent !== false) {
                    // Agregar el contenido binario de la imagen al objeto
                    $data->images = [$imageContent];
                }
            } else {
                // Obtener los datos del request como JSON
                $data = $request->getJSON();
            }
            
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
            
            // Obtener los datos del request como JSON
            $data = $request->getJSON();
            
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
