<?php
class SlaModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }


    //Deberia ser por id de categoria
    public function get($idSLA)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idSla si es necesario
        $vSql = "SELECT * FROM Sla WHERE idSla=$idSLA";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }
}