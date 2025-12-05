<?php
class workflowrules
{
    /**
     * GET /workflowrules - Obtener todas las reglas ordenadas por OrderPriority
     */
    public function index()
    {
        try {
            $response = new Response();
            $model = new WorkFlowRulesModel();
            $result = $model->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
