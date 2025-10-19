<?php
class ActorModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /*Listar */
    public function all()
    {
        //Consulta sql
        $vSql = "SELECT * FROM actor;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto
        return $vResultado;
    }
    /*Obtener */
    public function get($id)
    {
        //Consulta sql
        $vSql = "SELECT * FROM actor where id=$id";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado[0];
    }
    /*Obtener los actores de una pelicula */
    public function getActorMovie($idMovie)
    {
        //Consulta SQL
        $vSQL = "SELECT g.id, g.fname, g.lname, mg.role" .
            " FROM actor g, movie_cast mg" .
            " where g.id=mg.actor_id and mg.movie_id=$idMovie;";
        //Establecer conexión

        //Ejecutar la consulta
        $vResultado = $this->enlace->executeSQL($vSQL);
        //Retornar el resultado
        return $vResultado;
    }
    //Obtener información de un actor específico, incluyendo las películas en las que participa y los roles
    public function getActorMoviesRol($id)
    {
        $movieM = new MovieModel();
        //Consulta sql
        $vSql = "SELECT * FROM actor where id=$id";
        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if (!empty($vResultado)) {
            $vResultado = $vResultado[0];
            $vResultado->movies = $movieM->moviesByActor($id);
        }        
        // Retornar el objeto
        return $vResultado;
    }
}
