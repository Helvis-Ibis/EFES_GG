<?php
include './head.php';


include_once './database.php';
include_once './Etudiant.php';

$database = new Database();
$db = $database->getConnection();
$etudiant = new Etudiant($db);

$response = array("success" => false, "message" => "");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $etudiant->id = $data->etudiant_id ?? '';
    $raison_refus = $data->raison_refus ?? '';

    if (empty($etudiant->id) || empty($raison_refus)) {
        $response["message"] = "Données manquantes.";
        echo json_encode($response);
        exit;
    }

    if ($etudiant->rejeterInscription($raison_refus)) {
        $response["success"] = true;
        $response["message"] = "Inscription rejetée avec succès.";
    } else {
        $response["message"] = "Erreur lors du rejet de l'inscription.";
    }
} else {
    $response["message"] = "Méthode non autorisée.";
}

echo json_encode($response);
