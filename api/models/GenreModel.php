<?php
class GenreModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        //Consulta sql
        $vSql = "SELECT * FROM genre;";
        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado;
    }

    public function get($id)
    {
        //Consulta sql
        $vSql = "SELECT * FROM genre where id=$id";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado[0];
    }
    public function getGenreMovie($idMovie)
    {
        //Consulta sql
        $vSql = "SELECT g.id,g.title 
            FROM genre g,movie_genre mg 
            where mg.genre_id=g.id and mg.movie_id=$idMovie";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado;
    }
    public function getMoviesbyGenre($param)
    {
        $vResultado = null;
        if (!empty($param)) {
            $vSql = "SELECT m.id, m.lang, m.time, m.title, m.year
				FROM movie_genre mg, movie m
				where mg.movie_id=m.id and mg.genre_id=$param";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
        }
        // Retornar el objeto
        return $vResultado;
    }
}
