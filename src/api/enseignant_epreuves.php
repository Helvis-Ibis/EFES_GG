<?php

include './head.php';

include './head.php';
include './database.php';

class EnseignantEpreuvesController {
    private $conn;
    private $table_name = "epreuves";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getEpreuves();
                break;
            case 'POST':
                $this->createEpreuve();
                break;
            case 'PUT':
                $this->updateEpreuve();
                break;
            default:
                http_response_code(405);
                echo json_encode(array("success" => false, "message" => "Méthode non autorisée"));
                break;
        }
    }

    private function getEpreuves() {
        try {
            $enseignant_id = $_GET['enseignant_id'] ?? '';
            
            if (!$enseignant_id) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "enseignant_id requis"));
                return;
            }
    
            // Filtrer par enseignant_id
            $query = "SELECT e.* 
                      FROM " . $this->table_name . " e
                      WHERE e.enseignant_id = :enseignant_id
                      ORDER BY e.date_creation DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":enseignant_id", $enseignant_id);
            $stmt->execute();
            
            $epreuves = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(array(
                "success" => true,
                "data" => $epreuves
            ));
            
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur lors de la récupération: " . $exception->getMessage()
            ));
        }
    }

    private function createEpreuve() {
        try {
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            // Validation des données requises
            if (empty($data['titre']) || empty($data['description']) || empty($data['filiere']) || empty($data['enseignant_id'])) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "Titre, description, filiere et enseignant_id sont obligatoires"));
                return;
            }

            // Générer l'heure automatiquement
            $heure_auto = date('H:i:s');
            
            $query = "INSERT INTO " . $this->table_name . " 
                     (titre, description, annee_academique, heure, fichier_nom, filiere, enseignant_id, statut, date_creation, date_modification) 
                     VALUES 
                     (:titre, :description, :annee_academique, :heure, :fichier_nom, :filiere, :enseignant_id, :statut, :date_creation, :date_modification)";
            
            $stmt = $this->conn->prepare($query);
            
            // Valeurs par défaut
            $date_now = date('Y-m-d H:i:s');
            
            // Nettoyer les données
            $titre = htmlspecialchars(strip_tags($data['titre']));
            $description = htmlspecialchars(strip_tags($data['description']));
            $annee_academique = htmlspecialchars(strip_tags($data['annee_academique'] ?? '2024-2025'));
            $fichier_nom = htmlspecialchars(strip_tags($data['fichier_nom'] ?? ''));
            $filiere = htmlspecialchars(strip_tags($data['filiere']));
            $enseignant_id = $data['enseignant_id'];
            $statut = "en_attente";
            
            // Binder les paramètres
            $stmt->bindParam(":titre", $titre);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":annee_academique", $annee_academique);
            $stmt->bindParam(":heure", $heure_auto);
            $stmt->bindParam(":fichier_nom", $fichier_nom);
            $stmt->bindParam(":filiere", $filiere);
            $stmt->bindParam(":enseignant_id", $enseignant_id);
            $stmt->bindParam(":statut", $statut);
            $stmt->bindParam(":date_creation", $date_now);
            $stmt->bindParam(":date_modification", $date_now);
            
            if ($stmt->execute()) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Épreuve envoyée au chef de filière avec succès",
                    "data" => array(
                        "id" => $this->conn->lastInsertId(),
                        "heure" => $heure_auto,
                        "date_creation" => $date_now
                    )
                ));
            } else {
                throw new Exception("Erreur lors de l'envoi de l'épreuve");
            }
            
        } catch (Exception $exception) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Erreur: " . $exception->getMessage()
            ));
        }
    }

    private function updateEpreuve() {
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
            
            if (isset($data['marque_erreur'])) {
                $fields[] = "marque_erreur = :marque_erreur";
                $params[':marque_erreur'] = $data['marque_erreur'];
            }
            if (isset($data['raison_erreur'])) {
                $fields[] = "raison_erreur = :raison_erreur";
                $params[':raison_erreur'] = htmlspecialchars(strip_tags($data['raison_erreur']));
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
                    "message" => "Épreuve mise à jour avec succès"
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
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $controller = new EnseignantEpreuvesController($db);
    $controller->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>