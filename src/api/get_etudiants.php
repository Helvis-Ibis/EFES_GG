<?php
// AUCUN espace ou texte avant ce <?php !!

include_once './head.php';

try {
    include_once './database.php';
    include_once './Etudiant.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Erreur de connexion à la base de données");
    }

    $etudiant = new Etudiant($db);
    $stmt = $etudiant->readAll();

    if (!$stmt) {
        throw new Exception("Erreur lors de la récupération des étudiants");
    }

    $num = $stmt->rowCount();
    $etudiants_arr = ["success" => true, "data" => []];

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $etudiants_arr["data"][] = $row;
        }
    } else {
        $etudiants_arr["message"] = "Aucun étudiant trouvé.";
    }

    http_response_code(200);
    echo json_encode($etudiants_arr, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
