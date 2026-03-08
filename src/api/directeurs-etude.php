<?php
include './head.php';
include './database.php';

class DirecteurEtudeController {
    private $conn;
    private $table_name = "doyens_directeurs";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getDirecteurs();
                break;
            case 'POST':
                $this->createDirecteur();
                break;
            case 'PUT':
                $this->updateDirecteur();
                break;
            case 'DELETE':
                $this->deleteDirecteur();
                break;
            default:
                http_response_code(405);
                echo json_encode(array("message" => "Méthode non autorisée"));
                break;
        }
    }

    // Récupérer tous les directeurs d'étude
    private function getDirecteurs() {
        try {
            $query = "SELECT id, nom, prenom, email, telephone, login, role, faculte_uas, departement, grade, statut, date_creation, date_derniere_connexion 
                      FROM " . $this->table_name . " 
                      ORDER BY nom, prenom";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $directeurs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(array(
                "success" => true,
                "data" => $directeurs
            ));
            
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la récupération des directeurs: " . $exception->getMessage()
            ));
        }
    }

    // Créer un nouveau directeur d'étude
    private function createDirecteur() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $required_fields = ['nom', 'prenom', 'email', 'login', 'mot_de_passe', 'role'];
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
            
            if ($this->emailExists($data['email'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Un directeur avec cet email existe déjà"
                ));
                return;
            }
            
            if ($this->loginExists($data['login'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Ce nom d'utilisateur est déjà utilisé"
                ));
                return;
            }
            
            $hashed_password = password_hash($data['mot_de_passe'], PASSWORD_DEFAULT);
            
            $query = "INSERT INTO " . $this->table_name . " 
                     (nom, prenom, email, telephone, login, mot_de_passe, role, faculte_uas, departement, grade, statut, created_by) 
                     VALUES (:nom, :prenom, :email, :telephone, :login, :mot_de_passe, :role, :faculte_uas, :departement, :grade, :statut, :created_by)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindValue(':nom', htmlspecialchars(strip_tags($data['nom'])));
            $stmt->bindValue(':prenom', htmlspecialchars(strip_tags($data['prenom'])));
            $stmt->bindValue(':email', htmlspecialchars(strip_tags($data['email'])));
            $stmt->bindValue(':telephone', htmlspecialchars(strip_tags($data['telephone'] ?? '')));
            $stmt->bindValue(':login', htmlspecialchars(strip_tags($data['login'])));
            $stmt->bindValue(':mot_de_passe', $hashed_password);
            $stmt->bindValue(':role', htmlspecialchars(strip_tags($data['role'])));
            $stmt->bindValue(':faculte_uas', htmlspecialchars(strip_tags($data['faculte_uas'] ?? '')));
            $stmt->bindValue(':departement', htmlspecialchars(strip_tags($data['departement'] ?? '')));
            $stmt->bindValue(':grade', htmlspecialchars(strip_tags($data['grade'] ?? 'Professeur')));
            $stmt->bindValue(':statut', htmlspecialchars(strip_tags($data['statut'] ?? 'actif')));
            $stmt->bindValue(':created_by', $data['created_by'] ?? 1);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Directeur d'étude créé avec succès",
                    "id" => $this->conn->lastInsertId()
                ));
            } else {
                throw new Exception("Erreur lors de la création du directeur d'étude");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la création: " . $exception->getMessage()
            ));
        }
    }

    // Mettre à jour un directeur d'étude
    private function updateDirecteur() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "ID du directeur requis"
                ));
                return;
            }
            
            if (!$this->directeurExists($data['id'])) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Directeur non trouvé"
                ));
                return;
            }
            
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
                if ($this->emailExists($data['email'], $data['id'])) {
                    http_response_code(400);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Un directeur avec cet email existe déjà"
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
            if (isset($data['role'])) {
                $fields[] = "role = :role";
                $params[':role'] = htmlspecialchars(strip_tags($data['role']));
            }
            if (isset($data['faculte_uas'])) {
                $fields[] = "faculte_uas = :faculte_uas";
                $params[':faculte_uas'] = htmlspecialchars(strip_tags($data['faculte_uas']));
            }
            if (isset($data['departement'])) {
                $fields[] = "departement = :departement";
                $params[':departement'] = htmlspecialchars(strip_tags($data['departement']));
            }
            if (isset($data['grade'])) {
                $fields[] = "grade = :grade";
                $params[':grade'] = htmlspecialchars(strip_tags($data['grade']));
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
                    "message" => "Directeur d'étude mis à jour avec succès"
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

    // Supprimer un directeur d'étude
    private function deleteDirecteur() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "ID du directeur requis"
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
                        "message" => "Directeur d'étude supprimé avec succès"
                    ));
                } else {
                    http_response_code(404);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Directeur non trouvé"
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

    private function directeurExists($id) {
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
    
    $directeurController = new DirecteurEtudeController($db);
    $directeurController->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>