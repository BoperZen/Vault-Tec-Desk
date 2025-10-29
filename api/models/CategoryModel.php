<?php
class CategoryModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        // Consulta SQL
                $vSql = <<<'SQL'
SELECT
  c.idCategory,
  c.Categoryname,
  GROUP_CONCAT(DISTINCT l.Description ORDER BY l.Description SEPARATOR ', ') AS Labels,
  GROUP_CONCAT(DISTINCT sp.Description ORDER BY sp.Description SEPARATOR ', ') AS Specialties,
  IFNULL(MAX(CONCAT(s.MaxAnswerTime, ' h')), '') AS MaxAnswerTime,
  IFNULL(MAX(CONCAT(s.MaxResolutionTime, ' h')), '') AS MaxResolutionTime
FROM Category c
LEFT JOIN SLA s ON c.idSla = s.idSla
LEFT JOIN Label_Category lc ON lc.idCategory = c.idCategory
LEFT JOIN Label l ON l.idLabel = lc.idLabel
LEFT JOIN Category_Specialty cs ON cs.idCategory = c.idCategory
LEFT JOIN Specialty sp ON sp.idSpecialty = cs.idSpecialty
GROUP BY c.idCategory, c.Categoryname
ORDER BY c.idCategory DESC;
SQL;

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }

    public function get($idCategory)
    {
        $idCategory = (int) $idCategory;

        // Consulta SQL
        $vSql = <<<SQL
SELECT
  c.idCategory,
  c.Categoryname,
  GROUP_CONCAT(DISTINCT l.Description ORDER BY l.Description SEPARATOR ', ') AS Labels,
  GROUP_CONCAT(DISTINCT sp.Description ORDER BY sp.Description SEPARATOR ', ') AS Specialties,
  IFNULL(MAX(CONCAT(s.MaxAnswerTime, ' h')), '') AS MaxAnswerTime,
  IFNULL(MAX(CONCAT(s.MaxResolutionTime, ' h')), '') AS MaxResolutionTime
FROM Category c
LEFT JOIN SLA s ON c.idSla = s.idSla
LEFT JOIN Label_Category lc ON lc.idCategory = c.idCategory
LEFT JOIN Label l ON l.idLabel = lc.idLabel
LEFT JOIN Category_Specialty cs ON cs.idCategory = c.idCategory
LEFT JOIN Specialty sp ON sp.idSpecialty = cs.idSpecialty
WHERE c.idCategory = $idCategory
GROUP BY c.idCategory, c.Categoryname
ORDER BY c.idCategory DESC;
SQL;

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }
}