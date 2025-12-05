<?php
class notification
{
    public function get($idUser)
    {
        try {
            $response = new Response();
            $notificationModel = new NotificationModel();
            $result = $notificationModel->all($idUser);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function read()
    {
        try {
            $response = new Response();
            // Obtener idNotification de la URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($uri, '/'));
            $idNotification = end($parts);
            
            $notificationModel = new NotificationModel();
            $result = $notificationModel->markAsRead($idNotification);
            $response->toJSON(['success' => true]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function readall()
    {
        try {
            $response = new Response();
            // Obtener idUser de la URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($uri, '/'));
            $idUser = end($parts);
            
            $notificationModel = new NotificationModel();
            $result = $notificationModel->markAllAsRead($idUser);
            $response->toJSON(['success' => true]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
