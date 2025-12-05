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
}
