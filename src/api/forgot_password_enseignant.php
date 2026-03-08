<?php
include './head.php';

require_once './database.php';
require_once '../PHPMailer/src/PHPMailer.php';
require_once '../PHPMailer/src/SMTP.php';
require_once '../PHPMailer/src/Exception.php';
date_default_timezone_set("Africa/Lagos");

class ForgotPasswordEnseignant {
    private $conn;
    private $table_enseignants = 'enseignants';
    private $table_reset_requests = 'password_reset_requests_enseignant';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function requestPasswordReset() {
        // Vérifier si la requête est de type POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
            return;
        }

        // Récupérer les données JSON
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email']) || empty(trim($data['email']))) {
            echo json_encode(['success' => false, 'message' => 'L\'email est requis']);
            return;
        }

        $email = trim($data['email']);

        try {
            // Vérifier si l'enseignant existe
            $query = "SELECT id, email, nom, prenoms FROM " . $this->table_enseignants . " 
                      WHERE email = ? AND statut = 'approuve'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $email);
            $stmt->execute();

            if ($stmt->rowCount() == 0) {
                echo json_encode(['success' => false, 'message' => 'Aucun compte enseignant actif trouvé avec cet email']);
                return;
            }

            $enseignant = $stmt->fetch(PDO::FETCH_ASSOC);

            // Générer un token unique et un code de vérification
            $token = bin2hex(random_bytes(32));
            $verification_code = sprintf("%06d", mt_rand(1, 999999));

            // Date d'expiration (1 heure)
            $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Récupérer l'IP et le user agent
            $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

            // Insérer la demande de réinitialisation
            $insert_query = "INSERT INTO " . $this->table_reset_requests . " 
                            (email, token, verification_code, expires_at, ip_address, user_agent) 
                            VALUES (?, ?, ?, ?, ?, ?)";
            
            $insert_stmt = $this->conn->prepare($insert_query);
            $insert_stmt->bindParam(1, $email);
            $insert_stmt->bindParam(2, $token);
            $insert_stmt->bindParam(3, $verification_code);
            $insert_stmt->bindParam(4, $expires_at);
            $insert_stmt->bindParam(5, $ip_address);
            $insert_stmt->bindParam(6, $user_agent);

            if ($insert_stmt->execute()) {
                // Envoyer le code par email avec PHPMailer
                $emailSent = $this->sendVerificationEmail($enseignant, $verification_code);
                
                if ($emailSent) {
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Un code de réinitialisation a été envoyé à votre adresse email',
                        'verification_code' => $verification_code // Retourné pour le développement
                    ]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi de l\'email']);
                }
                
            } else {
                echo json_encode(['success' => false, 'message' => 'Erreur lors de la création de la demande']);
            }

        } catch (PDOException $e) {
            error_log("Erreur PDO: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
        } catch (Exception $e) {
            error_log("Erreur: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erreur: ' . $e->getMessage()]);
        }
    }

    private function sendVerificationEmail($enseignant, $verification_code) {
        $email = $enseignant['email'];
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
            $mail->setFrom("wabajob0@gmail.com", 'EFES Gnon-Gani');
            $mail->addAddress($email);

            // Contenu de l'email (version HTML)
            $mail->isHTML(true);
            $mail->Subject = 'Code de réinitialisation de mot de passe - EFES Gnon-Gani';
            $mail->Body = "
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                        .container { background-color: #ffffff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
                        h2 { color: #333333; margin-top: 0; }
                        p { color: #666666; line-height: 1.6; }
                        .code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; padding: 20px; border: 2px dashed #007bff; border-radius: 10px; background-color: #e6f2ff; letter-spacing: 8px; }
                        .footer { font-size: 12px; color: #999999; text-align: center; margin-top: 20px; }
                        .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
                        .instructions { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>EFES Gnon-Gani</h2>
                            <p>Réinitialisation de mot de passe</p>
                        </div>
                        
                        <p>Bonjour <strong>" . $enseignant['prenoms'] . " " . $enseignant['nom'] . "</strong>,</p>
                        
                        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        
                        <div class='info-box'>
                            <p style='text-align: center; margin-bottom: 10px;'><strong>Votre code de vérification :</strong></p>
                            <div class='code'>{$verification_code}</div>
                        </div>

                        <div class='instructions'>
                            <p><strong>📝 Instructions :</strong></p>
                            <ol>
                                <li>Retournez sur la page de réinitialisation de mot de passe</li>
                                <li>Entrez votre adresse email</li>
                                <li>Saisissez le code ci-dessus</li>
                                <li>Créez votre nouveau mot de passe</li>
                            </ol>
                        </div>
                        
                        <div class='info-box'>
                            <p><strong>⚠️ Important :</strong></p>
                            <ul>
                                <li>Ce code est valable pendant <strong>1 heure</strong></li>
                                <li>Ne partagez ce code avec personne</li>
                                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                            </ul>
                        </div>
                        
                        <div class='footer'>
                            <p>© 2024 EFES Gnon-Gani - Tous droits réservés</p>
                            <p>Ceci est un e-mail automatique, merci de ne pas y répondre.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

          

            return $mail->send();
            
        } catch (Exception $e) {
            error_log("Erreur PHPMailer: " . $e->getMessage());
            return false;
        }
    }
}

// Connexion à la base de données
$database = new Database();
$db = $database->getConnection();

$forgotPassword = new ForgotPasswordEnseignant($db);
$forgotPassword->requestPasswordReset();
?>