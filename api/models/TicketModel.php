<?php
class TicketModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar todos los tickets
     * @return array - Lista de objetos ticket con sus relaciones
     */
    public function all()
    {
        $categoryM = new CategoryModel();
        $stateM = new StateModel();
        $userM = new UserModel();
        $assignM = new AssignModel();
        
        // Consulta simple de tickets
        $vSql = "SELECT * FROM Ticket ORDER BY idTicket DESC";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Construir cada ticket con sus relaciones
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i] = $this->get($vResultado[$i]->idTicket);
            }
        }
        
        return $vResultado;
    }

    /**
     * Obtener un ticket específico con todas sus relaciones
     * @param int $idTicket - ID del ticket
     * @return object|null - Objeto ticket completo
     */
    public function get($idTicket)
    {
        $categoryM = new CategoryModel();
        $stateM = new StateModel();
        $userM = new UserModel();
        $assignM = new AssignModel();
        $labelM = new LabelModel();
        
        // Consulta básica del ticket
        $vSql = "SELECT * FROM Ticket WHERE idTicket = $idTicket";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $vResultado = $vResultado[0];
            
            // Agregar Category (nombre)
            if (isset($vResultado->idCategory) && $vResultado->idCategory) {
                $category = $categoryM->get($vResultado->idCategory);
                $vResultado->Category = $category ? $category->Categoryname : null;
            } else {
                $vResultado->Category = null;
            }
            
            // Agregar State (nombre)
            if (isset($vResultado->idState) && $vResultado->idState) {
                $state = $stateM->get($vResultado->idState);
                $vResultado->State = $state ? $state->Description : null;
            } else {
                $vResultado->State = null;
            }
            
            // Agregar Label (nombre)
            if (isset($vResultado->idLabel) && $vResultado->idLabel) {
                $label = $labelM->get($vResultado->idLabel);
                $vResultado->Label = $label ? $label->Description : null;
            }
            
            // Agregar User
            if (isset($vResultado->idUser) && $vResultado->idUser) {
                $user = $userM->get($vResultado->idUser);
                $vResultado->User = $user ? (object)[
                    'idUser' => $user->idUser,
                    'Username' => $user->Username,
                    'Email' => $user->Email
                ] : null;
            } else {
                $vResultado->User = null;
            }
            
            // Agregar Assign (si existe)
            $assign = $assignM->get($idTicket);
            if ($assign) {
                $vResultado->Assign = $assign;
            }
            
            // Agregar StateRecords
            $vResultado->StateRecords = $this->getStateRecords($idTicket);
            
            // Agregar ServiceReview (si el ticket está cerrado)
            if ($vResultado->State === 'Cerrado') {
                $vResultado->ServiceReview = $this->getServiceReview($idTicket);
            }
            
            // Renombrar DateOfEntry a CreationDate para consistencia con el frontend
            $vResultado->CreationDate = $vResultado->DateOfEntry;
            
            return $vResultado;
        }
        
        return null;
    }

    /**
     * Obtener tickets de un usuario específico
     * @param int $idUser - ID del usuario
     * @return array - Lista de tickets del usuario
     */
    public function UTicket($idUser)
    {
        $idUser = (int) $idUser;
        
        // Consulta simple de tickets del usuario
        $vSql = "SELECT * FROM Ticket WHERE idUser = $idUser ORDER BY idTicket DESC";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Construir cada ticket con sus relaciones
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i] = $this->get($vResultado[$i]->idTicket);
            }
        }
        
        return $vResultado;
    }

    /**
     * Obtener los registros de estado de un ticket
     * @param int $idTicket - ID del ticket
     * @return array - Lista de registros de estado
     */
    private function getStateRecords($idTicket)
    {
        $imageM = new ImageModel();
        
        $vSql = "SELECT sr.idStateRecord, sr.Observation, sr.DateOfChange, 
                        s.Description AS State
                 FROM StateRecord sr
                 LEFT JOIN State s ON s.idState = sr.idState
                 WHERE sr.idTicket = $idTicket
                 ORDER BY sr.DateOfChange ASC";
        
        $records = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($records) && is_array($records)) {
            for ($i = 0; $i < count($records); $i++) {
                // Obtener imágenes del state record
                $records[$i]->Images = $imageM->getImageStateRecord($records[$i]->idStateRecord);
            }
        }
        
        return $records ?: [];
    }

    /**
     * Obtener la reseña de servicio de un ticket
     * @param int $idTicket - ID del ticket
     * @return object|null - Objeto con la reseña o null
     */
    private function getServiceReview($idTicket)
    {
        $vSql = "SELECT idServiceReview, Score, Comment, DateOfReview
                 FROM ServiceReview
                 WHERE idTicket = $idTicket";
        
        $review = $this->enlace->ExecuteSQL($vSql);
        
        return (!empty($review)) ? $review[0] : null;
    }

    /**
     * Crear un nuevo ticket
     * @param object $objeto - Objeto con los datos del ticket
     * @return object - Objeto ticket creado
     */
    public function create($objeto)
    {
        // Validar campos requeridos
        if (empty($objeto->Title) || empty($objeto->Description) || 
            empty($objeto->idCategory) || empty($objeto->idUser)) {
            throw new Exception("Faltan campos requeridos para crear el ticket");
        }

        // Preparar fecha de creación
        $dateOfEntry = isset($objeto->CreationDate) && !empty($objeto->CreationDate) 
            ? date('Y-m-d H:i:s', strtotime($objeto->CreationDate))
            : date('Y-m-d H:i:s');

        // Estado por defecto: Pendiente (idState = 1)
        $idState = isset($objeto->idState) ? (int)$objeto->idState : 1;
        
        // Priority por defecto
        $priority = isset($objeto->Priority) ? (int)$objeto->Priority : 3;

        // Label (opcional)
        $idLabel = isset($objeto->idLabel) && !empty($objeto->idLabel) 
            ? (int)$objeto->idLabel 
            : 'NULL';

        // Consulta SQL para insertar
        $vSql = "INSERT INTO Ticket (Title, Description, DateOfEntry, Priority, idCategory, idState, idUser, idLabel)
                 VALUES (
                     '{$this->enlace->escapeString($objeto->Title)}',
                     '{$this->enlace->escapeString($objeto->Description)}',
                     '$dateOfEntry',
                     $priority,
                     {$objeto->idCategory},
                     $idState,
                     {$objeto->idUser},
                     $idLabel
                 )";

        // Ejecutar insert y obtener el ID del ticket creado
        $idTicket = $this->enlace->executeSQL_DML_last($vSql);

        // Crear el primer StateRecord (Ticket creado)
        $vSqlStateRecord = "INSERT INTO StateRecord (idTicket, idState, Observation, DateOfChange)
                            VALUES (
                                $idTicket,
                                $idState,
                                'Ticket creado',
                                '$dateOfEntry'
                            )";
        $this->enlace->executeSQL_DML($vSqlStateRecord);

        // Retornar el ticket completo creado
        return $this->get($idTicket);
    }

    /**
     * Actualizar un ticket existente
     * @param object $objeto - Objeto con los datos del ticket a actualizar
     * @return object - Objeto ticket actualizado
     */
    public function update($objeto)
    {
        // Validar que existe el ID
        if (empty($objeto->idTicket)) {
            throw new Exception("El ID del ticket es requerido para actualizar");
        }

        $idTicket = (int)$objeto->idTicket;

        // Construir la consulta UPDATE solo con los campos proporcionados
        $updates = [];

        if (isset($objeto->Title)) {
            $updates[] = "Title = '{$this->enlace->escapeString($objeto->Title)}'";
        }

        if (isset($objeto->Description)) {
            $updates[] = "Description = '{$this->enlace->escapeString($objeto->Description)}'";
        }

        if (isset($objeto->Priority)) {
            $updates[] = "Priority = " . (int)$objeto->Priority;
        }

        if (isset($objeto->idCategory)) {
            $updates[] = "idCategory = " . (int)$objeto->idCategory;
        }

        if (isset($objeto->idState)) {
            $oldTicket = $this->get($idTicket);
            $newState = (int)$objeto->idState;
            
            // Si el estado cambió, crear un StateRecord
            if ($oldTicket && isset($oldTicket->idState) && $oldTicket->idState != $newState) {
                $observation = isset($objeto->StateObservation) 
                    ? $this->enlace->escapeString($objeto->StateObservation)
                    : 'Estado actualizado';
                
                $vSqlStateRecord = "INSERT INTO StateRecord (idTicket, idState, Observation, DateOfChange)
                                    VALUES (
                                        $idTicket,
                                        $newState,
                                        '$observation',
                                        NOW()
                                    )";
                $this->enlace->executeSQL_DML($vSqlStateRecord);
            }
            
            $updates[] = "idState = $newState";
        }

        if (isset($objeto->idLabel)) {
            if (empty($objeto->idLabel)) {
                $updates[] = "idLabel = NULL";
            } else {
                $updates[] = "idLabel = " . (int)$objeto->idLabel;
            }
        }

        // Si no hay nada que actualizar, retornar el ticket actual
        if (empty($updates)) {
            return $this->get($idTicket);
        }

        // Ejecutar UPDATE
        $vSql = "UPDATE Ticket SET " . implode(', ', $updates) . " WHERE idTicket = $idTicket";
        $this->enlace->executeSQL_DML($vSql);

        // Retornar el ticket actualizado
        return $this->get($idTicket);
    }
}
