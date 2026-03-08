<?php

error_reporting(E_ALL & ~E_DEPRECATED);
ini_set('display_errors', 1);
include_once './head.php';

// Inclure les fichiers de configuration et modèle
include_once './database.php';
include_once './Publication.php';

// Réponse JSON
$response = array("success" => false, "message" => "", "data" => array());

// Fonction helper pour nettoyer les données
function cleanInput($data) {
    // Retourner vide si null
    if (is_null($data)) {
        return '';
    }
    // Convertir en string ET trim
    return trim((string)$data);
}

try {
    // Initialiser la base de données
    $database = new Database();
    $db = $database->getConnection();

    // Vérifier la connexion à la base de données
    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    // Initialiser la publication
    $publication = new Publication($db);

    // Déterminer l'action en fonction de la méthode HTTP
    $method = $_SERVER['REQUEST_METHOD'];

    
    switch ($method) {
        case 'GET':

            // Récupérer toutes les publications
            $stmt = $publication->readAll();
            $publications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($publications) {
                $response["success"] = true;
                $response["message"] = "Publications récupérées avec succès";
                $response["data"] = $publications;
            } else {

                $response["success"] = true;
                $response["message"] = "Aucune publication trouvée";
                $response["data"] = array();
            }
            break;

        case 'POST':
            // Vérifier si c'est une action spéciale (toggle featured, etc.)
            $input = json_decode(file_get_contents('php://input'), true);

            $id = isset($input['id']) ? $input['id'] : "";
            
            if (isset($input['method']) && $input['method'] === 'patch') {
                // Action PATCH simulée (toggle featured)
                if (isset($input['id']) && isset($input['isFeatured'])) {
                    $publication->id = $input['id'];
                    $publication->est_vedette = $input['isFeatured'];
                    
                    if ($publication->toggleFeatured()) {
                        $response["success"] = true;
                        $response["message"] = "Statut vedette modifié avec succès";
                    } else {
                        throw new Exception("Erreur lors de la modification du statut vedette");
                    }
                }
            } else {
                // Créer une nouvelle publication
                $data = $input ? $input : $_POST;
                
                // Nettoyer et valider les données - vérifier null AVANT cleanInput
                $publication->titre = (isset($data['title']) && $data['title'] !== null) ? cleanInput($data['title']) : '';
                $publication->description = (isset($data['description']) && $data['description'] !== null) ? cleanInput($data['description']) : '';
                $publication->categorie = (isset($data['category']) && $data['category'] !== null) ? cleanInput($data['category']) : '';
                $publication->est_vedette = isset($data['isFeatured']) ? (bool)$data['isFeatured'] : false;

                // Validation des champs requis
                if (empty($publication->titre) || empty($publication->description) || empty($publication->categorie)) {
                    $response["message"] = "Tous les champs obligatoires doivent être remplis";
                    echo json_encode($response);
                    exit;
                }

                // Gestion de l'upload de fichier
                if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
                    $file = $_FILES['file'];

                    // Vérifier le type de fichier
                    $allowed_types = array('pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png');
                    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

                    if (!in_array($file_extension, $allowed_types)) {
                        $response["message"] = "Format de fichier non supporté. Utilisez PDF, DOC, DOCX, JPG, JPEG ou PNG.";
                        echo json_encode($response);
                        exit;
                    }

                    // Vérifier la taille (20 Mo max)
                    if ($file['size'] > 20 * 1024 * 1024) {
                        $response["message"] = "Le fichier ne doit pas dépasser 20 Mo.";
                        echo json_encode($response);
                        exit;
                    }

                    // Créer le dossier de stockage s'il n'existe pas
                    $upload_dir = "../uploads/publications/";
                    if (!is_dir($upload_dir)) {
                        if (!mkdir($upload_dir, 0755, true)) {
                            $response["message"] = "Impossible de créer le dossier de stockage des publications.";
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

                    // Générer un nom unique pour le fichier
                    $file_name = uniqid() . '_' . time() . '.' . $file_extension;
                    $file_path = $upload_dir . $file_name;

                    // Déplacer le fichier uploadé
                    if (move_uploaded_file($file['tmp_name'], $file_path)) {
                        $publication->nom_fichier = cleanInput($file_name);
                        $publication->chemin_fichier = cleanInput($file_path);
                        $publication->taille_fichier = round($file['size'] / 1024 / 1024, 2) . ' MB';
                        $publication->type_fichier = strtoupper($file_extension);
                    } else {
                        $error = error_get_last();
                        $response["message"] = "Erreur lors de l'upload du fichier: " . ($error['message'] ?? 'Erreur inconnue');
                        echo json_encode($response);
                        exit;
                    }
                } else {
                    // Si pas de fichier uploadé mais on a un fileName (modification)
                    if (isset($data['fileName']) && !empty($data['fileName'])) {
                        $publication->nom_fichier = cleanInput($data['fileName']);
                        $publication->chemin_fichier = isset($data['filePath']) ? cleanInput($data['filePath']) : '';
                        $publication->taille_fichier = isset($data['fileSize']) ? cleanInput($data['fileSize']) : '0 MB';
                        $publication->type_fichier = pathinfo($data['fileName'], PATHINFO_EXTENSION);
                    }
                }

                // Créer la publication
                if ($publication->create()) {
                    $response["success"] = true;
                    $response["message"] = "Publication créée avec succès";
                    $response["id"] = $db->lastInsertId();
                } else {
                    throw new Exception("Erreur lors de la création de la publication");
                }
            }
            break;

        case 'PUT':
            // Modifier une publication existante
            $input = json_decode(file_get_contents('php://input'), true);
            
            $publication->id = isset($input['id']) ? intval($input['id']) : 0;
            $publication->titre = (isset($input['title']) && $input['title'] !== null) ? cleanInput($input['title']) : '';
            $publication->description = (isset($input['description']) && $input['description'] !== null) ? cleanInput($input['description']) : '';
            $publication->categorie = (isset($input['category']) && $input['category'] !== null) ? cleanInput($input['category']) : '';
            $publication->est_vedette = isset($input['isFeatured']) ? (bool)$input['isFeatured'] : false;

            if ($publication->id <= 0) {
                $response["message"] = "ID publication invalide";
                echo json_encode($response);
                exit;
            }

            // Vérifier que la publication existe
            if (!$publication->readOne()) {
                $response["message"] = "Publication non trouvée";
                echo json_encode($response);
                exit;
            }

            // Mettre à jour les informations du fichier si fournies
            if (isset($input['fileName']) && !empty($input['fileName'])) {
                $publication->nom_fichier = cleanInput($input['fileName']);
                $publication->chemin_fichier = isset($input['filePath']) ? cleanInput($input['filePath']) : $publication->chemin_fichier;
                $publication->taille_fichier = isset($input['fileSize']) ? cleanInput($input['fileSize']) : $publication->taille_fichier;
                $publication->type_fichier = pathinfo($input['fileName'], PATHINFO_EXTENSION);
            }

            if ($publication->update()) {
                $response["success"] = true;
                $response["message"] = "Publication modifiée avec succès";
            } else {
                throw new Exception("Erreur lors de la modification de la publication");
            }
            break;

        case 'DELETE':
            // Supprimer une publication
            $input = json_decode(file_get_contents('php://input'), true);
            
            $publication->id = isset($input['id']) ? intval($input['id']) : 0;

            if ($publication->id <= 0) {
                $response["message"] = "ID publication invalide";
                echo json_encode($response);
                exit;
            }

            // Vérifier que la publication existe
            if (!$publication->readOne()) {
                $response["message"] = "Publication non trouvée";
                echo json_encode($response);
                exit;
            }

            if ($publication->delete()) {
                $response["success"] = true;
                $response["message"] = "Publication supprimée avec succès";
            } else {
                throw new Exception("Erreur lors de la suppression de la publication");
            }
            break;

        default:
            $response["message"] = "Méthode non autorisée";
            http_response_code(405);
            break;
    }

} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans publications.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);
?>