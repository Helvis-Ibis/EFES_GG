<?php

include './head.php';
include './database.php';

class EpreuvesController {
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
            $filiere = $_GET['filiere'] ?? '';
            
            if (!$filiere) {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "filiere requis"));
                return;
            }

            $query = "SELECT e.*, en.nom as enseignant_nom, en.prenoms as enseignant_prenoms 
                      FROM " . $this->table_name . " e
                      LEFT JOIN enseignants en ON e.enseignant_id = en.id
                      WHERE e.filiere = :filiere
                      ORDER BY e.date_creation DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":filiere", $filiere);
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
            
            if (isset($data['statut'])) {
                $fields[] = "statut = :statut";
                $params[':statut'] = $data['statut'];
            }
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
    
    $controller = new EpreuvesController($db);
    $controller->handleRequest();
    
} catch (Exception $exception) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Erreur de connexion: " . $exception->getMessage()
    ));
}
?>