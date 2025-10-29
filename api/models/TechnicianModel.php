<?php
class TechnicianModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        $vSql = <<<'SQL'
    SELECT
     t.idTechnician, t.WorkLoad, t.Availability,
	 u.idUser, u.Username, u.Email, u.LastSesion, u.idRol,
     GROUP_CONCAT(DISTINCT s.Description ORDER BY s.Description SEPARATOR '|') AS Specialties
	 FROM Technician t
     LEFT JOIN `User` u ON u.idUser = t.idUser
     LEFT JOIN Technician_Specialty ts ON ts.idTechnician = t.idTechnician
	 LEFT JOIN Specialty s ON s.idSpecialty = ts.idSpecialty
     GROUP BY t.idTechnician, t.WorkLoad, t.Availability, u.idUser, u.Username, u.Email, u.LastSesion, u.idRol;
SQL;

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Convertir Specialties de string a array
        if (is_array($vResultado)) {
            foreach ($vResultado as $row) {
                if (isset($row->Specialties) && !empty($row->Specialties)) {
                    $row->Specialties = explode('|', $row->Specialties);
                } else {
                    $row->Specialties = [];
                }
            }
        }

        return $vResultado;
    }

    public function get($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        $vSql = <<<SQL
     SELECT
     t.idTechnician, t.WorkLoad, t.Availability,
	 u.idUser, u.Username, u.Email, u.LastSesion, u.idRol,
     GROUP_CONCAT(DISTINCT s.Description ORDER BY s.Description SEPARATOR '|') AS Specialties
	 FROM Technician t
     LEFT JOIN `User` u ON u.idUser = t.idUser
     LEFT JOIN Technician_Specialty ts ON ts.idTechnician = t.idTechnician
	 LEFT JOIN Specialty s ON s.idSpecialty = ts.idSpecialty
     WHERE t.idTechnician = {$idTechnician}
     GROUP BY t.idTechnician, t.WorkLoad, t.Availability, u.idUser, u.Username, u.Email, u.LastSesion, u.idRol;
SQL;

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Convertir Specialties de string a array
        if (is_array($vResultado) && count($vResultado) > 0) {
            $row = $vResultado[0];
            if (isset($row->Specialties) && !empty($row->Specialties)) {
                $row->Specialties = explode('|', $row->Specialties);
            } else {
                $row->Specialties = [];
            }
            return $row;
        }

        return null;
    }

    public function Simple($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        $vSql = "SELECT t.WorkLoad, t.Availability FROM Technician t WHERE idTechnician = {$idTechnician}";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (is_array($vResultado) && count($vResultado) > 0) {
            return $vResultado[0];
        }

        return null;
    }
}
