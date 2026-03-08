<?php
require_once './database.php';
require_once '../PHPMailer/src/PHPMailer.php';
require_once '../PHPMailer/src/SMTP.php';
require_once '../PHPMailer/src/Exception.php';

date_default_timezone_set("Africa/Lagos");

// Vérification des données POST
if (!isset($_POST['email'])) {
    die("Paramètre email manquant");
}

$email = htmlspecialchars($_POST['email']);
$sms = htmlspecialchars($_POST['sms']);

// Validation de l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Email invalide");
}

// Envoi du code de vérification sans vérification en base
sendVerificationEmail($email);

function sendVerificationEmail($email) {
    $random = rand(1245, 100000);
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
        $mail->setFrom("wabajob0@gmail.com", 'WABAJOB');
        $mail->addAddress($email);

        // Contenu de l'email (version HTML)
        $mail->isHTML(true);
        $mail->Subject = 'Code de vérification';
        $mail->Body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { background-color: #ffffff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
                    h2 { color: #333333; }
                    p { color: #666666; line-height: 1.6; }
                    refus { color: #FF0000; line-height: 2; }
                    .code { font-size: 24px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; padding: 10px; border: 1px solid #007bff; border-radius: 5px; background-color: #e6f2ff; }
                    .footer { font-size: 12px; color: #999999; text-align: center; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Salut,</h2>
                    <p classe='refus'>Raison de refus d'inscription :</p>
                    <div class='code'>{$sms}</div>
                   
                </div>
            </body>
            </html>
        ";

        // Version texte brut

        if ($mail->send()) {
            return $mail->send() ;
        } else {
            echo "Erreur lors de l'envoi de l'email";
        }
    } catch (Exception $e) {
        echo "Erreur PHPMailer: " . $e->getMessage();
    }
}