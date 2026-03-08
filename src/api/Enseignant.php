<?php
class Enseignant {
    private $conn;
    private $table_name = "enseignants";

    // Propriétés de l'enseignant
    public $id;
    public $nom;
    public $prenoms;
    public $date_naissance;
    public $lieu_naissance;
    public $sexe;
    public $nationalite;
    public $situation_matrimoniale;
    public $matrimoniale_autre;
    public $adresse_complete;
    public $telephone;
    public $email;
    public $password_hash;
    public $diplome;
    public $specialite;
    public $annee_experience;
    public $etablissement_precedent;
    public $filiere_enseignee;
    public $cours_enseignes;
    public $photo_nom;
    public $accepte_engagement;
    public $statut;
    public $date_creation;
    public $date_modification;

    // Constructeur
    public function __construct($db) {
        $this->conn = $db;
    }

    // Vérifier si l'email existe déjà
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    // Vérifier si le téléphone existe déjà
    public function telephoneExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE telephone = :telephone LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    // Vérifier les identifiants de connexion
    public function login($email, $password) {
        $query = "SELECT id, nom, prenoms, email, password_hash,filiere_enseignee, statut FROM " . $this->table_name . " 
                  WHERE email = :email AND statut = 'approuve' LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
       //var_dump(password_verify($password, $row['password_hash']) )   ;
            
            // Vérifier le mot de passe
            if (password_verify($password, $row['password_hash'])) {
                // Mettre à jour les propriétés de l'objet
                $this->id = $row['id'];
                $this->nom = $row['nom'];
                $this->filiere_enseignee = $row['filiere_enseignee'];
                $this->prenoms = $row['prenoms'];
                $this->email = $row['email'];
                $this->statut = $row['statut'];
                
                return true;
            }
        }
        
