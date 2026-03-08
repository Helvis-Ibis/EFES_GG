<?php
include_once './head.php';

// Inclure les fichiers de configuration et modèle
include_once './database.php';
include_once './Enseignant.php';

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

    // Initialiser l'enseignant
    $enseignant = new Enseignant($db);

    // Vérifier si c'est une requête GET
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {

        // Vérifier si un ID est fourni dans les paramètres GET
        if (isset($_GET['id'])) {
            $enseignant_id = $_GET['id'];
            
            // Journalisation pour le débogage
            error_log("Récupération de l'enseignant avec ID: " . $enseignant_id);

            // Requête pour récupérer un enseignant spécifique par ID
            $query = "SELECT * FROM enseignants WHERE id = ?";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute([$enseignant_id])) {
                $enseignant = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($enseignant) {
                    $response["success"] = true;
                    $response["message"] = "Enseignant récupéré avec succès";
                    $response["data"] = $enseignant;
                    error_log("Enseignant trouvé: " . $enseignant['nom'] . " " . $enseignant['prenoms']);
                } else {
                    $response["success"] = false;
                    $response["message"] = "Aucun enseignant trouvé avec cet ID";
                    error_log("Aucun enseignant trouvé avec ID: " . $enseignant_id);
                }
            } else {
                throw new Exception("Erreur lors de l'exécution de la requête pour récupérer l'enseignant");
            }

        } else {
            // Si aucun ID n'est fourni, récupérer tous les enseignants (comportement original)
            error_log("Début du traitement GET pour tous les enseignants");

            // Requête pour récupérer tous les enseignants
            $query = "SELECT * FROM enseignants ORDER BY date_creation DESC";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute()) {
                $enseignants = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if ($enseignants) {
                    $response["success"] = true;
                    $response["message"] = "Enseignants récupérés avec succès";
                    $response["data"] = $enseignants;
                    error_log("Enseignants récupérés: " . count($enseignants) . " enregistrements");
                } else {
                    $response["success"] = true;
                    $response["message"] = "Aucun enseignant trouvé";
                    $response["data"] = array();
                    error_log("Aucun enseignant trouvé dans la base de données");
                }
            } else {
                throw new Exception("Erreur lors de l'exécution de la requête pour tous les enseignants");
            }
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez GET.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans get_enseignants.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);

// Journalisation finale
error_log("Réponse envoyée get_enseignants: " . json_encode($response));
?>