<?php
class WorkFlowRulesModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todas las reglas de workflow ordenadas por OrderPriority ASC
     * @return array - Lista de reglas ordenadas
     */
    public function all()
    {
        $vSql = "SELECT idWorkFlowRules, WorkLoad, OrderPriority, idCategory, idSpecialty 
                 FROM workflowrules 
                 ORDER BY OrderPriority ASC";
        
        $rules = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($rules) && is_array($rules)) {
            for ($i = 0; $i < count($rules); $i++) {
                $rules[$i]->idWorkFlowRules = (int) $rules[$i]->idWorkFlowRules;
                $rules[$i]->WorkLoad = isset($rules[$i]->WorkLoad) ? (int) $rules[$i]->WorkLoad : null;
                $rules[$i]->OrderPriority = (int) $rules[$i]->OrderPriority;
                $rules[$i]->idCategory = isset($rules[$i]->idCategory) ? (int) $rules[$i]->idCategory : null;
                $rules[$i]->idSpecialty = isset($rules[$i]->idSpecialty) ? (int) $rules[$i]->idSpecialty : null;
            }
        }
        
        return $rules ?: [];
    }
}
