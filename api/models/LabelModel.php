<?php
class LabelModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        // Consulta SQL con JOIN para obtener la categoría de cada etiqueta
        $vSql = "SELECT l.*, lc.idCategory 
                 FROM label l
                 LEFT JOIN label_category lc ON lc.idLabel = l.idLabel;";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }

    public function get($id)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idLabel si es necesario
        $vSql = "SELECT * FROM label WHERE idLabel=$id";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }

    public function getbyCat($idCategory)
    {
        // Consulta SQL
        $vSql = "SELECT l.*
      FROM label l
      INNER JOIN label_category lc ON lc.idLabel = l.idLabel
      WHERE lc.idCategory = $idCategory";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }
}