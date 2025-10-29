<?php
class SpecialtyModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function getbyCat($idCategory)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idSpecialty si es necesario
        $vSql = "SELECT s.*
      FROM Specialty s
      INNER JOIN Category_Specialty sc ON sc.idSpecialty = s.idSpecialty
      WHERE sc.idCategory = $idCategory;";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }

    public function getbyTec($idTechnician)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idSpecialty si es necesario
        $vSql = "SELECT s.*
      FROM Specialty s
      INNER JOIN Technician_Specialty tc ON tc.idSpecialty = s.idSpecialty
      WHERE tc.idTechnician = $idTechnician";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }
}