<?php
class AssignModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
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
            
            // Obtener usuario del técnico
            $vSqlTech = "SELECT idUser FROM Technician WHERE idTechnician = " . (int)$assign->idTechnician;
            $techData = $this->enlace->ExecuteSQL($vSqlTech);
            
            if (!empty($techData) && is_array($techData)) {
                $techUser = $userM->get($techData[0]->idUser);
                
                $assign->Technician = (object)[
                    'idTechnician' => (int) $assign->idTechnician,
                    'idUser' => isset($techUser->idUser) ? (int) $techUser->idUser : null,
                    'Username' => $techUser->Username ?? ''
                ];
            } else {
                $assign->Technician = null;
            }
        } else {
            $assign->Technician = null;
        }

        return $assign;
    }
}