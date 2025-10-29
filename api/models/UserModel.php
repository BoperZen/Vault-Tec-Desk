<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
			//Consulta sql
			$vSql = "SELECT * FROM user;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		
	}

	/*public function get($idUser)  //Muestra la contra de un usuario
	{
			$rolM = new RolModel();
			//Consulta sql
			$vSql = "SELECT * FROM User where idUser=$idUser";
			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			if ($vResultado) {
				$vResultado = $vResultado[0];
				$rol = $rolM->getRolUser($idUser);
				$vResultado->rol = $rol;
				// Retornar el objeto
				return $vResultado;
			} else {
				return null;
			}
		
	}*/

	public function get($id)
    {
        $rolM = new RolModel();
        $id = intval($id);

        $vSql = "
            SELECT
                idUser,
                Username,
                Email,
                idRol,
                DATE_FORMAT(LastSesion, '%Y-%m-%d %H:%i:%s') AS LastSesion
            FROM `User`
            WHERE idUser = {$id}
            LIMIT 1;
        ";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if ($vResultado) {
            $vResultado = $vResultado[0];
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
