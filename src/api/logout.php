<?php
include './head.php';


session_start();

// Détruire la session
session_unset();
session_destroy();

echo json_encode(array(
    "success" => true,
    "message" => "Déconnexion réussie"
));
?>