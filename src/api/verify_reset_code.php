<?php

require_once './head.php';
require_once './database.php';

class VerifyResetCode {
    private $conn;
    private $table_reset_requests = 'password_reset_requests_enseignant';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function verifyCode() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if ( !isset($data['verification_code'])) {
            echo json_encode(['success' => false, 'message' => 'Token et code de vérification requis']);
            return;
        }

       // $token = trim($data['token']);
        $verification_code = trim($data['verification_code']);

        try {
            // Vérifier le token et le code
            $query = "SELECT * 
                      FROM " . $this->table_reset_requests . " 
                      WHERE  verification_code = ?";
            
            $stmt = $this->conn->prepare($query);
         //   $stmt->bindParam(1, $token);
            $stmt->bindParam(1, $verification_code);
            $stmt->execute();

            if ($stmt->rowCount() == 0) {
                // Incrémenter le compteur de tentatives
              //  $this->incrementAttempts($token);
                echo json_encode(['success' => false, 'message' => 'Code de vérification invalide ou expiré']);
                return;
            }

            $request = $stmt->fetch(PDO::FETCH_ASSOC);

            // Vérifier si le token n'est pas expiré
            if (strtotime($request['expires_at']) < time()) {
                echo json_encode(['success' => false, 'message' => 'Le code de vérification a expiré']);
                return;
            }

           

            // Code valide
            echo json_encode([
                'success' => true, 
                'message' => 'Code vérifié avec succès',
                'email' => $request['email'],
                //'token' => $token
            ]);

        } catch (PDOException $e) {
            error_log("Erreur PDO: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erreur serveur'.$e->getMessage()]);
        }
    }

    private function incrementAttempts($token) {
        try {
            $query = "UPDATE " . $this->table_reset_requests . " 
                      SET attempts = attempts + 1 
                      WHERE token = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $token);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur lors de l'incrémentation des tentatives: " . $e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();

$verifyCode = new VerifyResetCode($db);
$verifyCode->verifyCode();
?>