<?php
include_once './head.php';
include_once './database.php';

// Réponse JSON
$response = array("success" => false, "message" => "", "etudiant" => null);

try {
    // Initialiser la base de données
    $database = new Database();
    $db = $database->getConnection();

    // Vérifier la connexion à la base de données
    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    // Vérifier si c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {

        // Récupérer les données JSON
        $input = json_decode(file_get_contents('php://input'), true);
        
        $matricule = isset($input['matricule']) ? trim($input['matricule']) : '';

        if (empty($matricule)) {
            $response["message"] = "Le numéro matricule est requis";
            echo json_encode($response);
            exit;
        }

        // Vérifier si l'étudiant existe et est validé
        $query = "SELECT id, nom, prenoms, numero_matricule, filiere_choisie, statut 
                  FROM etudiants 
                  WHERE numero_matricule = ? AND statut = 'validee'";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$matricule]);
        
        $etudiant = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($etudiant) {
            $response["success"] = true;
            $response["message"] = "Authentification réussie";
            $response["etudiant"] = array(
                'id' => $etudiant['id'],
                'nom' => $etudiant['nom'],
                'prenom' => $etudiant['prenoms'],
                'matricule' => $etudiant['numero_matricule'],
                'filiere' => $etudiant['filiere_choisie']
            );
        } else {
            $response["message"] = "Matricule non trouvé ou étudiant non validé";
        }

    } else {
        $response["message"] = "Méthode non autorisée. Utilisez POST.";
        http_response_code(405);
    }
} catch (Exception $e) {
    $response["message"] = "Erreur serveur: " . $e->getMessage();
    error_log("Erreur dans verify_matricule.php: " . $e->getMessage());
    http_response_code(500);
}

// S'assurer que la réponse est bien en JSON
header('Content-Type: application/json');
echo json_encode($response);
?>