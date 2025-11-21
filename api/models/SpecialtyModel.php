<?php
class SpecialtyModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        // Consulta SQL para obtener todas las especialidades
        $vSql = "SELECT * FROM specialty ORDER BY Description ASC";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }

    public function getbyCat($idCategory)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idSpecialty si es necesario
        $vSql = "SELECT s.*
      FROM specialty s
      INNER JOIN category_specialty sc ON sc.idSpecialty = s.idSpecialty
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
      FROM specialty s
      INNER JOIN technician_specialty tc ON tc.idSpecialty = s.idSpecialty
      WHERE tc.idTechnician = $idTechnician";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }
}