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
	//-------- Ajustar estos metodos para que trabajen con clientes -----------
	//----------------------------------------------------------------------
	/*
	public function allCustomer() //Important to change for clients, 
	{
			//Consulta sql
			$vSql = "SELECT * FROM movie_rental.user
					where rol_id=2;";
			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			// Retornar el objeto
			return $vResultado;
		
	}
	public function customerbyShopRental($idShopRental) //Important to change for clients, but by ticket
	{
			//Consulta sql
			$vSql = "SELECT * FROM movie_rental.user
					where rol_id=2 and shop_id=$idShopRental;";
			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			// Retornar el objeto
			return $vResultado;
		
	}
	public function login($objeto)
	{
		
	}
	public function create($objeto)
	{
		
	}*/
}
