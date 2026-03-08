<?php

include './head.php';
include './database.php';

class EnseignantPublicationsController {
    private $conn;
    private $table_name = "publications";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getPublications();
                break;
            case 'POST':
                $this->createPublication();
                break;
            case 'PUT':
                $this->updatePublication();
                break;
            case 'DELETE':
                $this->deletePublication();
                break;
            default:
                http_response_code(405);
                echo json_encode(array("success" => false, "message" => "Méthode non autorisée"));
                break;
        }
    }

    private function getPublications() {
        try {
            $enseignant_id = $_GET['enseignant_id'] ?? '';
            
            if (!$enseignant_id) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "enseignant_id requis"));
                return;
            }
    
            // Filtrer par enseignant_id
            $query = "SELECT p.* 
                      FROM " . $this->table_name . " p
                      WHERE p.enseignant_id = :enseignant_id
                      ORDER BY p.date_publication DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":enseignant_id", $enseignant_id);
            $stmt->execute();
            
            $publications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(array(
                "success" => true,
                "data" => $publications
            ));
            
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la récupération: " . $exception->getMessage()
            ));
        }
    }

    private function createPublication() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Validation des données requises
            if (empty($data['titre']) || empty($data['description'])) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "Titre et description sont obligatoires"));
                return;
            }

            $query = "INSERT INTO " . $this->table_name . " 
                     (enseignant_id,titre, description, categorie, nom_fichier, type_fichier, statut, date_publication, date_modification) 
                     VALUES 
                     (:enseignant_id,:titre, :description, :categorie, :nom_fichier, :type_fichier, :statut, :date_publication, :date_modification)";
            
            $stmt = $this->conn->prepare($query);
            
            // Valeurs par défaut
            $date_now = date('Y-m-d H:i:s');
            
            // Nettoyer les données
            $enseignant_id = htmlspecialchars(strip_tags($data['enseignant_id']));
            $titre = htmlspecialchars(strip_tags($data['titre']));
            $description = htmlspecialchars(strip_tags($data['description']));
            $categorie = htmlspecialchars(strip_tags($data['categorie'] ?? 'Enseignant(s)'));
            $nom_fichier = htmlspecialchars(strip_tags($data['nom_fichier'] ?? ''));
            $type_fichier = htmlspecialchars(strip_tags($data['type_fichier'] ?? 'texte'));
            $statut = "publié";
            
            // Binder les paramètres
            $stmt->bindParam(":enseignant_id", $enseignant_id);
            $stmt->bindParam(":titre", $titre);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":categorie", $categorie);
            $stmt->bindParam(":nom_fichier", $nom_fichier);
            $stmt->bindParam(":type_fichier", $type_fichier);
            $stmt->bindParam(":statut", $statut);
            $stmt->bindParam(":date_publication", $date_now);
            $stmt->bindParam(":date_modification", $date_now);
            
            if ($stmt->execute()) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Publication créée avec succès",
                    "data" => array(
                        "id" => $this->conn->lastInsertId(),
                        "date_publication" => $date_now
                    )
                ));
            } else {
                throw new Exception("Erreur lors de la création de la publication");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur: " . $exception->getMessage()
            ));
        }
    }

    private function updatePublication() {
        try {
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "ID requis"));
                return;
            }
    
            $fields = [];
            $params = [':id' => $data['id']];
            
            if (isset($data['titre'])) {
                $fields[] = "titre = :titre";
                $params[':titre'] = htmlspecialchars(strip_tags($data['titre']));
            }
            if (isset($data['description'])) {
                $fields[] = "description = :description";
                $params[':description'] = htmlspecialchars(strip_tags($data['description']));
            }
            if (isset($data['nom_fichier'])) {
                $fields[] = "nom_fichier = :nom_fichier";
                $params[':nom_fichier'] = htmlspecialchars(strip_tags($data['nom_fichier']));
            }
            if (isset($data['type_fichier'])) {
                $fields[] = "type_fichier = :type_fichier";
                $params[':type_fichier'] = htmlspecialchars(strip_tags($data['type_fichier']));
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "Aucune donnée à mettre à jour"));
                return;
            }
            
            $fields[] = "date_modification = :date_modification";
            $params[':date_modification'] = date('Y-m-d H:i:s');
            
            $query = "UPDATE " . $this->table_name . " SET " . implode(", ", $fields) . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute($params)) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Publication mise à jour avec succès"
                ));
            } else {
                throw new Exception("Erreur lors de la mise à jour");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur: " . $exception->getMessage()
            ));
        }
    }

    private function deletePublication() {
        try {
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "ID requis"));
                return;
            }

            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $data['id']);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Publication supprimée avec succès"
                    ));
                } else {
                    http_response_code(404);
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Publication non trouvée"
                    ));
                }
            } else {
                throw new Exception("Erreur lors de la suppression");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur: " . $exception->getMessage()
            ));
        }
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $controller = new EnseignantPublicationsController($db);
    $controller->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>