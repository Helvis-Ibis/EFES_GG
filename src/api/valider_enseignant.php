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
        error_log("Début du traitement POST validation enseignant");
        error_log("Données POST reçues: " . print_r($_POST, true));
        error_log("Fichiers reçus: " . print_r($_FILES, true));

        // Récupérer l'ID de l'enseignant
        $enseignant_id = isset($_POST['enseignant_id']) ? intval($_POST['enseignant_id']) : 0;

        if ($enseignant_id <= 0) {
            $response["message"] = "ID enseignant invalide";
            echo json_encode($response);
            exit;
        }

        // Initialiser l'enseignant
        $enseignant = new Enseignant($db);
        $enseignant->id = $enseignant_id;
        
        // Charger les données de l'enseignant
        if (!$enseignant->readOne()) {
            $response["message"] = "Enseignant non trouvé";
            echo json_encode($response);
            exit;
        }

        // Gestion de l'upload des documents
        $uploaded_documents = array();

        // Documents à gérer
        $document_types = array(
            'cv' => 'Curriculum Vitae',
            'diplome' => 'Diplôme',
            'certificat_nationalite' => 'Certificat de nationalité'
        );

        foreach ($document_types as $type => $label) {
            if (isset($_FILES[$type]) && $_FILES[$type]['error'] == 0) {
                $document = $_FILES[$type];

                // Vérifier le type de fichier
                $allowed_types = array('jpg', 'jpeg', 'png', 'pdf');
                $file_extension = strtolower(pathinfo($document['name'], PATHINFO_EXTENSION));

                if (!in_array($file_extension, $allowed_types)) {
                    $response["message"] = "Format de document non supporté pour $label. Utilisez JPG, JPEG, PNG ou PDF.";
                    echo json_encode($response);
                    exit;
                }

                // Vérifier la taille (10 Mo max)
                if ($document['size'] > 10 * 1024 * 1024) {
                    $response["message"] = "Le document $label ne doit pas dépasser 10 Mo.";
                    echo json_encode($response);
                    exit;
                }

                // Créer le dossier de stockage s'il n'existe pas
                $upload_dir = "../uploads/documents_enseignants/";
                if (!is_dir($upload_dir)) {
                    if (!mkdir($upload_dir, 0755, true)) {
                        $response["message"] = "Impossible de créer le dossier de stockage des documents.";
                        echo json_encode($response);
                        exit;
                    }
                }

                // Vérifier que le dossier est accessible en écriture
                if (!is_writable($upload_dir)) {
                    $response["message"] = "Le dossier de stockage n'est pas accessible en écriture.";
                    echo json_encode($response);
                    exit;
                }

                // Générer un nom unique pour le document
                $document_name = "enseignant_{$enseignant_id}_{$type}_" . uniqid() . '.' . $file_extension;
                $document_path = $upload_dir . $document_name;

                // Déplacer le fichier uploadé
                if (move_uploaded_file($document['tmp_name'], $document_path)) {
                    $uploaded_documents[$type] = $document_name;
                    error_log("Document $type uploadé avec succès: " . $document_path);
                } else {
                    $error = error_get_last();
                    $response["message"] = "Erreur lors de l'upload du document $label: " . ($error['message'] ?? 'Erreur inconnue');
                    echo json_encode($response);
                    exit;
                }
            }
        }

        // Mettre à jour le statut de l'enseignant et les documents
        $update_fields = array();
        $update_values = array();

        // Ajouter les documents uploadés
        foreach ($uploaded_documents as $type => $filename) {
            $column_name = $type . '_nom';
            $update_fields[] = "$column_name = ?";
            $update_values[] = $filename;
        }

        // Mettre à jour le statut
        $update_fields[] = "statut = ?";
        $update_values[] = 'approuve';
        
        $update_fields[] = "date_modification = ?";
        $update_values[] = date('Y-m-d H:i:s');

        $update_values[] = $enseignant_id;

        $query = "UPDATE enseignants SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $stmt = $db->prepare($query);
        
        if ($stmt->execute($update_values)) {
            $response["success"] = true;
            $response["message"] = "Enseignant validé avec succès !";
            $response["document_url"] = "../uploads/documents_enseignants/";
            error_log("Enseignant validé avec succès, ID: " . $enseignant_id);
        } else {
            throw new Exception("Erreur lors de la mise à jour de l'enseignant");
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans valider_enseignant.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);

// Journalisation finale
error_log("Réponse envoyée valider_enseignant: " . json_encode($response));
?>