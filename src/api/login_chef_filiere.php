<?php
// Set CORS headers at the VERY BEGINNING


include './head.php';
include './database.php';

class LoginChefFiliereController {
    private $conn;
    private $table_name = "chefs_filiere";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        // Debug: log the method
        error_log("Méthode reçue: " . $method);
        error_log("Headers: " . print_r(getallheaders(), true));
        
        switch ($method) {
            case 'POST':
                $this->login();
                break;
            default:
                http_response_code(405);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "Méthode non autorisée: " . $method
                ));
                break;
        }
    }

    private function login() {
        try {
            // Debug: log the input
            $input = file_get_contents("php://input");
            error_log("Input reçu: " . $input);
            
            $data = json_decode($input, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "JSON invalide: " . json_last_error_msg()
                ));
                return;
            }
            
            // Validation des données requises
            if (empty($data['login']) || empty($data['mot_de_passe'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "Login et mot de passe sont obligatoires"
                ));
                return;
            }
    
            // Reste du code login...
            $query = "SELECT * FROM chefs_filiere 
                      WHERE login = :login AND statut = 'actif'";
            
            $stmt = $this->conn->prepare($query);
            $login = htmlspecialchars(strip_tags($data['login']));
            $stmt->bindParam(":login", $login);
            $stmt->execute();
            
            if ($stmt->rowCount() == 1) {
                $chef_filiere = $stmt->fetch(PDO::FETCH_ASSOC);

                
                if (password_verify($data['mot_de_passe'], $chef_filiere['mot_de_passe'])) {
                    $this->updateDerniereConnexion($chef_filiere['id']);
                    
                    if (session_status() === PHP_SESSION_NONE) {
                        session_start();
                    }
                    
                    $_SESSION['chef_filiere_id'] = $chef_filiere['id'];
                    $_SESSION['chef_filiere_login'] = $chef_filiere['login'];
                    $_SESSION['chef_filiere_nom'] = $chef_filiere['nom'];
                    $_SESSION['chef_filiere_prenom'] = $chef_filiere['prenom'];
                    $_SESSION['filiere'] = $chef_filiere['filiere'];
                    $_SESSION['grade'] = $chef_filiere['grade'];
                    $_SESSION['specialite'] = $chef_filiere['specialite'];
                    $_SESSION['role'] = 'chef_filiere';
                    
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Connexion réussie",
                        "data" => array(
                            "id" => $chef_filiere['id'],
                            "nom" => $chef_filiere['nom'],
                            "prenom" => $chef_filiere['prenom'],
                            "email" => $chef_filiere['email'],
                            "telephone" => $chef_filiere['telephone'],
                            "login" => $chef_filiere['login'],
                            "filiere" => $chef_filiere['filiere'],
                            "grade" => $chef_filiere['grade'],
                            "specialite" => $chef_filiere['specialite'],
                            "statut" => $chef_filiere['statut'],
                            "session_token" => session_id()
                        )
                    ));
                } else {
                    http_response_code(401);
                    echo json_encode(array(
                        "success" => false, 
                        "message" => "Login ou mot de passe incorrect"
                    ));
                }
            } else {
                http_response_code(401);
                echo json_encode(array(
                    "success" => false, 
                    "message" => "Login ou mot de passe incorrect"
                ));
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur serveur: " . $exception->getMessage()
            ));
        }
    }

    private function updateDerniereConnexion($chef_filiere_id) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET date_derniere_connexion = NOW() 
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $chef_filiere_id);
            $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Erreur mise à jour dernière connexion: " . $e->getMessage());
        }
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $controller = new LoginChefFiliereController($db);
    $controller->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>