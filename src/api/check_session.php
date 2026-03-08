<?php

include './head.php';

session_start();

// Vérifier si l'utilisateur est connecté en tant que chef de filière
if (isset($_SESSION['role']) && $_SESSION['role'] === 'chef_filiere') {
    echo json_encode(array(
        "success" => true,
        "message" => "Session valide",
        "data" => array(
            "id" => $_SESSION['chef_filiere_id'],
            "nom" => $_SESSION['chef_filiere_nom'],
            "prenom" => $_SESSION['chef_filiere_prenom'],
            "login" => $_SESSION['chef_filiere_login'],
            "filiere" => $_SESSION['filiere'],
            "grade" => $_SESSION['grade'],
            "specialite" => $_SESSION['specialite'],
            "role" => $_SESSION['role']
        )
    ));
} else {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Session invalide ou expirée"
    ));
}
?>