<?php
class Database
{
    private $host = "localhost";
   /* private $db_name = "ecole4tt_efes";
    private $username = "ecole4tt_efes";
    private $password = "Efes6168@@@@";*/

    private $db_name = "efes";
    private $username = "root";
    private $password = "";


    public $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            echo "Erreur de connexion: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
// Fichier: database.php
// 1. Définition des constantes de connexion