<?php
require_once './database.php';
include './head.php';
require_once '../PHPMailer/src/PHPMailer.php';
require_once '../PHPMailer/src/SMTP.php';
require_once '../PHPMailer/src/Exception.php';

header('Content-Type: application/json');
date_default_timezone_set("Africa/Lagos");

// Fonction pour générer un token sécurisé
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Fonction pour hacher le mot de passe
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupération des données
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // ACTION: Demande de réinitialisation (envoi du code)
    if ($action === 'request_reset') {
        if (!isset($input['email'])) {
            echo json_encode(['success' => false, 'message' => 'Email manquant']);
            exit;
        }

        $email = trim($input['email']);

        // Validation de l'email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Email invalide']);
            exit;
        }

        // Vérifier si l'email existe dans la table administrateurs
        $stmt = $conn->prepare("SELECT id, nom, prenom, login, statut FROM administrateurs WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Aucun compte administrateur trouvé avec cet email']);
            exit;
        }

        // Vérifier si le compte est actif
        if ($admin['statut'] !== 'actif') {
            echo json_encode(['success' => false, 'message' => 'Ce compte administrateur est inactif']);
            exit;
        }

        // Générer un code de vérification
        $verification_code = rand(100000, 999999);
        $token = generateToken();
        $expires_at = date('Y-m-d H:i:s', strtotime('+30 minutes'));

        // Insérer ou mettre à jour la demande de réinitialisation
        $stmt = $conn->prepare("
            INSERT INTO password_reset_requests (email, token, verification_code, expires_at, created_at) 
            VALUES (?, ?, ?, ?, NOW()) 
            ON DUPLICATE KEY UPDATE 
            token = VALUES(token), 
            verification_code = VALUES(verification_code), 
            expires_at = VALUES(expires_at), 
            created_at = NOW()
        ");
        
        $stmt->execute([$email, $token, $verification_code, $expires_at]);

        // Envoyer l'email avec le code
        if (sendVerificationEmail($email, $admin['prenom'] . ' ' . $admin['nom'], $verification_code)) {
            echo json_encode([
                'success' => true, 
                'message' => 'Code de vérification envoyé avec succès',
                'token' => $token,
                'code' => $verification_code,
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi de l\'email']);
        }
    }

    // ACTION: Vérification du code
    elseif ($action === 'verify_code') {
        if (!isset($input['email']) || !isset($input['code']) || !isset($input['token'])) {
            echo json_encode(['success' => false, 'message' => 'Données manquantes']);
            exit;
        }

        $email = trim($input['email']);
        $code = trim($input['code']);
        $token = trim($input['token']);

        // Vérifier le code de vérification
        $stmt = $conn->prepare("
            SELECT id, email, verification_code, expires_at 
            FROM password_reset_requests 
            WHERE email = ? AND token = ? AND verification_code = ? AND expires_at > NOW()
        ");
        
        $stmt->execute([$email, $token, $code]);
        $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reset_request) {
            echo json_encode(['success' => false, 'message' => 'Code invalide ou expiré']);
            exit;
        }

        // Générer un nouveau token pour l'étape de réinitialisation
        $reset_token = generateToken();
        
        $stmt = $conn->prepare("
            UPDATE password_reset_requests 
            SET token = ?, verified_at = NOW() 
            WHERE email = ? AND verification_code = ?
        ");
        
        $stmt->execute([$reset_token, $email, $code]);

        echo json_encode([
            'success' => true, 
            'message' => 'Code vérifié avec succès',
            'reset_token' => $reset_token
        ]);
    }

    // ACTION: Réinitialisation du mot de passe
    elseif ($action === 'reset_password') {
        if (!isset($input['email']) || !isset($input['token']) || !isset($input['new_password'])) {
            echo json_encode(['success' => false, 'message' => 'Données manquantes']);
            exit;
        }

        $email = trim($input['email']);
        $token = trim($input['token']);
        $new_password = trim($input['new_password']);

        // Vérifier la force du mot de passe
        if (strlen($new_password) < 6) {
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères']);
            exit;
        }

        // Vérifier la validité de la demande
        $stmt = $conn->prepare("
            SELECT id, email 
            FROM password_reset_requests 
            WHERE email = ? AND token = ? AND  expires_at > NOW()
        ");
        
        $stmt->execute([$email, $token]);
        $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reset_request) {
            echo json_encode(['success' => false, 'message' => 'Demande de réinitialisation invalide ou expirée']);
            exit;
        }

        // Hacher le nouveau mot de passe
        $hashed_password = hashPassword($new_password);

        // Mettre à jour le mot de passe dans la table administrateurs
        $stmt = $conn->prepare("
            UPDATE administrateurs 
            SET mot_de_passe = ?, date_derniere_connexion = NOW() 
            WHERE email = ?
        ");
        
        $stmt->execute([$hashed_password, $email]);

        if ($stmt->rowCount() > 0) {
            // Supprimer la demande de réinitialisation
            $stmt = $conn->prepare("DELETE FROM password_reset_requests WHERE email = ?");
            $stmt->execute([$email]);

            echo json_encode([
                'success' => true, 
                'message' => 'Mot de passe réinitialisé avec succès'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la réinitialisation du mot de passe']);
        }
    }

    else {
        echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
    }

} catch (Exception $e) {
    error_log("Erreur forgot_password: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}

// Fonction d'envoi d'email
function sendVerificationEmail($email, $name, $verification_code) {
    $mail = new PHPMailer\PHPMailer\PHPMailer();

    try {
        // Configuration SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'wabajob0@gmail.com';
        $mail->Password = 'vldjnaakrurmzeeq';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Expéditeur et destinataire
        $mail->setFrom("wabajob0@gmail.com", 'EFES GG Administration');
        $mail->addAddress($email, $name);

        // Contenu de l'email
        $mail->isHTML(true);
        $mail->Subject = 'Réinitialisation de mot de passe - EFES GG';
        
        $mail->Body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { background-color: #ffffff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
                    h2 { color: #059669; }
                    p { color: #666666; line-height: 1.6; }
                    .code { font-size: 24px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; padding: 15px; border: 2px dashed #059669; border-radius: 8px; background-color: #f0fdf4; }
                    .warning { background-color: #fef3c7; padding: 10px; border-radius: 5px; border-left: 4px solid #d97706; }
                    .footer { font-size: 12px; color: #999999; text-align: center; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Réinitialisation de mot de passe</h2>
                    <p>Bonjour <strong>{$name}</strong>,</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe administrateur EFES GG.</p>
                    <p>Voici votre code de vérification :</p>
                    <div class='code'>{$verification_code}</div>
                    <div class='warning'>
                        <strong>Important :</strong> Ce code est valable pendant 30 minutes. 
                        Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.
                    </div>
                    <div class='footer'>
                        EFES GG - Système d'Administration © " . date('Y') . "<br>
                        Ceci est un e-mail automatique, merci de ne pas y répondre.
                    </div>
                </div>
            </body>
            </html>
        ";

        // Version texte brut
        $mail->AltBody = "Code de vérification EFES GG: {$verification_code}\nCe code est valable 30 minutes.";

        return $mail->send();
        
    } catch (Exception $e) {
        error_log("Erreur PHPMailer: " . $e->getMessage());
        return false;
    }
}
?>