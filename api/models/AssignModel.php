<?php
class AssignModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener un assign por id en formato:
     * {
     *   idAssign, DateOfAssign, PriorityScore, WorkFlowRules, 
     *   Ticket: [ { idTicket, Title, DateOf, idState, User: { idUser, Username } } ],
     *   Technician: { idTechnician, idUser, Username }
     * }
     *
     * Si idWorkFlowRules es NULL -> WorkFlowRules = "Manual"
     */
    public function get($idTicket)
    {
        $idTicket = (int)$idTicket;

        $vSql = <<<SQL
SELECT
  a.idAssign,
  a.DateOfAssign,
  a.PriorityScore,
  a.idWorkFlowRules,
  tk.idTicket,
  tk.Title,
  tk.DateOfEntry AS EntryDate,
  tk.idState AS TicketState,
  tk.idUser AS TicketUserId,
  u_t.Username AS TicketUsername,
  tech.idTechnician,
  tech.idUser AS TechUserId,
  u_tech.Username AS TechUsername
FROM assign a
LEFT JOIN Ticket tk ON tk.idTicket = a.idTicket
LEFT JOIN `User` u_t ON u_t.idUser = tk.idUser
LEFT JOIN Technician tech ON tech.idTechnician = a.idTechnician
LEFT JOIN `User` u_tech ON u_tech.idUser = tech.idUser
WHERE a.idTicket = $idTicket
SQL;

        $rows = $this->enlace->ExecuteSQL($vSql);

        if (!is_array($rows) || count($rows) === 0) {
            return null; // no existe ese assign
        }

        // toma la primera fila
        $r = $rows[0];

        // Armar objeto assign
        $assign = new stdClass();
        $assign->idAssign = isset($r->idAssign) ? (int)$r->idAssign : null;
        $assign->DateOfAssign = $r->DateOfAssign ?? null;
        $assign->PriorityScore = isset($r->PriorityScore) ? (int)$r->PriorityScore : null;

        // WorkFlowRules: si es NULL -> "Manual", si no -> id (o cadena)
        $assign->WorkFlowRules = isset($r->idWorkFlowRules) && $r->idWorkFlowRules !== null
            ? (int)$r->idWorkFlowRules
            : 'Manual';

        // Ticket: lo devolvemos como array de objetos (puede estar vacío)
        $assign->Ticket = [];
        if (isset($r->idTicket) && $r->idTicket !== null) {
            $ticket = new stdClass();
            $ticket->idTicket = (int)$r->idTicket;
            $ticket->Title = $r->Title ?? '';
            $ticket->DateOfEntry = $r->EntryDate ?? null;
            $ticket->idState = isset($r->TicketState) ? (int)$r->TicketState : null;

            // user dentro del ticket
            $ticket->User = new stdClass();
            $ticket->User->idUser = isset($r->TicketUserId) ? (int)$r->TicketUserId : null;
            $ticket->User->Username = $r->TicketUsername ?? '';

            $assign->Ticket[] = $ticket;
        }

        // Technician fuera del ticket (objeto simple o null)
        if (isset($r->idTechnician) && $r->idTechnician !== null) {
            $tech = new stdClass();
            $tech->idTechnician = (int)$r->idTechnician;
            $tech->idUser = isset($r->TechUserId) ? (int)$r->TechUserId : null;
            $tech->Username = $r->TechUsername ?? '';
            $assign->Technician = $tech;
        } else {
            $assign->Technician = null;
        }

        return $assign;
    }
}