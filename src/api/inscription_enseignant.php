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
        error_log("Début du traitement POST - Enseignant");
        error_log("Données POST reçues: " . print_r($_POST, true));
        error_log("Fichiers reçus: " . print_r($_FILES, true));

        // Récupérer les données du formulaire avec des valeurs par défaut sécurisées
        $enseignant->nom = isset($_POST['nom']) ? trim($_POST['nom']) : '';
        $enseignant->prenoms = isset($_POST['prenoms']) ? trim($_POST['prenoms']) : '';
        $enseignant->date_naissance = isset($_POST['dateNaissance']) ? trim($_POST['dateNaissance']) : '';
        $enseignant->lieu_naissance = isset($_POST['lieuNaissance']) ? trim($_POST['lieuNaissance']) : '';
        $enseignant->sexe = isset($_POST['sexe']) ? trim($_POST['sexe']) : '';
        $enseignant->nationalite = isset($_POST['nationalite']) ? trim($_POST['nationalite']) : '';
        $enseignant->situation_matrimoniale = isset($_POST['matrimoniale']) ? trim($_POST['matrimoniale']) : 'Célibataire';
        $enseignant->matrimoniale_autre = isset($_POST['matrimonialeAutre']) ? trim($_POST['matrimonialeAutre']) : '';
        $enseignant->adresse_complete = isset($_POST['adresseComplete']) ? trim($_POST['adresseComplete']) : '';
        $enseignant->telephone = isset($_POST['telephone']) ? trim($_POST['telephone']) : '';
        $enseignant->email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        $confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';
        $enseignant->diplome = isset($_POST['diplome']) ? trim($_POST['diplome']) : '';
        $enseignant->specialite = isset($_POST['specialite']) ? trim($_POST['specialite']) : '';
        $enseignant->annee_experience = isset($_POST['anneeExperience']) ? intval($_POST['anneeExperience']) : 0;
        $enseignant->etablissement_precedent = isset($_POST['etablissementPrecedent']) ? trim($_POST['etablissementPrecedent']) : '';
        $enseignant->filiere_enseignee = isset($_POST['filiereEnseignee']) ? trim($_POST['filiereEnseignee']) : '';
        $enseignant->cours_enseignes = isset($_POST['coursEnseignes']) ? trim($_POST['coursEnseignes']) : '';
        $enseignant->accepte_engagement = isset($_POST['accepteEngagement']) ? 1 : 0;

        // Validation des champs requis
        $required_fields = array(
            'nom' => 'Nom',
            'prenoms' => 'Prénoms',
            'date_naissance' => 'Date de naissance',
            'lieu_naissance' => 'Lieu de naissance',
            'sexe' => 'Sexe',
            'nationalite' => 'Nationalité',
            'adresse_complete' => 'Adresse complète',
            'telephone' => 'Téléphone',
            'email' => 'Email',
            'password' => 'Mot de passe',
            'confirmPassword' => 'Confirmation du mot de passe',
            'diplome' => 'Diplôme',
            'specialite' => 'Spécialité',
            'annee_experience' => 'Années d\'expérience',
            'filiere_enseignee' => 'Filière à enseigner'
        );

        $missing_fields = array();
        foreach ($required_fields as $field => $label) {
            if ($field === 'password' || $field === 'confirmPassword') {
                if (empty($field)) {
                    $missing_fields[] = $label;
                }
            } else {
                if (empty($enseignant->$field)) {
                    $missing_fields[] = $label;
                }
            }
        }

        if (!empty($missing_fields)) {
            $response["message"] = "Champs obligatoires manquants: " . implode(", ", $missing_fields);
            echo json_encode($response);
            exit;
        }

        // Vérifier l'email
        if (!filter_var($enseignant->email, FILTER_VALIDATE_EMAIL)) {
            $response["message"] = "Adresse email invalide.";
            echo json_encode($response);
            exit;
        }

        // Validation du mot de passe
        if (strlen($password) < 8) {
            $response["message"] = "Le mot de passe doit contenir au moins 8 caractères.";
            echo json_encode($response);
            exit;
        }

        if (!preg_match('/[a-z]/', $password)) {
            $response["message"] = "Le mot de passe doit contenir au moins une lettre minuscule.";
            echo json_encode($response);
            exit;
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $response["message"] = "Le mot de passe doit contenir au moins une lettre majuscule.";
            echo json_encode($response);
            exit;
        }

        if (!preg_match('/[0-9]/', $password)) {
            $response["message"] = "Le mot de passe doit contenir au moins un chiffre.";
            echo json_encode($response);
            exit;
        }

        if (!preg_match('/[@$!%*?&]/', $password)) {
            $response["message"] = "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&).";
            echo json_encode($response);
            exit;
        }

        //var_dump($_POST);

        // Vérifier que les mots de passe correspondent
      /*  if ($password !== $confirmPassword) {
            $response["message"] = "Les mots de passe ne correspondent pas.";
            echo json_encode($response);
            exit;
        }
*/
        // Hasher le mot de passe
        $enseignant->password_hash = password_hash($password, PASSWORD_DEFAULT);

        // Vérifier si l'email existe déjà
        if ($enseignant->emailExists()) {
            $response["message"] = "Un enseignant avec cet email existe déjà.";
            echo json_encode($response);
            exit;
        }

        // Vérifier si le téléphone existe déjà
        if ($enseignant->telephoneExists()) {
            $response["message"] = "Un enseignant avec ce numéro de téléphone existe déjà.";
            echo json_encode($response);
            exit;
        }

        // Gestion de l'upload de la photo
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
            $photo = $_FILES['photo'];

            // Vérifier le type de fichier
            $allowed_types = array('jpg', 'jpeg', 'png');
            $file_extension = strtolower(pathinfo($photo['name'], PATHINFO_EXTENSION));

            if (!in_array($file_extension, $allowed_types)) {
                $response["message"] = "Format de photo non supporté. Utilisez JPG, JPEG ou PNG.";
                echo json_encode($response);
                exit;
            }

            // Vérifier la taille (5 Mo max)
            if ($photo['size'] > 5 * 1024 * 1024) {
                $response["message"] = "La photo ne doit pas dépasser 5 Mo.";
                echo json_encode($response);
                exit;
            }

            // Créer le dossier de stockage s'il n'existe pas
            $upload_dir = "../uploads/photos_enseignants/";
            if (!is_dir($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    $response["message"] = "Impossible de créer le dossier de stockage des photos.";
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

            // Générer un nom unique pour la photo
            $photo_name = uniqid() . '_' . time() . '.' . $file_extension;
            $photo_path = $upload_dir . $photo_name;

            // Déplacer le fichier uploadé
            if (move_uploaded_file($photo['tmp_name'], $photo_path)) {
                $enseignant->photo_nom = $photo_name;
                error_log("Photo enseignant uploadée avec succès: " . $photo_path);
            } else {
                $error = error_get_last();
                $response["message"] = "Erreur lors de l'upload de la photo: " . ($error['message'] ?? 'Erreur inconnue');
                echo json_encode($response);
                exit;
            }
        } else {
            $upload_error = "Aucun fichier reçu";
            if (isset($_FILES['photo'])) {
                switch ($_FILES['photo']['error']) {
                    case UPLOAD_ERR_INI_SIZE:
                        $upload_error = "Fichier trop volumineux (configuration serveur)";
                        break;
                    case UPLOAD_ERR_FORM_SIZE:
                        $upload_error = "Fichier trop volumineux (formulaire)";
                        break;
                    case UPLOAD_ERR_PARTIAL:
                        $upload_error = "Upload partiel";
                        break;
                    case UPLOAD_ERR_NO_FILE:
                        $upload_error = "Aucun fichier sélectionné";
                        break;
                    case UPLOAD_ERR_NO_TMP_DIR:
                        $upload_error = "Dossier temporaire manquant";
                        break;
                    case UPLOAD_ERR_CANT_WRITE:
                        $upload_error = "Erreur d'écriture sur le disque";
                        break;
                    case UPLOAD_ERR_EXTENSION:
                        $upload_error = "Extension PHP a arrêté l'upload";
                        break;
                    default:
                        $upload_error = "Erreur inconnue: " . $_FILES['photo']['error'];
                        break;
                }
            }
            $response["message"] = "Veuillez importer une photo d'identité. Erreur: " . $upload_error;
            echo json_encode($response);
            exit;
        }

        // Vérifier l'engagement
        if (!$enseignant->accepte_engagement) {
            $response["message"] = "Veuillez accepter l'engagement.";
            echo json_encode($response);
            exit;
        }

        // Créer l'enseignant dans la base de données
        if ($enseignant->create()) {
            $response["success"] = true;
            $response["message"] = "Candidature envoyée avec succès ! Votre dossier sera examiné et vous serez contacté pour la suite du processus.";
            $response["id"] = $db->lastInsertId();
            error_log("Enseignant créé avec succès, ID: " . $response["id"]);
        } else {
            $response["message"] = "Erreur lors de l'enregistrement de la candidature. Veuillez réessayer.";
            error_log("Erreur lors de la création de l'enseignant");
        }
    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans inscription_enseignant.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);

// Journalisation finale
error_log("Réponse envoyée: " . json_encode($response));
?>