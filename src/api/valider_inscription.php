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
        $etudiant_id = $_POST['etudiant_id'] ?? '';

        if (empty($etudiant_id)) {
            $response["message"] = "ID étudiant manquant.";
            echo json_encode($response);
            exit;
        }

        $etudiant->id = $etudiant_id;
        if (!$etudiant->readOne()) {
            $response["message"] = "Étudiant non trouvé.";
            echo json_encode($response);
            exit;
        }

        // Générer un numéro de matricule unique
        $numero_matricule = null;
        $max_attempts = 10;
        
        for ($attempt = 0; $attempt < $max_attempts; $attempt++) {
            $dernier_matricule = $etudiant->getDernierMatricule();
            $nouveau_numero = str_pad($dernier_matricule + 1 + $attempt, 8, '0', STR_PAD_LEFT);
            $date_actuelle = date('dmY');
            $numero_matricule_test = "GG-{$nouveau_numero}-{$date_actuelle}";
            
            if (!$etudiant->matriculeExists($numero_matricule_test)) {
                $numero_matricule = $numero_matricule_test;
                break;
            }
        }

        if (!$numero_matricule) {
            $response["message"] = "Impossible de générer un numéro de matricule unique.";
            echo json_encode($response);
            exit;
        }

        // Tableau pour stocker les informations des documents uploadés
        $uploaded_documents = array();

        // Types de documents à traiter
        $document_types = array(
            'acte_naissance',
            'cip', 
            'diplome_bac',
            'photo',
            'recu_inscription'
        );

        // Traiter chaque type de document

        foreach ($document_types as $doc_type) {
            if (isset($_FILES[$doc_type]) && $_FILES[$doc_type]['error'] == 0) {
                $document = $_FILES[$doc_type];

                // Vérifier le type de fichier
                $allowed_types = array('jpg', 'jpeg', 'png', 'pdf');
                $file_extension = strtolower(pathinfo($document['name'], PATHINFO_EXTENSION));

                if (!in_array($file_extension, $allowed_types)) {
                    $response["message"] = "Format de document non supporté pour {$doc_type}. Utilisez JPG, JPEG, PNG ou PDF.";
                    echo json_encode($response);
                    exit;
                }

                // Vérifier la taille (10 Mo max)
                if ($document['size'] > 10 * 1024 * 1024) {
                    $response["message"] = "Le document {$doc_type} ne doit pas dépasser 10 Mo.";
                    echo json_encode($response);
                    exit;
                }

                // Créer le dossier de stockage spécifique au type de document
                $upload_dir = "../uploads/{$doc_type}/";
                if (!is_dir($upload_dir)) {
                    if (!mkdir($upload_dir, 0755, true)) {
                        $response["message"] = "Impossible de créer le dossier de stockage pour {$doc_type}.";
                        echo json_encode($response);
                        exit;
                    }
                }

                // Générer un nom unique pour le document
                $document_nom = "{$doc_type}_{$etudiant_id}_" . time() . '_' . uniqid() . '.' . $file_extension;
                $document_path = $upload_dir . $document_nom;
                $document_url = "../uploads/{$doc_type}/" . $document_nom;

                // Déplacer le fichier uploadé
                if (!move_uploaded_file($document['tmp_name'], $document_path)) {
                    $response["message"] = "Erreur lors de l'upload du document {$doc_type}.";
                    echo json_encode($response);
                    exit;
                }

                // Stocker les informations du document
                $uploaded_documents[$doc_type] = array(
                    'nom' => $document_nom,
                    'url' => $document_url
                );

               
            }
        }

        // Vérifier que le reçu d'inscription est fourni (obligatoire)
        if (!isset($uploaded_documents['recu_inscription'])) {
            $response["message"] = "Le reçu d'inscription est obligatoire pour valider l'inscription.";
            echo json_encode($response);
            exit;
        }

      

        // Valider l'inscription avec tous les documents
        // Essayer d'abord la méthode principale
      // Dans votre fichier valider_inscription.php, modifiez cette partie :

// Valider l'inscription avec tous les documents
try {
    if ($etudiant->validerInscriptionAvecDocuments($numero_matricule, $uploaded_documents)) {
        $response["success"] = true;
        $response["message"] = "Inscription validée avec succès !";
        $response["numero_matricule"] = $numero_matricule;
        $response["documents_uploades"] = array_keys($uploaded_documents);
    } else {
        $response["message"] = "Erreur lors de la validation de l'inscription dans la base de données.";
    }
} catch (Exception $e) {
    $response["message"] = "Erreur validation (méthode principale): " . $e->getMessage();
}

// Si échec, essayer la méthode simplifiée
if (!$response["success"]) {
    try {
        error_log("Essai méthode simplifiée...");
        if ($etudiant->validerInscriptionAvecDocumentsSimplifiee($numero_matricule, $uploaded_documents)) {
            $response["success"] = true;
            $response["message"] = "Inscription validée avec succès (méthode simplifiée) !";
            $response["numero_matricule"] = $numero_matricule;
            $response["documents_uploades"] = array_keys($uploaded_documents);
        } else {
            $response["message"] = "Erreur lors de la validation de l'inscription (méthode simplifiée a échoué).";
        }
    } catch (Exception $e) {
        $response["message"] = "Erreur validation (méthode simplifiée): " . $e->getMessage();
    }
}
    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans valider_inscription.php: " . $e->getMessage());
    http_response_code(500);
}

header('Content-Type: application/json');
echo json_encode($response);
?>