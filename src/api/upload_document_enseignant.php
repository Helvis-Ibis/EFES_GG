<?php
include_once './head.php';

include_once './database.php';
include_once './Enseignant.php';

$response = array("success" => false, "message" => "");

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    $enseignant = new Enseignant($db);

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $enseignant_id = $_POST['enseignant_id'] ?? '';
        $document_type = $_POST['document_type'] ?? '';

        if (empty($enseignant_id) || empty($document_type)) {
            $response["message"] = "ID enseignant ou type de document manquant.";
            echo json_encode($response);
            exit;
        }

        // Vérifier les types de documents autorisés pour les enseignants
        $allowed_document_types = array('cv', 'diplome', 'certificat_nationalite');
        if (!in_array($document_type, $allowed_document_types)) {
            $response["message"] = "Type de document non autorisé pour un enseignant.";
            echo json_encode($response);
            exit;
        }

        $enseignant->id = $enseignant_id;
        if (!$enseignant->readOne()) {
            $response["message"] = "Enseignant non trouvé.";
            echo json_encode($response);
            exit;
        }

        // Gestion de l'upload du document
        if (isset($_FILES['document_file']) && $_FILES['document_file']['error'] == 0) {
            $document = $_FILES['document_file'];

            // Vérifier le type de fichier
            $allowed_types = array('jpg', 'jpeg', 'png', 'pdf');
            $file_extension = strtolower(pathinfo($document['name'], PATHINFO_EXTENSION));

            if (!in_array($file_extension, $allowed_types)) {
                $response["message"] = "Format de document non supporté. Utilisez JPG, JPEG, PNG ou PDF.";
                echo json_encode($response);
                exit;
            }

            // Vérifier la taille (10 Mo max)
            if ($document['size'] > 10 * 1024 * 1024) {
                $response["message"] = "Le document ne doit pas dépasser 10 Mo.";
                echo json_encode($response);
                exit;
            }

            // Créer le dossier de stockage spécifique pour les enseignants
            $upload_dir = "../uploads/documents_enseignants/";
            if (!is_dir($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    $response["message"] = "Impossible de créer le dossier de stockage pour les documents enseignants.";
                    echo json_encode($response);
                    exit;
                }
            }

            // Générer un nom unique pour le document
            $document_nom = "enseignant_{$enseignant_id}_{$document_type}_" . time() . '.' . $file_extension;
            $document_path = $upload_dir . $document_nom;
            $document_url = "documents_enseignants/" . $document_nom; // URL relative par rapport à uploads/

            // Déplacer le fichier uploadé
            if (!move_uploaded_file($document['tmp_name'], $document_path)) {
                $response["message"] = "Erreur lors de l'upload du document.";
                echo json_encode($response);
                exit;
            }

            // Mettre à jour la base de données
            if ($enseignant->updateDocument($document_type, $document_nom)) {
                $response["success"] = true;
                $response["message"] = "Document enseignant uploadé avec succès !";
                $response["document_url"] = "../uploads/" . $document_url;
            } else {
                $response["message"] = "Erreur lors de la mise à jour de la base de données.";
            }
        } else {
            $response["message"] = "Veuillez sélectionner un fichier.";
        }
    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans upload_document_enseignant.php: " . $e->getMessage());
    http_response_code(500);
}

header('Content-Type: application/json');
echo json_encode($response);
?>
