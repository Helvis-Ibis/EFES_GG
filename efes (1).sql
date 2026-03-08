-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 19 nov. 2025 à 17:47
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
-- Base de données : `ecole4tt_efes `
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
(1, 'ADMINds', 'Visso', 'superadmin@uas.bf', '+226 01 23 45 67', 'superadmin', '$2y$10$BjhsNFpmxtS4EgE.jBVkTO5sDvDVKe7FQRfKFktphcr2jy8A4IaSG', 'super_admin', 'actif', '2025-10-30 22:17:01', '2025-11-15 20:14:52', NULL);

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

--
-- Déchargement des données de la table `chefs_filiere`
--

INSERT INTO `chefs_filiere` (`id`, `nom`, `prenom`, `email`, `telephone`, `login`, `mot_de_passe`, `filiere`, `grade`, `specialite`, `statut`, `date_creation`, `date_derniere_connexion`, `created_by`) VALUES
(1, 'DAKO Helvis', 'Mahougnon Helvis', 'mahougnonelvis@gmail.com', '61683037', 'Helvis', '$2y$10$NZzPmqfaoUddGr7C/qyH2OtcxmJK0ojZH3faktrimbG3MdJFGNbh6', 'Espagnol', 'Professeur', 'Disertation', 'actif', '2025-11-15 18:17:35', '2025-11-15 18:17:54', 1);

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
  `password_hash` varchar(255) NOT NULL,
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

INSERT INTO `enseignants` (`id`, `nom`, `prenoms`, `date_naissance`, `lieu_naissance`, `sexe`, `nationalite`, `situation_matrimoniale`, `matrimoniale_autre`, `adresse_complete`, `telephone`, `email`, `password_hash`, `diplome`, `specialite`, `annee_experience`, `etablissement_precedent`, `filiere_enseignee`, `cours_enseignes`, `photo_nom`, `cv_nom`, `diplome_nom`, `certificat_nationalite_nom`, `accepte_engagement`, `statut`, `raison_refus`, `date_creation`, `date_modification`) VALUES
(5, 'Dako', 'Mahougnon Helvis', '2000-11-27', 'Savè', 'Masculin', 'Béninoise', 'Célibataire', '', 'Benin', '61683037', 'mahougnonelvis@gmail.com', '$2y$10$FBDSbkHlLCv9PgXa98aOH.QpXL9cjjuj6U.skmo1mvQ5Jqt4NJp1u', 'Master', 'Intelligence Artificielle', 2019, 'HECM', 'Anglais', 'inedit', '6918a445727ce_1763222597.png', 'enseignant_5_cv_6918a6fbcdac9.pdf', 'enseignant_5_diplome_6918a6fbdc2e8.pdf', 'enseignant_5_certificat_nationalite_6918a6fbdc59e.pdf', 1, 'approuve', NULL, '2025-11-15 17:03:18', '2025-11-15 17:14:51');

-- --------------------------------------------------------

--
-- Structure de la table `epreuves`
--

