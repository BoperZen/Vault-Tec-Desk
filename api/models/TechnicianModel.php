<?php
class TechnicianModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar todos los técnicos
     * @return array - Lista de técnicos con sus relaciones
     */
    public function all()
    {
        // Consulta simple de técnicos
        $vSql = "SELECT * FROM Technician";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Construir cada técnico con sus relaciones
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i] = $this->get($vResultado[$i]->idTechnician);
            }
        }
        
        return $vResultado;
    }

    /**
     * Obtener un técnico específico con todas sus relaciones
     * @param int $idTechnician - ID del técnico
     * @return object|null - Objeto técnico completo
     */
    public function get($idTechnician)
    {
        $userM = new UserModel();
        $specialtyM = new SpecialtyModel();
        
        $idTechnician = (int) $idTechnician;
        
        // Consulta básica del técnico
        $vSql = "SELECT * FROM Technician WHERE idTechnician = $idTechnician";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $vResultado = $vResultado[0];
            
            // Agregar información del usuario
            if (isset($vResultado->idUser) && $vResultado->idUser) {
                $user = $userM->get($vResultado->idUser);
                if ($user) {
                    $vResultado->Username = $user->Username;
                    $vResultado->Email = $user->Email;
                    $vResultado->LastSesion = $user->LastSesion;
                    $vResultado->idRol = $user->idRol;
                }
            }
            
            // Agregar especialidades
            $vResultado->Specialties = $this->getSpecialties($idTechnician);
            
            return $vResultado;
        }
        
        return null;
    }

    /**
     * Obtener información simple del técnico (solo WorkLoad y Availability)
     * @param int $idTechnician - ID del técnico
     * @return object|null - Objeto con WorkLoad y Availability
     */
    public function Simple($idTechnician)
    {
        $idTechnician = (int) $idTechnician;

        $vSql = "SELECT WorkLoad, Availability FROM Technician WHERE idTechnician = $idTechnician";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (is_array($vResultado) && count($vResultado) > 0) {
            return $vResultado[0];
        }

        return null;
    }

    /**
     * Obtener las especialidades de un técnico
     * @param int $idTechnician - ID del técnico
     * @return array - Lista de nombres de especialidades
     */
    private function getSpecialties($idTechnician)
    {
        $vSql = "SELECT s.Description
                 FROM Specialty s
                 INNER JOIN Technician_Specialty ts ON ts.idSpecialty = s.idSpecialty
                 WHERE ts.idTechnician = $idTechnician
                 ORDER BY s.Description";
        
        $specialties = $this->enlace->ExecuteSQL($vSql);
        
        // Extraer solo los nombres en un array simple
        $result = [];
        if (!empty($specialties) && is_array($specialties)) {
            foreach ($specialties as $specialty) {
                $result[] = $specialty->Description;
            }
        }
        
        return $result;
    }
}
