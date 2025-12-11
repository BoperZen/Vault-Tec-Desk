<?php
class NotificationModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all($idUser)
    {
        $idUser = (int)$idUser;
        $vSql = "SELECT * FROM notification WHERE Reciever = '$idUser' ORDER BY DateOf DESC";
        
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $userModel = new UserModel();
            
            for ($i = 0; $i < count($vResultado); $i++) {
                // Agregar nombre del remitente
                if (!empty($vResultado[$i]->Sender)) {
                    $sender = $userModel->get($vResultado[$i]->Sender);
                    $vResultado[$i]->SenderName = $sender ? $sender->Username : null;
                } else {
                    $vResultado[$i]->SenderName = null;
                }
            }
        }
        
        return $vResultado ?: [];
    }

    public function markAsRead($idNotification)
    {
        $idNotification = (int)$idNotification;
        $vSql = "UPDATE notification SET idState = 6 WHERE idNotification = $idNotification";
        
        $this->enlace->ExecuteSQL_DML($vSql);
        return true;
    }

    public function markAllAsRead($idUser)
    {
        $idUser = (int)$idUser;
        $vSql = "UPDATE notification SET idState = 6 WHERE Reciever = '$idUser' AND idState = 7";
        
        $this->enlace->ExecuteSQL_DML($vSql);
        return true;
    }

    /**
     * Crear una notificación
     * @param int $sender - ID del usuario que envía (puede ser null para sistema)
     * @param int $receiver - ID del usuario que recibe
     * @param string $event - Título/Evento de la notificación
     * @param string $descripcion - Descripción de la notificación
     * @param int $idUser - ID del usuario relacionado (usa receiver si no se proporciona)
     * @return array - Resultado de la operación
     */
    public function create($sender, $receiver, $event, $descripcion, $idUser = null)
    {
        try {
            $sender = $sender ? (int)$sender : 'NULL';
            $receiver = (int)$receiver;
            $event = $this->enlace->escapeString($event);
            $descripcion = $this->enlace->escapeString($descripcion);
            $idUser = $idUser ? (int)$idUser : $receiver; // Usa receiver si no hay idUser
            $dateOf = date('Y-m-d H:i:s');
            $idState = 7; // Sin leer

            $vSql = "INSERT INTO notification (Sender, Reciever, Event, Descripcion, DateOf, idUser, idState) 
                     VALUES ($sender, $receiver, '$event', '$descripcion', '$dateOf', $idUser, $idState)";
            
            $this->enlace->ExecuteSQL_DML($vSql);
            
            return [
                'success' => true,
                'message' => 'Notificación creada exitosamente'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al crear notificación: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Crear notificación de inicio de sesión
     * @param int $userId - ID del usuario que inició sesión
     * @return array - Resultado de la operación
     */
    public function createLoginNotification($userId)
    {
        $dateTime = date('d/m/Y H:i');
        return $this->create(
            null, // Sistema como remitente
            $userId,
            'Inicio de sesión',
            "Has iniciado sesión el $dateTime. Si no fuiste tú, cambia tu contraseña inmediatamente."
        );
    }
}
