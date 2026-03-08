<?php

include_once './head.php';
include_once './database.php';
include_once './Enseignant.php';

// Réponse JSON
$response = array("success" => false, "message" => "", "token" => "", "enseignant" => null);

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
        
        // Récupérer les données JSON
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->email) || !isset($data->password)) {
            $response["message"] = "Email et mot de passe requis.";
            echo json_encode($response);
            exit;
        }

        $email = trim($data->email);
        $password = $data->password;

        // Validation des champs
        if (empty($email) || empty($password)) {
            $response["message"] = "Veuillez remplir tous les champs.";
            echo json_encode($response);
            exit;
        }

        // Vérifier l'email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response["message"] = "Adresse email invalide.";
            echo json_encode($response);
            exit;
        }

        // Tenter la connexion
        if ($enseignant->login($email, $password)) {
            
            // Générer un token simple (vous pouvez utiliser JWT pour plus de sécurité)
            $token = bin2hex(random_bytes(32));
            
            $response["success"] = true;
            $response["message"] = "Connexion réussie.";
            $response["token"] = $token;
            $response["enseignant"] = array(
                "id" => $enseignant->id,
                "nom" => $enseignant->nom,
                "prenoms" => $enseignant->prenoms,
                "email" => $enseignant->email,
                "filiere_enseignee" => $enseignant->filiere_enseignee,
                "statut" => $enseignant->statut
            );
            
            error_log("Connexion réussie pour l'enseignant: " . $email);
            
        } else {
            $response["message"] = "Email ou mot de passe incorrect, ou compte non approuvé.";
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans login_enseignant.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);
?>