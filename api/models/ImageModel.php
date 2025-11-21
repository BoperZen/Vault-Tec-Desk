<?php
class ImageModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    /*
    public function all()
    {
        // Consulta SQL
        $vSql = "SELECT * FROM Image;";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto (array de filas)
        return $vResultado;
    }*/
    /*
    public function get($id)
    {
        // Consulta SQL
        // Recordar cambiar el nombre de la columna idImage si es necesario
        $vSql = "SELECT * FROM Image WHERE idImage=$id";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }*/

    // Agregar metodo para obtener imagen por stateRecord
    public function getByStateRecord($stateRecord)
    {
        // Consulta SQL
        $vSql = "SELECT * FROM Image WHERE stateRecord='$stateRecord'";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar la primera fila o null si no existe
        return isset($vResultado[0]) ? $vResultado[0] : null;
    }

    // Obtener imágenes de un StateRecord
    public function getImageStateRecord($idStateRecord)
    {
        // Consulta SQL con JOIN a la tabla intermedia
        $vSql = "SELECT i.idImage, i.Image
                 FROM Image i
                 INNER JOIN image_staterecord isr ON isr.idImage = i.idImage
                 WHERE isr.idStateRecord = $idStateRecord";

        // Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Convertir BLOB a base64
        if ($vResultado && is_array($vResultado)) {
            foreach ($vResultado as $img) {
                if (isset($img->Image) && $img->Image !== null && $img->Image !== '') {
                    // Siempre convertir a base64
                    $img->ImageBase64 = base64_encode($img->Image);
                    // Limpiar el blob original
                    unset($img->Image);
                } else {
                    // Si no hay imagen, marcar como null
                    $img->ImageBase64 = null;
                }
            }
        }

        // Retornar el array de imágenes (puede estar vacío)
        return $vResultado ? $vResultado : [];
    }

    /**
     * Crear una nueva imagen vinculada a un StateRecord
     * @param object $data - Objeto con Image (datos binarios) y idStateRecord
     * @return int - ID de la imagen creada
     */
    public function create($data)
    {
        if (empty($data->Image)) {
            throw new Exception("Los datos de la imagen son requeridos");
        }

        if (empty($data->idStateRecord)) {
            throw new Exception("El ID del StateRecord es requerido");
        }

        $idStateRecord = (int)$data->idStateRecord;

        // Usar escapeString para escapar datos binarios (usa mysqli_real_escape_string internamente)
        $imageEscaped = $this->enlace->escapeString($data->Image);

        // Insertar la imagen en la tabla Image
        $vSqlImage = "INSERT INTO Image (Image) VALUES ('$imageEscaped')";
        $idImage = $this->enlace->executeSQL_DML_last($vSqlImage);

        if ($idImage === 0) {
            throw new Exception("Error al insertar la imagen");
        }

        // Vincular la imagen con el StateRecord en la tabla intermedia
        $vSqlLink = "INSERT INTO image_staterecord (idImage, idStateRecord) 
                     VALUES ($idImage, $idStateRecord)";
        $this->enlace->ExecuteSQL_DML($vSqlLink);

        return $idImage;
    }
}