        return false;
    }

    // Mettre à jour le mot de passe
    public function updatePassword($new_password) {
        $query = "UPDATE " . $this->table_name . "
                SET 
                    password_hash = :password_hash,
                    date_modification = :date_modification
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $this->date_modification = date('Y-m-d H:i:s');

        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":date_modification", $this->date_modification);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Vérifier si le mot de passe actuel est correct
    public function verifyCurrentPassword($password) {
        $query = "SELECT password_hash FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return password_verify($password, $row['password_hash']);
        }
        
        return false;
    }

    // Créer un nouvel enseignant
    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                SET 
                    nom = :nom,
                    prenoms = :prenoms,
                    date_naissance = :date_naissance,
                    lieu_naissance = :lieu_naissance,
                    sexe = :sexe,
                    nationalite = :nationalite,
                    situation_matrimoniale = :situation_matrimoniale,
                    matrimoniale_autre = :matrimoniale_autre,
                    adresse_complete = :adresse_complete,
                    telephone = :telephone,
                    email = :email,
                    password_hash = :password_hash,
                    diplome = :diplome,
                    specialite = :specialite,
                    annee_experience = :annee_experience,
                    etablissement_precedent = :etablissement_precedent,
                    filiere_enseignee = :filiere_enseignee,
                    cours_enseignes = :cours_enseignes,
                    photo_nom = :photo_nom,
                    accepte_engagement = :accepte_engagement,
                    statut = :statut,
                    date_creation = :date_creation,
                    date_modification = :date_modification";

            $stmt = $this->conn->prepare($query);

            // Nettoyer et binder les données
            $this->nom = htmlspecialchars(strip_tags($this->nom));
            $this->prenoms = htmlspecialchars(strip_tags($this->prenoms));
            $this->lieu_naissance = htmlspecialchars(strip_tags($this->lieu_naissance));
            $this->sexe = htmlspecialchars(strip_tags($this->sexe));
            $this->nationalite = htmlspecialchars(strip_tags($this->nationalite));
            $this->situation_matrimoniale = htmlspecialchars(strip_tags($this->situation_matrimoniale));
            $this->matrimoniale_autre = htmlspecialchars(strip_tags($this->matrimoniale_autre));
            $this->adresse_complete = htmlspecialchars(strip_tags($this->adresse_complete));
            $this->telephone = htmlspecialchars(strip_tags($this->telephone));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->diplome = htmlspecialchars(strip_tags($this->diplome));
            $this->specialite = htmlspecialchars(strip_tags($this->specialite));
            $this->etablissement_precedent = htmlspecialchars(strip_tags($this->etablissement_precedent));
            $this->filiere_enseignee = htmlspecialchars(strip_tags($this->filiere_enseignee));
            $this->cours_enseignes = htmlspecialchars(strip_tags($this->cours_enseignes));
            $this->photo_nom = htmlspecialchars(strip_tags($this->photo_nom));

            // Valeurs par défaut
            $this->statut = "en_attente"; // en_attente, approuve, rejete
            $this->date_creation = date('Y-m-d H:i:s');
            $this->date_modification = date('Y-m-d H:i:s');

            // S'assurer que le mot de passe est hashé
            if (empty($this->password_hash)) {
                // Générer un mot de passe temporaire si non fourni
                $temp_password = bin2hex(random_bytes(8));
                $this->password_hash = password_hash($temp_password, PASSWORD_DEFAULT);
            }

            // Binder les paramètres
            $stmt->bindParam(":nom", $this->nom);
            $stmt->bindParam(":prenoms", $this->prenoms);
            $stmt->bindParam(":date_naissance", $this->date_naissance);
            $stmt->bindParam(":lieu_naissance", $this->lieu_naissance);
            $stmt->bindParam(":sexe", $this->sexe);
            $stmt->bindParam(":nationalite", $this->nationalite);
            $stmt->bindParam(":situation_matrimoniale", $this->situation_matrimoniale);
            $stmt->bindParam(":matrimoniale_autre", $this->matrimoniale_autre);
            $stmt->bindParam(":adresse_complete", $this->adresse_complete);
            $stmt->bindParam(":telephone", $this->telephone);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password_hash", $this->password_hash);
            $stmt->bindParam(":diplome", $this->diplome);
            $stmt->bindParam(":specialite", $this->specialite);
            $stmt->bindParam(":annee_experience", $this->annee_experience);
            $stmt->bindParam(":etablissement_precedent", $this->etablissement_precedent);
            $stmt->bindParam(":filiere_enseignee", $this->filiere_enseignee);
            $stmt->bindParam(":cours_enseignes", $this->cours_enseignes);
            $stmt->bindParam(":photo_nom", $this->photo_nom);
            $stmt->bindParam(":accepte_engagement", $this->accepte_engagement);
            $stmt->bindParam(":statut", $this->statut);
            $stmt->bindParam(":date_creation", $this->date_creation);
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

    // Lire un enseignant par ID
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->nom = $row['nom'];
            $this->prenoms = $row['prenoms'];
            $this->date_naissance = $row['date_naissance'];
            $this->lieu_naissance = $row['lieu_naissance'];
            $this->sexe = $row['sexe'];
            $this->nationalite = $row['nationalite'];
            $this->situation_matrimoniale = $row['situation_matrimoniale'];
            $this->matrimoniale_autre = $row['matrimoniale_autre'];
            $this->adresse_complete = $row['adresse_complete'];
            $this->telephone = $row['telephone'];
            $this->email = $row['email'];
            $this->password_hash = $row['password_hash'];
            $this->diplome = $row['diplome'];
            $this->specialite = $row['specialite'];
            $this->annee_experience = $row['annee_experience'];
            $this->etablissement_precedent = $row['etablissement_precedent'];
            $this->filiere_enseignee = $row['filiere_enseignee'];
            $this->cours_enseignes = $row['cours_enseignes'];
            $this->photo_nom = $row['photo_nom'];
            $this->accepte_engagement = $row['accepte_engagement'];
            $this->statut = $row['statut'];
            $this->date_creation = $row['date_creation'];
            $this->date_modification = $row['date_modification'];
            
            return true;
        }
        
        return false;
    }

    // Lire tous les enseignants
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date_creation DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    // Lire les enseignants par statut
    public function readByStatut($statut) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE statut = :statut ORDER BY date_creation DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":statut", $statut);
        $stmt->execute();
        
        return $stmt;
    }

    // Mettre à jour le statut d'un enseignant
    public function updateStatut() {
        $query = "UPDATE " . $this->table_name . "
                SET 
                    statut = :statut,
                    date_modification = :date_modification
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->date_modification = date('Y-m-d H:i:s');

        $stmt->bindParam(":statut", $this->statut);
        $stmt->bindParam(":date_modification", $this->date_modification);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Mettre à jour le profil d'un enseignant
    public function updateProfile() {
        $query = "UPDATE " . $this->table_name . "
                SET 
                    nom = :nom,
                    prenoms = :prenoms,
                    date_naissance = :date_naissance,
                    lieu_naissance = :lieu_naissance,
                    sexe = :sexe,
                    nationalite = :nationalite,
                    situation_matrimoniale = :situation_matrimoniale,
                    matrimoniale_autre = :matrimoniale_autre,
                    adresse_complete = :adresse_complete,
                    telephone = :telephone,
                    email = :email,
                    diplome = :diplome,
                    specialite = :specialite,
                    annee_experience = :annee_experience,
                    etablissement_precedent = :etablissement_precedent,
                    filiere_enseignee = :filiere_enseignee,
                    cours_enseignes = :cours_enseignes,
                    date_modification = :date_modification
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Nettoyer les données
        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenoms = htmlspecialchars(strip_tags($this->prenoms));
        $this->lieu_naissance = htmlspecialchars(strip_tags($this->lieu_naissance));
        $this->sexe = htmlspecialchars(strip_tags($this->sexe));
        $this->nationalite = htmlspecialchars(strip_tags($this->nationalite));
        $this->situation_matrimoniale = htmlspecialchars(strip_tags($this->situation_matrimoniale));
        $this->matrimoniale_autre = htmlspecialchars(strip_tags($this->matrimoniale_autre));
        $this->adresse_complete = htmlspecialchars(strip_tags($this->adresse_complete));
        $this->telephone = htmlspecialchars(strip_tags($this->telephone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->diplome = htmlspecialchars(strip_tags($this->diplome));
        $this->specialite = htmlspecialchars(strip_tags($this->specialite));
        $this->etablissement_precedent = htmlspecialchars(strip_tags($this->etablissement_precedent));
        $this->filiere_enseignee = htmlspecialchars(strip_tags($this->filiere_enseignee));
        $this->cours_enseignes = htmlspecialchars(strip_tags($this->cours_enseignes));

        $this->date_modification = date('Y-m-d H:i:s');

        // Binder les paramètres
        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenoms", $this->prenoms);
        $stmt->bindParam(":date_naissance", $this->date_naissance);
        $stmt->bindParam(":lieu_naissance", $this->lieu_naissance);
        $stmt->bindParam(":sexe", $this->sexe);
        $stmt->bindParam(":nationalite", $this->nationalite);
        $stmt->bindParam(":situation_matrimoniale", $this->situation_matrimoniale);
        $stmt->bindParam(":matrimoniale_autre", $this->matrimoniale_autre);
        $stmt->bindParam(":adresse_complete", $this->adresse_complete);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":diplome", $this->diplome);
        $stmt->bindParam(":specialite", $this->specialite);
        $stmt->bindParam(":annee_experience", $this->annee_experience);
        $stmt->bindParam(":etablissement_precedent", $this->etablissement_precedent);
        $stmt->bindParam(":filiere_enseignee", $this->filiere_enseignee);
        $stmt->bindParam(":cours_enseignes", $this->cours_enseignes);
        $stmt->bindParam(":date_modification", $this->date_modification);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Supprimer un enseignant
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    // Compter le nombre total d'enseignants
    public function countAll() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['total'];
    }

    // Compter les enseignants par statut
    public function countByStatut($statut) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE statut = :statut";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":statut", $statut);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['total'];
    }
}
?>