<?php
class Publication {
    private $conn;
    private $table_name = "publications";

    // Propriétés de la publication
    public $id;
    public $titre;
    public $description;
    public $categorie;
    public $nom_fichier;
    public $chemin_fichier;
    public $taille_fichier;
    public $type_fichier;
    public $telechargements;
    public $est_vedette;
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

    // Créer une nouvelle publication
    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                SET 
                    titre = :titre,
                    description = :description,
                    categorie = :categorie,
                    nom_fichier = :nom_fichier,
                    chemin_fichier = :chemin_fichier,
                    taille_fichier = :taille_fichier,
                    type_fichier = :type_fichier,
                    telechargements = :telechargements,
                    est_vedette = :est_vedette,
                    statut = :statut,
                    date_publication = :date_publication,
                    date_modification = :date_modification";

            $stmt = $this->conn->prepare($query);

            // Nettoyer et binder les données
            $this->titre = $this->sanitizeInput($this->titre);
            $this->description = $this->sanitizeInput($this->description);
            $this->categorie = $this->sanitizeInput($this->categorie);
            $this->nom_fichier = $this->sanitizeInput($this->nom_fichier);
            $this->chemin_fichier = $this->sanitizeInput($this->chemin_fichier);
            $this->taille_fichier = $this->sanitizeInput($this->taille_fichier);
            $this->type_fichier = $this->sanitizeInput($this->type_fichier);

            // Valeurs par défaut
            $this->telechargements = 0;
            $this->est_vedette = $this->est_vedette ? 1 : 0;
            $this->statut = "publiee"; // publiee, brouillon, archivee
            $this->date_publication = date('Y-m-d H:i:s');
            $this->date_modification = date('Y-m-d H:i:s');

            // Binder les paramètres
            $stmt->bindParam(":titre", $this->titre);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":categorie", $this->categorie);
            $stmt->bindParam(":nom_fichier", $this->nom_fichier);
            $stmt->bindParam(":chemin_fichier", $this->chemin_fichier);
            $stmt->bindParam(":taille_fichier", $this->taille_fichier);
            $stmt->bindParam(":type_fichier", $this->type_fichier);
            $stmt->bindParam(":telechargements", $this->telechargements);
            $stmt->bindParam(":est_vedette", $this->est_vedette);
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

    // Lire toutes les publications
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date_publication DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    // Lire une publication par ID
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->titre = $row['titre'];
            $this->description = $row['description'];
            $this->categorie = $row['categorie'];
            $this->nom_fichier = $row['nom_fichier'];
            $this->chemin_fichier = $row['chemin_fichier'];
            $this->taille_fichier = $row['taille_fichier'];
            $this->type_fichier = $row['type_fichier'];
            $this->telechargements = $row['telechargements'];
            $this->est_vedette = $row['est_vedette'];
            $this->statut = $row['statut'];
            $this->date_publication = $row['date_publication'];
            $this->date_modification = $row['date_modification'];
            
            return true;
        }
        
        return false;
    }

    // Mettre à jour une publication
    public function update() {
        try {
            $query = "UPDATE " . $this->table_name . "
                SET 
                    titre = :titre,
                    description = :description,
                    categorie = :categorie,
                    nom_fichier = :nom_fichier,
                    chemin_fichier = :chemin_fichier,
                    taille_fichier = :taille_fichier,
                    type_fichier = :type_fichier,
                    est_vedette = :est_vedette,
                    date_modification = :date_modification
                WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Nettoyer et binder les données
            $this->titre = $this->sanitizeInput($this->titre);
            $this->description = $this->sanitizeInput($this->description);
            $this->categorie = $this->sanitizeInput($this->categorie);
            $this->nom_fichier = $this->sanitizeInput($this->nom_fichier);
            $this->chemin_fichier = $this->sanitizeInput($this->chemin_fichier);
            $this->taille_fichier = $this->sanitizeInput($this->taille_fichier);
            $this->type_fichier = $this->sanitizeInput($this->type_fichier);

            $this->est_vedette = $this->est_vedette ? 1 : 0;
            $this->date_modification = date('Y-m-d H:i:s');

            // Binder les paramètres
            $stmt->bindParam(":titre", $this->titre);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":categorie", $this->categorie);
            $stmt->bindParam(":nom_fichier", $this->nom_fichier);
            $stmt->bindParam(":chemin_fichier", $this->chemin_fichier);
            $stmt->bindParam(":taille_fichier", $this->taille_fichier);
            $stmt->bindParam(":type_fichier", $this->type_fichier);
            $stmt->bindParam(":est_vedette", $this->est_vedette);
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

    // Supprimer une publication
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    // Basculer le statut vedette
    public function toggleFeatured() {
        $query = "UPDATE " . $this->table_name . "
                SET 
                    est_vedette = NOT est_vedette,
                    date_modification = :date_modification
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->date_modification = date('Y-m-d H:i:s');

        $stmt->bindParam(":date_modification", $this->date_modification);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Incrémenter le compteur de téléchargements
    public function incrementDownloads() {
        $query = "UPDATE " . $this->table_name . "
                SET telechargements = telechargements + 1
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Vérifier si une publication existe avec le même titre
    public function titleExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE titre = :titre";
        
        if ($this->id) {
            $query .= " AND id != :id";
        }
        
        $query .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":titre", $this->titre);
        
        if ($this->id) {
            $stmt->bindParam(":id", $this->id);
        }
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}
?>