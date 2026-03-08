<?php
include_once './head.php';
include_once './database.php';
include_once './Etudiant.php';


$response = array("success" => false, "message" => "");

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    $etudiant = new Etudiant($db);

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Récupérer les données JSON
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            $response["message"] = "Données JSON invalides.";
            echo json_encode($response);
            exit;
        }

        error_log("Données reçues pour modification: " . print_r($input, true));

        $etudiant_id = $input['etudiant_id'] ?? '';

        if (empty($etudiant_id)) {
            $response["message"] = "ID étudiant manquant.";
            echo json_encode($response);
            exit;
        }

        // Vérifier que l'étudiant existe
        $etudiant->id = $etudiant_id;
        if (!$etudiant->readOne()) {
            $response["message"] = "Étudiant non trouvé.";
            echo json_encode($response);
            exit;
        }

        // Préparer les données de mise à jour
        $update_data = array();

        // Champs autorisés à modifier avec mapping
        $field_mapping = [
            'nom' => 'nom',
            'prenom' => 'prenoms', // Mapping vers prenoms dans la BD
            'email' => 'email',
            'telephone' => 'telephone',
            'dateNaissance' => 'date_naissance',
            'lieuNaissance' => 'lieu_naissance',
            'adresse' => 'adresse_complete',
            'anneeAcademique' => 'anneeAcademique', // À ajuster selon votre structure
            'filiere' => 'filiere_choisie'
        ];

        foreach ($field_mapping as $front_field => $db_field) {
            if (isset($input[$front_field]) && !empty($input[$front_field])) {
                $update_data[$db_field] = $input[$front_field];
            }
        }

        error_log("Données préparées pour UPDATE: " . print_r($update_data, true));

        if (empty($update_data)) {
            $response["message"] = "Aucune donnée valide à mettre à jour.";
            echo json_encode($response);
            exit;
        }

        // Vérifier l'unicité de l'email si modifié
        if (isset($update_data['email']) && $update_data['email'] !== $etudiant->email) {
            $etudiant->email = $update_data['email'];
            if ($etudiant->emailExists()) {
                $response["message"] = "Cet email est déjà utilisé par un autre étudiant.";
                echo json_encode($response);
                exit;
            }
        }

        // Vérifier l'unicité du téléphone si modifié
        if (isset($update_data['telephone']) && $update_data['telephone'] !== $etudiant->telephone) {
            $etudiant->telephone = $update_data['telephone'];
            if ($etudiant->telephoneExists()) {
                $response["message"] = "Ce numéro de téléphone est déjà utilisé par un autre étudiant.";
                echo json_encode($response);
                exit;
            }
        }

        // Mettre à jour l'étudiant
        $update_result = $etudiant->modifierEtudiant($update_data);

        if ($update_result === true) {
            $response["success"] = true;
            $response["message"] = "Informations mises à jour avec succès !";
        } else {
            // $update_result contient le message d'erreur
            $response["message"] = $update_result;
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans modifier_etudiant.php: " . $e->getMessage());
    http_response_code(500);
}

error_log("Réponse envoyée: " . json_encode($response));
header('Content-Type: application/json');
echo json_encode($response);
?>