<?php

//echo password_hash("admin",PASSWORD_DEFAULT);


include './head.php';
include './database.php';

class AdminSettingsController {
    private $conn;
    private $table_name = "administrateurs";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Méthode pour gérer les requêtes
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getAdminSettings();
                break;
            case 'PUT':
                $this->updateAdminSettings();
                break;
            default:
                http_response_code(405);
                echo json_encode(array("success" => false, "message" => "Méthode non autorisée"));
                break;
        }
    }

    // Récupérer les paramètres de l'administrateur connecté
    private function getAdminSettings() {
        try {
            // Récupérer l'ID de l'admin depuis la session ou le token
            $admin_id = $this->getAdminIdFromSession();
            
            if (!$admin_id) {
                http_response_code(401);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Non autorisé. Session requise."
                ));
                return;
            }

            $query = "SELECT id, nom, prenom, email, telephone, login, niveau_acces, statut, date_creation, date_derniere_connexion 
                      FROM " . $this->table_name . " 
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':id', $admin_id);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Administrateur non trouvé"
                ));
                return;
            }
            
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode(array(
                "success" => true,
                "data" => $admin
            ));
            
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la récupération: " . $exception->getMessage()
            ));
        }
    }

    // Mettre à jour les paramètres de l'administrateur
    private function updateAdminSettings() {
        try {
            $admin_id = $this->getAdminIdFromSession();
            
            if (!$admin_id) {
                http_response_code(401);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Non autorisé. Session requise."
                ));
                return;
            }

            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Données invalides"
                ));
                return;
            }

            // Vérifier si l'admin existe
            if (!$this->adminExists($admin_id)) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Administrateur non trouvé"
                ));
                return;
            }

            // Construire la requête dynamiquement
            $fields = [];
            $params = [':id' => $admin_id];
            
            if (isset($data['nom'])) {
                $fields[] = "nom = :nom";
                $params[':nom'] = htmlspecialchars(strip_tags($data['nom']));
            }
            if (isset($data['prenom'])) {
                $fields[] = "prenom = :prenom";
                $params[':prenom'] = htmlspecialchars(strip_tags($data['prenom']));
            }
            if (isset($data['email'])) {
                // Vérifier si l'email existe déjà pour un autre admin
                if ($this->emailExists($data['email'], $admin_id)) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Un administrateur avec cet email existe déjà"
                    ));
                    return;
                }
                $fields[] = "email = :email";
                $params[':email'] = htmlspecialchars(strip_tags($data['email']));
            }
            if (isset($data['telephone'])) {
                $fields[] = "telephone = :telephone";
                $params[':telephone'] = htmlspecialchars(strip_tags($data['telephone']));
            }
            if (isset($data['nomUtilisateur']) || isset($data['login'])) {
                $login = $data['nomUtilisateur'] ?? $data['login'];
                // Vérifier si le login existe déjà pour un autre admin
                if ($this->loginExists($login, $admin_id)) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Ce nom d'utilisateur est déjà utilisé"
                    ));
                    return;
                }
                $fields[] = "login = :login";
                $params[':login'] = htmlspecialchars(strip_tags($login));
            }
            if (isset($data['motDePasse']) && !empty($data['motDePasse'])) {
                // Hasher le nouveau mot de passe
                $fields[] = "mot_de_passe = :mot_de_passe";
                $params[':mot_de_passe'] = password_hash($data['motDePasse'], PASSWORD_DEFAULT);
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Aucune donnée à mettre à jour"
                ));
                return;
            }
            
            $query = "UPDATE " . $this->table_name . " SET " . implode(", ", $fields) . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute($params)) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Paramètres mis à jour avec succès"
                ));
            } else {
                throw new Exception("Erreur lors de la mise à jour");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la mise à jour: " . $exception->getMessage()
            ));
        }
    }

    // Récupérer l'ID de l'admin depuis la session
    private function getAdminIdFromSession() {
        // Vérifier dans le header Authorization
        $headers = getallheaders();
        
        // Option 1: Vérifier le token dans l'header Authorization
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $query = "SELECT utilisateur_id FROM sessions_utilisateurs WHERE id = :token AND type_utilisateur = 'admin' AND expires_at > NOW()";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':token', $token);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $session = $stmt->fetch(PDO::FETCH_ASSOC);
                return $session['utilisateur_id'];
            }
        }
        
        // Option 2: Vérifier dans les headers personnalisés
        if (isset($headers['X-Session-Token'])) {
            $token = $headers['X-Session-Token'];
            $query = "SELECT utilisateur_id FROM sessions_utilisateurs WHERE id = :token AND type_utilisateur = 'admin' AND expires_at > NOW()";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':token', $token);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $session = $stmt->fetch(PDO::FETCH_ASSOC);
                return $session['utilisateur_id'];
            }
        }
        
        // Option 3: Vérifier dans $_SESSION (si les sessions PHP sont utilisées)
        if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['user_id']) && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin') {
            return $_SESSION['user_id'];
        }
        
        // Option 4: Vérifier dans les données de la requête (pour compatibilité)
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['admin_id'])) {
            return intval($input['admin_id']);
        }
        
        // Par défaut, utiliser l'ID 1 (premier admin) pour les tests
        // En production, cette ligne devrait être supprimée et une erreur retournée
        return 1;
    }

    // Vérifier si l'admin existe
    private function adminExists($id) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Vérifier si l'email existe
    private function emailExists($email, $exclude_id = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email";
        $params = [':email' => $email];
        
        if ($exclude_id) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $exclude_id;
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->rowCount() > 0;
    }

    // Vérifier si le login existe
    private function loginExists($login, $exclude_id = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE login = :login";
        $params = [':login' => $login];
        
        if ($exclude_id) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $exclude_id;
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->rowCount() > 0;
    }
}

// Gérer la requête
try {
    $database = new Database();
    $db = $database->getConnection();
    
    $adminSettingsController = new AdminSettingsController($db);
    $adminSettingsController->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>

