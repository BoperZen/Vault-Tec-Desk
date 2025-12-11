<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{
		$this->enlace = new MySqlConnect();
	}

	/**
	 * Listar todos los usuarios
	 * @return array - Lista de usuarios
	 */
	public function all()
	{
		$rolM = new RolModel();
		
		// Consulta SQL
		$vSql = "SELECT * FROM user";
		
		// Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		
		// Agregar rol a cada usuario
		if (!empty($vResultado) && is_array($vResultado)) {
			for ($i = 0; $i < count($vResultado); $i++) {
				$rol = $rolM->getRolUser($vResultado[$i]->idUser);
				$vResultado[$i]->rol = $rol;
			}
		}
		
		// Retornar el objeto
		return $vResultado;
	}

	/**
	 * Obtener todos los usuarios con un rol específico
	 * @param int $idRol - ID del rol
	 * @return array - Lista de usuarios con ese rol
	 */
	public function getByRole($idRol)
	{
		$idRol = intval($idRol);
		$vSql = "SELECT idUser, Username, Email FROM user WHERE idRol = $idRol";
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		return $vResultado ?: [];
	}

	/**
	 * Obtener un usuario específico con su rol
	 * @param int $id - ID del usuario
	 * @return object|null - Objeto usuario con rol
	 */
	public function get($id)
	{
		$rolM = new RolModel();
		$id = intval($id);

		// Consulta básica del usuario
		$vSql = "SELECT
					idUser,
					Username,
					Email,
					idRol,
					DATE_FORMAT(LastSesion, '%Y-%m-%d %H:%i:%s') AS LastSesion
				FROM `User`
				WHERE idUser = {$id}
				LIMIT 1";

		$vResultado = $this->enlace->ExecuteSQL($vSql);
		
		if ($vResultado) {
			$vResultado = $vResultado[0];
			
			// Agregar información del rol
			$rol = $rolM->getRolUser($id);
			$vResultado->rol = $rol;
			
			return $vResultado;
		} else {
			return null;
		}
	}

	//----------------------------------------------------------------------
	//-------- Métodos de Autenticación -----------
	//----------------------------------------------------------------------

	/**
	 * Login de usuario
	 * @param object $objeto - Credenciales (Email/Username, Password)
	 * @return array - Resultado con success, data, token o message
	 */
	public function login($objeto)
	{
		try {
			// Validar que vengan las credenciales
			if (empty($objeto->identifier) || empty($objeto->password)) {
				return [
					'success' => false,
					'message' => 'Email/Usuario y contraseña son requeridos'
				];
			}

			$identifier = $this->enlace->escapeString($objeto->identifier);
			$password = $objeto->password;

			// Determinar si es email o username
			$isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL) !== false;
			$identifierType = $isEmail ? 'email' : 'username';

			// Buscar usuario por email o username
			$vSql = "SELECT idUser, Username, Email, Password, idRol 
					 FROM user 
					 WHERE Email = '$identifier' OR Username = '$identifier'
					 LIMIT 1";
			
			$result = $this->enlace->ExecuteSQL($vSql);

			if (empty($result)) {
				return [
					'success' => false,
					'message' => 'userNotFound',
					'identifierType' => $identifierType
				];
			}

			$user = $result[0];

			// Verificar contraseña
			if (!password_verify($password, $user->Password)) {
				return [
					'success' => false,
					'message' => 'wrongPassword',
					'identifierType' => $identifierType
				];
			}

			// Actualizar última sesión
			$updateSql = "UPDATE user SET LastSesion = NOW() WHERE idUser = {$user->idUser}";
			$this->enlace->ExecuteSQL_DML($updateSql);

			// Generar token JWT
			$secretKey = Config::get('SECRET_KEY');
			
			$payload = [
				'iat' => time(),
				'exp' => time() + (60 * 60 * 24 * 7), // 7 días
				'idUser' => $user->idUser,
				'username' => $user->Username,
				'email' => $user->Email,
				'idRol' => $user->idRol
			];

			$token = JWT::encode($payload, $secretKey, 'HS256');

			// Obtener usuario completo
			$userData = $this->get($user->idUser);

			// Crear notificación de inicio de sesión
			$notificationModel = new NotificationModel();
			$notificationModel->createLoginNotification($user->idUser);

			return [
				'success' => true,
				'data' => $userData,
				'token' => $token,
				'message' => 'Login exitoso'
			];

		} catch (Exception $e) {
			return [
				'success' => false,
				'message' => 'Error en el login: ' . $e->getMessage()
			];
		}
	}

	/**
	 * Registro de nuevo usuario (cliente)
	 * @param object $objeto - Datos del usuario (Username, Email, Password)
	 * @return array - Resultado con success, data o message
	 */
	public function register($objeto)
	{
		try {
			// Validar datos requeridos
			if (empty($objeto->Username)) {
				return ['success' => false, 'message' => 'El nombre de usuario es requerido'];
			}

			if (empty($objeto->Email)) {
				return ['success' => false, 'message' => 'El email es requerido'];
			}

			if (empty($objeto->Password)) {
				return ['success' => false, 'message' => 'La contraseña es requerida'];
			}

			if (strlen($objeto->Password) < 6) {
				return ['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres'];
			}

			// Validar formato de email
			if (!filter_var($objeto->Email, FILTER_VALIDATE_EMAIL)) {
				return ['success' => false, 'message' => 'El formato del email no es válido'];
			}

			$username = $this->enlace->escapeString($objeto->Username);
			$email = $this->enlace->escapeString($objeto->Email);

			// Verificar si el email ya existe
			$emailCheck = "SELECT idUser FROM user WHERE Email = '$email'";
			$existingEmail = $this->enlace->ExecuteSQL($emailCheck);
			if (!empty($existingEmail)) {
				return ['success' => false, 'message' => 'El email ya está registrado'];
			}

			// Verificar si el username ya existe
			$usernameCheck = "SELECT idUser FROM user WHERE Username = '$username'";
			$existingUsername = $this->enlace->ExecuteSQL($usernameCheck);
			if (!empty($existingUsername)) {
				return ['success' => false, 'message' => 'El nombre de usuario ya está en uso'];
			}

			// Hash de la contraseña
			$passwordHash = password_hash($objeto->Password, PASSWORD_DEFAULT);

			// Crear usuario con rol de cliente (idRol = 2)
			$vSql = "INSERT INTO user (Username, Email, Password, idRol, LastSesion) 
					 VALUES ('$username', '$email', '$passwordHash', 2, NOW())";
			
			$idUser = $this->enlace->executeSQL_DML_last($vSql);

			if (!$idUser) {
				return ['success' => false, 'message' => 'Error al crear el usuario'];
			}

			// Generar token JWT para auto-login
			$secretKey = Config::get('SECRET_KEY');
			
			$payload = [
				'iat' => time(),
				'exp' => time() + (60 * 60 * 24 * 7), // 7 días
				'idUser' => $idUser,
				'username' => $objeto->Username,
				'email' => $objeto->Email,
				'idRol' => 2 // Cliente
			];

			$token = JWT::encode($payload, $secretKey, 'HS256');

			// Obtener usuario completo
			$userData = $this->get($idUser);

			// Crear notificación de bienvenida
			$notificationModel = new NotificationModel();
			$notificationModel->create(
				null, // Sistema
				$idUser,
				'¡Bienvenido a Vault-Tec Desk!',
				'Tu cuenta ha sido creada exitosamente. Ya puedes crear tickets de soporte.'
			);

			return [
				'success' => true,
				'data' => $userData,
				'token' => $token,
				'message' => 'Registro exitoso'
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Error en el registro: ' . $e->getMessage()];
		}
	}

	/**
	 * Verificar token JWT
	 * @param string $token - Token JWT
	 * @return array - Resultado con success y data o message
	 */
	public function verifyToken($token)
	{
		try {
			$secretKey = Config::get('SECRET_KEY');
			
			$decoded = JWT::decode($token, new \Firebase\JWT\Key($secretKey, 'HS256'));
			
			// Obtener usuario actualizado
			$userData = $this->get($decoded->idUser);
			
			if (!$userData) {
				return ['success' => false, 'message' => 'Usuario no encontrado'];
			}

			return [
				'success' => true,
				'data' => $userData
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Token inválido o expirado'];
		}
	}

	//----------------------------------------------------------------------
	//-------- Métodos CRUD para Administración -----------
	//----------------------------------------------------------------------

	/**
	 * Crear usuario desde mantenimiento (Admin)
	 * Permite crear técnicos (rol 1) o clientes (rol 2)
	 * @param object $objeto - Datos del usuario
	 * @return array - Resultado con success y data o message
	 */
	public function create($objeto)
	{
		try {
			// Validar datos requeridos
			if (empty($objeto->Username)) {
				return ['success' => false, 'message' => 'usernameRequired', 'field' => 'Username'];
			}

			if (empty($objeto->Email)) {
				return ['success' => false, 'message' => 'emailRequired', 'field' => 'Email'];
			}

			if (empty($objeto->Password)) {
				return ['success' => false, 'message' => 'passwordRequired', 'field' => 'Password'];
			}

			if (strlen($objeto->Password) < 6) {
				return ['success' => false, 'message' => 'passwordTooShort', 'field' => 'Password'];
			}

			// Validar formato de email
			if (!filter_var($objeto->Email, FILTER_VALIDATE_EMAIL)) {
				return ['success' => false, 'message' => 'invalidEmail', 'field' => 'Email'];
			}

			// Validar rol (1=Técnico, 2=Cliente, 3=Admin)
			$idRol = isset($objeto->idRol) ? intval($objeto->idRol) : 2;
			if (!in_array($idRol, [1, 2, 3])) {
				return ['success' => false, 'message' => 'invalidRole', 'field' => 'idRol'];
			}

			$username = $this->enlace->escapeString($objeto->Username);
			$email = $this->enlace->escapeString($objeto->Email);

			// Verificar si el email ya existe
			$emailCheck = "SELECT idUser FROM user WHERE Email = '$email'";
			$existingEmail = $this->enlace->ExecuteSQL($emailCheck);
			if (!empty($existingEmail)) {
				return ['success' => false, 'message' => 'emailExists', 'field' => 'Email'];
			}

			// Verificar si el username ya existe
			$usernameCheck = "SELECT idUser FROM user WHERE Username = '$username'";
			$existingUsername = $this->enlace->ExecuteSQL($usernameCheck);
			if (!empty($existingUsername)) {
				return ['success' => false, 'message' => 'usernameExists', 'field' => 'Username'];
			}

			// Hash de la contraseña
			$passwordHash = password_hash($objeto->Password, PASSWORD_DEFAULT);

			// Crear usuario
			$vSql = "INSERT INTO user (Username, Email, Password, idRol, LastSesion) 
					 VALUES ('$username', '$email', '$passwordHash', $idRol, NOW())";
			
			$idUser = $this->enlace->executeSQL_DML_last($vSql);

			if (!$idUser) {
				return ['success' => false, 'message' => 'createError'];
			}

			// Obtener usuario creado
			$userData = $this->get($idUser);

			// Crear notificación de bienvenida para el nuevo usuario
			$notificationModel = new NotificationModel();
			$roleName = $idRol == 1 ? 'Técnico' : ($idRol == 2 ? 'Cliente' : 'Administrador');
			$notificationModel->create(
				null, // Sistema
				$idUser,
				'¡Bienvenido a Vault-Tec Desk!',
				"Tu cuenta de $roleName ha sido creada por un administrador. Ya puedes acceder al sistema."
			);

			return [
				'success' => true,
				'data' => $userData,
				'message' => 'Usuario creado exitosamente'
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Error al crear usuario: ' . $e->getMessage()];
		}
	}

	/**
	 * Actualizar usuario (sin modificar contraseña)
	 * @param int $id - ID del usuario
	 * @param object $objeto - Datos a actualizar
	 * @return array - Resultado con success y data o message
	 */
	public function update($id, $objeto)
	{
		try {
			$id = intval($id);

			// Verificar que el usuario existe
			$existingUser = $this->get($id);
			if (!$existingUser) {
				return ['success' => false, 'message' => 'userNotFound'];
			}

			// Validar datos requeridos
			if (empty($objeto->Username)) {
				return ['success' => false, 'message' => 'usernameRequired', 'field' => 'Username'];
			}

			if (empty($objeto->Email)) {
				return ['success' => false, 'message' => 'emailRequired', 'field' => 'Email'];
			}

			// Validar formato de email
			if (!filter_var($objeto->Email, FILTER_VALIDATE_EMAIL)) {
				return ['success' => false, 'message' => 'invalidEmail', 'field' => 'Email'];
			}

			$username = $this->enlace->escapeString($objeto->Username);
			$email = $this->enlace->escapeString($objeto->Email);

			// Verificar si el email ya existe (excluyendo el usuario actual)
			$emailCheck = "SELECT idUser FROM user WHERE Email = '$email' AND idUser != $id";
			$existingEmail = $this->enlace->ExecuteSQL($emailCheck);
			if (!empty($existingEmail)) {
				return ['success' => false, 'message' => 'emailExists', 'field' => 'Email'];
			}

			// Verificar si el username ya existe (excluyendo el usuario actual)
			$usernameCheck = "SELECT idUser FROM user WHERE Username = '$username' AND idUser != $id";
			$existingUsername = $this->enlace->ExecuteSQL($usernameCheck);
			if (!empty($existingUsername)) {
				return ['success' => false, 'message' => 'usernameExists', 'field' => 'Username'];
			}

			// Construir query de actualización (SIN contraseña)
			$updateFields = "Username = '$username', Email = '$email'";

			// Solo permitir cambio de rol si se proporciona (y es válido)
			if (isset($objeto->idRol)) {
				$idRol = intval($objeto->idRol);
				if (in_array($idRol, [1, 2, 3])) {
					$updateFields .= ", idRol = $idRol";
				}
			}

			$vSql = "UPDATE user SET $updateFields WHERE idUser = $id";
			$this->enlace->ExecuteSQL_DML($vSql);

			// Obtener usuario actualizado
			$userData = $this->get($id);

			return [
				'success' => true,
				'data' => $userData,
				'message' => 'Usuario actualizado exitosamente'
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Error al actualizar usuario: ' . $e->getMessage()];
		}
	}

	/**
	 * Eliminar usuario
	 * @param int $id - ID del usuario
	 * @return array - Resultado con success o message
	 */
	public function delete($id)
	{
		try {
			$id = intval($id);

			// Verificar que el usuario existe
			$existingUser = $this->get($id);
			if (!$existingUser) {
				return ['success' => false, 'message' => 'userNotFound'];
			}

			// No permitir eliminar admins (rol 3)
			if ($existingUser->idRol == 3) {
				return ['success' => false, 'message' => 'cannotDeleteAdmin'];
			}

			// Eliminar usuario
			$vSql = "DELETE FROM user WHERE idUser = $id";
			$this->enlace->ExecuteSQL_DML($vSql);

			return [
				'success' => true,
				'message' => 'Usuario eliminado exitosamente'
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Error al eliminar usuario: ' . $e->getMessage()];
		}
	}

	/**
	 * Cambiar contraseña del usuario (requiere contraseña actual)
	 * @param int $id - ID del usuario
	 * @param string $currentPassword - Contraseña actual
	 * @param string $newPassword - Nueva contraseña
	 * @return array - Resultado de la operación
	 */
	public function changePassword($id, $currentPassword, $newPassword)
	{
		try {
			$id = intval($id);

			// Obtener usuario actual con contraseña
			$vSql = "SELECT idUser, Password FROM user WHERE idUser = $id";
			$result = $this->enlace->ExecuteSQL($vSql);

			if (empty($result)) {
				return ['success' => false, 'message' => 'userNotFound'];
			}

			$user = $result[0];

			// Verificar contraseña actual
			if (!password_verify($currentPassword, $user->Password)) {
				return ['success' => false, 'message' => 'wrongPassword'];
			}

			// Validar nueva contraseña
			if (empty($newPassword) || strlen($newPassword) < 6) {
				return ['success' => false, 'message' => 'passwordTooShort'];
			}

			// Actualizar contraseña
			$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
			$updateSql = "UPDATE user SET Password = '$passwordHash' WHERE idUser = $id";
			$this->enlace->ExecuteSQL_DML($updateSql);

			return [
				'success' => true,
				'message' => 'Contraseña actualizada exitosamente'
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Error al cambiar contraseña: ' . $e->getMessage()];
		}
	}

	/**
	 * Restablecer contraseña (admin resetea a un usuario)
	 * @param int $id - ID del usuario
	 * @param string $newPassword - Nueva contraseña
	 * @return array - Resultado de la operación
	 */
	public function resetPassword($id, $newPassword)
	{
		try {
			$id = intval($id);

			// Verificar que el usuario existe
			$existingUser = $this->get($id);
			if (!$existingUser) {
				return ['success' => false, 'message' => 'userNotFound'];
			}

			// Validar contraseña
			if (empty($newPassword) || strlen($newPassword) < 6) {
				return ['success' => false, 'message' => 'passwordTooShort'];
			}

			$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

			// Actualizar contraseña
			$vSql = "UPDATE user SET Password = '$passwordHash' WHERE idUser = $id";
			$this->enlace->ExecuteSQL_DML($vSql);

			// Crear notificación para el usuario
			$notificationModel = new NotificationModel();
			$notificationModel->create(
				null, // Sistema
				$id,
				'Contraseña restablecida',
				'Tu contraseña ha sido restablecida por un administrador.'
			);

			return [
				'success' => true,
				'message' => 'Contraseña restablecida exitosamente'
			];

		} catch (Exception $e) {
			return ['success' => false, 'message' => 'Error al restablecer contraseña: ' . $e->getMessage()];
		}
	}
}
