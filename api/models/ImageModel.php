<?php
class ImageModel
{

    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    //Obtener una imagen de una pelicula
    public function getImageMovie($idMovie)
    {
        //Consulta sql
        $vSql = "SELECT * FROM movie_image where movie_id=$idMovie";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if (!empty($vResultado)) {
            // Retornar el objeto
            return $vResultado[0];
        }
        return $vResultado;
    }
}
