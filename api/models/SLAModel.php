<?php
class SlaModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todos los SLAs
     * @return array - Lista de SLAs
     */
    public function all()
    {
        $vSql = "SELECT * FROM Sla ORDER BY idSla";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ?: [];
    }

    /**
     * Obtener un SLA específico
     * @param int $idSLA - ID del SLA
     * @return object|null - Objeto SLA
     */
    public function get($idSLA)
    {
        $idSLA = (int)$idSLA;
        $vSql = "SELECT * FROM Sla WHERE idSla = $idSLA";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }

    /**
     * Obtener SLA por categoría
     * @param int $idCategory - ID de la categoría
     * @return object|null - Objeto SLA
     */
    public function getByCategory($idCategory)
    {
        $idCategory = (int)$idCategory;
        $vSql = "SELECT s.* FROM Sla s
                 INNER JOIN category c ON c.idSla = s.idSla
                 WHERE c.idCategory = $idCategory";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }

    /**
     * Crear un nuevo SLA
     * @param object $data - Datos del SLA (ResponseTime, ResolutionTime)
     * @return array - Resultado con success y data/message
     */
    public function create($data)
    {
        try {
            // Validar datos requeridos
            if (!isset($data->MaxAnswerTime) || $data->MaxAnswerTime < 0) {
                return ['success' => false, 'message' => 'El tiempo de respuesta es requerido y debe ser mayor o igual a 0'];
            }

            if (!isset($data->MaxResolutionTime) || $data->MaxResolutionTime < 0) {
                return ['success' => false, 'message' => 'El tiempo de resolución es requerido y debe ser mayor o igual a 0'];
            }

            $maxAnswerTime = (int)$data->MaxAnswerTime;
            $maxResolutionTime = (int)$data->MaxResolutionTime;

            $vSql = "INSERT INTO Sla (MaxAnswerTime, MaxResolutionTime) 
                     VALUES ($maxAnswerTime, $maxResolutionTime)";
            
            $idSla = $this->enlace->executeSQL_DML_last($vSql);

            return [
                'success' => true,
                'data' => $this->get($idSla),
                'message' => 'SLA creado exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear SLA: ' . $e->getMessage()];
        }
    }

    /**
     * Actualizar un SLA existente
     * @param object $data - Datos del SLA incluyendo idSla
     * @return array - Resultado con success y data/message
     */
    public function update($data)
    {
        try {
            // Validar ID
            if (empty($data->idSla)) {
                return ['success' => false, 'message' => 'ID de SLA es requerido'];
            }

            $idSla = (int)$data->idSla;

            // Verificar que existe
            $current = $this->get($idSla);
            if (!$current) {
                return ['success' => false, 'message' => 'SLA no encontrado'];
            }

            // Validar datos
            if (!isset($data->MaxAnswerTime) || $data->MaxAnswerTime < 0) {
                return ['success' => false, 'message' => 'El tiempo de respuesta es requerido y debe ser mayor o igual a 0'];
            }

            if (!isset($data->MaxResolutionTime) || $data->MaxResolutionTime < 0) {
                return ['success' => false, 'message' => 'El tiempo de resolución es requerido y debe ser mayor o igual a 0'];
            }

            $maxAnswerTime = (int)$data->MaxAnswerTime;
            $maxResolutionTime = (int)$data->MaxResolutionTime;

            $vSql = "UPDATE Sla 
                     SET MaxAnswerTime = $maxAnswerTime,
                         MaxResolutionTime = $maxResolutionTime
                     WHERE idSla = $idSla";
            
            $this->enlace->ExecuteSQL_DML($vSql);

            return [
                'success' => true,
                'data' => $this->get($idSla),
                'message' => 'SLA actualizado exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al actualizar SLA: ' . $e->getMessage()];
        }
    }

    /**
     * Eliminar un SLA
     * @param int $idSla - ID del SLA
     * @return array - Resultado con success y message
     */
    public function delete($idSla)
    {
        try {
            $idSla = (int)$idSla;

            // Verificar que existe
            $current = $this->get($idSla);
            if (!$current) {
                return ['success' => false, 'message' => 'SLA no encontrado'];
            }

            // Verificar si está en uso
            $vSqlCheck = "SELECT COUNT(*) as count FROM category WHERE idSla = $idSla";
            $result = $this->enlace->ExecuteSQL($vSqlCheck);
            if ($result && $result[0]->count > 0) {
                return ['success' => false, 'message' => 'No se puede eliminar el SLA porque está siendo utilizado por categorías'];
            }

            $vSql = "DELETE FROM Sla WHERE idSla = $idSla";
            $this->enlace->ExecuteSQL_DML($vSql);

            return [
                'success' => true,
                'message' => 'SLA eliminado exitosamente'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al eliminar SLA: ' . $e->getMessage()];
        }
    }
}