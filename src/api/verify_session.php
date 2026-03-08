<?php
include './head.php';

include_once './database.php';
include_once './config.php';

$response = array("success" => false, "message" => "", "user" => null);

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            $response["message"] = "Données JSON invalides.";
            echo json_encode($response);
            exit;
        }

        $session_token = $input['session_token'] ?? '';

        if (empty($session_token)) {
            $response["message"] = "Token de session requis.";
            echo json_encode($response);
            exit;
        }

        // Vérifier la session
        $query = "SELECT s.*, 
                         CASE s.type_utilisateur 
                             WHEN 'admin' THEN (SELECT CONCAT(nom, ' ', prenom) FROM administrateurs WHERE id = s.utilisateur_id)
                             WHEN 'secretaire' THEN (SELECT CONCAT(nom, ' ', prenom) FROM secretaires WHERE id = s.utilisateur_id)
                             WHEN 'chef_filiere' THEN (SELECT CONCAT(nom, ' ', prenom) FROM chefs_filiere WHERE id = s.utilisateur_id)
                             WHEN 'doyen' THEN (SELECT CONCAT(nom, ' ', prenom) FROM doyens_directeurs WHERE id = s.utilisateur_id)
                         END as nom_complet
                  FROM sessions_utilisateurs s 
                  WHERE s.id = ? AND s.expires_at > NOW()";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$session_token]);
        
        if ($stmt->rowCount() == 1) {
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Mettre à jour la date de dernière activité
            $query_update = "UPDATE sessions_utilisateurs SET date_derniere_activite = NOW() WHERE id = ?";
            $stmt_update = $db->prepare($query_update);
            $stmt_update->execute([$session_token]);
            
            $response["success"] = true;
            $response["message"] = "Session valide";
            $response["user"] = array(
                "session_token" => $session_token,
                "type_utilisateur" => $session['type_utilisateur'],
                "nom_complet" => $session['nom_complet']
            );
        } else {
            $response["message"] = "Session invalide ou expirée.";
        }
    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans verify_session.php: " . $e->getMessage());
    http_response_code(500);
}

echo json_encode($response);
?>