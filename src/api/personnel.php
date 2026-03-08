<?php
include './head.php';
include './database.php';


class Personnel {
    private $conn;
    private $table = "personnel";

    public $id;
    public $nom;
    public $prenom;
    public $email;
    public $telephone;
    public $poste;
    public $nomUtilisateur;
    public $motDePasse;
    public $dateCreation;
    public $statut;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Créer un membre du personnel
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                 SET nom=:nom, prenom=:prenom, email=:email, telephone=:telephone, 
                     poste=:poste, nomUtilisateur=:nomUtilisateur, motDePasse=:motDePasse,
                     dateCreation=:dateCreation, statut=:statut";

        $stmt = $this->conn->prepare($query);

        // Nettoyer les données
        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenom = htmlspecialchars(strip_tags($this->prenom));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->telephone = htmlspecialchars(strip_tags($this->telephone));
        $this->poste = htmlspecialchars(strip_tags($this->poste));
        $this->nomUtilisateur = htmlspecialchars(strip_tags($this->nomUtilisateur));
        
        // Hasher le mot de passe
        $hashed_password = password_hash($this->motDePasse, PASSWORD_DEFAULT);

        // Liaison des paramètres
        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenom", $this->prenom);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->bindParam(":poste", $this->poste);
        $stmt->bindParam(":nomUtilisateur", $this->nomUtilisateur);
        $stmt->bindParam(":motDePasse", $hashed_password);
        $stmt->bindParam(":dateCreation", $this->dateCreation);
        $stmt->bindParam(":statut", $this->statut);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Lire tout le personnel
    public function read() {
        $query = "SELECT id, nom, prenom, email, telephone, poste, nomUtilisateur, dateCreation, statut 
                 FROM " . $this->table . " ORDER BY nom, prenom";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Lire un membre par ID
    public function readOne() {
        $query = "SELECT id, nom, prenom, email, telephone, poste, nomUtilisateur, dateCreation, statut 
                 FROM " . $this->table . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->nom = $row['nom'];
            $this->prenom = $row['prenom'];
            $this->email = $row['email'];
            $this->telephone = $row['telephone'];
            $this->poste = $row['poste'];
            $this->nomUtilisateur = $row['nomUtilisateur'];
            $this->dateCreation = $row['dateCreation'];
            $this->statut = $row['statut'];
            return true;
        }
        return false;
    }

    // Mettre à jour un membre
    public function update() {
        $query = "UPDATE " . $this->table . " 
                 SET nom=:nom, prenom=:prenom, email=:email, telephone=:telephone, 
                     poste=:poste, nomUtilisateur=:nomUtilisateur, statut=:statut
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Nettoyer les données
        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenom = htmlspecialchars(strip_tags($this->prenom));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->telephone = htmlspecialchars(strip_tags($this->telephone));
        $this->poste = htmlspecialchars(strip_tags($this->poste));
        $this->nomUtilisateur = htmlspecialchars(strip_tags($this->nomUtilisateur));

        // Liaison des paramètres
        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenom", $this->prenom);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->bindParam(":poste", $this->poste);
        $stmt->bindParam(":nomUtilisateur", $this->nomUtilisateur);
        $stmt->bindParam(":statut", $this->statut);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Supprimer un membre
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Changer le statut
    public function toggleStatus() {
        $query = "UPDATE " . $this->table . " SET statut = :statut WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":statut", $this->statut);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

$database = new Database();
$db = $database->getConnection();
$personnel = new Personnel($db);

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $personnel->id = $_GET['id'];
            if ($personnel->readOne()) {
                echo json_encode($personnel);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Membre du personnel non trouvé."));
            }
        } else {
            $stmt = $personnel->read();
            $personnels = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($personnels, $row);
            }
            echo json_encode($personnels);
        }
        break;

    case 'POST':
        $personnel->nom = $input['nom'];
        $personnel->prenom = $input['prenom'];
        $personnel->email = $input['email'];
        $personnel->telephone = $input['telephone'];
        $personnel->poste = $input['poste'];
        $personnel->nomUtilisateur = $input['nomUtilisateur'];
        $personnel->motDePasse = $input['motDePasse'];
        $personnel->dateCreation = date('Y-m-d');
        $personnel->statut = 'actif';

        if ($personnel->create()) {
            http_response_code(201);
            echo json_encode(array("message" => "Membre du personnel créé avec succès."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Impossible de créer le membre du personnel."));
        }
        break;

    case 'PUT':
        $personnel->id = $input['id'];
        $personnel->nom = $input['nom'];
        $personnel->prenom = $input['prenom'];
        $personnel->email = $input['email'];
        $personnel->telephone = $input['telephone'];
        $personnel->poste = $input['poste'];
        $personnel->nomUtilisateur = $input['nomUtilisateur'];
        $personnel->statut = $input['statut'];

        if ($personnel->update()) {
            echo json_encode(array("message" => "Membre du personnel mis à jour avec succès."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Impossible de mettre à jour le membre du personnel."));
        }
        break;

    case 'DELETE':
        $personnel->id = $input['id'];
        if ($personnel->delete()) {
            echo json_encode(array("message" => "Membre du personnel supprimé avec succès."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Impossible de supprimer le membre du personnel."));
        }
        break;

    case 'PATCH':
        // Pour changer le statut
        $personnel->id = $input['id'];
        $personnel->statut = $input['statut'];
        if ($personnel->toggleStatus()) {
            echo json_encode(array("message" => "Statut mis à jour."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Impossible de mettre à jour le statut."));
        }
        break;
}
?>