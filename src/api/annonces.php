<?php

include_once './head.php';

// Inclure les fichiers de configuration et modèle
include_once './database.php';
include_once './annonce.php';

// Réponse JSON
$response = array("success" => false, "message" => "", "data" => array());

try {
    // Initialiser la base de données
    $database = new Database();
    $db = $database->getConnection();

    // Vérifier la connexion à la base de données
    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    // Initialiser l'annonce
    $annonce = new Annonce($db);
    // Déterminer l'action en fonction de la méthode HTTP
    $method = $_SERVER['REQUEST_METHOD'];


    switch ($method) {
        case 'GET':
            // Récupérer toutes les annonces
            $stmt = $annonce->readAll();
            $annonces = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($annonces) {
                $response["success"] = true;
                $response["message"] = "Annonces récupérées avec succès";
                $response["data"] = $annonces;
            } else {
                $response["success"] = true;
                $response["message"] = "Aucune annonce trouvée";
                $response["data"] = array();
            }
            break;

        case 'POST':
            // Créer une nouvelle annonce
            
            // Validation des champs requis
            if (!isset($_POST['title']) || empty($_POST['title'])) {
                $response["message"] = "Le titre est obligatoire";
                echo json_encode($response);
                exit;
            }

            // Vérifier qu'il y a au moins une image
            if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
                $response["message"] = "Au moins une image est obligatoire";
                echo json_encode($response);
                exit;
            }

            $annonce->titre = trim($_POST['title']);
            $annonce->description = isset($_POST['description']) ? trim($_POST['description']) : '';

            // Gestion de l'upload multiple d'images
            $uploaded_images = array();
            $upload_dir = "../uploads/annonces/";
            
            // Créer le dossier s'il n'existe pas
            if (!is_dir($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    $response["message"] = "Impossible de créer le dossier de stockage des annonces.";
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

            // Traiter chaque image uploadée
            $allowed_types = array('jpg', 'jpeg', 'png', 'gif', 'webp');
            $total_files = count($_FILES['images']['name']);
            
            for ($i = 0; $i < $total_files; $i++) {
                if ($_FILES['images']['error'][$i] == 0) {
                    $file_extension = strtolower(pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION));
                    
                    // Vérifier le type de fichier
                    if (!in_array($file_extension, $allowed_types)) {
                        $response["message"] = "Format de fichier non supporté. Utilisez JPG, JPEG, PNG, GIF ou WEBP.";
                        echo json_encode($response);
                        exit;
                    }

                    // Vérifier la taille (5 Mo max par image)
                    if ($_FILES['images']['size'][$i] > 5 * 1024 * 1024) {
                        $response["message"] = "Chaque image ne doit pas dépasser 5 Mo.";
                        echo json_encode($response);
                        exit;
                    }

                    // Générer un nom unique pour le fichier
                    $file_name = uniqid() . '_' . time() . '_' . $i . '.' . $file_extension;
                    $file_path = $upload_dir . $file_name;

                    // Déplacer le fichier uploadé
                    if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $file_path)) {
                        $uploaded_images[] = array(
                            'nom_fichier' => $file_name,
                            'chemin' => $file_path,
                            'url' => str_replace('../', '', $file_path) // Pour l'affichage frontend
                        );
                    } else {
                        $error = error_get_last();
                        $response["message"] = "Erreur lors de l'upload de l'image " . ($i + 1) . ": " . ($error['message'] ?? 'Erreur inconnue');
                        echo json_encode($response);
                        exit;
                    }
                }
            }

            // Vérifier qu'au moins une image a été uploadée
            if (empty($uploaded_images)) {
                $response["message"] = "Aucune image n'a pu être uploadée";
                echo json_encode($response);
                exit;
            }

            // Stocker les images en JSON
            $annonce->images = json_encode($uploaded_images);
            $annonce->nombre_images = count($uploaded_images);

            // Créer l'annonce
            if ($annonce->create()) {
                $response["success"] = true;
                $response["message"] = "Annonce créée avec succès";
                $response["id"] = $db->lastInsertId();
                $response["data"] = array(
                    'images' => $uploaded_images,
                    'nombre_images' => count($uploaded_images)
                );
            } else {
                throw new Exception("Erreur lors de la création de l'annonce");
            }
            break;

        case 'PUT':
            // Modifier une annonce existante
           
            
            // Vérifier si c'est un upload de fichier ou du JSON
            if (isset($_POST['id'])) {
                // Modification avec upload de nouvelles images
                $annonce->id = intval($_POST['id']);
                
                if ($annonce->id <= 0) {
                    $response["message"] = "ID annonce invalide";
                    echo json_encode($response);
                    exit;
                }

                // Vérifier que l'annonce existe
                if (!$annonce->readOne()) {
                    $response["message"] = "Annonce non trouvée";
                    echo json_encode($response);
                    exit;
                }

                $annonce->titre = isset($_POST['title']) ? trim($_POST['title']) : $annonce->titre;
                $annonce->description = isset($_POST['description']) ? trim($_POST['description']) : $annonce->description;

                // Gestion de l'upload des nouvelles images
                if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
                    // Supprimer les anciennes images du serveur
                    $old_images = json_decode($annonce->images, true);
                    if ($old_images && is_array($old_images)) {
                        foreach ($old_images as $old_img) {
                            if (isset($old_img['chemin']) && file_exists($old_img['chemin'])) {
                                unlink($old_img['chemin']);
                            }
                        }
                    }

                    // Upload des nouvelles images
                    $uploaded_images = array();
                    $upload_dir = "../uploads/annonces/";
                    
                    $allowed_types = array('jpg', 'jpeg', 'png', 'gif', 'webp');
                    $total_files = count($_FILES['images']['name']);
                    
                    for ($i = 0; $i < $total_files; $i++) {
                        if ($_FILES['images']['error'][$i] == 0) {
                            $file_extension = strtolower(pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION));
                            
                            if (!in_array($file_extension, $allowed_types)) {
                                $response["message"] = "Format de fichier non supporté. Utilisez JPG, JPEG, PNG, GIF ou WEBP.";
                                echo json_encode($response);
                                exit;
                            }

                            if ($_FILES['images']['size'][$i] > 5 * 1024 * 1024) {
                                $response["message"] = "Chaque image ne doit pas dépasser 5 Mo.";
                                echo json_encode($response);
                                exit;
                            }

                            $file_name = uniqid() . '_' . time() . '_' . $i . '.' . $file_extension;
                            $file_path = $upload_dir . $file_name;

                            if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $file_path)) {
                                $uploaded_images[] = array(
                                    'nom_fichier' => $file_name,
                                    'chemin' => $file_path,
                                    'url' => str_replace('../', '', $file_path)
                                );
                            }
                        }
                    }

                    if (!empty($uploaded_images)) {
                        $annonce->images = json_encode($uploaded_images);
                        $annonce->nombre_images = count($uploaded_images);
                    }
                }

                if ($annonce->update()) {
                    $response["success"] = true;
                    $response["message"] = "Annonce modifiée avec succès";
                } else {
                    throw new Exception("Erreur lors de la modification de l'annonce");
                }
            } else {
                // Modification simple sans nouvelles images (JSON)
                $input = json_decode(file_get_contents('php://input'), true);
                
                $annonce->id = isset($input['id']) ? intval($input['id']) : 0;
                
                if ($annonce->id <= 0) {
                    $response["message"] = "ID annonce invalide";
                    echo json_encode($response);
                    exit;
                }

                // Vérifier que l'annonce existe
                if (!$annonce->readOne()) {
                    $response["message"] = "Annonce non trouvée";
                    echo json_encode($response);
                    exit;
                }

                // Mettre à jour seulement le titre et la description
                $annonce->titre = isset($input['title']) && $input['title'] !== null ? trim($input['title']) : $annonce->titre;
                $annonce->description = isset($input['description']) && $input['description'] !== null ? trim($input['description']) : $annonce->description;
                
                // Conserver les images existantes si fournies
                if (isset($input['images']) && !empty($input['images'])) {
                    $annonce->images = json_encode($input['images']);
                    $annonce->nombre_images = count($input['images']);
                }

                if ($annonce->update()) {
                    $response["success"] = true;
                    $response["message"] = "Annonce modifiée avec succès";
                } else {
                    throw new Exception("Erreur lors de la modification de l'annonce");
                }
            }
            break;

        case 'DELETE':
            // Supprimer une annonce
            $input = json_decode(file_get_contents('php://input'), true);
            
            $annonce->id = isset($input['id']) ? intval($input['id']) : 0;

            if ($annonce->id <= 0) {
                $response["message"] = "ID annonce invalide";
                echo json_encode($response);
                exit;
            }

            // Vérifier que l'annonce existe
            if (!$annonce->readOne()) {
                $response["message"] = "Annonce non trouvée";
                echo json_encode($response);
                exit;
            }

            // Supprimer les fichiers images associés
            $images = json_decode($annonce->images, true);
            if ($images && is_array($images)) {
                foreach ($images as $image) {
                    if (isset($image['chemin']) && file_exists($image['chemin'])) {
                        unlink($image['chemin']);
                    }
                }
            }

            if ($annonce->delete()) {
                $response["success"] = true;
                $response["message"] = "Annonce supprimée avec succès";
            } else {
                throw new Exception("Erreur lors de la suppression de l'annonce");
            }
            break;

        default:
            $response["message"] = "Méthode non autorisée";
            http_response_code(405);
            break;
    }

} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans annonces.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);
?>