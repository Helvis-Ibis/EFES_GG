<?php
include_once './head.php';
include_once './database.php';
include_once './config.php';
header('Content-Type: application/json; charset=utf-8');

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

        $login = $input['login'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($login) || empty($password)) {
            $response["message"] = "Login et mot de passe requis.";
            echo json_encode($response);
            exit;
        }

        // Rechercher le secrétaire
        $query = "SELECT * FROM secretaires WHERE login = ? AND statut = 'actif'";
        $stmt = $db->prepare($query);
        $stmt->execute([$login]);
        
        if ($stmt->rowCount() == 1) {
            $secretaire = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Vérifier le mot de passe
            if (verifyPassword($password, $secretaire['mot_de_passe'])) {
                // Générer une session
                $session_token = generateSessionToken();
                $expires_at = date('Y-m-d H:i:s', time() + SESSION_DURATION);
                
                // Créer la session
                $query_session = "INSERT INTO sessions_utilisateurs (id, utilisateur_id, type_utilisateur, ip_address, user_agent, expires_at) 
                                 VALUES (?, ?, 'secretaire', ?, ?, ?)";
                $stmt_session = $db->prepare($query_session);
                $stmt_session->execute([$session_token, $secretaire['id'], $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $expires_at]);
                
                // Mettre à jour la date de dernière connexion
                $query_update = "UPDATE secretaires SET date_derniere_connexion = NOW() WHERE id = ?";
                $stmt_update = $db->prepare($query_update);
                $stmt_update->execute([$secretaire['id']]);
                
                // Logger la connexion
                loggerActivite($secretaire['id'], 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie');
                
                $response["success"] = true;
                $response["message"] = "Connexion réussie !";
                $response["user"] = array(
                    "id" => $secretaire['id'],
                    "nom" => $secretaire['nom'],
                    "prenom" => $secretaire['prenom'],
                    "email" => $secretaire['email'],
                    "role" => "secretaire",
                    "departement" => $secretaire['departement'],
                    "permissions" => json_decode($secretaire['permissions'] ?? '[]', true),
                    "session_token" => $session_token
                );
            } else {
                $response["message"] = "Login ou mot de passe incorrect.";
            }
        } else {
            $response["message"] = "Login ou mot de passe incorrect.";
        }
    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans login_secretaire.php: " . $e->getMessage());
    http_response_code(500);
}

echo json_encode($response);
?>