CREATE TABLE `epreuves` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `annee_academique` varchar(20) NOT NULL,
  `heure` time NOT NULL,
  `fichier_nom` varchar(255) NOT NULL,
  `fichier_chemin` varchar(500) NOT NULL,
  `filiere` varchar(100) NOT NULL,
  `enseignant_id` int(11) NOT NULL,
  `statut` enum('en_attente','approuve','erreur') DEFAULT 'en_attente',
  `marque_erreur` tinyint(1) DEFAULT 0,
  `raison_erreur` text DEFAULT NULL,
  `date_creation` datetime DEFAULT current_timestamp(),
  `date_modification` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(4, 'Dako', 'Mahougnon Helvis', '2000-11-27', 'Savè', 'Masculin', 'Béninoise', 'Célibataire', 'Anglais', 'Bénin', '0161683037', 'dakohelvis@gmail.com', 'BAC', 'D', '2019', 'Passable', 'CCTA', 'Anglais', 'TOMETIN Helene', 'mère', 'Couturière', '0197362376', 'mahougnonelvis@gmail.com', '691870a00957b_1763209376.jpg', 'acte_naissance_4_1763214687_6918855fa1078.pdf', 'cip_4_1763214687_6918855fa13db.pdf', 'diplome_bac_4_1763214687_6918855fa167e.pdf', 'recu_inscription_4_1763214687_6918855fac473.pdf', '../uploads/acte_naissance/acte_naissance_4_1763214687_6918855fa1078.pdf', '../uploads/cip/cip_4_1763214687_6918855fa13db.pdf', '../uploads/diplome_bac/diplome_bac_4_1763214687_6918855fa167e.pdf', '../uploads/recu_inscription/recu_inscription_4_1763214687_6918855fac473.pdf', 1, 'validee', '2025-11-15 12:22:56', '2025-11-15 14:02:40', 'GG-00000001-15112025', NULL, NULL, NULL, '2025-11-15 14:02:40');

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
(16, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 12:41:53'),
(17, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 12:43:25'),
(18, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 12:55:54'),
(19, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-15 12:57:09'),
(20, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-15 12:57:33'),
(21, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-15 12:58:24'),
(22, 5, 'secretaire', 'CONNEXION', 'Connexion secrétaire réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:08:53'),
(23, 1, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 18:16:38'),
(24, 1, 'admin', 'CONNEXION', 'Connexion administrateur réussie', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 20:14:52');

-- --------------------------------------------------------

--
-- Structure de la table `publications`
--

CREATE TABLE `publications` (
  `id` int(11) NOT NULL,
  `enseignant_id` int(11) NOT NULL,
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

INSERT INTO `publications` (`id`, `enseignant_id`, `titre`, `description`, `categorie`, `nom_fichier`, `chemin_fichier`, `taille_fichier`, `type_fichier`, `telechargements`, `est_vedette`, `statut`, `date_publication`, `date_modification`) VALUES
(16, 0, 'Les IA', 'Les IA qui se definissent comme Intelligence Artificielle ......', 'Etudiant(s)', '691864eaf2ec4_1763206378.pdf', '../uploads/publications/691864eaf2ec4_1763206378.pdf', '0.86 MB', 'PDF', 0, 1, 'publiee', '2025-11-15 12:32:59', '2025-11-15 12:32:59'),
(17, 5, 'Titre', 'Le contenu', 'Enseignant(s)', 'trading2.png', '', '', 'image', 0, 0, '', '2025-11-15 17:51:59', '2025-11-15 17:52:15');

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
(5, 'BOGLO', 'Brunelle', 'mahougnonelvis@gmail.com', '0198195880', 'Brunelle', '$2y$10$xY9RCTjMYyIVxVcbC0L48OPBIlgWQeCe4B19eosrRS/9eOwIUOh/e', 'Scolarité', '[]', 'actif', '2025-11-15 12:41:06', '2025-11-15 16:08:53', 1);

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
('08a156884ce80a0b37a6991227593515920bf7051cc1a4e39663f3920aa37b62b7f90074cae3fea5af1bb12b85443b07cb813ac5b342d50ea4e4efaaa4be4b2f', 1, 'admin', '2025-11-15 18:16:38', '2025-11-15 18:16:38', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 18:16:38'),
('2dac36d706c5407050a20bac83e6a6f7502fde6fe3dae4acc6d308b1e43258d6019ebad68cf295a0aa3d8e8432f438d15ac7e496f97ffbee88757b343fe57397', 5, 'secretaire', '2025-11-15 12:43:25', '2025-11-15 12:43:25', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 12:43:25'),
('7be6e6c9c5931c456624c6e82138aff417931c04c79cfb52ea26878d01d7f9bda8a59c8dc15363d8399783016dd4dc6ac1ecc98e291e1ee44d5673f4fc6cd99b', 5, 'secretaire', '2025-11-15 12:57:32', '2025-11-15 12:57:32', '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-16 12:57:32'),
('c9c6609532c801f316e0af9bfad4dc9c6ff24da49be724c842456e212c670e74d2c2b0ce80b9ae6fc3adf85b454f49c5f66f4b24f9247062833cc485a73d0d70', 5, 'secretaire', '2025-11-15 16:08:53', '2025-11-15 16:08:53', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 16:08:53'),
('d19143e0ed82c9c3af1eb6dbf7900ccdd6a6cceed54ebcf68d1aa9b04b2e748858b9b4a0a758c9c26a5db5fd03b602dd19ef2b197884df9b2399e5dfe71bcd4e', 5, 'secretaire', '2025-11-15 12:55:54', '2025-11-15 12:55:54', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 12:55:54'),
('d810c341d03d04a469d714035f38667f6c73efd374e2d39d901a607e1bf32e82bfb33892af017cb55e3734956374ddcbef102ee5c9c9fc9fb96f71ea3a136393', 5, 'secretaire', '2025-11-15 12:57:08', '2025-11-15 12:57:08', '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-16 12:57:08'),
('e6c9bb51442a2007b28e8adb2ed2df1ee7156136158ac08cb33bfa5b2df86bbf6c62cfee272acba688b41245783aeb124528c724c4248de0f36cb37422d9b1f1', 5, 'secretaire', '2025-11-15 12:41:52', '2025-11-15 12:41:52', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 12:41:52'),
('f037373f38c33e446359641de41a40791748882f3033ed19f3f23987c4f348218287fe661da3830546558cc7acd6f46580c143de2ea86be684d9e90014166010', 5, 'secretaire', '2025-11-15 12:58:24', '2025-11-15 12:58:24', '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-16 12:58:24'),
('f7574e1984dfd1c8cae63fa9608d1cc00944b6738b11402e73ec713c854d9e0d0cfe81c51ac48299593ac201bcfad80dbb4bf94a8de126e31b0b71d0dd8a66e5', 1, 'admin', '2025-11-15 20:14:52', '2025-11-15 20:14:52', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 20:14:52');

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
-- Index pour la table `epreuves`
--
ALTER TABLE `epreuves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enseignant_id` (`enseignant_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `doyens_directeurs`
--
ALTER TABLE `doyens_directeurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `enseignants`
--
ALTER TABLE `enseignants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `epreuves`
--
ALTER TABLE `epreuves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `etudiants`
--
ALTER TABLE `etudiants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `logs_activite`
--
ALTER TABLE `logs_activite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `publications`
--
ALTER TABLE `publications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `secretaires`
--
ALTER TABLE `secretaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- Contraintes pour la table `epreuves`
--
ALTER TABLE `epreuves`
  ADD CONSTRAINT `epreuves_ibfk_1` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`);

--
-- Contraintes pour la table `secretaires`
--
ALTER TABLE `secretaires`
  ADD CONSTRAINT `secretaires_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
