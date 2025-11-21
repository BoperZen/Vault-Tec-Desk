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
        $vSql = "SELECT * FROM category ORDER BY idCategory DESC";
        
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
        $vSql = "SELECT * FROM category WHERE idCategory = $idCategory";
        
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            $vResultado = $vResultado[0];
            
            // Obtener Labels de la categoría
            $labels = $labelM->getbyCat($idCategory);
            $labelNames = [];
            $labelIds = [];
            if (!empty($labels) && is_array($labels)) {
                foreach ($labels as $label) {
                    $labelNames[] = $label->Description;
                    $labelIds[] = $label->idLabel;
                }
            }
            $vResultado->Labels = !empty($labelNames) ? implode(', ', $labelNames) : '';
            $vResultado->LabelIds = $labelIds;
            
            // Obtener Specialties de la categoría
            $specialties = $specialtyM->getbyCat($idCategory);
            $specialtyNames = [];
            $specialtyIds = [];
            if (!empty($specialties) && is_array($specialties)) {
                foreach ($specialties as $specialty) {
                    $specialtyNames[] = $specialty->Description;
                    $specialtyIds[] = $specialty->idSpecialty;
                }
            }
            $vResultado->Specialties = !empty($specialtyNames) ? implode(', ', $specialtyNames) : '';
            $vResultado->SpecialtyIds = $specialtyIds;
            
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

    /**
     * Crear una nueva categoría
     * @param object $data - Datos de la categoría (Categoryname, MaxAnswerTime, MaxResolutionTime, idPriority)
     * @return array - Resultado con success y data/message
     */
    public function create($data)
    {
        try {
            // Validar datos requeridos
            if (empty($data->Categoryname)) {
                return ['success' => false, 'message' => 'El nombre de la categoría es requerido'];
            }

            if (!isset($data->MaxAnswerTime) || !isset($data->MaxResolutionTime)) {
                return ['success' => false, 'message' => 'Los tiempos de respuesta y resolución son requeridos'];
            }

            $maxAnswerTime = (int)$data->MaxAnswerTime;
            $maxResolutionTime = (int)$data->MaxResolutionTime;

            if ($maxAnswerTime <= 0) {
                return ['success' => false, 'message' => 'El tiempo de respuesta debe ser mayor a 0'];
            }

            if ($maxResolutionTime <= $maxAnswerTime) {
                return ['success' => false, 'message' => 'El tiempo de resolución debe ser mayor al tiempo de respuesta'];
            }

            if (empty($data->idPriority)) {
                return ['success' => false, 'message' => 'La prioridad es requerida'];
            }

            // Escapar valores
            $categoryName = $this->enlace->escapeString($data->Categoryname);
            $idPriority = (int)$data->idPriority;

            // Crear SLA primero
            $vSqlSLA = "INSERT INTO Sla (MaxAnswerTime, MaxResolutionTime) 
                        VALUES ($maxAnswerTime, $maxResolutionTime)";
            
            $idSLA = $this->enlace->executeSQL_DML_last($vSqlSLA);

            // Crear categoría
            $vSql = "INSERT INTO category (Categoryname, idSla, idPriority) 
                     VALUES ('$categoryName', $idSLA, $idPriority)";
            
            $idCategory = $this->enlace->executeSQL_DML_last($vSql);

            // Procesar Labels si existen
            if (!empty($data->labels) && is_array($data->labels)) {
                foreach ($data->labels as $idLabel) {
                    $idLabel = (int)$idLabel;
                    $vSqlLabel = "INSERT INTO label_category (idCategory, idLabel) 
                                  VALUES ($idCategory, $idLabel)";
                    $this->enlace->ExecuteSQL_DML($vSqlLabel);
                }
            }

            // Procesar Specialties si existen
            if (!empty($data->specialties) && is_array($data->specialties)) {
                foreach ($data->specialties as $idSpecialty) {
                    $idSpecialty = (int)$idSpecialty;
                    $vSqlSpecialty = "INSERT INTO category_specialty (idCategory, idSpecialty) 
                                      VALUES ($idCategory, $idSpecialty)";
                    $this->enlace->ExecuteSQL_DML($vSqlSpecialty);
                }
            }

            return [
                'success' => true,
                'data' => $this->get($idCategory),
                'message' => 'Categoría creada exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear categoría: ' . $e->getMessage()];
        }
    }

    /**
     * Actualizar una categoría existente
     * @param object $data - Datos de la categoría incluyendo idCategory
     * @return array - Resultado con success y data/message
     */
    public function update($data)
    {
        try {
            // Validar ID
            if (empty($data->idCategory)) {
                return ['success' => false, 'message' => 'ID de categoría es requerido'];
            }

            $idCategory = (int)$data->idCategory;

            // Obtener categoría actual
            $currentCategory = $this->get($idCategory);
            if (!$currentCategory) {
                return ['success' => false, 'message' => 'Categoría no encontrada'];
            }

            // Validar tiempos
            $maxAnswerTime = (int)$data->MaxAnswerTime;
            $maxResolutionTime = (int)$data->MaxResolutionTime;

            if ($maxAnswerTime <= 0) {
                return ['success' => false, 'message' => 'El tiempo de respuesta debe ser mayor a 0'];
            }

            if ($maxResolutionTime <= $maxAnswerTime) {
                return ['success' => false, 'message' => 'El tiempo de resolución debe ser mayor al tiempo de respuesta'];
            }

            // Escapar valores
            $categoryName = $this->enlace->escapeString($data->Categoryname);
            $idPriority = (int)$data->idPriority;

            // Actualizar SLA
            if (isset($currentCategory->idSLA) && $currentCategory->idSLA) {
                $idSLA = (int)$currentCategory->idSLA;
                $vSqlSLA = "UPDATE Sla 
                           SET MaxAnswerTime = $maxAnswerTime, 
                               MaxResolutionTime = $maxResolutionTime 
                           WHERE idSla = $idSLA";
                $this->enlace->ExecuteSQL_DML($vSqlSLA);
            }

            // Actualizar categoría
            $vSql = "UPDATE category 
                     SET Categoryname = '$categoryName',
                         idPriority = $idPriority
                     WHERE idCategory = $idCategory";
            
            $this->enlace->ExecuteSQL_DML($vSql);

            // Actualizar Labels
            // Eliminar labels actuales
            $vSqlDeleteLabels = "DELETE FROM label_category WHERE idCategory = $idCategory";
            $this->enlace->ExecuteSQL_DML($vSqlDeleteLabels);
            
            // Insertar nuevos labels
            if (!empty($data->labels) && is_array($data->labels)) {
                foreach ($data->labels as $idLabel) {
                    $idLabel = (int)$idLabel;
                    $vSqlLabel = "INSERT INTO label_category (idCategory, idLabel) 
                                  VALUES ($idCategory, $idLabel)";
                    $this->enlace->ExecuteSQL_DML($vSqlLabel);
                }
            }

            // Actualizar Specialties
            // Eliminar specialties actuales
            $vSqlDeleteSpecialties = "DELETE FROM category_specialty WHERE idCategory = $idCategory";
            $this->enlace->ExecuteSQL_DML($vSqlDeleteSpecialties);
            
            // Insertar nuevas specialties
            if (!empty($data->specialties) && is_array($data->specialties)) {
                foreach ($data->specialties as $idSpecialty) {
                    $idSpecialty = (int)$idSpecialty;
                    $vSqlSpecialty = "INSERT INTO category_specialty (idCategory, idSpecialty) 
                                      VALUES ($idCategory, $idSpecialty)";
                    $this->enlace->ExecuteSQL_DML($vSqlSpecialty);
                }
            }

            return [
                'success' => true,
                'data' => $this->get($idCategory),
                'message' => 'Categoría actualizada exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al actualizar categoría: ' . $e->getMessage()];
        }
    }
}