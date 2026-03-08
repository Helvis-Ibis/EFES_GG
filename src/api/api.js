//export const API_URL_BASE = 'http://localhost/EFES_GG/src';
//export const API_URL_BASE2 = 'http://localhost/EFES_GG/src/x';
export const API_URL_BASE = 'https://www.ecolesuperieuregnongani.org/EFES_GG/src';
export const API_URL_BASE2 = 'https://www.ecolesuperieuregnongani.org/EFES_GG/src/x';

// Correction 2: Utilisation d'un objet constant (plus direct)
export const URL_BASE = {
  
    INSCRIPTION_ETUDIANT: () => `${API_URL_BASE}/api/inscription.php`,
    GET_ETUDIANTS: () => `${API_URL_BASE}/api/get_etudiants.php`,
    VALIDER_INSCRIPTION: () => `${API_URL_BASE}/api/valider_inscription.php`,
    REJETER_INSCRIPTION: () => `${API_URL_BASE}/api/rejeter_inscription.php`,
    UPLOADS_PHOTOS: () => `${API_URL_BASE}/uploads/photos`, 
    UPLOADS_PHOTOS_ENSEIGNANTS: () => `${API_URL_BASE}/uploads/photos_enseignants`,
    UPLOADS_RECU: () => `${API_URL_BASE}/uploads/recu_inscription`,
    
    FORGOT_PASSWORD: () => `${API_URL_BASE}/api/forgot_password.php`, // Ajoutez cette ligne
    FORGOT_PASSWORD_ENSEIGNANT: () => `${API_URL_BASE}/api/forgot_password_enseignant.php`,
    RESET_PASSWORD_ENSEIGNANT: () => `${API_URL_BASE}/api/reset_password_enseignant.php`,
    VERIFY_RESET_CODE: () => `${API_URL_BASE}/api/verify_reset_code.php`,
    API_SEBD_MAIL_REFUS: () => `${API_URL_BASE}/api/send_mail.php`,
 
    // Modification d'étudiant
    MODIFIER_ETUDIANT: () => `${API_URL_BASE}/api/modifier_etudiant.php`,
    
    // URLs de connexion
    LOGIN_SECRETAIRE: () => `${API_URL_BASE}/api/login_secretaire.php`,
    LOGIN_ADMIN: () => `${API_URL_BASE}/api/login_admin.php`,
    LOGIN_CHEF_FILIERE: () => `${API_URL_BASE}/api/login_chef_filiere.php`,
    LOGIN_DOYEN: () => `${API_URL_BASE}/api/login_doyen.php`,
    VERIFY_SESSION: () => `${API_URL_BASE}/api/verify_session.php`,
    LOGOUT: () => `${API_URL_BASE}/api/logout.php`,

    // URLs secrétariat
    UPLOAD_DOCUMENT: () => `${API_URL_BASE}/api/upload_document.php`,
    // URLs pour les publications
    API_PUBLICATIONS: () => `${API_URL_BASE}/api/publications.php`,
    
    // URLs des uploads pour publications
    UPLOADS_PUBLICATIONS: () => `${API_URL_BASE}/uploads/publications`,

      // URLs des uploads pour enseignants
      UPLOADS_DOCUMENTS_ENSEIGNANTS: () => `${API_URL_BASE}/uploads/documents_enseignants`,

      VERIFY_MATRICULE: () => `${API_URL_BASE}/api/verify_matricule.php`,

    
    // URLs pour les enseignants
    INSCRIPTION_ENSEIGNANT: () => `${API_URL_BASE}/api/inscription_enseignant.php`,
    GET_ENSEIGNANTS: () => `${API_URL_BASE}/api/get_enseignants.php`,
    GET_ONE_ENSEIGNANTS: () => `${API_URL_BASE}/api/get_enseignants.php?id=${id}`,
    VALIDER_ENSEIGNANT: () => `${API_URL_BASE}/api/valider_enseignant.php`,
    REJETER_ENSEIGNANT: () => `${API_URL_BASE}/api/rejeter_enseignant.php`,
    MODIFIER_ENSEIGNANT: () => `${API_URL_BASE}/api/modifier_enseignant.php`,
    
    // Nouveaux endpoints pour les publications
  PUBLICATIONS: () => `${API_URL_BASE}/api/publications.php`,
  INCREMENT_DOWNLOADS: (publicationId) => `${API_URL_BASE}/api/publications/${publicationId}/download.php`,

  // Personnel
  SECRETAIRES: () => `${API_URL_BASE}/api/secretaires.php`,
  DIRECTEURS_ETUDE: () => `${API_URL_BASE}/api/directeurs-etude.php`,
  CHEFS_FILIERE: () => `${API_URL_BASE}/api/chefs-filiere.php`,

  // Paramètres administrateur
  ADMIN_SETTINGS: () => `${API_URL_BASE}/api/admin_settings.php`,

  EPREUVES: () => `${API_URL_BASE}/api/epreuves.php`,
  UPLOADS: () => `${API_URL_BASE}/uploads/`,
  CRUD_EPREUVES_ENSEIGNANT: () => `${API_URL_BASE}/api/enseignant_epreuves.php`,
  CRUD_PUBLICATION_ENSEIGNANT: () => `${API_URL_BASE}/api/enseignant_publications.php`,
  UPLOAD_EPREUVES_ENSEIGNANT: (id) => `${API_URL_BASE}/api/enseignant_epreuves.php?enseignant_id=${id}`,
  CRUD_PUBLICATION_ENSEIGNANT_KEY: (id) => `${API_URL_BASE}/api/enseignant_publications.php?enseignant_id=${id}`,
  CRUD_EPREUVES_ENSEIGNANT_KEY: (id) => `${API_URL_BASE}/api/enseignant_epreuves.php?enseignant_id=${id}`,
  LOGIN_ENSEIGNANT: (id) => `${API_URL_BASE}/api/login_enseignant.php`,

  API_ANNONCES: () => `${API_URL_BASE}/api/annonces.php`,



};