<?php
class ImageModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    /*
    public function all()
    {
        // Consulta SQL
        $vSql = "SELECT * FROM Image;";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }*/
    /*
    public function get($id)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idImage si es necesario
        $vSql = "SELECT * FROM Image WHERE idImage=$id";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }*/

    // Agregar metodo para obtener imagen por stateRecord
    public function getByStateRecord($stateRecord)
    {
        // Consulta SQL
        $vSql = "SELECT * FROM Image WHERE stateRecord='$stateRecord'";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }
}