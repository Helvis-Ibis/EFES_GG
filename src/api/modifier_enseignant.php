<?php
include_once './head.php';

// Inclure les fichiers de configuration et modèle
include_once './database.php';
include_once './Enseignant.php';

// Réponse JSON
$response = array("success" => false, "message" => "");

try {
    // Initialiser la base de données
    $database = new Database();
    $db = $database->getConnection();

    // Vérifier la connexion à la base de données
    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    // Vérifier si c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {

        // Journalisation pour le débogage
        error_log("Début du traitement POST modification enseignant");

        // Récupérer les données JSON
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $response["message"] = "Données JSON invalides";
            echo json_encode($response);
            exit;
        }

        $enseignant_id = isset($input['enseignant_id']) ? intval($input['enseignant_id']) : 0;
        
        if ($enseignant_id <= 0) {
            $response["message"] = "ID enseignant invalide";
            echo json_encode($response);
            exit;
        }

        // Récupérer les données à modifier
        $nom = isset($input['nom']) ? trim($input['nom']) : '';
        $prenom = isset($input['prenom']) ? trim($input['prenom']) : '';
        $email = isset($input['email']) ? trim($input['email']) : '';
        $telephone = isset($input['telephone']) ? trim($input['telephone']) : '';
        $dateNaissance = isset($input['dateNaissance']) ? trim($input['dateNaissance']) : '';
        $lieuNaissance = isset($input['lieuNaissance']) ? trim($input['lieuNaissance']) : '';
        $adresse = isset($input['adresse']) ? trim($input['adresse']) : '';
        $diplome = isset($input['diplome']) ? trim($input['diplome']) : '';
        $specialite = isset($input['specialite']) ? trim($input['specialite']) : '';
        $anneeExperience = isset($input['anneeExperience']) ? intval($input['anneeExperience']) : 0;
        $filiereEnseignee = isset($input['filiereEnseignee']) ? trim($input['filiereEnseignee']) : '';
        $coursEnseignes = isset($input['coursEnseignes']) ? trim($input['coursEnseignes']) : '';

        // Validation des champs requis
        if (empty($nom) || empty($prenom) || empty($email) || empty($telephone)) {
            $response["message"] = "Les champs nom, prénom, email et téléphone sont obligatoires";
            echo json_encode($response);
            exit;
        }

        // Vérifier l'email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response["message"] = "Adresse email invalide";
            echo json_encode($response);
            exit;
        }

        // Initialiser l'enseignant
        $enseignant = new Enseignant($db);
        $enseignant->id = $enseignant_id;
        
        // Vérifier que l'enseignant existe
        if (!$enseignant->readOne()) {
            $response["message"] = "Enseignant non trouvé";
            echo json_encode($response);
            exit;
        }

        // Vérifier si l'email existe déjà pour un autre enseignant
        $query_check = "SELECT id FROM enseignants WHERE email = ? AND id != ?";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->execute([$email, $enseignant_id]);
        
        if ($stmt_check->rowCount() > 0) {
            $response["message"] = "Un enseignant avec cet email existe déjà";
            echo json_encode($response);
            exit;
        }

        // Vérifier si le téléphone existe déjà pour un autre enseignant
        $query_check_tel = "SELECT id FROM enseignants WHERE telephone = ? AND id != ?";
        $stmt_check_tel = $db->prepare($query_check_tel);
        $stmt_check_tel->execute([$telephone, $enseignant_id]);
        
        if ($stmt_check_tel->rowCount() > 0) {
            $response["message"] = "Un enseignant avec ce numéro de téléphone existe déjà";
            echo json_encode($response);
            exit;
        }

        // Mettre à jour les informations
        $query = "UPDATE enseignants SET 
                    nom = ?,
                    prenoms = ?,
                    email = ?,
                    telephone = ?,
                    date_naissance = ?,
                    lieu_naissance = ?,
                    adresse_complete = ?,
                    diplome = ?,
                    specialite = ?,
                    annee_experience = ?,
                    filiere_enseignee = ?,
                    cours_enseignes = ?,
                    date_modification = ?
                WHERE id = ?";

        $stmt = $db->prepare($query);
        
        $date_modification = date('Y-m-d H:i:s');
        
        $params = [
            $nom,
            $prenom,
            $email,
            $telephone,
            $dateNaissance,
            $lieuNaissance,
            $adresse,
            $diplome,
            $specialite,
            $anneeExperience,
            $filiereEnseignee,
            $coursEnseignes,
            $date_modification,
            $enseignant_id
        ];

        if ($stmt->execute($params)) {
            $response["success"] = true;
            $response["message"] = "Informations de l'enseignant mises à jour avec succès";
            error_log("Enseignant modifié avec succès, ID: " . $enseignant_id);
        } else {
            throw new Exception("Erreur lors de la mise à jour des informations");
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans modifier_enseignant.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);

// Journalisation finale
error_log("Réponse envoyée modifier_enseignant: " . json_encode($response));
?>