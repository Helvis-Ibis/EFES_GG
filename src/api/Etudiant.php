<?php
class Etudiant
{
    private $conn;
    private $table_name = "etudiants";

    public $id;
    public $nom;
    public $prenoms;
    public $date_naissance;
    public $lieu_naissance;
    public $sexe;
    public $nationalite;
    public $situation_matrimoniale;
    public $adresse_complete;
    public $telephone;
    public $email;
    public $diplome_acces;
    public $serie_option;
    public $annee_obtention;
    public $mention_obtenue;
    public $etablissement_origine;
    public $filiere_choisie;
    public $tuteur_nom_prenoms;
    public $tuteur_lien_parente;
    public $tuteur_profession;
    public $tuteur_telephone;
    public $tuteur_email;
    public $photo_nom;
    public $accepte_engagement;
    public $statut;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Vérifier si l'email existe déjà
    public function emailExists()
    {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Vérifier si le téléphone existe déjà
    public function telephoneExists()
    {
        $query = "SELECT id FROM " . $this->table_name . " WHERE telephone = :telephone LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Dans la classe Etudiant, ajoutez cette méthode :

    public function modifierEtudiant($update_data) {
        try {
            if (empty($update_data)) {
                return "Aucune donnée à mettre à jour";
            }
    
            $query = "UPDATE " . $this->table_name . " SET ";
            $updates = array();
            $params = array();
    
            foreach ($update_data as $field => $value) {
                // Nettoyer les données
                $clean_value = htmlspecialchars(strip_tags($value));
                
                $updates[] = "{$field} = :{$field}";
                $params[":{$field}"] = $clean_value;
            }
    
            $query .= implode(", ", $updates);
            $query .= " WHERE id = :id";
            $params[":id"] = $this->id;
    
            error_log("Requête UPDATE: " . $query);
            error_log("Paramètres: " . print_r($params, true));
    
            $stmt = $this->conn->prepare($query);
            $result = $stmt->execute($params);
    
            if ($result) {
                $rowCount = $stmt->rowCount();
                error_log("Étudiant {$this->id} mis à jour avec succès. Lignes affectées: {$rowCount}. Champs: " . implode(', ', array_keys($update_data)));
                
                if ($rowCount > 0) {
                    return true;
                } else {
                    return "Aucune modification effectuée (les données sont peut-être identiques)";
                }
            } else {
                $errorInfo = $stmt->errorInfo();
                $errorMessage = "Erreur SQL: " . $errorInfo[2] . " (Code: " . $errorInfo[0] . ")";
                error_log("Erreur mise à jour étudiant: " . $errorMessage);
                return $errorMessage;
            }
    
        } catch (PDOException $e) {
            $errorMessage = "Erreur PDO: " . $e->getMessage();
            error_log("Erreur PDO dans modifierEtudiant: " . $errorMessage);
            return $errorMessage;
        } catch (Exception $e) {
            $errorMessage = "Erreur générale: " . $e->getMessage();
            error_log("Erreur générale dans modifierEtudiant: " . $errorMessage);
            return $errorMessage;
        }
    }

    // Récupérer le dernier numéro de matricule
    public function getDernierMatricule() {
        try {
            $query = "SELECT MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(numero_matricule, '-', 2), '-', -1) AS UNSIGNED)) as dernier_numero 
                      FROM etudiants 
                      WHERE numero_matricule IS NOT NULL 
                      AND numero_matricule LIKE 'GG-%'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $result = $row['dernier_numero'] ?: 0;
            
            error_log("Dernier matricule trouvé: " . $result);
            return $result;
            
        } catch (PDOException $e) {
            error_log("Erreur getDernierMatricule: " . $e->getMessage());
            return 0;
        }
    }

    // Vérifier si un matricule existe déjà
    public function matriculeExists($matricule) {
        try {
            $query = "SELECT id FROM etudiants WHERE numero_matricule = :matricule";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':matricule', $matricule);
            $stmt->execute();
            
            $exists = $stmt->rowCount() > 0;
            error_log("Matricule {$matricule} existe: " . ($exists ? "OUI" : "NON"));
            
            return $exists;
            
        } catch (PDOException $e) {
            error_log("Erreur matriculeExists: " . $e->getMessage());
            return false;
        }
    }

    // Valider l'inscription avec tous les documents
    public function validerInscriptionAvecDocuments($numero_matricule, $documents) {
        try {
            error_log("=== DEBUT VALIDATION INSCRIPTION AVEC DOCUMENTS ===");
            error_log("Matricule: " . $numero_matricule);
            error_log("Nombre de documents: " . count($documents));
            error_log("Documents: " . print_r($documents, true));

            // Commencer la transaction
            $this->conn->beginTransaction();

            // Construction de la requête de base
            $query = "UPDATE etudiants 
                      SET statut = 'validee', 
                          numero_matricule = :matricule";
            
            $params = array(
                ':matricule' => $numero_matricule,
                ':id' => $this->id
            );

            // Ajouter les champs pour chaque document
            foreach ($documents as $doc_type => $doc_info) {
                $column_nom = $doc_type . '_nom';
                $column_url = $doc_type . '_url';
                
                // Vérifier si les colonnes existent dans la table
                $query .= ", {$column_nom} = :{$column_nom}";
                $query .= ", {$column_url} = :{$column_url}";
                
                $params[":{$column_nom}"] = $doc_info['nom'];
                $params[":{$column_url}"] = $doc_info['url'];
            }

            // Ajouter la date de mise à jour
            $query .= ", updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            
            error_log("Requête SQL finale: " . $query);
            error_log("Paramètres: " . print_r($params, true));

            $stmt = $this->conn->prepare($query);
            $result = $stmt->execute($params);
            
            if ($result) {
                $rowCount = $stmt->rowCount();
                error_log("Nombre de lignes affectées: " . $rowCount);
                
                if ($rowCount > 0) {
                    $this->conn->commit();
                    error_log("=== VALIDATION RÉUSSIE ===");
                    return true;
                } else {
                    $this->conn->rollBack();
                    error_log("Échec: Aucune ligne affectée");
                    return false;
                }
            } else {
                $this->conn->rollBack();
                $errorInfo = $stmt->errorInfo();
                error_log("Erreur SQL: " . print_r($errorInfo, true));
                return false;
            }
            
        } catch (PDOException $e) {
            // Annuler la transaction en cas d'erreur
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            $error_message = "Erreur PDO dans validerInscriptionAvecDocuments: " . $e->getMessage();
            error_log($error_message);
            throw new Exception($error_message); // Lancer l'exception pour la récupérer
            return false;
        }
    }

    // Méthode alternative si la méthode principale échoue
    public function validerInscriptionAvecDocumentsSimplifiee($numero_matricule, $documents) {
        try {
            error_log("=== DÉBUT VALIDATION SIMPLIFIÉE ===");
            error_log("ID Étudiant: " . $this->id);
            error_log("Matricule: " . $numero_matricule);
            error_log("Documents reçus: " . print_r($documents, true));
            
            // D'abord, mettre à jour le statut et le matricule
            $query_base = "UPDATE etudiants 
                          SET statut = 'validee', 
                              numero_matricule = :matricule,
                              updated_at = CURRENT_TIMESTAMP
                          WHERE id = :id";
            
            error_log("Requête base: " . $query_base);
            
            $stmt_base = $this->conn->prepare($query_base);
            $stmt_base->bindParam(':matricule', $numero_matricule);
            $stmt_base->bindParam(':id', $this->id);
            
            $result_base = $stmt_base->execute();
            $rowCount_base = $stmt_base->rowCount();
            
            error_log("Résultat mise à jour base: " . ($result_base ? "SUCCÈS" : "ÉCHEC"));
            error_log("Lignes affectées base: " . $rowCount_base);
            
            if (!$result_base) {
                $errorInfo = $stmt_base->errorInfo();
                error_log("Erreur SQL base: " . print_r($errorInfo, true));
                throw new Exception("Échec mise à jour statut/matricule: " . $errorInfo[2]);
            }
            
            error_log("Statut et matricule mis à jour avec succès");

            // Ensuite, mettre à jour chaque document individuellement
            $success_count = 0;
            $total_documents = count($documents);
            
            foreach ($documents as $doc_type => $doc_info) {
                try {
                    $column_nom = $doc_type . '_nom';
                    $column_url = $doc_type . '_url';
                    
                    error_log("Traitement document: " . $doc_type);
                    error_log("Colonne nom: " . $column_nom);
                    error_log("Colonne URL: " . $column_url);
                    error_log("Nom fichier: " . $doc_info['nom']);
                    error_log("URL fichier: " . $doc_info['url']);
                    
                    $query_doc = "UPDATE etudiants 
                                 SET {$column_nom} = :doc_nom, 
                                     {$column_url} = :doc_url
                                 WHERE id = :id";
                    
                    error_log("Requête document: " . $query_doc);
                    
                    $stmt_doc = $this->conn->prepare($query_doc);
                    $stmt_doc->bindParam(':doc_nom', $doc_info['nom']);
                    $stmt_doc->bindParam(':doc_url', $doc_info['url']);
                    $stmt_doc->bindParam(':id', $this->id);
                    
                    $result_doc = $stmt_doc->execute();
                    $rowCount_doc = $stmt_doc->rowCount();
                    
                    if ($result_doc) {
                        $success_count++;
                        error_log("Document {$doc_type} mis à jour avec succès (lignes: {$rowCount_doc})");
                    } else {
                        $errorInfo = $stmt_doc->errorInfo();
                        error_log("Échec mise à jour document {$doc_type}: " . print_r($errorInfo, true));
                        throw new Exception("Erreur document {$doc_type}: " . $errorInfo[2]);
                    }
                    
                } catch (PDOException $e) {
                    error_log("Erreur PDO pour document {$doc_type}: " . $e->getMessage());
                    // Continuer avec les autres documents même si un échoue
                }
            }
            
            error_log("=== VALIDATION SIMPLIFIÉE TERMINÉE ===");
            error_log("Documents mis à jour: {$success_count}/{$total_documents}");
            
            if ($success_count > 0) {
                return true;
            } else {
                throw new Exception("Aucun document n'a pu être mis à jour");
            }
            
        } catch (PDOException $e) {
            $error_message = "Erreur PDO validation simplifiée: " . $e->getMessage();
            error_log($error_message);
            throw new Exception($error_message);
        } catch (Exception $e) {
            $error_message = "Erreur générale validation simplifiée: " . $e->getMessage();
            error_log($error_message);
            throw new Exception($error_message);
        }
    }

    // Méthode de validation simple (pour compatibilité)
    public function validerInscription($numero_matricule, $recu_nom = null) {
        try {
            $query = "UPDATE etudiants 
                      SET statut = 'validee', 
                          numero_matricule = :matricule";
            
            $params = array(
                ':matricule' => $numero_matricule,
                ':id' => $this->id
            );

            if ($recu_nom) {
                $query .= ", recu_inscription_nom = :recu_nom, recu_inscription_url = :recu_url";
                $params[':recu_nom'] = $recu_nom;
                $params[':recu_url'] = "../uploads/recu_inscription/" . $recu_nom;
            }

            $query .= " WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            return $stmt->execute($params);
            
        } catch (PDOException $e) {
            error_log("Erreur validation inscription: " . $e->getMessage());
            return false;
        }
    }

    // Mettre à jour un document spécifique
    public function updateDocument($document_type, $document_nom, $document_url) {
        try {
            $column_nom = $document_type . '_nom';
            $column_url = $document_type . '_url';
            
            $query = "UPDATE etudiants 
                      SET {$column_nom} = :document_nom,
                          {$column_url} = :document_url,
                          updated_at = CURRENT_TIMESTAMP
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':document_nom', $document_nom);
            $stmt->bindParam(':document_url', $document_url);
            $stmt->bindParam(':id', $this->id);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Erreur mise à jour document: " . $e->getMessage());
            return false;
        }
    }

