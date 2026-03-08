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

    // Initialiser l'enseignant
    $enseignant = new Enseignant($db);

    // Vérifier si c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {

        // Journalisation pour le débogage
        error_log("Début du traitement POST rejet enseignant");

        // Récupérer les données JSON
        $input = json_decode(file_get_contents('php://input'), true);
        
        $enseignant_id = isset($input['enseignant_id']) ? intval($input['enseignant_id']) : 0;
        $raison_refus = isset($input['raison_refus']) ? trim($input['raison_refus']) : '';

        if ($enseignant_id <= 0) {
            $response["message"] = "ID enseignant invalide";
            echo json_encode($response);
            exit;
        }

        if (empty($raison_refus)) {
            $response["message"] = "La raison du refus est obligatoire";
            echo json_encode($response);
            exit;
        }

        // Charger les données de l'enseignant
        $enseignant->id = $enseignant_id;
        if (!$enseignant->readOne()) {
            $response["message"] = "Enseignant non trouvé";
            echo json_encode($response);
            exit;
        }

        // Mettre à jour le statut et la raison du refus
        $query = "UPDATE enseignants SET statut = 'rejete', raison_refus = ?, date_modification = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        
        $date_modification = date('Y-m-d H:i:s');
        
        if ($stmt->execute([$raison_refus, $date_modification, $enseignant_id])) {
            $response["success"] = true;
            $response["message"] = "Enseignant rejeté avec succès";
            error_log("Enseignant rejeté avec succès, ID: " . $enseignant_id);
        } else {
            throw new Exception("Erreur lors de la mise à jour du statut");
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans rejeter_enseignant.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);

// Journalisation finale
error_log("Réponse envoyée rejeter_enseignant: " . json_encode($response));
?>