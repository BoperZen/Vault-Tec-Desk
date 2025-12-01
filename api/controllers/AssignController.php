<?php
class assign
{
    public function index()
    {
        try {
            $response = new Response();
            $assign = new AssignModel();
            $result = $assign->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($param)
    {
        try {
            $response = new Response();
            $assign = new AssignModel();
            $result = $assign->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            $data = $request->getJSON();

            $assign = new AssignModel();
            $result = $assign->assignTicket($data);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function update()
    {
        try {
            $response = new Response();
            $request = new Request();
            $data = $request->getJSON();

            $assign = new AssignModel();
            $result = $assign->assignTicket($data);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}