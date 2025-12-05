<?php
class AssignModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar todas las asignaciones existentes
     * @return array
     */
    public function all()
    {
        $vSql = "SELECT idTicket FROM assign ORDER BY idAssign DESC";
        $rows = $this->enlace->ExecuteSQL($vSql);

        if (empty($rows) || !is_array($rows)) {
            return [];
        }

        $assignments = [];
        foreach ($rows as $row) {
            $assignment = $this->get($row->idTicket);
            if ($assignment) {
                $assignments[] = $assignment;
            }
        }

        return $assignments;
    }

    /**
     * Obtener la asignación de un ticket con todas sus relaciones
     * @param int $idTicket - ID del ticket
     * @return object|null - Objeto assign completo
     */
    public function get($idTicket)
    {
        $technicianM = new TechnicianModel();
        $userM = new UserModel();
        
        $idTicket = (int) $idTicket;

        // Consulta básica del assign
        $vSql = "SELECT * FROM assign WHERE idTicket = $idTicket";
        $rows = $this->enlace->ExecuteSQL($vSql);

        if (!is_array($rows) || count($rows) === 0) {
            return null; // no existe ese assign
        }

        // Toma la primera fila
        $assign = $rows[0];

        // Convertir tipos de datos
        $assign->idAssign = isset($assign->idAssign) ? (int) $assign->idAssign : null;
        $assign->PriorityScore = isset($assign->PriorityScore) ? (int) $assign->PriorityScore : null;

        // WorkFlowRules: si es NULL -> "Manual", si no -> id
        $assign->WorkFlowRules = isset($assign->idWorkFlowRules) && $assign->idWorkFlowRules !== null
            ? (int) $assign->idWorkFlowRules
            : 'Manual';

        // Obtener información básica del ticket (SIN crear el objeto completo para evitar recursión)
        $vSqlTicket = "SELECT idTicket, title, CreationDate, idState, idUser 
                       FROM Ticket 
                       WHERE idTicket = $idTicket";
        $ticketData = $this->enlace->ExecuteSQL($vSqlTicket);
        
        // Ticket: lo devolvemos como array de objetos
        $assign->Ticket = [];
        if (!empty($ticketData) && is_array($ticketData)) {
            $t = $ticketData[0];
            
            $ticket = (object)[
                'idTicket' => (int) $t->idTicket,
                'Title' => $t->title ?? '',
                'CreationDate' => $t->CreationDate ?? null,
                'idState' => isset($t->idState) ? (int) $t->idState : null
            ];
            
            // Agregar user dentro del ticket (información básica)
            if (isset($t->idUser) && $t->idUser) {
                $user = $userM->get($t->idUser);
                $ticket->User = (object)[
                    'idUser' => isset($user->idUser) ? (int) $user->idUser : null,
                    'Username' => $user->Username ?? ''
                ];
            } else {
                $ticket->User = null;
            }
            
            $assign->Ticket[] = $ticket;
        }

        // Technician: obtener información del técnico (SIN especialidades para evitar llamadas extras)
        if (isset($assign->idTechnician) && $assign->idTechnician !== null) {
            // Obtener técnico simple para evitar muchas queries
            $techSimple = $technicianM->Simple($assign->idTechnician);
            
            // Obtener usuario y datos de avatar del técnico
            $vSqlTech = "SELECT idUser, AvatarStyle, AvatarSeed FROM Technician WHERE idTechnician = " . (int)$assign->idTechnician;
            $techData = $this->enlace->ExecuteSQL($vSqlTech);
            
            if (!empty($techData) && is_array($techData)) {
                $techRow = $techData[0];
                $techUser = $userM->get($techRow->idUser);
                
                $assign->Technician = (object)[
                    'idTechnician' => (int) $assign->idTechnician,
                    'idUser' => isset($techUser->idUser) ? (int) $techUser->idUser : null,
                    'Username' => $techUser->Username ?? '',
                    'Email' => $techUser->Email ?? '',
                    'AvatarStyle' => $techRow->AvatarStyle ?? 'avataaars',
                    'AvatarSeed' => $techRow->AvatarSeed ?? ''
                ];
            } else {
                $assign->Technician = null;
            }
        } else {
            $assign->Technician = null;
        }

        return $assign;
    }

    /**
     * Crear o actualizar la asignación manual de un ticket
     * @param object $data
     * @return object
     * @throws Exception
     */
    public function assignTicket($data)
    {
        if (!is_object($data)) {
            throw new Exception('Se requieren los datos de la asignación');
        }

        $idTicket = isset($data->idTicket) ? (int)$data->idTicket : 0;
        $idTechnician = isset($data->idTechnician) ? (int)$data->idTechnician : 0;

        if ($idTicket <= 0) {
            throw new Exception('El ticket es requerido para asignar');
        }

        if ($idTechnician <= 0) {
            throw new Exception('El técnico es requerido para asignar');
        }

        if (!isset($data->idUser)) {
            throw new Exception('El usuario que realiza la asignación es requerido');
        }

        // Verificar la carga actual del técnico (máximo 5 tickets activos)
        $technicianM = new TechnicianModel();
        $techData = $technicianM->Simple($idTechnician);
        
        if ($techData && (int)$techData->WorkLoad >= 5) {
            throw new Exception('El técnico ya tiene la carga máxima de 5 tickets activos');
        }

        // PriorityScore no puede ser NULL, usar 0 como valor por defecto
        $priorityScore = isset($data->PriorityScore) ? (int)$data->PriorityScore : 0;
        $workflowRules = isset($data->idWorkFlowRules) ? (int)$data->idWorkFlowRules : null;
        
        // Obtener fecha de asignación (desde frontend o NOW() como respaldo)
        $dateOfAssign = isset($data->DateOfAssign) && !empty($data->DateOfAssign)
            ? "'{$this->enlace->escapeString($data->DateOfAssign)}'"
            : "NOW()";

        $existing = $this->enlace->ExecuteSQL("SELECT idAssign, idTechnician FROM assign WHERE idTicket = $idTicket LIMIT 1");

        $priorityValue = $priorityScore;
        $workflowValue = $workflowRules !== null ? $workflowRules : 'NULL';

        $oldTechnicianId = null;

        if (!empty($existing) && is_array($existing)) {
            $idAssign = (int)$existing[0]->idAssign;
            $oldTechnicianId = isset($existing[0]->idTechnician) ? (int)$existing[0]->idTechnician : null;
            
            $updateSql = "UPDATE assign SET ".
                "idTechnician = $idTechnician, ".
                "PriorityScore = $priorityValue, ".
                "idWorkFlowRules = $workflowValue, ".
                "DateOfAssign = $dateOfAssign " .
                "WHERE idAssign = $idAssign";
            $this->enlace->ExecuteSQL_DML($updateSql);

            // Si cambió el técnico, decrementar carga del antiguo e incrementar del nuevo
            if ($oldTechnicianId && $oldTechnicianId !== $idTechnician) {
                $technicianM->decrementWorkload($oldTechnicianId);
                $technicianM->incrementWorkload($idTechnician);
            }
        } else {
            $insertSql = "INSERT INTO assign (idTicket, idTechnician, PriorityScore, idWorkFlowRules, DateOfAssign) VALUES (" .
                "$idTicket, $idTechnician, $priorityValue, $workflowValue, $dateOfAssign)";
            $this->enlace->executeSQL_DML_last($insertSql);

            // Incrementar la carga del técnico asignado
            $technicianM->incrementWorkload($idTechnician);
        }

        $ticketM = new TicketModel();
        $userM = new UserModel();

        // Obtener datos del técnico asignado (incluyendo idUser)
        $techSql = "SELECT idUser FROM technician WHERE idTechnician = $idTechnician";
        $techResult = $this->enlace->ExecuteSQL($techSql);
        $techUserId = (!empty($techResult) && is_array($techResult)) ? (int)$techResult[0]->idUser : null;
        
        $techUserData = $techUserId ? $userM->get($techUserId) : null;
        $techUsername = $techUserData ? $techUserData->Username : "Técnico #$idTechnician";

        // Obtener datos del ticket para notificaciones
        $ticketData = $ticketM->get($idTicket);
        $ticketOwnerId = $ticketData && isset($ticketData->idUser) ? $ticketData->idUser : null;
        // El campo es 'title' (minúsculas) en la tabla Ticket
        $ticketTitle = null;
        if ($ticketData) {
            if (isset($ticketData->title) && !empty($ticketData->title)) {
                $ticketTitle = $ticketData->title;
            } elseif (isset($ticketData->Title) && !empty($ticketData->Title)) {
                $ticketTitle = $ticketData->Title;
            }
        }
        $ticketTitle = $ticketTitle ?: "Ticket #$idTicket";

        $stateObservation = isset($data->StateObservation) && trim($data->StateObservation) !== ''
            ? $data->StateObservation
            : "Asignado a $techUsername";

        $statePayload = (object) [
            'idTicket' => $idTicket,
            'idState' => 2,
            'StateObservation' => $stateObservation,
            'idUser' => (int) $data->idUser,
            'skipStateValidation' => true,
        ];

        if (!empty($data->StateImages) && is_array($data->StateImages)) {
            $statePayload->StateImages = $data->StateImages;
        }

        // Crear notificaciones específicas de asignación
        $assigningUserId = (int) $data->idUser;
        
        // Notificar al técnico asignado
        if ($techUserId && $techUserId !== $assigningUserId) {
            $this->createNotification(
                $assigningUserId,
                $techUserId,
                "Ticket asignado",
                "Se te ha asignado el ticket #$idTicket: $ticketTitle"
            );
        }
        
        // Notificar al dueño del ticket (si no es quien asigna)
        if ($ticketOwnerId && (int)$ticketOwnerId !== $assigningUserId) {
            $this->createNotification(
                $assigningUserId,
                (int)$ticketOwnerId,
                "Técnico asignado",
                "Tu ticket #$idTicket ha sido asignado a $techUsername"
            );
        }

        return $ticketM->update($statePayload);
    }

    /**
     * Crea una notificación en la base de datos
     * @param mixed $sender - ID del usuario que envía o null para Sistema
     * @param int $reciever - ID del usuario que recibe
     * @param string $event - Tipo de evento
     * @param string $descripcion - Descripción del evento
     */
    private function createNotification($sender, $reciever, $event, $descripcion)
    {
        $senderValue = $sender ? "'" . $this->enlace->escapeString($sender) . "'" : "NULL";
        $reciever = $this->enlace->escapeString($reciever);
        $event = $this->enlace->escapeString($event);
        $descripcion = $this->enlace->escapeString($descripcion);
        
        $vSql = "INSERT INTO notification (Descripcion, Sender, Reciever, DateOf, Event, idUser, idState) 
                 VALUES ('$descripcion', $senderValue, '$reciever', NOW(), '$event', '$reciever', 7)";
        
        $this->enlace->ExecuteSQL_DML($vSql);
    }
}