    // Rejeter l'inscription
    public function rejeterInscription($raison_refus)
    {
        $query = "UPDATE " . $this->table_name . " 
                  SET statut = 'rejetee', 
                      raison_refus = :raison_refus,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Nettoyage des données
        $this->id = htmlspecialchars(strip_tags($this->id));
        $raison_refus = htmlspecialchars(strip_tags($raison_refus));

        // Liaison des paramètres
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":raison_refus", $raison_refus);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Créer un nouvel étudiant
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . "
                SET nom=:nom, prenoms=:prenoms, date_naissance=:date_naissance, 
                    lieu_naissance=:lieu_naissance, sexe=:sexe, nationalite=:nationalite,
                    situation_matrimoniale=:situation_matrimoniale, adresse_complete=:adresse_complete,
                    telephone=:telephone, email=:email, diplome_acces=:diplome_acces,
                    serie_option=:serie_option, annee_obtention=:annee_obtention, 
                    mention_obtenue=:mention_obtenue, etablissement_origine=:etablissement_origine,
                    filiere_choisie=:filiere_choisie, tuteur_nom_prenoms=:tuteur_nom_prenoms,
                    tuteur_lien_parente=:tuteur_lien_parente, tuteur_profession=:tuteur_profession,
                    tuteur_telephone=:tuteur_telephone, tuteur_email=:tuteur_email,
                    photo_nom=:photo_nom, accepte_engagement=:accepte_engagement";

