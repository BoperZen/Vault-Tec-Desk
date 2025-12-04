<?php
class TechnicianModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar todos los técnicos
     * @return array - Lista de técnicos con sus relaciones
     */
    public function all()
    {
        // Consulta simple de técnicos
        $vSql = "SELECT * FROM technician";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Construir cada técnico con sus relaciones
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i] = $this->get($vResultado[$i]->idTechnician);
            }
        }
        
        return $vResultado;
    }

    /**
     * Obtener un técnico específico con todas sus relaciones
     * @param int $idTechnician - ID del técnico
     * @return object|null - Objeto técnico completo
     */
    public function get($idTechnician)
    {
        $userM = new UserModel();
        $specialtyM = new SpecialtyModel();
        
        $idTechnician = (int) $idTechnician;
        
        // Consulta básica del técnico
        $vSql = "SELECT * FROM technician WHERE idTechnician = $idTechnician";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $vResultado = $vResultado[0];
            
            // Normalizar WorkLoad (la BD tiene 'Workload', el frontend espera 'WorkLoad')
            if (isset($vResultado->Workload)) {
                $vResultado->WorkLoad = $vResultado->Workload;
            } else {
                $vResultado->WorkLoad = 0;
            }
            
            // Agregar información del usuario
            if (isset($vResultado->idUser) && $vResultado->idUser) {
                $user = $userM->get($vResultado->idUser);
                if ($user) {
                    $vResultado->Username = $user->Username;
                    $vResultado->Email = $user->Email;
                    $vResultado->LastSesion = $user->LastSesion;
                    $vResultado->idRol = $user->idRol;
                }
            }
            
            // Agregar especialidades
            $vResultado->Specialties = $this->getSpecialties($idTechnician);
            
            // Agregar los IDs de especialidades como array
            $vResultado->SpecialtyIds = $this->getSpecialtyIds($idTechnician);
            
            // Normalizar campos de avatar
            $vResultado->AvatarStyle = isset($vResultado->AvatarStyle) ? $vResultado->AvatarStyle : 'avataaars';
            $vResultado->AvatarSeed = isset($vResultado->AvatarSeed) ? $vResultado->AvatarSeed : '';
            
            return $vResultado;
        }
        
        return null;
    }

    /**
     * Obtener información simple del técnico (solo WorkLoad)
     * @param int $idTechnician - ID del técnico
     * @return object|null - Objeto con WorkLoad
     */
    public function Simple($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        $vSql = "SELECT WorkLoad FROM technician WHERE idTechnician = $idTechnician";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (is_array($vResultado) && count($vResultado) > 0) {
            return $vResultado[0];
        }

        return null;
    }

    /**
     * Recalcular y actualizar el WorkLoad de un técnico basado en tickets activos
     * Tickets activos = estados 1 (Pendiente), 2 (Asignado), 3 (En Proceso)
     * Máximo de carga = 5
     * @param int $idTechnician - ID del técnico
     * @return int - Nuevo valor de WorkLoad
     */
    public function recalculateWorkload($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        // Contar tickets activos asignados al técnico (estados 1, 2, 3)
        $vSql = "SELECT COUNT(*) as activeTickets 
                 FROM assign a
                 INNER JOIN Ticket t ON t.idTicket = a.idTicket
                 WHERE a.idTechnician = $idTechnician 
                 AND t.idState IN (1, 2, 3)";
        
        $result = $this->enlace->ExecuteSQL($vSql);
        $workload = 0;
        
        if (!empty($result) && is_array($result)) {
            $workload = (int) $result[0]->activeTickets;
        }

        // Limitar a máximo 5
        $workload = min($workload, 5);

        // Actualizar el WorkLoad en la tabla technician
        $vSqlUpdate = "UPDATE technician SET WorkLoad = $workload WHERE idTechnician = $idTechnician";
        $this->enlace->ExecuteSQL_DML($vSqlUpdate);

        return $workload;
    }

    /**
     * Incrementar el WorkLoad de un técnico en 1 (máximo 5)
     * @param int $idTechnician - ID del técnico
     * @return bool - true si se actualizó correctamente
     */
    public function incrementWorkload($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        // Incrementar solo si es menor a 5
        $vSql = "UPDATE technician SET WorkLoad = LEAST(WorkLoad + 1, 5) WHERE idTechnician = $idTechnician";
        $this->enlace->ExecuteSQL_DML($vSql);

        return true;
    }

    /**
     * Decrementar el WorkLoad de un técnico en 1 (mínimo 0)
     * @param int $idTechnician - ID del técnico
     * @return bool - true si se actualizó correctamente
     */
    public function decrementWorkload($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        // Decrementar solo si es mayor a 0
        $vSql = "UPDATE technician SET WorkLoad = GREATEST(WorkLoad - 1, 0) WHERE idTechnician = $idTechnician";
        $this->enlace->ExecuteSQL_DML($vSql);

        return true;
    }

    /**
     * Obtener un técnico a partir del ID de usuario
     * @param int $idUser - ID del usuario relacionado
     * @return object|null - Objeto técnico completo o null si no existe
     */
    public function getByUserId($idUser)
    {
        $idUser = (int) $idUser;

        if ($idUser <= 0) {
            return null;
        }

        $vSql = "SELECT idTechnician FROM technician WHERE idUser = $idUser LIMIT 1";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_array($vResultado)) {
            $record = $vResultado[0];
            if (isset($record->idTechnician)) {
                return $this->get((int) $record->idTechnician);
            }
        }

        return null;
    }

    /**
     * Obtener las especialidades de un técnico
     * @param int $idTechnician - ID del técnico
     * @return array - Lista de nombres de especialidades
     */
    private function getSpecialties($idTechnician)
    {
        $vSql = "SELECT s.Description
                 FROM specialty s
                 INNER JOIN technician_specialty ts ON ts.idSpecialty = s.idSpecialty
                 WHERE ts.idTechnician = $idTechnician
                 ORDER BY s.Description";
        
        $specialties = $this->enlace->ExecuteSQL($vSql);
        
        // Extraer solo los nombres en un array simple
        $result = [];
        if (!empty($specialties) && is_array($specialties)) {
            foreach ($specialties as $specialty) {
                $result[] = $specialty->Description;
            }
        }
        
        return $result;
    }

    /**
     * Obtener los IDs de las especialidades de un técnico
     * @param int $idTechnician - ID del técnico
     * @return array - Lista de IDs de especialidades
     */
    private function getSpecialtyIds($idTechnician)
    {
        $vSql = "SELECT s.idSpecialty
                 FROM specialty s
                 INNER JOIN technician_specialty ts ON ts.idSpecialty = s.idSpecialty
                 WHERE ts.idTechnician = $idTechnician
                 ORDER BY s.Description";
        
        $specialties = $this->enlace->ExecuteSQL($vSql);
        
        // Extraer solo los IDs en un array simple
        $result = [];
        if (!empty($specialties) && is_array($specialties)) {
            foreach ($specialties as $specialty) {
                $result[] = $specialty->idSpecialty;
            }
        }
        
        return $result;
    }

    /**
     * Crear un nuevo técnico
     * @param object $data - Datos del técnico (Username, Email, Password, idSpecialty)
     * @return array - Resultado con success y data/message
     */
    public function create($data)
    {
        try {
            // Validar datos requeridos
            if (empty($data->Username)) {
                return ['success' => false, 'message' => 'El nombre de usuario es requerido'];
            }

            if (empty($data->Email)) {
                return ['success' => false, 'message' => 'El email es requerido'];
            }

            if (empty($data->Password)) {
                return ['success' => false, 'message' => 'La contraseña es requerida'];
            }

            if (empty($data->specialties)) {
                return ['success' => false, 'message' => 'Al menos una especialidad es requerida'];
            }

            // Validar formato de email
            if (!filter_var($data->Email, FILTER_VALIDATE_EMAIL)) {
                return ['success' => false, 'message' => 'El formato del email no es válido'];
            }

            // Verificar si el email ya existe
            $emailCheck = "SELECT idUser FROM user WHERE Email = '" . $this->enlace->escapeString($data->Email) . "'";
            $existingEmail = $this->enlace->ExecuteSQL($emailCheck);
            if (!empty($existingEmail)) {
                return ['success' => false, 'message' => 'El email ya está registrado'];
            }

            // Verificar si el username ya existe
            $usernameCheck = "SELECT idUser FROM user WHERE Username = '" . $this->enlace->escapeString($data->Username) . "'";
            $existingUsername = $this->enlace->ExecuteSQL($usernameCheck);
            if (!empty($existingUsername)) {
                return ['success' => false, 'message' => 'El nombre de usuario ya está registrado'];
            }

            // Escapar valores
            $username = $this->enlace->escapeString($data->Username);
            $email = $this->enlace->escapeString($data->Email);
            $password = password_hash($data->Password, PASSWORD_DEFAULT);
            $avatarStyle = isset($data->avatarStyle) ? $this->enlace->escapeString($data->avatarStyle) : 'avataaars';
            $avatarSeed = isset($data->avatarSeed) ? $this->enlace->escapeString($data->avatarSeed) : '';

            // Crear usuario primero (idRol = 1 para técnicos)
            $vSqlUser = "INSERT INTO user (Username, Email, Password, idRol) 
                        VALUES ('$username', '$email', '$password', 1)";
            
            $idUser = $this->enlace->executeSQL_DML_last($vSqlUser);

            // Crear técnico con valores por defecto
            $vSql = "INSERT INTO technician (idUser, WorkLoad, AvatarStyle, AvatarSeed) 
                     VALUES ($idUser, 0, '$avatarStyle', '$avatarSeed')";
            
            $idTechnician = $this->enlace->executeSQL_DML_last($vSql);

            // Asignar especialidades (múltiples)
            if (is_array($data->specialties)) {
                foreach ($data->specialties as $idSpecialty) {
                    $idSpec = (int)$idSpecialty;
                    $vSqlSpecialty = "INSERT INTO technician_specialty (idTechnician, idSpecialty) 
                                      VALUES ($idTechnician, $idSpec)";
                    $this->enlace->ExecuteSQL_DML($vSqlSpecialty);
                }
            }

            return [
                'success' => true,
                'data' => $this->get($idTechnician),
                'message' => 'Técnico creado exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear técnico: ' . $e->getMessage()];
        }
    }

    /**
     * Actualizar un técnico existente
     * @param object $data - Datos del técnico incluyendo idTechnician
     * @return array - Resultado con success y data/message
     */
    public function update($data)
    {
        try {
            // Validar ID
            if (empty($data->idTechnician)) {
                return ['success' => false, 'message' => 'ID de técnico es requerido'];
            }

            $idTechnician = (int)$data->idTechnician;

            // Obtener técnico actual
            $currentTechnician = $this->get($idTechnician);
            if (!$currentTechnician) {
                return ['success' => false, 'message' => 'Técnico no encontrado'];
            }

            if (empty($data->Username)) {
                return ['success' => false, 'message' => 'El nombre de usuario es requerido'];
            }

            if (empty($data->Email)) {
                return ['success' => false, 'message' => 'El email es requerido'];
            }

            if (empty($data->specialties)) {
                return ['success' => false, 'message' => 'Al menos una especialidad es requerida'];
            }

            // Validar formato de email
            if (!filter_var($data->Email, FILTER_VALIDATE_EMAIL)) {
                return ['success' => false, 'message' => 'El formato del email no es válido'];
            }

            $idUser = (int)$currentTechnician->idUser;

            // Verificar si el email ya existe (excepto el actual)
            $emailCheck = "SELECT idUser FROM user WHERE Email = '" . $this->enlace->escapeString($data->Email) . "' AND idUser != $idUser";
            $existingEmail = $this->enlace->ExecuteSQL($emailCheck);
            if (!empty($existingEmail)) {
                return ['success' => false, 'message' => 'El email ya está registrado'];
            }

            // Verificar si el username ya existe (excepto el actual)
            $usernameCheck = "SELECT idUser FROM user WHERE Username = '" . $this->enlace->escapeString($data->Username) . "' AND idUser != $idUser";
            $existingUsername = $this->enlace->ExecuteSQL($usernameCheck);
            if (!empty($existingUsername)) {
                return ['success' => false, 'message' => 'El nombre de usuario ya está registrado'];
            }

            // Escapar valores
            $username = $this->enlace->escapeString($data->Username);
            $email = $this->enlace->escapeString($data->Email);

            // Actualizar usuario
            $vSqlUser = "UPDATE user 
                        SET Username = '$username', 
                            Email = '$email'";
            
            // Si se proporciona nueva contraseña, actualizarla
            if (!empty($data->Password)) {
                $password = password_hash($data->Password, PASSWORD_DEFAULT);
                $vSqlUser .= ", Password = '$password'";
            }
            
            $vSqlUser .= " WHERE idUser = $idUser";
            $this->enlace->ExecuteSQL_DML($vSqlUser);

            // Actualizar avatarStyle y avatarSeed si se proporcionan
            if (isset($data->avatarStyle) || isset($data->avatarSeed)) {
                $updates = [];
                if (isset($data->avatarStyle)) {
                    $avatarStyle = $this->enlace->escapeString($data->avatarStyle);
                    $updates[] = "AvatarStyle = '$avatarStyle'";
                }
                if (isset($data->avatarSeed)) {
                    $avatarSeed = $this->enlace->escapeString($data->avatarSeed);
                    $updates[] = "AvatarSeed = '$avatarSeed'";
                }
                if (!empty($updates)) {
                    $vSqlAvatar = "UPDATE technician SET " . implode(', ', $updates) . " WHERE idTechnician = $idTechnician";
                    $this->enlace->ExecuteSQL_DML($vSqlAvatar);
                }
            }

            // Actualizar especialidades del técnico
            // Eliminar especialidades actuales
            $vSqlDeleteSpecialty = "DELETE FROM technician_specialty WHERE idTechnician = $idTechnician";
            $this->enlace->ExecuteSQL_DML($vSqlDeleteSpecialty);
            
            // Insertar nuevas especialidades (múltiples)
            if (is_array($data->specialties)) {
                foreach ($data->specialties as $idSpecialty) {
                    $idSpec = (int)$idSpecialty;
                    $vSqlSpecialty = "INSERT INTO technician_specialty (idTechnician, idSpecialty) 
                                      VALUES ($idTechnician, $idSpec)";
                    $this->enlace->ExecuteSQL_DML($vSqlSpecialty);
                }
            }

            return [
                'success' => true,
                'data' => $this->get($idTechnician),
                'message' => 'Técnico actualizado exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al actualizar técnico: ' . $e->getMessage()];
        }
    }
}
