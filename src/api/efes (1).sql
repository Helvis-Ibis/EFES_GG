-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 02 nov. 2025 à 01:07
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `efes`
--

-- --------------------------------------------------------

--
-- Structure de la table `administrateurs`
--

CREATE TABLE `administrateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `login` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `niveau_acces` enum('super_admin','admin') DEFAULT 'admin',
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_derniere_connexion` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `administrateurs`
--

INSERT INTO `administrateurs` (`id`, `nom`, `prenom`, `email`, `telephone`, `login`, `mot_de_passe`, `niveau_acces`, `statut`, `date_creation`, `date_derniere_connexion`, `created_by`) VALUES
(1, 'ADMIN', 'Super', 'superadmin@uas.bf', '+226 01 23 45 67', 'superadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'actif', '2025-10-30 22:17:01', '2025-10-30 23:10:33', NULL),
(2, 'KABORE', 'Jean', 'admin@uas.bf', '+226 01 23 45 68', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'actif', '2025-10-30 22:17:01', '2025-10-30 23:03:37', 1);

-- --------------------------------------------------------

--
-- Structure de la table `chefs_filiere`
--

CREATE TABLE `chefs_filiere` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `login` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `filiere` varchar(100) NOT NULL,
  `grade` enum('Professeur','Maitre de Conférences','Maître Assistant','Assistant') DEFAULT 'Professeur',
  `specialite` varchar(200) DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_derniere_connexion` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `doyens_directeurs`
--

CREATE TABLE `doyens_directeurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `login` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('Doyen','Directeur_Etudes','Vice_Doyen') NOT NULL,
  `faculte_uas` varchar(100) DEFAULT NULL,
  `departement` varchar(100) DEFAULT NULL,
  `grade` enum('Professeur','Maitre de Conférences','Maître Assistant') DEFAULT 'Professeur',
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_derniere_connexion` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `enseignants`
--

CREATE TABLE `enseignants` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenoms` varchar(150) NOT NULL,
  `date_naissance` date NOT NULL,
  `lieu_naissance` varchar(100) NOT NULL,
  `sexe` enum('Masculin','Féminin') NOT NULL,
  `nationalite` varchar(50) NOT NULL,
  `situation_matrimoniale` varchar(50) DEFAULT 'Célibataire',
  `matrimoniale_autre` varchar(100) DEFAULT NULL,
  `adresse_complete` text NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `diplome` varchar(200) NOT NULL,
  `specialite` varchar(200) NOT NULL,
  `annee_experience` int(3) DEFAULT 0,
  `etablissement_precedent` varchar(200) DEFAULT NULL,
  `filiere_enseignee` varchar(100) NOT NULL,
  `cours_enseignes` text DEFAULT NULL,
  `photo_nom` varchar(255) NOT NULL,
  `cv_nom` varchar(255) DEFAULT NULL,
  `diplome_nom` varchar(255) DEFAULT NULL,
  `certificat_nationalite_nom` varchar(255) DEFAULT NULL,
  `accepte_engagement` tinyint(1) DEFAULT 0,
  `statut` enum('en_attente','approuve','rejete') DEFAULT 'en_attente',
  `raison_refus` text DEFAULT NULL,
  `date_creation` datetime DEFAULT current_timestamp(),
  `date_modification` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `enseignants`
--

INSERT INTO `enseignants` (`id`, `nom`, `prenoms`, `date_naissance`, `lieu_naissance`, `sexe`, `nationalite`, `situation_matrimoniale`, `matrimoniale_autre`, `adresse_complete`, `telephone`, `email`, `diplome`, `specialite`, `annee_experience`, `etablissement_precedent`, `filiere_enseignee`, `cours_enseignes`, `photo_nom`, `cv_nom`, `diplome_nom`, `certificat_nationalite_nom`, `accepte_engagement`, `statut`, `raison_refus`, `date_creation`, `date_modification`) VALUES
(1, 'VIKING', 'Helvis', '2000-11-27', 'Savè', 'Masculin', 'Béninoise', 'Célibataire', '', 'Benin', '61683037', 'mahougnonelvis@gmail.com', 'Master', 'Intelligence Artificielle', 5, 'HECM', 'Anglais', 'Electronique , Programmation Web , Mobile et Logiciel', '69065f878c47b_1762025351.jpg', 'enseignant_1_cv_69066c66528e2.jpg', 'enseignant_1_diplome_69066c6652b2e.png', 'enseignant_1_certificat_nationalite_69066c6652d12.png', 1, 'approuve', NULL, '2025-11-01 20:29:11', '2025-11-01 22:00:11');

-- --------------------------------------------------------

--
-- Structure de la table `etudiants`
--

CREATE TABLE `etudiants` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenoms` varchar(150) NOT NULL,
  `date_naissance` date NOT NULL,
  `lieu_naissance` varchar(100) NOT NULL,
  `sexe` enum('Masculin','Féminin') NOT NULL,
  `nationalite` varchar(50) NOT NULL,
  `situation_matrimoniale` varchar(50) DEFAULT 'Célibataire',
  `anneeAcademique` varchar(255) NOT NULL DEFAULT '1ere année',
  `adresse_complete` text NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `diplome_acces` varchar(50) DEFAULT 'BAC',
  `serie_option` varchar(100) NOT NULL,
  `annee_obtention` year(4) NOT NULL,
  `mention_obtenue` varchar(50) DEFAULT NULL,
  `etablissement_origine` varchar(200) NOT NULL,
  `filiere_choisie` varchar(100) NOT NULL,
  `tuteur_nom_prenoms` varchar(200) NOT NULL,
  `tuteur_lien_parente` varchar(50) NOT NULL,
  `tuteur_profession` varchar(100) NOT NULL,
  `tuteur_telephone` varchar(20) NOT NULL,
  `tuteur_email` varchar(150) DEFAULT NULL,
  `photo_nom` varchar(255) DEFAULT NULL,
  `acte_naissance_nom` varchar(255) DEFAULT NULL,
  `cip_nom` varchar(255) DEFAULT NULL,
  `diplome_bac_nom` varchar(255) DEFAULT NULL,
  `recu_inscription_nom` varchar(255) DEFAULT NULL,
  `acte_naissance_url` varchar(500) DEFAULT NULL,
  `cip_url` varchar(500) DEFAULT NULL,
  `diplome_bac_url` varchar(500) DEFAULT NULL,
  `recu_inscription_url` varchar(500) DEFAULT NULL,
  `accepte_engagement` tinyint(1) DEFAULT 0,
  `statut` enum('en_attente','validee','rejetee') DEFAULT 'en_attente',
  `date_inscription` timestamp NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `numero_matricule` varchar(20) DEFAULT NULL,
  `recu_inscription` varchar(255) DEFAULT NULL,
  `date_validation` timestamp NULL DEFAULT NULL,
  `raison_refus` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `etudiants`
--

INSERT INTO `etudiants` (`id`, `nom`, `prenoms`, `date_naissance`, `lieu_naissance`, `sexe`, `nationalite`, `situation_matrimoniale`, `anneeAcademique`, `adresse_complete`, `telephone`, `email`, `diplome_acces`, `serie_option`, `annee_obtention`, `mention_obtenue`, `etablissement_origine`, `filiere_choisie`, `tuteur_nom_prenoms`, `tuteur_lien_parente`, `tuteur_profession`, `tuteur_telephone`, `tuteur_email`, `photo_nom`, `acte_naissance_nom`, `cip_nom`, `diplome_bac_nom`, `recu_inscription_nom`, `acte_naissance_url`, `cip_url`, `diplome_bac_url`, `recu_inscription_url`, `accepte_engagement`, `statut`, `date_inscription`, `date_modification`, `numero_matricule`, `recu_inscription`, `date_validation`, `raison_refus`, `updated_at`) VALUES
(3, 'VIKING', 'Mahougnon Helvis', '2000-11-27', 'Savè', 'Masculin', 'Béninoise', 'Célibataire', 'Lettres Modernes', 'Benin', '0161683037', 'mahougnonelvis@gmail.com', 'BAC', 'D', '2019', 'Bien', 'CCTA', 'Anglais', 'TOMETIN Helene', 'mère', 'Couturière', '61683037', 'mahougnonelvis@gmail.com', '69037a8b5a355_1761835659.png', 'acte_naissance_3_1761835728_69037ad02079c.pdf', 'cip_3_1761835728_69037ad020a72.pdf', 'diplome_bac_3_1761835728_69037ad020d38.pdf', 'recu_inscription_3_1761835728_69037ad020fdc.png', '../uploads/acte_naissance/acte_naissance_3_1761835728_69037ad02079c.pdf', '../uploads/cip/cip_3_1761835728_69037ad020a72.pdf', '../uploads/diplome_bac/diplome_bac_3_1761835728_69037ad020d38.pdf', '../uploads/recu_inscription/recu_inscription_3_1761835728_69037ad020fdc.png', 1, 'validee', '2025-10-30 14:47:39', '2025-11-01 20:56:02', 'GG-00000001-30102025', NULL, NULL, NULL, '2025-11-01 20:56:02');

-- --------------------------------------------------------

--
-- Structure de la table `logs_activite`
--

CREATE TABLE `logs_activite` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `type_utilisateur` enum('admin','secretaire','chef_filiere','doyen') NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `table_affectee` varchar(50) DEFAULT NULL,
  `id_affecte` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `date_action` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `logs_activite`
--

INSERT INTO `logs_activite` (`id`, `utilisateur_id`, `type_utilisateur`, `action`, `description`, `table_affectee`, `id_affecte`, `ip_address`, `user_agent`, `date_action`) VALUES
(1, 2, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 22:53:46'),
(2, 2, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 22:53:55'),
(3, 1, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 23:01:18'),
(4, 2, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 23:02:08'),
(5, 2, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 23:02:54'),
(6, 2, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 23:03:38'),
(7, 1, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 23:10:33');

-- --------------------------------------------------------

--
-- Structure de la table `publications`
--

CREATE TABLE `publications` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `categorie` varchar(100) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(500) NOT NULL,
  `taille_fichier` varchar(50) NOT NULL,
  `type_fichier` varchar(10) NOT NULL,
  `telechargements` int(11) DEFAULT 0,
  `est_vedette` tinyint(1) DEFAULT 0,
  `statut` enum('publiee','brouillon','archivee') DEFAULT 'publiee',
  `date_publication` datetime DEFAULT current_timestamp(),
  `date_modification` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `publications`
--

INSERT INTO `publications` (`id`, `titre`, `description`, `categorie`, `nom_fichier`, `chemin_fichier`, `taille_fichier`, `type_fichier`, `telechargements`, `est_vedette`, `statut`, `date_publication`, `date_modification`) VALUES
(1, 'Mon titre', 'Description aux enseignants', 'Enseignant(s)', 'Capture d’écran 2025-10-30 140332.png', '/uploads/Capture d’écran 2025-10-30 140332.png', '2.4 MB', 'png', 0, 0, 'publiee', '2025-11-01 22:23:45', '2025-11-01 22:57:58'),
(2, 'Titre2', 'Description titre 2', 'Etudiant(s)', '69067e1491743_1762033172.png', '../uploads/publications/69067e1491743_1762033172.png', '0.02 MB', 'PNG', 0, 0, 'publiee', '2025-11-01 22:39:32', '2025-11-02 00:19:58'),
(3, 'Guide de l\'Étudiant EFES GG 2024', 'Guide complet pour les étudiants avec toutes les informations académiques et administratives', 'Etudiant(s)', 'guide_etudiant_efes_gg_2024.pdf', '/publications/guides/guide_etudiant_efes_gg_2024.pdf', '2.4 MB', 'PDF', 1247, 1, 'publiee', '2024-03-15 00:00:00', '2025-11-01 23:49:42'),
(4, 'Communiqué Administratif - Rentrée 2024', 'Informations importantes concernant la rentrée académique 2024-2025', 'Administration-communiqué(s)', 'communique_rentree_2024.pdf', '/publications/communiques/communique_rentree_2024.pdf', '1.2 MB', 'PDF', 892, 1, 'publiee', '2024-01-10 00:00:00', '2025-11-01 23:49:42'),
(5, 'Programme des Formations Enseignants', 'Détail du curriculum et des modules de formation pour les futurs enseignants', 'Enseignant(s)', 'programme_formations_enseignants.pdf', '/publications/programmes/programme_formations_enseignants.pdf', '1.8 MB', 'PDF', 1563, 0, 'publiee', '2024-02-28 00:00:00', '2025-11-01 23:49:42'),
(6, 'Calendrier Académique 2024-2025', 'Planning détaillé des activités académiques et administratives', 'Programmation(s)', 'calendrier_academique_2024_2025.pdf', '/publications/calendriers/calendrier_academique_2024_2025.pdf', '0.8 MB', 'PDF', 2104, 1, 'publiee', '2024-03-05 00:00:00', '2025-11-01 23:49:42'),
(7, 'Projet d\'Extension Campus Nord', 'Documentation technique du projet d\'extension de notre campus', 'extentions de l\'école', 'projet_extension_campus_nord.pdf', '/publications/projets/projet_extension_campus_nord.pdf', '4.7 MB', 'PDF', 567, 0, 'publiee', '2024-01-20 00:00:00', '2025-11-01 23:49:42'),
(8, 'Rapport des Activités Internes', 'Bilan des activités pédagogiques et scientifiques internes', 'Activité(s) interne(s)', 'rapport_activites_internes.pdf', '/publications/rapports/rapport_activites_internes.pdf', '3.2 MB', 'PDF', 734, 0, 'publiee', '2024-03-08 00:00:00', '2025-11-01 23:49:42'),
(9, 'Programme des Sorties Pédagogiques', 'Planning des activités extra-scolaires et sorties éducatives', 'Activité(s) extra-scolaire', 'programme_sorties_pedagogiques.pdf', '/publications/programmes/programme_sorties_pedagogiques.pdf', '1.1 MB', 'PDF', 892, 1, 'publiee', '2024-03-12 00:00:00', '2025-11-01 23:49:42');

-- --------------------------------------------------------

--
-- Structure de la table `secretaires`
--

  CREATE TABLE `secretaires` (
    `id` int(11) NOT NULL,
    `nom` varchar(100) NOT NULL,
    `prenom` varchar(100) NOT NULL,
    `email` varchar(150) NOT NULL,
    `telephone` varchar(20) DEFAULT NULL,
    `login` varchar(50) NOT NULL,
    `mot_de_passe` varchar(255) NOT NULL,
    `departement` varchar(100) DEFAULT 'Scolarité',
    `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
    `statut` enum('actif','inactif') DEFAULT 'actif',
    `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
    `date_derniere_connexion` timestamp NULL DEFAULT NULL,
    `created_by` int(11) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `secretaires`
--

INSERT INTO `secretaires` (`id`, `nom`, `prenom`, `email`, `telephone`, `login`, `mot_de_passe`, `departement`, `permissions`, `statut`, `date_creation`, `date_derniere_connexion`, `created_by`) VALUES
(1, 'TRAORE', 'Aminata', 'secretariat1@uas.bf', '+226 01 23 45 69', 'secretariat1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Scolarité', NULL, 'actif', '2025-10-30 22:17:01', NULL, 1),
(2, 'SAWADOGO', 'Bintou', 'secretariat2@uas.bf', '+226 01 23 45 70', 'secretariat2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Affaires Académiques', NULL, 'actif', '2025-10-30 22:17:01', '2025-10-30 22:53:55', 1);

-- --------------------------------------------------------

--
-- Structure de la table `sessions_utilisateurs`
--

CREATE TABLE `sessions_utilisateurs` (
  `id` varchar(128) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `type_utilisateur` enum('admin','secretaire','chef_filiere','doyen') NOT NULL,
  `date_debut` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_derniere_activite` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sessions_utilisateurs`
--

INSERT INTO `sessions_utilisateurs` (`id`, `utilisateur_id`, `type_utilisateur`, `date_debut`, `date_derniere_activite`, `ip_address`, `user_agent`, `expires_at`) VALUES
('0b55f71cb3684aedad2a56897825ec81cce7eea7d5e923fb81a048a9bc267d7e8d6ec9e650a30826929a6d132b33c2c2d2bd09350e766ff818d2b91f369234d0', 2, 'secretaire', '2025-10-30 22:53:46', '2025-10-30 22:53:46', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 22:53:46'),
('2397070278f6a82cc6ff474bf28c45bde6b78ca2d3f8d7300f081bc39bd9ee36547612f7cac36b2d90715bbe696a9e6dc6c7187696b7bdbb7903dc2280d00bbc', 1, 'admin', '2025-10-30 23:01:18', '2025-10-30 23:01:18', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 23:01:18'),
('81ecd7ee4443f70126d83943fbd96b0c65362b6b2ad6c8ba0c6af56da26eae6deefa32fcbcce2d4a60f2e2c8fdfa44090683ace78fd8e4662a44da779e4a4521', 1, 'admin', '2025-10-30 23:10:33', '2025-10-30 23:10:33', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 23:10:33'),
('a1e5458e3ad3f74556e29d5b90792c800b6d0802a77b60f317462d91a09964a7e82d0e2f86c296cddff8645ef4f11c029047e65c1421b049005d268ee0f1c01d', 2, 'admin', '2025-10-30 23:03:37', '2025-10-30 23:03:37', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 23:03:37'),
('a6301c479ba02c87feb13855ad5bfa858b938cabcf426b47dfa175cd2c0925fdf6c83612ba1c164f5b92de675dd700557780df61a072e37a76fa2803edde7ffa', 2, 'admin', '2025-10-30 23:02:08', '2025-10-30 23:02:08', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 23:02:08'),
('c6a7dda703b3bb4994ced5d222af90b1412134081aad4e29d2373d9c4519e159f3050a8d41fe35726d5be8786b9597b334698ec47a1770811176f77cc4f87f11', 2, 'admin', '2025-10-30 23:02:54', '2025-10-30 23:02:54', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 23:02:54'),
('cb418437e087142c730650436c5bae7f04ab64643a1298c466986ddca528c29b1363d51f19d68f972651308cc8ce849d340f821ed0d03a857be0e174291ea2da', 2, 'secretaire', '2025-10-30 22:53:54', '2025-10-30 22:53:54', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-31 22:53:54');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `administrateurs`
--
ALTER TABLE `administrateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `login` (`login`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_admin_email` (`email`),
  ADD KEY `idx_admin_login` (`login`),
  ADD KEY `idx_admin_statut` (`statut`);

--
-- Index pour la table `chefs_filiere`
--
ALTER TABLE `chefs_filiere`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `login` (`login`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_chef_email` (`email`),
  ADD KEY `idx_chef_login` (`login`),
  ADD KEY `idx_chef_filiere` (`filiere`),
  ADD KEY `idx_chef_statut` (`statut`);

--
-- Index pour la table `doyens_directeurs`
--
ALTER TABLE `doyens_directeurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `login` (`login`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_doyen_email` (`email`),
  ADD KEY `idx_doyen_login` (`login`),
  ADD KEY `idx_doyen_role` (`role`),
  ADD KEY `idx_doyen_faculte` (`faculte_uas`);

--
-- Index pour la table `enseignants`
--
ALTER TABLE `enseignants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_telephone` (`telephone`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_filiere` (`filiere_enseignee`);

--
-- Index pour la table `etudiants`
--
ALTER TABLE `etudiants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_telephone` (`telephone`),
  ADD KEY `idx_filiere` (`filiere_choisie`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_matricule` (`numero_matricule`),
  ADD KEY `idx_date_validation` (`date_validation`);

--
-- Index pour la table `logs_activite`
--
ALTER TABLE `logs_activite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_logs_utilisateur` (`utilisateur_id`,`type_utilisateur`),
  ADD KEY `idx_logs_date` (`date_action`),
  ADD KEY `idx_logs_action` (`action`),
  ADD KEY `idx_logs_table` (`table_affectee`);

--
-- Index pour la table `publications`
--
ALTER TABLE `publications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categorie` (`categorie`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_vedette` (`est_vedette`),
  ADD KEY `idx_date` (`date_publication`);

--
-- Index pour la table `secretaires`
--
ALTER TABLE `secretaires`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `login` (`login`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_secretaire_email` (`email`),
  ADD KEY `idx_secretaire_login` (`login`),
  ADD KEY `idx_secretaire_departement` (`departement`);

--
-- Index pour la table `sessions_utilisateurs`
--
ALTER TABLE `sessions_utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_utilisateur` (`utilisateur_id`,`type_utilisateur`),
  ADD KEY `idx_sessions_expires` (`expires_at`),
  ADD KEY `idx_sessions_type` (`type_utilisateur`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `administrateurs`
--
ALTER TABLE `administrateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `chefs_filiere`
--
ALTER TABLE `chefs_filiere`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `doyens_directeurs`
--
ALTER TABLE `doyens_directeurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `enseignants`
--
ALTER TABLE `enseignants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `etudiants`
--
ALTER TABLE `etudiants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `logs_activite`
--
ALTER TABLE `logs_activite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `publications`
--
ALTER TABLE `publications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `secretaires`
--
ALTER TABLE `secretaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `administrateurs`
--
ALTER TABLE `administrateurs`
  ADD CONSTRAINT `administrateurs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `chefs_filiere`
--
ALTER TABLE `chefs_filiere`
  ADD CONSTRAINT `chefs_filiere_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `doyens_directeurs`
--
ALTER TABLE `doyens_directeurs`
  ADD CONSTRAINT `doyens_directeurs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `secretaires`
--
ALTER TABLE `secretaires`
  ADD CONSTRAINT `secretaires_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
