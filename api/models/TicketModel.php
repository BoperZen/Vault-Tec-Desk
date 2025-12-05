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
                
                // Agregar objeto CategoryData completo con especialidades
                $vResultado->CategoryData = $category;
                
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
                        s.Description AS State,
                        u.Username AS ChangedBy
                 FROM StateRecord sr
                 LEFT JOIN State s ON s.idState = sr.idState
                 LEFT JOIN User u ON u.idUser = sr.idUser
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

        $creationDate = isset($objeto->CreationDate)
            ? $this->normalizeDateTime($objeto->CreationDate)
            : null;

        $creationDateValue = $creationDate
            ? "'{$this->enlace->escapeString($creationDate)}'"
            : "NOW()";

        // Consulta SQL para insertar - usar fecha proporcionada (OSI) o NOW() como respaldo
        $vSql = "INSERT INTO Ticket (title, Description, CreationDate, Priority, idCategory, idState, idUser)
                 VALUES (
                     '{$this->enlace->escapeString($objeto->title)}',
                     '{$this->enlace->escapeString($objeto->Description)}',
                     $creationDateValue,
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
                                'Ticket pendiente',
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

        // Crear notificación para el usuario (Sender null = Sistema)
        $this->createNotification(
            null,
            $objeto->idUser,
            'Ticket Creado',
            "Tu ticket #{$idTicket} '{$objeto->title}' ha sido creado exitosamente"
        );

        // Retornar el ticket completo creado
        return $this->get($idTicket);
    }

    /**
     * Crea una notificación en la base de datos
     * @param mixed $sender - ID del usuario que envía o null para Sistema
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

    /**
     * Normaliza una fecha recibida desde el frontend al formato Y-m-d H:i:s
     * Admitimos múltiples formatos comunes y caemos en null si no son válidos
     */
    private function normalizeDateTime($value)
    {
        if (!isset($value) || empty($value)) {
            return null;
        }

        $formats = ['Y-m-d H:i:s', 'Y-m-d\TH:i', 'Y-m-d\TH:i:s'];
        foreach ($formats as $format) {
            $date = DateTime::createFromFormat($format, $value);
            if ($date instanceof DateTime) {
                return $date->format('Y-m-d H:i:s');
            }
        }

        // Intentar parsear con DateTime regular por si envían ISO completo
        try {
            $fallback = new DateTime($value);
            return $fallback->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            return null;
        }
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
            if (!$oldTicket) {
                throw new Exception('El ticket especificado no existe');
            }

            if (!isset($objeto->idUser)) {
                throw new Exception('Se requiere el usuario que realiza el cambio de estado');
            }

            $newState = (int)$objeto->idState;
            $currentState = isset($oldTicket->idState) ? (int)$oldTicket->idState : null;
            $idUserForRecord = (int)$objeto->idUser;

            $skipValidation = !empty($objeto->skipStateValidation);

            // Solo validar transiciones si no se saltea la validación
            if (!$skipValidation) {
                $userModel = new UserModel();
                $actingUser = $userModel->get($idUserForRecord);
                if (!$actingUser) {
                    throw new Exception('Usuario no válido para registrar el cambio de estado');
                }

                $actingRole = null;
                if (isset($actingUser->idRol)) {
                    $actingRole = (int)$actingUser->idRol;
                } elseif (isset($actingUser->rol) && isset($actingUser->rol->idRol)) {
                    $actingRole = (int)$actingUser->rol->idRol;
                }

                if (!$actingRole) {
                    throw new Exception('No se pudo determinar el rol del usuario');
                }

                $technicianTransitions = [
                    2 => [3],
                    3 => [4],
                ];
                $clientTransitions = [
                    4 => [5],
                ];
                $adminTransitions = [
                    4 => [5],
                ];

                if ($actingRole === 1) {
                    $allowed = $technicianTransitions[$currentState] ?? [];
                    if (!in_array($newState, $allowed, true)) {
                        throw new Exception('Los técnicos solo pueden avanzar a En Proceso o marcar como Resuelto');
                    }
                } elseif ($actingRole === 2) {
                    $allowed = $clientTransitions[$currentState] ?? [];
                    if (!in_array($newState, $allowed, true)) {
                        throw new Exception('Solo puedes cerrar tickets que ya fueron resueltos');
                    }
                } elseif ($actingRole === 3) {
                    $allowed = $adminTransitions[$currentState] ?? [];
                    if (!in_array($newState, $allowed, true)) {
                        throw new Exception('Los administradores solo pueden cerrar tickets resueltos');
                    }
                } else {
                    throw new Exception('Rol no autorizado para actualizar estados');
                }
            }

            // Crear StateRecord si el estado cambió
            if ($currentState !== null && $currentState != $newState) {
                $observation = isset($objeto->StateObservation)
                    ? $this->enlace->escapeString($objeto->StateObservation)
                    : 'Estado actualizado';

                $vSqlStateRecord = "INSERT INTO StateRecord (idTicket, idState, idUser, Observation, DateOfChange)
                                    VALUES (
                                        $idTicket,
                                        $newState,
                                        $idUserForRecord,
                                        '$observation',
                                        NOW()
                                    )";
                $idStateRecord = $this->enlace->executeSQL_DML_last($vSqlStateRecord);

                // Crear notificación de cambio de estado (excepto estado 2 = Asignado, que ya tiene notificaciones específicas)
                // (con try-catch para no afectar la operación principal)
                if ($newState != 2) {
                    try {
                        $stateM = new StateModel();
                        $newStateObj = $stateM->get($newState);
                        $newStateName = $newStateObj ? $newStateObj->Description : 'Desconocido';
                        
                        // Notificar al creador del ticket
                        if (isset($oldTicket->idUser) && $oldTicket->idUser != $idUserForRecord) {
                            $this->createNotification(
                                $idUserForRecord,
                                $oldTicket->idUser,
                                "Cambio de estado",
                                "Tu ticket #$idTicket ha cambiado a: $newStateName"
                            );
                        }
                        
                        // Notificar al técnico asignado si existe y no es quien hizo el cambio
                        if (isset($oldTicket->Assign) && isset($oldTicket->Assign->Technician) && isset($oldTicket->Assign->Technician->idUser)) {
                            $techUserId = $oldTicket->Assign->Technician->idUser;
                            if ($techUserId != $idUserForRecord) {
                                $this->createNotification(
                                    $idUserForRecord,
                                    $techUserId,
                                    "Cambio de estado",
                                    "El ticket #$idTicket ha cambiado a: $newStateName"
                                );
                            }
                        }
                    } catch (Exception $notifError) {
                        error_log("Error creando notificación de cambio de estado: " . $notifError->getMessage());
                    }
                }

                // Guardar imágenes si hay
                if (!empty($objeto->StateImages) && is_array($objeto->StateImages)) {
                    $imageM = new ImageModel();
                    foreach ($objeto->StateImages as $imageString) {
                        $decoded = $this->decodeImagePayload($imageString);
                        if ($decoded === null) {
                            continue;
                        }

                        $imageData = (object) [
                            'Image' => $decoded,
                            'idStateRecord' => $idStateRecord,
                        ];
                        $imageM->create($imageData);
                    }
                }

                // Si el ticket pasa a estado 4 (Resuelto), decrementar la carga del técnico asignado
                if ($newState === 4 && isset($oldTicket->Assign) && isset($oldTicket->Assign->idTechnician)) {
                    $technicianM = new TechnicianModel();
                    $technicianM->decrementWorkload((int)$oldTicket->Assign->idTechnician);
                }
            }

            // Siempre agregar el cambio de estado al array de updates
            $updates[] = "idState = $newState";
        }

        if (isset($objeto->idLabel)) {
            if (empty($objeto->idLabel)) {
                $updates[] = "idLabel = NULL";
            } else {
                $updates[] = "idLabel = " . (int)$objeto->idLabel;
            }
        }

        // Si no hay campos para actualizar, devolver la versión actual
        if (empty($updates)) {
            return $this->get($idTicket);
        }

        // Ejecutar UPDATE con los cambios recopilados
        $vSql = "UPDATE Ticket SET " . implode(', ', $updates) . " WHERE idTicket = $idTicket";
        $this->enlace->executeSQL_DML($vSql);

        // Retornar el ticket actualizado con sus relaciones
        return $this->get($idTicket);
    }

    private function decodeImagePayload($value)
    {
        if (!is_string($value) || $value === '') {
            return null;
        }

        if (strpos($value, 'base64,') !== false) {
            $parts = explode('base64,', $value, 2);
            $value = $parts[1];
        }

        $value = str_replace(' ', '+', $value);
        $decoded = base64_decode($value, true);

        return $decoded !== false ? $decoded : null;
    }
}
