<?php
class Annonce {
    private $conn;
    private $table_name = "annonces";

    // Propriétés de l'annonce
    public $id;
    public $titre;
    public $description;
    public $images; // JSON array
    public $nombre_images;
    public $statut;
    public $date_publication;
    public $date_modification;

    // Constructeur
    public function __construct($db) {
        $this->conn = $db;
    }

    // Fonction helper pour nettoyer les données et gérer les valeurs null
    private function sanitizeInput($data) {
        if (is_null($data) || $data === '') {
            return '';
        }
        return htmlspecialchars(strip_tags(trim((string)$data)));
    }

    // Créer une nouvelle annonce
    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                SET 
                    titre = :titre,
                    description = :description,
                    images = :images,
                    nombre_images = :nombre_images,
                    statut = :statut,
                    date_publication = :date_publication,
                    date_modification = :date_modification";

            $stmt = $this->conn->prepare($query);

            // Nettoyer les données
            $this->titre = $this->sanitizeInput($this->titre);
            $this->description = $this->sanitizeInput($this->description);

            // Valeurs par défaut
            $this->statut = "publiee";
            $this->date_publication = date('Y-m-d H:i:s');
            $this->date_modification = date('Y-m-d H:i:s');

            // Binder les paramètres
            $stmt->bindParam(":titre", $this->titre);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":images", $this->images);
            $stmt->bindParam(":nombre_images", $this->nombre_images);
            $stmt->bindParam(":statut", $this->statut);
            $stmt->bindParam(":date_publication", $this->date_publication);
            $stmt->bindParam(":date_modification", $this->date_modification);

            // Exécuter la requête
            if ($stmt->execute()) {
                return true;
            }
            
            error_log("Erreur SQL: " . implode(", ", $stmt->errorInfo()));
            return false;

        } catch (PDOException $exception) {
            error_log("Erreur PDO: " . $exception->getMessage());
            return false;
        }
    }

    // Lire toutes les annonces
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date_publication DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    // Lire une annonce par ID
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->titre = $row['titre'];
            $this->description = $row['description'];
            $this->images = $row['images'];
            $this->nombre_images = $row['nombre_images'];
            $this->statut = $row['statut'];
            $this->date_publication = $row['date_publication'];
            $this->date_modification = $row['date_modification'];
            
            return true;
        }
        
        return false;
    }

    // Mettre à jour une annonce
    public function update() {
        try {
            $query = "UPDATE " . $this->table_name . "
                SET 
                    titre = :titre,
                    description = :description,
                    images = :images,
                    nombre_images = :nombre_images,
                    date_modification = :date_modification
                WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Nettoyer les données
            $this->titre = $this->sanitizeInput($this->titre);
            $this->description = $this->sanitizeInput($this->description);
            $this->date_modification = date('Y-m-d H:i:s');

            // Binder les paramètres
            $stmt->bindParam(":titre", $this->titre);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":images", $this->images);
            $stmt->bindParam(":nombre_images", $this->nombre_images);
            $stmt->bindParam(":date_modification", $this->date_modification);
            $stmt->bindParam(":id", $this->id);

            // Exécuter la requête
            if ($stmt->execute()) {
                return true;
            }
            
            return false;

        } catch (PDOException $exception) {
            error_log("Erreur PDO: " . $exception->getMessage());
            return false;
        }
    }

    // Supprimer une annonce
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}
?>