<?php

require_once './head.php';
require_once './database.php';

class ResetPasswordEnseignant {
    private $conn;
    private $table_enseignants = 'enseignants';
    private $table_reset_requests = 'password_reset_requests_enseignant';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function resetPassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if ( !isset($data['password']) || !isset($data['confirm_password'])) {
            echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis']);
            return;
        }

       // $token = trim($data['token']);
        $password = trim($data['password']);
        $confirm_password = trim($data['confirm_password']);

        // Validation du mot de passe
        if (strlen($password) < 8) {
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 8 caractères']);
            return;
        }

        if ($password !== $confirm_password) {
            echo json_encode(['success' => false, 'message' => 'Les mots de passe ne correspondent pas']);
            return;
        }

        try {
          /*  // Vérifier la validité du token
            $query = "SELECT id, email, expires_at, used_at 
                      FROM " . $this->table_reset_requests . " 
                      WHERE token = ? AND used_at IS NULL";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $token);
            $stmt->execute();

            if ($stmt->rowCount() == 0) {
                echo json_encode(['success' => false, 'message' => 'Lien de réinitialisation invalide ou déjà utilisé']);
                return;
            }

            $request = $stmt->fetch(PDO::FETCH_ASSOC);

            // Vérifier l'expiration
            if (strtotime($request['expires_at']) < time()) {
                echo json_encode(['success' => false, 'message' => 'Le lien de réinitialisation a expiré']);
                return;
            }*/

            // Hasher le nouveau mot de passe
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // Mettre à jour le mot de passe de l'enseignant
            $update_query = "UPDATE " . $this->table_enseignants . " 
                            SET password_hash = ?, date_modification = NOW() 
                            WHERE email = ?" ;
            
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(1, $password_hash);
            $update_stmt->bindParam(2, $request['email']);

            if ($update_stmt->execute()) {
                // Marquer le token comme utilisé
           //     $this->markTokenAsUsed($token);

                // Envoyer un email de confirmation
               // $this->sendConfirmationEmail($request['email']);

                echo json_encode([
                    'success' => true, 
                    'message' => 'Mot de passe réinitialisé avec succès'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erreur lors de la réinitialisation du mot de passe']);
            }

        } catch (PDOException $e) {
            error_log("Erreur PDO: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
        }
    }

    private function markTokenAsUsed($token) {
        try {
            $query = "UPDATE " . $this->table_reset_requests . " 
                      SET used_at = NOW() 
                      WHERE token = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $token);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors du marquage du token: " . $e->getMessage());
        }
    }

    private function sendConfirmationEmail($email) {
        $to = $email;
        $subject = "Mot de passe modifié - EFES Gnon-Gani";
        
        $message = "
        <html>
        <head>
            <title>Confirmation de modification de mot de passe</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; color: white; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 20px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>EFES Gnon-Gani</h2>
                    <p>Confirmation de modification de mot de passe</p>
                </div>
                <div class='content'>
                    <p>Bonjour,</p>
                    
                    <p>Votre mot de passe a été modifié avec succès.</p>
                    
                    <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement le support technique.</p>
                    
                    <p><strong>Date de modification :</strong> " . date('d/m/Y à H:i') . "</p>
                </div>
                <div class='footer'>
                    <p>© 2024 EFES Gnon-Gani - Tous droits réservés</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: no-reply@efes-gani.bj" . "\r\n";
        
        mail($to, $subject, $message, $headers);
    }
}

$database = new Database();
$db = $database->getConnection();

$resetPassword = new ResetPasswordEnseignant($db);
$resetPassword->resetPassword();
?>