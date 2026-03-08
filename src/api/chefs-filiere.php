<?php
include './head.php';
include './database.php';


class ChefFiliereController {
    private $conn;
    private $table_name = "chefs_filiere";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getChefsFiliere();
                break;
            case 'POST':
                $this->createChefFiliere();
                break;
            case 'PUT':
                $this->updateChefFiliere();
                break;
            case 'DELETE':
                $this->deleteChefFiliere();
                break;
            default:
                http_response_code(405);
                echo json_encode(array("message" => "Méthode non autorisée"));
                break;
        }
    }

    // Récupérer tous les chefs de filière
    private function getChefsFiliere() {
        try {
            $query = "SELECT id, nom, prenom, email, telephone, login, filiere, grade, specialite, statut, date_creation, date_derniere_connexion 
                      FROM " . $this->table_name . " 
                      ORDER BY nom, prenom";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $chefs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(array(
                "success" => true,
                "data" => $chefs
            ));
            
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la récupération des chefs de filière: " . $exception->getMessage()
            ));
        }
    }

    // Créer un nouveau chef de filière
    private function createChefFiliere() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $required_fields = ['nom', 'prenom', 'email', 'login', 'mot_de_passe', 'filiere'];
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
                    "message" => "Un chef de filière avec cet email existe déjà"
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
                     (nom, prenom, email, telephone, login, mot_de_passe, filiere, grade, specialite, statut, created_by) 
                     VALUES (:nom, :prenom, :email, :telephone, :login, :mot_de_passe, :filiere, :grade, :specialite, :statut, :created_by)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindValue(':nom', htmlspecialchars(strip_tags($data['nom'])));
            $stmt->bindValue(':prenom', htmlspecialchars(strip_tags($data['prenom'])));
            $stmt->bindValue(':email', htmlspecialchars(strip_tags($data['email'])));
            $stmt->bindValue(':telephone', htmlspecialchars(strip_tags($data['telephone'] ?? '')));
            $stmt->bindValue(':login', htmlspecialchars(strip_tags($data['login'])));
            $stmt->bindValue(':mot_de_passe', $hashed_password);
            $stmt->bindValue(':filiere', htmlspecialchars(strip_tags($data['filiere'])));
            $stmt->bindValue(':grade', htmlspecialchars(strip_tags($data['grade'] ?? 'Professeur')));
            $stmt->bindValue(':specialite', htmlspecialchars(strip_tags($data['specialite'] ?? '')));
            $stmt->bindValue(':statut', htmlspecialchars(strip_tags($data['statut'] ?? 'actif')));
            $stmt->bindValue(':created_by', $data['created_by'] ?? 1);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Chef de filière créé avec succès",
                    "id" => $this->conn->lastInsertId()
                ));
            } else {
                throw new Exception("Erreur lors de la création du chef de filière");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la création: " . $exception->getMessage()
            ));
        }
    }

    // Mettre à jour un chef de filière
    private function updateChefFiliere() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "ID du chef de filière requis"
                ));
                return;
            }
            
            if (!$this->chefFiliereExists($data['id'])) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Chef de filière non trouvé"
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
                        "message" => "Un chef de filière avec cet email existe déjà"
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
            if (isset($data['filiere'])) {
                $fields[] = "filiere = :filiere";
                $params[':filiere'] = htmlspecialchars(strip_tags($data['filiere']));
            }
            if (isset($data['grade'])) {
                $fields[] = "grade = :grade";
                $params[':grade'] = htmlspecialchars(strip_tags($data['grade']));
            }
            if (isset($data['specialite'])) {
                $fields[] = "specialite = :specialite";
                $params[':specialite'] = htmlspecialchars(strip_tags($data['specialite']));
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
                    "message" => "Chef de filière mis à jour avec succès"
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

    // Supprimer un chef de filière
    private function deleteChefFiliere() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    "success" => false,
                    "message" => "ID du chef de filière requis"
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
                        "message" => "Chef de filière supprimé avec succès"
                    ));
                } else {
                    http_response_code(404);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Chef de filière non trouvé"
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

    private function chefFiliereExists($id) {
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
    
    $chefFiliereController = new ChefFiliereController($db);
    $chefFiliereController->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>