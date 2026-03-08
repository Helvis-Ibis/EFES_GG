<?php
// config.php - Configuration commune
include './head.php';

// Constantes de configuration
define('SESSION_DURATION', 24 * 60 * 60); // 24 heures en secondes

// Fonction pour hasher les mots de passe
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Fonction pour vérifier les mots de passe
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Fonction pour générer un token de session
function generateSessionToken() {
    return bin2hex(random_bytes(64));
}

// Fonction pour logger les activités
function loggerActivite($utilisateur_id, $type_utilisateur, $action, $description = '', $table_affectee = null, $id_affecte = null) {
    global $db;
    
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    $query = "INSERT INTO logs_activite (utilisateur_id, type_utilisateur, action, description, table_affectee, id_affecte, ip_address, user_agent) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$utilisateur_id, $type_utilisateur, $action, $description, $table_affectee, $id_affecte, $ip_address, $user_agent]);
}
?>