<?php
class CategoryModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar todas las categorías con sus relaciones
     * @return array - Lista de categorías
     */
    public function all()
    {
        // Consulta SQL simple
        $vSql = "SELECT * FROM Category ORDER BY idCategory DESC";
        
        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Construir cada categoría con sus relaciones
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i] = $this->get($vResultado[$i]->idCategory);
            }
        }

        return $vResultado;
    }

    /**
     * Obtener una categoría específica con sus relaciones
     * @param int $idCategory - ID de la categoría
     * @return object|null - Objeto categoría completo
     */
    public function get($idCategory)
    {
        $labelM = new LabelModel();
        $specialtyM = new SpecialtyModel();
        $slaM = new SlaModel();
        
        $idCategory = (int) $idCategory;

        // Consulta básica de la categoría
        $vSql = "SELECT * FROM Category WHERE idCategory = $idCategory";
        
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $vResultado = $vResultado[0];
            
            // Obtener Labels de la categoría
            $labels = $labelM->getbyCat($idCategory);
            $labelNames = [];
            if (!empty($labels) && is_array($labels)) {
                foreach ($labels as $label) {
                    $labelNames[] = $label->Description;
                }
            }
            $vResultado->Labels = !empty($labelNames) ? implode(', ', $labelNames) : '';
            
            // Obtener Specialties de la categoría
            $specialties = $specialtyM->getbyCat($idCategory);
            $specialtyNames = [];
            if (!empty($specialties) && is_array($specialties)) {
                foreach ($specialties as $specialty) {
                    $specialtyNames[] = $specialty->Description;
                }
            }
            $vResultado->Specialties = !empty($specialtyNames) ? implode(', ', $specialtyNames) : '';
            
            // Obtener información del SLA
            if (isset($vResultado->idSLA) && $vResultado->idSLA) {
                $sla = $slaM->get($vResultado->idSLA);
                if ($sla) {
                    $vResultado->MaxAnswerTime = $sla->MaxAnswerTime . ' h';
                    $vResultado->MaxResolutionTime = $sla->MaxResolutionTime . ' h';
                } else {
                    $vResultado->MaxAnswerTime = '';
                    $vResultado->MaxResolutionTime = '';
                }
            } else {
                $vResultado->MaxAnswerTime = '';
                $vResultado->MaxResolutionTime = '';
            }
            
            return $vResultado;
        }

        return null;
    }
}