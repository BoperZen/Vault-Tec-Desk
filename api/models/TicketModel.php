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
        // Consulta simple de tickets
        $vSql = "SELECT * FROM Ticket ORDER BY idTicket ASC";
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
        $priorityM = new PriorityModel();
        $slaM = new SlaModel();
        
        // Consulta básica del ticket
        $vSql = "SELECT * FROM Ticket WHERE idTicket = $idTicket";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $vResultado = $vResultado[0];
            
            // Normalizar title a Title para compatibilidad con frontend
            if (isset($vResultado->title)) {
                $vResultado->Title = $vResultado->title;
            }
            
            // Agregar Category (nombre) y datos de SLA
            if (isset($vResultado->idCategory) && $vResultado->idCategory) {
                $category = $categoryM->get($vResultado->idCategory);
                $vResultado->Category = $category ? $category->Categoryname : null;
                
                // Obtener SLA de la categoría (intentar ambos formatos de nombre)
                $idSLA = null;
                if ($category && isset($category->idSLA)) {
                    $idSLA = $category->idSLA;
                } elseif ($category && isset($category->idSla)) {
                    $idSLA = $category->idSla;
                }
                
                if ($idSLA) {
                    $sla = $slaM->get($idSLA);
                    if ($sla) {
                        $vResultado->SLA = (object)[
                            'ResponseTime' => (int)$sla->MaxAnswerTime,
                            'ResolutionTime' => (int)$sla->MaxResolutionTime
                        ];
                        
                        // Calcular fechas SLA basadas en fecha de creación
                        if (isset($vResultado->CreationDate)) {
                            $creationDate = new DateTime($vResultado->CreationDate);
                            $now = new DateTime(); // Hora del servidor de BD
                            
                            // SLA de Respuesta = fecha creación + tiempo máximo de respuesta (en horas)
                            $responseSLA = clone $creationDate;
                            $responseSLA->add(new DateInterval('PT' . $sla->MaxAnswerTime . 'H'));
                            $vResultado->SLA->ResponseDeadline = $responseSLA->format('Y-m-d H:i:s');
                            
                            // SLA de Resolución = fecha creación + tiempo máximo de resolución (en horas)
                            $resolutionSLA = clone $creationDate;
                            $resolutionSLA->add(new DateInterval('PT' . $sla->MaxResolutionTime . 'H'));
                            $vResultado->SLA->ResolutionDeadline = $resolutionSLA->format('Y-m-d H:i:s');
                            
                            // Calcular horas restantes desde el servidor (no desde el cliente)
                            $responseSeconds = $responseSLA->getTimestamp() - $now->getTimestamp();
                            $resolutionSeconds = $resolutionSLA->getTimestamp() - $now->getTimestamp();
                            
                            $vResultado->SLA->ResponseHoursRemaining = round($responseSeconds / 3600, 1);
                            $vResultado->SLA->ResolutionHoursRemaining = round($resolutionSeconds / 3600, 1);
                        }
                    }
                }
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
            
            // Agregar Priority (nombre)
            if (isset($vResultado->Priority) && $vResultado->Priority) {
                $priority = $priorityM->get($vResultado->Priority);
                $vResultado->PriorityName = $priority ? $priority->Description : null;
            } else {
                $vResultado->PriorityName = null;
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
        if (empty($objeto->title) || empty($objeto->Description) || 
            empty($objeto->idCategory) || empty($objeto->idUser)) {
            throw new Exception("Faltan campos requeridos para crear el ticket");
        }

        // Estado por defecto: Pendiente (idState = 1)
        $idState = isset($objeto->idState) ? (int)$objeto->idState : 1;
        
        // Priority por defecto
        $priority = isset($objeto->Priority) ? (int)$objeto->Priority : 3;

        // Consulta SQL para insertar - usar NOW() de MySQL para respetar zona horaria
        $vSql = "INSERT INTO Ticket (title, Description, CreationDate, Priority, idCategory, idState, idUser)
                 VALUES (
                     '{$this->enlace->escapeString($objeto->title)}',
                     '{$this->enlace->escapeString($objeto->Description)}',
                     NOW(),
                     $priority,
                     {$objeto->idCategory},
                     $idState,
                     {$objeto->idUser}
                 )";

        // Ejecutar insert y obtener el ID del ticket creado
        $idTicket = $this->enlace->executeSQL_DML_last($vSql);

        // Crear el primer StateRecord (Ticket creado) - usar NOW() de MySQL
        $vSqlStateRecord = "INSERT INTO StateRecord (idTicket, idState, idUser, Observation, DateOfChange)
                            VALUES (
                                $idTicket,
                                $idState,
                                {$objeto->idUser},
                                'Ticket creado',
                                NOW()
                            )";
        $idStateRecord = $this->enlace->executeSQL_DML_last($vSqlStateRecord);

        // Si hay imágenes, crearlas vinculadas al StateRecord
        if (isset($objeto->images) && is_array($objeto->images) && !empty($objeto->images)) {
            $imageM = new ImageModel();
            foreach ($objeto->images as $imagePath) {
                if (!empty($imagePath)) {
                    $imageData = (object)[
                        'Image' => $imagePath,
                        'idStateRecord' => $idStateRecord
                    ];
                    $imageM->create($imageData);
                }
            }
        }

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

        if (isset($objeto->title)) {
            $updates[] = "title = '{$this->enlace->escapeString($objeto->title)}'";
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
                
                // Obtener idUser del ticket actual o del objeto
                $idUserForRecord = isset($objeto->idUser) ? (int)$objeto->idUser : (int)$oldTicket->idUser;
                
                $vSqlStateRecord = "INSERT INTO StateRecord (idTicket, idState, idUser, Observation, DateOfChange)
                                    VALUES (
                                        $idTicket,
                                        $newState,
                                        $idUserForRecord,
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
