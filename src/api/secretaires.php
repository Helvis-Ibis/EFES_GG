<?php
include './head.php';
include './database.php';

class SecretaireController {
    private $conn;
    private $table_name = "secretaires";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Méthode pour gérer les requêtes
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getSecretaires();
                break;
            case 'POST':
                $this->createSecretaire();
                break;
            case 'PUT':
                $this->updateSecretaire();
                break;
            case 'DELETE':
                $this->deleteSecretaire();
                break;
            default:
                http_response_code(405);
                echo json_encode(array("message" => "Méthode non autorisée"));
                break;
        }
    }

    // Récupérer tous les secrétaires
    private function getSecretaires() {
        try {
            $query = "SELECT id, nom, prenom, email, telephone, login, departement, permissions, statut, date_creation, date_derniere_connexion 
                      FROM " . $this->table_name . " 
                      ORDER BY nom, prenom";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $secretaires = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(array(
                "success" => true,
                "data" => $secretaires
            ));
            
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la récupération des secrétaires: " . $exception->getMessage()
            ));
        }
    }

    // Créer un nouveau secrétaire
    private function createSecretaire() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Validation des données requises
            $required_fields = ['nom', 'prenom', 'email', 'login', 'mot_de_passe'];
            foreach ($required_fields as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Le champ '$field' est requis"
                    ));
                    return;
                }
            }
            
            // Vérifier si l'email existe déjà
            if ($this->emailExists($data['email'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Un secrétaire avec cet email existe déjà"
                ));
                return;
            }
            
            // Vérifier si le login existe déjà
            if ($this->loginExists($data['login'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Ce nom d'utilisateur est déjà utilisé"
                ));
                return;
            }
            
            // Hasher le mot de passe
            $hashed_password = password_hash($data['mot_de_passe'], PASSWORD_DEFAULT);
            
            $query = "INSERT INTO " . $this->table_name . " 
                     (nom, prenom, email, telephone, login, mot_de_passe, departement, permissions, statut, created_by) 
                     VALUES (:nom, :prenom, :email, :telephone, :login, :mot_de_passe, :departement, :permissions, :statut, :created_by)";
            
            $stmt = $this->conn->prepare($query);
            
            // Nettoyer et binder les données
            $stmt->bindValue(':nom', htmlspecialchars(strip_tags($data['nom'])));
            $stmt->bindValue(':prenom', htmlspecialchars(strip_tags($data['prenom'])));
            $stmt->bindValue(':email', htmlspecialchars(strip_tags($data['email'])));
            $stmt->bindValue(':telephone', htmlspecialchars(strip_tags($data['telephone'] ?? '')));
            $stmt->bindValue(':login', htmlspecialchars(strip_tags($data['login'])));
            $stmt->bindValue(':mot_de_passe', $hashed_password);
            $stmt->bindValue(':departement', htmlspecialchars(strip_tags($data['departement'] ?? 'Scolarité')));
            $stmt->bindValue(':permissions', json_encode($data['permissions'] ?? []));
            $stmt->bindValue(':statut', htmlspecialchars(strip_tags($data['statut'] ?? 'actif')));
            $stmt->bindValue(':created_by', $data['created_by'] ?? 1); // ID de l'admin connecté
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Secrétaire créé avec succès",
                    "id" => $this->conn->lastInsertId()
                ));
            } else {
                throw new Exception("Erreur lors de la création du secrétaire");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la création: " . $exception->getMessage()
            ));
        }
    }

    // Mettre à jour un secrétaire
    private function updateSecretaire() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "ID du secrétaire requis"
                ));
                return;
            }
            
            // Vérifier si le secrétaire existe
            if (!$this->secretaireExists($data['id'])) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Secrétaire non trouvé"
                ));
                return;
            }
            
            // Construire la requête dynamiquement
            $fields = [];
            $params = [':id' => $data['id']];
            
            if (isset($data['nom'])) {
                $fields[] = "nom = :nom";
                $params[':nom'] = htmlspecialchars(strip_tags($data['nom']));
            }
            if (isset($data['prenom'])) {
                $fields[] = "prenom = :prenom";
                $params[':prenom'] = htmlspecialchars(strip_tags($data['prenom']));
            }
            if (isset($data['email'])) {
                // Vérifier si l'email existe déjà pour un autre secrétaire
                if ($this->emailExists($data['email'], $data['id'])) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Un secrétaire avec cet email existe déjà"
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
            if (isset($data['login'])) {
                // Vérifier si le login existe déjà pour un autre secrétaire
                if ($this->loginExists($data['login'], $data['id'])) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Ce nom d'utilisateur est déjà utilisé"
                    ));
                    return;
                }
                $fields[] = "login = :login";
                $params[':login'] = htmlspecialchars(strip_tags($data['login']));
            }
            if (isset($data['mot_de_passe']) && !empty($data['mot_de_passe'])) {
                $fields[] = "mot_de_passe = :mot_de_passe";
                $params[':mot_de_passe'] = password_hash($data['mot_de_passe'], PASSWORD_DEFAULT);
            }
            if (isset($data['departement'])) {
                $fields[] = "departement = :departement";
                $params[':departement'] = htmlspecialchars(strip_tags($data['departement']));
            }
            if (isset($data['permissions'])) {
                $fields[] = "permissions = :permissions";
                $params[':permissions'] = json_encode($data['permissions']);
            }
            if (isset($data['statut'])) {
                $fields[] = "statut = :statut";
                $params[':statut'] = htmlspecialchars(strip_tags($data['statut']));
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
                    "message" => "Secrétaire mis à jour avec succès"
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

    // Supprimer un secrétaire
    private function deleteSecretaire() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "ID du secrétaire requis"
                ));
                return;
            }
            
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':id', $data['id']);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Secrétaire supprimé avec succès"
                    ));
                } else {
                    http_response_code(404);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Secrétaire non trouvé"
                    ));
                }
            } else {
                throw new Exception("Erreur lors de la suppression");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la suppression: " . $exception->getMessage()
            ));
        }
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

    // Vérifier si le secrétaire existe
    private function secretaireExists($id) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}

// Gérer la requête
try {
    $database = new Database();
    $db = $database->getConnection();
    
    $secretaireController = new SecretaireController($db);
    $secretaireController->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>