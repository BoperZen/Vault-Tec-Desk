<?php
class StateModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        // Consulta para obtener todos los estados
        $vSql = "SELECT * FROM State";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar el array de estados
        return $vResultado;
    }

    public function get($id)
    {
        //Consulta sql
        //Recordar cambiar el nombre de la columna idState si es necesario
        $vSql = "SELECT * FROM State WHERE idState=$id";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar el objeto
        return $vResultado[0];
    }
}
