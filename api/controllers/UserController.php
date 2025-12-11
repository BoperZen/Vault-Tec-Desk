<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class user
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->all();
        //Dar respuesta
        $response->toJSON($result);
    }
    
    public function get($param)
    {
        $response = new Response();
        $usuario = new UserModel();
        $result = $usuario->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }

    /**
     * Login de usuario
     * POST /api/user/login
     */
    public function login()
    {
        $response = new Response();
        $request = new Request();
        
        try {
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos de login requeridos'
                ]);
                return;
            }

            $usuario = new UserModel();
            $result = $usuario->login($inputJSON);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Registro de nuevo usuario
     * POST /api/user/register
     */
    public function register()
    {
        $response = new Response();
        $request = new Request();
        
        try {
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos de registro requeridos'
                ]);
                return;
            }

            $usuario = new UserModel();
            $result = $usuario->register($inputJSON);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Verificar token de usuario
     * POST /api/user/verify
     */
    public function verify()
    {
        $response = new Response();
        $request = new Request();
        
        try {
            // Obtener token del header Authorization
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (empty($authHeader)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Token no proporcionado'
                ]);
                return;
            }

            // Extraer token (formato: "Bearer <token>")
            $token = str_replace('Bearer ', '', $authHeader);
            
            $usuario = new UserModel();
            $result = $usuario->verifyToken($token);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error al verificar token: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Crear usuario (Admin)
     * POST /api/user/create
     */
    public function create()
    {
        $response = new Response();
        $request = new Request();
        
        try {
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos requeridos'
                ]);
                return;
            }

            $usuario = new UserModel();
            $result = $usuario->create($inputJSON);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Actualizar usuario (sin contraseña)
     * PUT /api/user/update/{id}
     */
    public function update($param)
    {
        $response = new Response();
        $request = new Request();
        
        try {
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos requeridos'
                ]);
                return;
            }

            $usuario = new UserModel();
            $result = $usuario->update($param, $inputJSON);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Eliminar usuario
     * DELETE /api/user/delete/{id}
     */
    public function delete($param)
    {
        $response = new Response();
        
        try {
            $usuario = new UserModel();
            $result = $usuario->delete($param);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Restablecer contraseña
     * POST /api/user/resetPassword
     */
    public function resetPassword()
    {
        $response = new Response();
        $request = new Request();
        
        try {
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON || !isset($inputJSON->idUser) || !isset($inputJSON->newPassword)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'ID de usuario y nueva contraseña requeridos'
                ]);
                return;
            }

            $usuario = new UserModel();
            $result = $usuario->resetPassword($inputJSON->idUser, $inputJSON->newPassword);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Cambiar contraseña del usuario
     * POST /api/user/changePassword
     */
    public function changePassword()
    {
        $response = new Response();
        $request = new Request();
        
        try {
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON || !isset($inputJSON->idUser) || !isset($inputJSON->currentPassword) || !isset($inputJSON->newPassword)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos incompletos'
                ]);
                return;
            }

            $usuario = new UserModel();
            $result = $usuario->changePassword($inputJSON->idUser, $inputJSON->currentPassword, $inputJSON->newPassword);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener usuarios por rol
     * GET /api/user/role/{idRol}
     */
    public function getByRole($param)
    {
        $response = new Response();
        
        try {
            $usuario = new UserModel();
            $result = $usuario->getByRole($param);
            
            $response->toJSON($result);
            
        } catch (Exception $e) {
            $response->toJSON([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ]);
        }
    }
}
