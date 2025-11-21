<?php
class PriorityModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        // Consulta SQL para obtener todas las prioridades
        $vSql = "SELECT * FROM Priority ORDER BY idPriority ASC";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar el resultado
        return $vResultado;
    }

    public function get($id)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idLabel si es necesario
        $vSql = "SELECT * FROM Priority WHERE idPriority=$id";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }
}