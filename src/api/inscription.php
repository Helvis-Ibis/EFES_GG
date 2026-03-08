<?php
include_once './head.php';

// Inclure les fichiers de configuration et modèle
include_once './database.php';
include_once './Etudiant.php';

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

    // Initialiser l'étudiant
    $etudiant = new Etudiant($db);

    // Vérifier si c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {

        // Journalisation pour le débogage
        error_log("Début du traitement POST");
        error_log("Données POST reçues: " . print_r($_POST, true));
        error_log("Fichiers reçus: " . print_r($_FILES, true));

        // Récupérer les données du formulaire avec des valeurs par défaut sécurisées
        $etudiant->nom = isset($_POST['nom']) ? trim($_POST['nom']) : '';
        $etudiant->prenoms = isset($_POST['prenoms']) ? trim($_POST['prenoms']) : '';
        $etudiant->date_naissance = isset($_POST['dateNaissance']) ? trim($_POST['dateNaissance']) : '';
        $etudiant->lieu_naissance = isset($_POST['lieuNaissance']) ? trim($_POST['lieuNaissance']) : '';
        $etudiant->sexe = isset($_POST['sexe']) ? trim($_POST['sexe']) : '';
        $etudiant->nationalite = isset($_POST['nationalite']) ? trim($_POST['nationalite']) : '';
        $etudiant->situation_matrimoniale = isset($_POST['matrimoniale']) ? trim($_POST['matrimoniale']) : 'Célibataire';
        $etudiant->adresse_complete = isset($_POST['adresseComplete']) ? trim($_POST['adresseComplete']) : '';
        $etudiant->telephone = isset($_POST['telephone']) ? trim($_POST['telephone']) : '';
        $etudiant->email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $etudiant->diplome_acces = isset($_POST['diplomeAcces']) ? trim($_POST['diplomeAcces']) : 'BAC';
        $etudiant->serie_option = isset($_POST['serieOption']) ? trim($_POST['serieOption']) : '';
        $etudiant->annee_obtention = isset($_POST['anneeObtention']) ? trim($_POST['anneeObtention']) : '';
        $etudiant->mention_obtenue = isset($_POST['mentionObtenue']) ? trim($_POST['mentionObtenue']) : '';
        $etudiant->etablissement_origine = isset($_POST['etablissementOrigine']) ? trim($_POST['etablissementOrigine']) : '';
        $etudiant->filiere_choisie = isset($_POST['filiereChoisie']) ? trim($_POST['filiereChoisie']) : '';
        $etudiant->tuteur_nom_prenoms = isset($_POST['tuteurNomPrenoms']) ? trim($_POST['tuteurNomPrenoms']) : '';
        $etudiant->tuteur_lien_parente = isset($_POST['tuteurLienParente']) ? trim($_POST['tuteurLienParente']) : '';
        $etudiant->tuteur_profession = isset($_POST['tuteurProfession']) ? trim($_POST['tuteurProfession']) : '';
        $etudiant->tuteur_telephone = isset($_POST['tuteurTelephone']) ? trim($_POST['tuteurTelephone']) : '';
        $etudiant->tuteur_email = isset($_POST['tuteurEmail']) ? trim($_POST['tuteurEmail']) : '';
        $etudiant->accepte_engagement = isset($_POST['accepteEngagement']) ? 1 : 0;

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
            'serie_option' => 'Série/Option',
            'annee_obtention' => 'Année d\'obtention',
            'etablissement_origine' => 'Établissement d\'origine',
            'filiere_choisie' => 'Filière choisie',
            'tuteur_nom_prenoms' => 'Nom du tuteur',
            'tuteur_lien_parente' => 'Lien de parenté',
            'tuteur_profession' => 'Profession du tuteur',
            'tuteur_telephone' => 'Téléphone du tuteur'
        );

        $missing_fields = array();
        foreach ($required_fields as $field => $label) {
            if (empty($etudiant->$field)) {
                $missing_fields[] = $label;
            }
        }

        if (!empty($missing_fields)) {
            $response["message"] = "Champs obligatoires manquants: " . implode(", ", $missing_fields);
            echo json_encode($response);
            exit;
        }

        // Vérifier l'email
        if (!filter_var($etudiant->email, FILTER_VALIDATE_EMAIL)) {
            $response["message"] = "Adresse email invalide.";
            echo json_encode($response);
            exit;
        }

        // Vérifier si l'email existe déjà
        if ($etudiant->emailExists()) {
            $response["message"] = "Un étudiant avec cet email existe déjà.";
            echo json_encode($response);
            exit;
        }

        // Vérifier si le téléphone existe déjà
        if ($etudiant->telephoneExists()) {
            $response["message"] = "Un étudiant avec ce numéro de téléphone existe déjà.";
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
            $upload_dir = "../uploads/photos/";
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
                $etudiant->photo_nom = $photo_name;
                error_log("Photo uploadée avec succès: " . $photo_path);
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
        if (!$etudiant->accepte_engagement) {
            $response["message"] = "Veuillez accepter l'engagement.";
            echo json_encode($response);
            exit;
        }

        // Créer l'étudiant dans la base de données
        if ($etudiant->create()) {
            $response["success"] = true;
            $response["message"] = "Inscription effectuée avec succès ! Veuillez-vous rapprocher de l'administration pour la validation de votre inscription.";
            $response["id"] = $db->lastInsertId();
            error_log("Étudiant créé avec succès, ID: " . $response["id"]);
        } else {
            $response["message"] = "Erreur lors de l'inscription dans la base de données. Veuillez réessayer.";
            error_log("Erreur lors de la création de l'étudiant");
        }
    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans inscription_etudiant.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);

// Journalisation finale
error_log("Réponse envoyée: " . json_encode($response));
