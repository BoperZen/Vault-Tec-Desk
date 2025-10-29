<?php
class LabelModel
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
        $vSql = "SELECT * FROM Label;";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }

    public function get($id)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idLabel si es necesario
        $vSql = "SELECT * FROM Label WHERE idLabel=$id";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }*/

    public function getbyCat($idCategory)
    {
        // Consulta SQL
        $vSql = "SELECT l.*
      FROM Label l
      INNER JOIN Label_Category lc ON lc.idLabel = l.idLabel
      WHERE lc.idCategory = $idCategory";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }
}