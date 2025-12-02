<?php
class ServiceReviewModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener la reseña de un ticket específico
     * @param int $idTicket - ID del ticket
     * @return object|null - Objeto reseña o null
     */
    public function get($idTicket)
    {
        $idTicket = (int) $idTicket;
        $vSql = "SELECT * FROM ServiceReview WHERE idTicket = $idTicket";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }

    /**
     * Crear una nueva reseña de servicio
     * @param object $objeto - Objeto con los datos de la reseña
     * @return object - Objeto ticket actualizado con la reseña
     */
    public function create($objeto)
    {
        // Validar campos requeridos
        if (empty($objeto->idTicket)) {
            throw new Exception("El ID del ticket es requerido");
        }
        if (!isset($objeto->Score) || $objeto->Score < 1 || $objeto->Score > 5) {
            throw new Exception("La calificación debe estar entre 1 y 5");
        }
        if (empty($objeto->Comment)) {
            throw new Exception("El comentario es requerido");
        }

        $idTicket = (int) $objeto->idTicket;
        $score = (int) $objeto->Score;
        $comment = $this->enlace->escapeString($objeto->Comment);
        
        // Obtener fecha desde el frontend o usar fecha actual como respaldo
        $dateOfReview = isset($objeto->DateOfReview) && !empty($objeto->DateOfReview)
            ? $this->enlace->escapeString($objeto->DateOfReview)
            : date('Y-m-d H:i:s');

        // Verificar que el ticket existe y está cerrado (estado 5)
        $ticketModel = new TicketModel();
        $ticket = $ticketModel->get($idTicket);
        
        if (!$ticket) {
            throw new Exception("El ticket no existe");
        }
        
        if ((int)$ticket->idState !== 5) {
            throw new Exception("Solo se pueden valorar tickets cerrados");
        }

        // Verificar que no exista ya una reseña para este ticket
        $existingReview = $this->get($idTicket);
        if ($existingReview) {
            throw new Exception("Este ticket ya tiene una valoración");
        }

        // Insertar la reseña
        $vSql = "INSERT INTO ServiceReview (Score, Comment, DateOfReview, idTicket)
                 VALUES (
                     $score,
                     '$comment',
                     '$dateOfReview',
                     $idTicket
                 )";

        $this->enlace->executeSQL_DML_last($vSql);

        // Retornar el ticket actualizado con la reseña
        return $ticketModel->get($idTicket);
    }
}