        $stmt = $this->conn->prepare($query);

        // Nettoyage des données
        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenoms = htmlspecialchars(strip_tags($this->prenoms));
        $this->lieu_naissance = htmlspecialchars(strip_tags($this->lieu_naissance));
        $this->nationalite = htmlspecialchars(strip_tags($this->nationalite));
        $this->adresse_complete = htmlspecialchars(strip_tags($this->adresse_complete));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->serie_option = htmlspecialchars(strip_tags($this->serie_option));
        $this->mention_obtenue = htmlspecialchars(strip_tags($this->mention_obtenue));
        $this->etablissement_origine = htmlspecialchars(strip_tags($this->etablissement_origine));
        $this->filiere_choisie = htmlspecialchars(strip_tags($this->filiere_choisie));
        $this->tuteur_nom_prenoms = htmlspecialchars(strip_tags($this->tuteur_nom_prenoms));
        $this->tuteur_lien_parente = htmlspecialchars(strip_tags($this->tuteur_lien_parente));
        $this->tuteur_profession = htmlspecialchars(strip_tags($this->tuteur_profession));

        // Liaison des paramètres
        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenoms", $this->prenoms);
        $stmt->bindParam(":date_naissance", $this->date_naissance);
        $stmt->bindParam(":lieu_naissance", $this->lieu_naissance);
        $stmt->bindParam(":sexe", $this->sexe);
        $stmt->bindParam(":nationalite", $this->nationalite);
        $stmt->bindParam(":situation_matrimoniale", $this->situation_matrimoniale);
        $stmt->bindParam(":adresse_complete", $this->adresse_complete);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":diplome_acces", $this->diplome_acces);
        $stmt->bindParam(":serie_option", $this->serie_option);
        $stmt->bindParam(":annee_obtention", $this->annee_obtention);
        $stmt->bindParam(":mention_obtenue", $this->mention_obtenue);
        $stmt->bindParam(":etablissement_origine", $this->etablissement_origine);
        $stmt->bindParam(":filiere_choisie", $this->filiere_choisie);
        $stmt->bindParam(":tuteur_nom_prenoms", $this->tuteur_nom_prenoms);
        $stmt->bindParam(":tuteur_lien_parente", $this->tuteur_lien_parente);
        $stmt->bindParam(":tuteur_profession", $this->tuteur_profession);
        $stmt->bindParam(":tuteur_telephone", $this->tuteur_telephone);
        $stmt->bindParam(":tuteur_email", $this->tuteur_email);
        $stmt->bindParam(":photo_nom", $this->photo_nom);
        $stmt->bindParam(":accepte_engagement", $this->accepte_engagement);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Récupérer tous les étudiants
    public function readAll()
    {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date_inscription DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Récupérer un étudiant par ID
    public function readOne()
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->nom = $row['nom'];
            $this->prenoms = $row['prenoms'];
            $this->date_naissance = $row['date_naissance'];
            $this->lieu_naissance = $row['lieu_naissance'];
            $this->sexe = $row['sexe'];
            $this->nationalite = $row['nationalite'];
            $this->situation_matrimoniale = $row['situation_matrimoniale'];
            $this->adresse_complete = $row['adresse_complete'];
            $this->telephone = $row['telephone'];
            $this->email = $row['email'];
            $this->diplome_acces = $row['diplome_acces'];
            $this->serie_option = $row['serie_option'];
            $this->annee_obtention = $row['annee_obtention'];
            $this->mention_obtenue = $row['mention_obtenue'];
            $this->etablissement_origine = $row['etablissement_origine'];
            $this->filiere_choisie = $row['filiere_choisie'];
            $this->tuteur_nom_prenoms = $row['tuteur_nom_prenoms'];
            $this->tuteur_lien_parente = $row['tuteur_lien_parente'];
            $this->tuteur_profession = $row['tuteur_profession'];
            $this->tuteur_telephone = $row['tuteur_telephone'];
            $this->tuteur_email = $row['tuteur_email'];
            $this->photo_nom = $row['photo_nom'];
            $this->accepte_engagement = $row['accepte_engagement'];
            $this->statut = $row['statut'];

            return true;
        }
        return false;
    }

    // Vérifier si les colonnes de documents existent
    public function checkDocumentColumns() {
        $columns_to_check = [
            'acte_naissance_nom', 'acte_naissance_url',
            'cip_nom', 'cip_url',
            'diplome_bac_nom', 'diplome_bac_url',
            'recu_inscription_nom', 'recu_inscription_url'
        ];
        
        $existing_columns = [];
        
        try {
            $query = "SHOW COLUMNS FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $existing_columns[] = $row['Field'];
            }
            
            $missing_columns = array_diff($columns_to_check, $existing_columns);
            
            if (!empty($missing_columns)) {
                error_log("Colonnes manquantes: " . implode(', ', $missing_columns));
                return false;
            }
            
            return true;
            
        } catch (PDOException $e) {
            error_log("Erreur vérification colonnes: " . $e->getMessage());
            return false;
        }
    }
}
?>