<?php

class Response
{
    private $status = 200;

    public function status(int $code)
    {
        $this->status = $code;
        return $this;
    }

    public function toJSON($response = [], $message = "")
    {
        // Caso éxito
        if (!empty($response)) {
            $json = [
                "success" => true,
                "status"  => 200,
                "message" => $message ?: "Solicitud exitosa",
                "data"    => $response
            ];
            $this->status = 200;

            // Caso sin resultados 
        } elseif ($response === [] || $response === null) {
            $json = [
                "success" => false,
                "status"  => 404,
                "message" => $message ?: "Recurso no encontrado",
                "error"   => [
                    "code" => "NOT_FOUND",
                    "details" => "El recurso solicitado no existe o no contiene datos"
                ]
            ];
            $this->status = 404;

            // Caso error interno
        } else {
            $json = [
                "success" => false,
                "status"  => 500,
                "message" => $message ?: "Error interno del servidor",
                "error"   => [
                    "code" => "INTERNAL_ERROR",
                    "details" => "Ocurrió un error inesperado"
                ]
            ];
            $this->status = 500;
        }

        // Escribir respuesta JSON con código de estado HTTP
        http_response_code($this->status);
        echo json_encode($json, JSON_UNESCAPED_UNICODE);
    }
}
