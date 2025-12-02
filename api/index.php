<?php
// Configurar zona horaria (América Central - UTC-6)
date_default_timezone_set('America/Guatemala');

// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";
//Middleware
require_once "middleware/AuthMiddleware.php";

/***--- Agregar todos los modelos*/
require_once "models/RolModel.php";
require_once "models/UserModel.php";
//require_once "models/DirectorModel.php";
//require_once "models/ActorModel.php";
//require_once "models/GenreModel.php";
//require_once "models/MovieModel.php";
//require_once "models/ShopRentalModel.php";
//require_once "models/RentalModel.php";
//require_once "models/RentalMovieModel.php";
require_once "models/ImageModel.php";
require_once "models/StateModel.php";
require_once "models/LabelModel.php";
require_once "models/SpecialtyModel.php";
require_once "models/SLAModel.php";
require_once "models/CategoryModel.php";
require_once "models/TechnicianModel.php";
require_once "models/AssignModel.php";
require_once "models/TicketModel.php";
require_once "models/PriorityModel.php";
require_once "models/ServiceReviewModel.php";

/***--- Agregar todos los controladores*/
require_once "controllers/UserController.php";
//require_once "controllers/DirectorController.php";
//require_once "controllers/ActorController.php";
//require_once "controllers/GenreController.php";
//require_once "controllers/MovieController.php";
//require_once "controllers/ShopRentalController.php";
//require_once "controllers/RentalController.php";
require_once "controllers/StateController.php";
require_once "controllers/LabelController.php";
require_once "controllers/SpecialtyController.php";
require_once "controllers/CategoryController.php";
require_once "controllers/TechnicianController.php";
require_once "controllers/AssignController.php";
require_once "controllers/TicketController.php";
require_once "controllers/PriorityController.php";
require_once "controllers/ServiceReviewController.php";

//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();



