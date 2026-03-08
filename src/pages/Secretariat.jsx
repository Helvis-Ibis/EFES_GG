import React, { useState, useCallback, useEffect } from 'react';
import { Search, CheckCircle, XCircle, User, Calendar, Mail, Phone, MapPin, BookOpen, FileText, Filter, Download, Eye, Camera, Upload, Loader2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { URL_BASE , API_URL_BASE} from '../api/api';
import axios from 'axios';
import {anneesAcademiques , filieres} from '../data/news'; 

import { useLocation } from 'react-router-dom';

const Secretariat = () => {
  const [secretaire, setSecretaire] = useState({});
  const [activeTab, setActiveTab] = useState('inscriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAnnee, setFilterAnnee] = useState('all');
  const [filterFiliere, setFilterFiliere] = useState('all');
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [inscriptionToReject, setInscriptionToReject] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [recuFile, setRecuFile] = useState(null);
  const [recuPreview, setRecuPreview] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [inscriptionToValidate, setInscriptionToValidate] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingDocuments, setUploadingDocuments] = useState({});
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);

  // États pour les enseignants
  const [enseignants, setEnseignants] = useState([]);
  const [loadingEnseignants, setLoadingEnseignants] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [showValidationModalEnseignant, setShowValidationModalEnseignant] = useState(false);
  const [enseignantToValidate, setEnseignantToValidate] = useState(null);
  const [showRefusalModalEnseignant, setShowRefusalModalEnseignant] = useState(false);
  const [enseignantToReject, setEnseignantToReject] = useState(null);
  const [refusalReasonEnseignant, setRefusalReasonEnseignant] = useState('');
  const [editingEnseignant, setEditingEnseignant] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();


  


 useEffect ( () => {
  location.state?.user ? setSecretaire(location.state.user) : navigate('/LoginSecretaire');
 },[])


 // Fonctions pour gérer les modals d'étudiants
const ouvrirModalValidation = (id) => {
  setInscriptionToValidate(id);
  setShowValidationModal(true);
  setRecuFile(null);
  setRecuPreview(null);
  setSelectedDocuments({});
  setDocumentPreviews({});
};

const ouvrirModalRefus = (id) => {
  setInscriptionToReject(id);
  setShowRefusalModal(true);
  setRefusalReason('');
};

// Fonction pour gérer le changement de reçu
const handleRecuChange = (e) => {
  const file = e.target.files[0];
  
  if (!file) {
    setRecuFile(null);
    setRecuPreview(null);
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    alert('Format de fichier non supporté. Utilisez JPG, JPEG, PNG ou PDF.');
    e.target.value = '';
    return;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('Le reçu ne doit pas dépasser 10 Mo.');
    e.target.value = '';
    return;
  }

  setRecuFile(file);

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setRecuPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    setRecuPreview(null);
  }
};

// Fonction pour gérer les documents des étudiants
const handleDocumentChange = (e, etudiantId, documentType) => {
  const file = e.target.files[0];
  const key = `${etudiantId}_${documentType}`;
  
  if (!file) {
    setSelectedDocuments(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    setDocumentPreviews(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    alert('Format de fichier non supporté. Utilisez JPG, JPEG, PNG ou PDF.');
    e.target.value = '';
    return;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('Le document ne doit pas dépasser 10 Mo.');
    e.target.value = '';
    return;
  }

  setSelectedDocuments(prev => ({ ...prev, [key]: file }));

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocumentPreviews(prev => ({ ...prev, [key]: e.target.result }));
    };
    reader.readAsDataURL(file);
  } else {
    setDocumentPreviews(prev => ({ ...prev, [key]: null }));
  }
};

// Fonction pour valider une inscription
const validerInscription = async (id) => {
  if (!recuFile) {
    alert('Veuillez sélectionner un reçu d\'inscription');
    return;
  }

  const formData = new FormData();
  formData.append('etudiant_id', id);
  formData.append('recu_inscription', recuFile);

  // Ajouter les documents supplémentaires sélectionnés
  Object.keys(selectedDocuments).forEach(key => {
    if (key.startsWith(`${id}_`)) {
      const documentType = key.replace(`${id}_`, '');
      const file = selectedDocuments[key];
      formData.append(documentType, file);
    }
  });

  try {
    setGlobalLoading(true);
    const response = await fetch(URL_BASE.VALIDER_INSCRIPTION(), {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Mettre à jour l'état local
      setInscriptions(inscriptions.map(ins => 
        ins.id === id 
          ? { 
              ...ins, 
              statut: 'validee',
              matricule: data.matricule,
              recuInscription: data.recu_nom,
              documents: ins.documents.map(doc => ({
                ...doc,
                statut: 'valide',
                url: data.document_urls?.[doc.type] || doc.url
              }))
            }
          : ins
      ));
      
      setShowValidationModal(false);
      setRecuFile(null);
      setRecuPreview(null);
      setSelectedDocuments({});
      setDocumentPreviews({});
      
      Swal.fire({
        title: 'Succès !',
        text: 'Inscription validée avec succès !',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then( (result) => {
        if(result.isConfirmed){
          window.location.reload()
        }
      });
    } else {
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur: ' + data.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    Swal.fire({
      title: 'Erreur',
      text: 'Erreur de connexion au serveur.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    setGlobalLoading(false);
  }
};
// Fonction pour rejeter une inscription
const rejeterInscription = async () => {
  if (!refusalReason.trim()) {
    Swal.fire({
      title: 'Raison manquante',
      text: 'Veuillez saisir la raison du refus',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
    return;
  }
  try {
    setGlobalLoading(true);
    const response = await fetch(URL_BASE.REJETER_ETUDIANT(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        etudiant_id: inscriptionToReject,
        raison_refus: refusalReason
      })
    });

    const data = await response.json();

    if (data.success) {
      setInscriptions(inscriptions.map(ins => 
        ins.id === inscriptionToReject 
          ? { ...ins, statut: 'rejetee', raisonRefus: refusalReason }
          : ins
      ));
      setShowRefusalModal(false);
      setSelectedInscription(null);
      setRefusalReason('');
      setInscriptionToReject(null);
      Swal.fire({
        title: 'Succès !',
        text: 'Inscription rejetée avec succès.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then( (result) => {
        if(result.isConfirmed){
          window.location.reload()
        }
      });
    } else {
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur: ' + data.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  } catch (error) {
    console.error('Erreur lors du rejet:', error);
    Swal.fire({
      title: 'Erreur',
      text: 'Erreur de connexion au serveur.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    setGlobalLoading(false);
  }
};

// Fonction pour mettre à jour un étudiant
const mettreAJourEtudiant = (id, nouvellesInfos) => {
  setInscriptions(inscriptions.map(ins => 
    ins.id === id 
      ? { 
          ...ins, 
          ...nouvellesInfos,
          nom: nouvellesInfos.nom || ins.nom,
          prenom: nouvellesInfos.prenom || ins.prenom,
          email: nouvellesInfos.email || ins.email,
          telephone: nouvellesInfos.telephone || ins.telephone,
          dateNaissance: nouvellesInfos.dateNaissance || ins.dateNaissance,
          lieuNaissance: nouvellesInfos.lieuNaissance || ins.lieuNaissance,
          adresse: nouvellesInfos.adresse || ins.adresse,
          anneeAcademique: nouvellesInfos.anneeAcademique || ins.anneeAcademique,
          filiere: nouvellesInfos.filiere || ins.filiere
        }
      : ins
  ));
  setEditingStudent(null);
};

  // Ajouter cette fonction après les autres fonctions pour les enseignants
const mettreAJourEnseignant = (id, nouvellesInfos) => {
  setEnseignants(enseignants.map(ens => 
    ens.id === id 
      ? { 
          ...ens, 
          ...nouvellesInfos,
          nom: nouvellesInfos.nom || ens.nom,
          prenom: nouvellesInfos.prenom || ens.prenom,
          email: nouvellesInfos.email || ens.email,
          telephone: nouvellesInfos.telephone || ens.telephone,
          dateNaissance: nouvellesInfos.dateNaissance || ens.dateNaissance,
          lieuNaissance: nouvellesInfos.lieuNaissance || ens.lieuNaissance,
          adresse: nouvellesInfos.adresse || ens.adresse,
          diplome: nouvellesInfos.diplome || ens.diplome,
          specialite: nouvellesInfos.specialite || ens.specialite,
          anneeExperience: nouvellesInfos.anneeExperience || ens.anneeExperience,
          filiereEnseignee: nouvellesInfos.filiereEnseignee || ens.filiereEnseignee,
          coursEnseignes: nouvellesInfos.coursEnseignes || ens.coursEnseignes
        }
      : ens
  ));
  setEditingEnseignant(null);
};

  // Récupérer les étudiants depuis l'API
  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await axios.get(URL_BASE.GET_ETUDIANTS(), {
        headers: { 'Accept': 'application/json' },
      });
  
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        const transformedData = data.data.map(etudiant => ({
          id: etudiant.id,
          nom: etudiant.nom,
          prenom: etudiant.prenoms,
          dateNaissance: etudiant.date_naissance,
          lieuNaissance: etudiant.lieu_naissance,
          email: etudiant.email,
          telephone: etudiant.telephone,
          adresse: etudiant.adresse_complete,
          anneeAcademique: getAnneeAcademique(etudiant.filiere_choisie),
          filiere: etudiant.filiere_choisie,
          dateInscription: formatDate(etudiant.date_inscription),
          statut: etudiant.statut || 'en_attente',
          matricule: etudiant.numero_matricule,
          raisonRefus: etudiant.raison_refus || '',
          photo: etudiant.photo_nom,
          recuInscription: etudiant.recu_inscription_nom,
          documents: [
            { 
              nom: 'Acte de naissance', 
              type: 'acte_naissance', 
              url: etudiant.acte_naissance_url || '#', 
              statut: etudiant.acte_naissance_nom ? 'valide' : 'en_attente' 
            },
            { 
              nom: 'Carte CIP', 
              type: 'cip', 
              url: etudiant.cip_url || '#', 
              statut: etudiant.cip_nom ? 'valide' : 'en_attente' 
            },
            { 
              nom: 'Diplôme de Bac', 
              type: 'diplome_bac', 
              url: etudiant.diplome_bac_url || '#', 
              statut: etudiant.diplome_bac_nom ? 'valide' : 'en_attente' 
            },
            { 
              nom: 'Photo d\'identité', 
              type: 'photo', 
              url: etudiant.photo_url ? `${URL_BASE.UPLOADS_PHOTOS()}/${etudiant.photo_url}` : '#', 
              statut: etudiant.photo_nom ? 'valide' : 'en_attente' 
            }
          ]
        }));
  
        setInscriptions(transformedData);
      } else {
        setInscriptions([]);
      }
  
    } catch (error) {
      setError(error.message);
      setInscriptions([
        {
          id: 1,
          nom: 'TEST',
          prenom: 'Utilisateur',
          dateNaissance: '2000-01-01',
          lieuNaissance: 'Cotonou',
          email: 'test@email.com',
          telephone: '+229 01 23 45 67',
          adresse: 'Adresse test',
          anneeAcademique: '1ere année',
          filiere: 'Philosophie',
          dateInscription: '2024-01-01',
          statut: 'en_attente',
          matricule: null,
          raisonRefus: '',
          photo: null,
          recuInscription: null,
          documents: [
            { nom: 'Acte de naissance', type: 'acte_naissance', url: '#', statut: 'en_attente' },
            { nom: 'Carte CIP', type: 'cip', url: '#', statut: 'en_attente' },
            { nom: 'Diplôme de Bac', type: 'diplome_bac', url: '#', statut: 'en_attente' },
            { nom: 'Photo d\'identité', type: 'photo', url: '#', statut: 'en_attente' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les enseignants depuis l'API
  const fetchEnseignants = async () => {
    try {
      setLoadingEnseignants(true);
      const response = await axios.get(URL_BASE.GET_ENSEIGNANTS(), {
        headers: { 'Accept': 'application/json' },
      });

      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        const transformedData = data.data.map(enseignant => ({
          id: enseignant.id,
          nom: enseignant.nom,
          prenom: enseignant.prenoms,
          dateNaissance: enseignant.date_naissance,
          lieuNaissance: enseignant.lieu_naissance,
          email: enseignant.email,
          telephone: enseignant.telephone,
          adresse: enseignant.adresse_complete,
          diplome: enseignant.diplome,
          specialite: enseignant.specialite,
          anneeExperience: enseignant.annee_experience,
          filiereEnseignee: enseignant.filiere_enseignee,
          coursEnseignes: enseignant.cours_enseignes,
          dateCandidature: formatDate(enseignant.date_creation),
          statut: enseignant.statut || 'en_attente',
          raisonRefus: enseignant.raison_refus || '',
          photo: enseignant.photo_nom,
          documents: [
            { 
              nom: 'Curriculum Vitae', 
              type: 'cv', 
              url: enseignant.cv_url || '#', 
              statut: enseignant.cv_nom ? 'valide' : 'en_attente' 
            },
            { 
              nom: 'Diplôme le plus élevé', 
              type: 'diplome', 
              url: enseignant.diplome_url || '#', 
              statut: enseignant.diplome_nom ? 'valide' : 'en_attente' 
            },
            { 
              nom: 'Certificat de nationalité', 
              type: 'certificat_nationalite', 
              url: enseignant.certificat_nationalite_url || '#', 
              statut: enseignant.certificat_nationalite_nom ? 'valide' : 'en_attente' 
            },
            { 
              nom: 'Photo d\'identité', 
              type: 'photo', 
              url: enseignant.photo_url ? `${URL_BASE.UPLOADS_PHOTOS_ENSEIGNANTS()}/${enseignant.photo_url}` : '#', 
              statut: enseignant.photo_nom ? 'valide' : 'en_attente' 
            }
          ]
        }));

        setEnseignants(transformedData);
      } else {
        setEnseignants([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
      // Données de test
      setEnseignants([
        {
          id: 1,
          nom: 'KOUASSI',
          prenom: 'Jean',
          dateNaissance: '1980-05-15',
          lieuNaissance: 'Abidjan',
          email: 'jean.kouassi@email.com',
          telephone: '+225 07 89 45 12',
          adresse: 'Abidjan, Plateau',
          diplome: 'Doctorat en Philosophie',
          specialite: 'Philosophie contemporaine',
          anneeExperience: 10,
          filiereEnseignee: 'Philosophie',
          coursEnseignes: 'Épistémologie, Philosophie morale, Logique',
          dateCandidature: '2024-01-15',
          statut: 'en_attente',
          raisonRefus: '',
          photo: null,
          documents: [
            { nom: 'Curriculum Vitae', type: 'cv', url: '#', statut: 'en_attente' },
            { nom: 'Diplôme le plus élevé', type: 'diplome', url: '#', statut: 'en_attente' },
            { nom: 'Certificat de nationalité', type: 'certificat_nationalite', url: '#', statut: 'en_attente' },
            { nom: 'Photo d\'identité', type: 'photo', url: '#', statut: 'en_attente' }
          ]
        }
      ]);
    } finally {
      setLoadingEnseignants(false);
    }
  };
  
  useEffect(() => {
    fetchEtudiants();
    fetchEnseignants();
  }, []);

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      const date = new Date(dateString);
      const datePart = date.toLocaleDateString('fr-FR');
      const timePart = date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `${datePart} à ${timePart} min`;
    } catch {
      return dateString;
    }
  };


  const handleLogout = () => {
    // Nettoyer toutes les données d'authentification
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_role');
    
    // Rediriger vers la page de connexion
    navigate('/LoginSecretaire');
  };

// Utilisations :
// formatDate(dateString) // "25/12/2024 à 14:30"
// formatDate(dateString, { hour: '2-digit', minute: '2-digit' }) // "25/12/2024, 14:30"
// formatDate(dateString, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) // "mercredi 25 décembre 2024"

  const getAnneeAcademique = (filiere) => {
    return filiere || '1ere année';
  };

  // Gestion des documents pour enseignants
  const handleDocumentChangeEnseignant = (e, enseignantId, documentType) => {
    const file = e.target.files[0];
    const key = `enseignant_${enseignantId}_${documentType}`;
    
    if (!file) {
      setSelectedDocuments(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      setDocumentPreviews(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format de fichier non supporté. Utilisez JPG, JPEG, PNG ou PDF.');
      e.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Le document ne doit pas dépasser 10 Mo.');
      e.target.value = '';
      return;
    }

    setSelectedDocuments(prev => ({ ...prev, [key]: file }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews(prev => ({ ...prev, [key]: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews(prev => ({ ...prev, [key]: null }));
    }
  };

  // Valider un enseignant avec tous les documents
  const validerEnseignant = async (id) => {
    const formData = new FormData();
    formData.append('enseignant_id', id);

    // Ajouter tous les documents sélectionnés pour cet enseignant
    Object.keys(selectedDocuments).forEach(key => {
      if (key.startsWith(`enseignant_${id}_`)) {
        const documentType = key.replace(`enseignant_${id}_`, '');
        const file = selectedDocuments[key];
        formData.append(documentType, file);
      }
    });

    try {
      setGlobalLoading(true);
      const response = await fetch(URL_BASE.VALIDER_ENSEIGNANT(), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setEnseignants(enseignants.map(ens => 
          ens.id === id 
            ? { 
                ...ens, 
                statut: 'validee',
                documents: ens.documents.map(doc => ({
                  ...doc,
                  statut: 'valide',
                  url: data.document_url || doc.url
                }))
              }
            : ens
        ));
        
        setShowValidationModalEnseignant(false);
        setSelectedDocuments({});
        setDocumentPreviews({});
        
       // alert('Enseignant validé avec succès !');

       Swal.fire({
        title: 'Enseignant validé avec succès !',
        text: 'L\'enseignant a été validé avec succès.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload();
        }
      });

      } else {
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur: ' + data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur de connexion au serveur.');
    } finally {
      setGlobalLoading(false);
    }
  };

    // Filtrer les inscriptions
    const inscriptionsFiltrees = inscriptions.filter(ins => {
      const matchSearch = ins.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ins.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ins.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterStatus === 'all' || ins.statut === filterStatus;
      const matchAnnee = filterAnnee === 'all' || ins.anneeAcademique === filterAnnee;
      const matchFiliere = filterFiliere === 'all' || ins.filiere === filterFiliere;
      
      return matchSearch && matchFilter && matchAnnee && matchFiliere;
    });

  // Rejeter un enseignant avec raison
  const rejeterEnseignant = async () => {
    if (!refusalReasonEnseignant.trim()) {
      alert('Veuillez saisir la raison du refus');
      return;
    }

    try {
      setGlobalLoading(true);
      const response = await fetch(URL_BASE.REJETER_ENSEIGNANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enseignant_id: enseignantToReject,
          raison_refus: refusalReasonEnseignant
        })
      });

      const response2 = await fetch(URL_BASE.API_SEBD_MAIL_REFUS(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: enseignantToReject,
          sms: refusalReasonEnseignant
        })
      });

      const data = await response.json();
      const data2 = await response2.json();

      if(data2){
        
      }

      if (data.success) {
        setEnseignants(enseignants.map(ens => 
          ens.id === enseignantToReject 
            ? { ...ens, statut: 'rejetee', raisonRefus: refusalReasonEnseignant }
            : ens
        ));
        setShowRefusalModalEnseignant(false);
        setSelectedEnseignant(null);
        setRefusalReasonEnseignant('');
        setEnseignantToReject(null);
        alert('Candidature rejetée avec succès.');
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur de connexion au serveur.');
    } finally {
      setGlobalLoading(false);
    }
  };

  // Composant pour visualiser et uploader les documents des enseignants
  const DocumentViewerEnseignant = ({ document, enseignantId, canUpload = false }) => {
    const documentKey = `enseignant_${enseignantId}_${document.type}`;
    const selectedFile = selectedDocuments[documentKey];
    const documentPreview = documentPreviews[documentKey];

    const getDocumentIcon = (type) => {
      const icons = {
        'cv': '📄',
        'diplome': '🎓',
        'certificat_nationalite': '📋',
        'photo': '🖼️'
      };
      return icons[type] || '📄';
    };

    const getDocumentLabel = (type) => {
      const labels = {
        'cv': 'Curriculum Vitae',
        'diplome': 'Diplôme le plus élevé',
        'certificat_nationalite': 'Certificat de nationalité',
        'photo': 'Photo d\'identité'
      };
      return labels[type] || document.nom;
    };

    return (
      <div className="flex flex-col bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getDocumentIcon(document.type)}</div>
            <div>
              <span className="font-medium text-gray-900">{getDocumentLabel(document.type)}</span>
              <div className="text-xs text-gray-500 uppercase">{document.type}</div>
            </div>
          </div>
          
          {document.statut === 'valide' ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              ✓ Validé
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              En attente
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {document.url && document.url !== '#' && (
            <button 
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
              onClick={() => window.open(`${API_URL_BASE+document.url}`, '_blank')}
            >
              <Eye className="w-4 h-4" />
              Voir le document
            </button>
          )}
          
          {canUpload && document.statut !== 'valide' && (
            <div className="flex-1">
              <input
                type="file"
                id={`document-enseignant-${enseignantId}-${document.type}`}
                onChange={(e) => handleDocumentChangeEnseignant(e, enseignantId, document.type)}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <label 
                htmlFor={`document-enseignant-${enseignantId}-${document.type}`}
                className="block w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm text-center cursor-pointer"
              >
                {selectedFile ? 'Fichier sélectionné' : 'Choisir un fichier'}
              </label>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">
                  📎 {selectedFile.name}
                </p>
                <p className="text-blue-600 text-xs">
                  Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Prêt pour validation
              </span>
            </div>
            
            {documentPreview && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <label className="block text-xs text-blue-700 mb-1">Aperçu:</label>
                <img 
                  src={documentPreview} 
                  alt="Preview document" 
                  className="max-w-full max-h-32 object-contain rounded border border-blue-300"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Modal pour la validation avec reçu et documents
  const ModalValidation = () => {
    if (!showValidationModal) return null;

    const currentStudent = inscriptions.find(ins => ins.id === inscriptionToValidate);
    const hasSelectedDocuments = Object.keys(selectedDocuments).some(key => 
      key.startsWith(`${inscriptionToValidate}_`)
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
            <h3 className="text-xl font-bold">Validation d'inscription</h3>
            {currentStudent && (
              <p className="text-green-100 mt-1">
                {currentStudent.nom} {currentStudent.prenom} - {currentStudent.filiere}
              </p>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Section Reçu d'inscription */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reçu d'inscription <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  id="recu"
                  name="recu"
                  onChange={handleRecuChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />
                <label 
                  htmlFor="recu"
                  className="cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Cliquez pour importer le reçu d'inscription
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formats acceptés: JPG, JPEG, PNG, PDF
                    </p>
                    <p className="text-xs text-gray-500">
                      Taille maximale: 10 Mo
                    </p>
                  </div>
                </label>
              </div>

              {recuFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">
                    ✓ Reçu sélectionné: {recuFile.name}
                  </p>
                  <p className="text-green-600 text-xs">
                    Taille: {(recuFile.size / 1024 / 1024).toFixed(2)} Mo
                  </p>
                </div>
              )}

              {recuPreview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu du reçu
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                    <img 
                      src={recuPreview} 
                      alt="Preview reçu" 
                      className="mx-auto max-w-full max-h-48 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section Documents supplémentaires */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents supplémentaires (optionnels)
              </h4>
              <div className="space-y-4">
                {currentStudent?.documents.map((doc, index) => (
                  <DocumentViewer 
                    key={index} 
                    document={doc} 
                    etudiantId={inscriptionToValidate}
                    canUpload={true}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowValidationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => validerInscription(inscriptionToValidate)}
                disabled={!recuFile || globalLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {globalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {globalLoading ? 'Validation en cours...' : 'Valider l\'inscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de validation pour enseignant
  const ModalValidationEnseignant = () => {
    if (!showValidationModalEnseignant) return null;

    const currentEnseignant = enseignants.find(ens => ens.id === enseignantToValidate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
            <h3 className="text-xl font-bold">Validation de candidature enseignant</h3>
            {currentEnseignant && (
              <p className="text-purple-100 mt-1">
                {currentEnseignant.nom} {currentEnseignant.prenom} - {currentEnseignant.filiereEnseignee}
              </p>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Section Documents requis */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Documents requis pour la validation
              </h4>
              <div className="space-y-4">
                {currentEnseignant?.documents.map((doc, index) => (
                  <DocumentViewerEnseignant 
                    key={index} 
                    document={doc} 
                    enseignantId={enseignantToValidate}
                    canUpload={true}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowValidationModalEnseignant(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => validerEnseignant(enseignantToValidate)}
                disabled={globalLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {globalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {globalLoading ? 'Validation en cours...' : 'Valider la candidature'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Modal de refus avec raison
  const ModalRefus = () => {
    if (!showRefusalModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
            <h3 className="text-xl font-bold">Raison du refus</h3>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Veuillez indiquer la raison du refus :
            </label>
            <textarea
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              placeholder="Saisissez la raison du refus de l'inscription..."
              required
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefusalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={rejeterInscription}
                disabled={globalLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {globalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {globalLoading ? 'Traitement...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Modal de refus pour enseignant
  const ModalRefusEnseignant = () => {
    if (!showRefusalModalEnseignant) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
            <h3 className="text-xl font-bold">Raison du refus</h3>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Veuillez indiquer la raison du refus de la candidature :
            </label>
            <textarea
              value={refusalReasonEnseignant}
              onChange={(e) => setRefusalReasonEnseignant(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              placeholder="Saisissez la raison du refus de la candidature..."
              required
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefusalModalEnseignant(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={rejeterEnseignant}
                disabled={globalLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {globalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {globalLoading ? 'Traitement...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Modal de détails d'inscription
  const ModalDetails = () => {
    if (!selectedInscription) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Détails de l'inscription</h3>
              <button
                onClick={() => setSelectedInscription(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Statut actuel */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Statut actuel</span>
                <StatutBadge statut={selectedInscription.statut} />
              </div>
              {selectedInscription.matricule && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Matricule attribué</div>
                  <div className="text-lg font-mono font-bold text-blue-600 mt-1">
                    {selectedInscription.matricule}
                  </div>
                </div>
              )}
              {selectedInscription.statut === 'rejetee' && selectedInscription.raisonRefus && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Raison du refus</div>
                  <div className="text-red-600 mt-1 p-3 bg-red-50 rounded-lg">
                    {selectedInscription.raisonRefus}
                  </div>
                </div>
              )}
            </div>

            {/* Informations personnelles */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nom complet</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.nom} {selectedInscription.prenom}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date de naissance</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.dateNaissance}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lieu de naissance</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.lieuNaissance}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adresse</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.adresse}</div>
                </div>
              </div>
            </div>

            {/* Informations académiques */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Informations académiques
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Année académique</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.anneeAcademique}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Filière</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.filiere}</div>
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.email}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Téléphone</div>
                  <div className="font-semibold text-gray-900">{selectedInscription.telephone}</div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents fournis
              </h4>
              <div className="space-y-4">
                {selectedInscription.documents.map((doc, index) => (
                  <DocumentViewer 
                    key={index} 
                    document={doc} 
                    etudiantId={selectedInscription.id}
                    canUpload={false}
                  />
                ))}
              </div>
            </div>

            {/* Section reçu d'inscription */}
            {selectedInscription.recuInscription && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Reçu d'inscription
                </h4>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-700 font-medium">Reçu validé</div>
                      <div className="text-xs text-green-600">Document disponible</div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                      onClick={() => window.open(`${URL_BASE.UPLOADS_RECU()}/${selectedInscription.recuInscription}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                      Voir le reçu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedInscription.statut === 'en_attente' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => ouvrirModalValidation(selectedInscription.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Valider avec reçu
                </button>
                <button
                  onClick={() => ouvrirModalRefus(selectedInscription.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal pour modifier les informations de l'enseignant
const ModalModificationEnseignant = () => {
  if (!editingEnseignant) return null;

  const [formData, setFormData] = useState({
    nom: editingEnseignant.nom,
    prenom: editingEnseignant.prenom,
    email: editingEnseignant.email,
    telephone: editingEnseignant.telephone,
    dateNaissance: editingEnseignant.dateNaissance,
    lieuNaissance: editingEnseignant.lieuNaissance,
    adresse: editingEnseignant.adresse,
    diplome: editingEnseignant.diplome,
    specialite: editingEnseignant.specialite,
    anneeExperience: editingEnseignant.anneeExperience,
    filiereEnseignee: editingEnseignant.filiereEnseignee,
    coursEnseignes: editingEnseignant.coursEnseignes
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(URL_BASE.MODIFIER_ENSEIGNANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enseignant_id: editingEnseignant.id,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour l'état local
        mettreAJourEnseignant(editingEnseignant.id, formData);
        Swal.fire({
          title: 'Enseignant modifié avec succès !',
          text: 'Les informations de l\'enseignant ont été mises à jour avec succès.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur: ' + data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur: ' + error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setError('Erreur de connexion au serveur'+error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
          <h3 className="text-xl font-bold">Modifier les informations de l'enseignant</h3>
          <p className="text-purple-100 text-sm mt-1">
            {editingEnseignant.nom} {editingEnseignant.prenom}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Informations personnelles</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  name="lieuNaissance"
                  value={formData.lieuNaissance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            {/* Informations professionnelles et contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Informations professionnelles</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diplôme *
                </label>
                <input
                  type="text"
                  name="diplome"
                  value={formData.diplome}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité *
                </label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  name="anneeExperience"
                  value={formData.anneeExperience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filière enseignée *
                </label>
                <select
                  name="filiereEnseignee"
                  value={formData.filiereEnseignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Sélectionnez une filière</option>
                  {filieres.map(filiere => (
                    <option key={filiere} value={filiere}>{filiere}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cours enseignés
                </label>
                <textarea
                  name="coursEnseignes"
                  value={formData.coursEnseignes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Séparer les cours par des virgules"
                />
              </div>

              <h4 className="font-semibold text-gray-900 border-b pb-2 pt-4">Coordonnées</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setEditingEnseignant(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  // Composant pour modifier les informations de l'étudiant
const ModalModificationEtudiant = () => {
  if (!editingStudent) return null;

  const [formData, setFormData] = useState({
    nom: editingStudent.nom,
    prenom: editingStudent.prenom,
    email: editingStudent.email,
    telephone: editingStudent.telephone,
    dateNaissance: editingStudent.dateNaissance,
    lieuNaissance: editingStudent.lieuNaissance,
    adresse: editingStudent.adresse,
    anneeAcademique: editingStudent.anneeAcademique,
    filiere: editingStudent.filiere
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(URL_BASE.MODIFIER_ETUDIANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etudiant_id: editingStudent.id,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour l'état local
        mettreAJourEtudiant(editingStudent.id, formData);
        alert('Informations mises à jour avec succès !');
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setError('Erreur de connexion au serveur'+error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <h3 className="text-xl font-bold">Modifier les informations de l'étudiant</h3>
          <p className="text-blue-100 text-sm mt-1">
            {editingStudent.nom} {editingStudent.prenom}
            {editingStudent.matricule && ` - ${editingStudent.matricule}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Informations personnelles</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  name="lieuNaissance"
                  value={formData.lieuNaissance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Informations de contact et académiques */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Contact & Académique</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année académique
                </label>
                <select
                  name="anneeAcademique"
                  value={formData.anneeAcademique}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {anneesAcademiques.map(annee => (
                    <option key={annee} value={annee}>{annee}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filière
                </label>
                <select
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {filieres.map(filiere => (
                    <option key={filiere} value={filiere}>{filiere}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-white rounded-lg bg-red-500 transition"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


  // Modal de détails pour enseignant
  const ModalDetailsEnseignant = () => {
    if (!selectedEnseignant) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Détails de la candidature</h3>
              <button
                onClick={() => setSelectedEnseignant(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Statut actuel */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Statut actuel</span>
             
                <StatutBadge statut={selectedEnseignant.statut} />
              </div>
              {selectedEnseignant.statut === 'rejetee' && selectedEnseignant.raisonRefus && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Raison du refus</div>
                  <div className="text-red-600 mt-1 p-3 bg-red-50 rounded-lg">
                    {selectedEnseignant.raisonRefus}
                  </div>
                </div>
              )}
            </div>

            {/* Informations personnelles */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nom complet</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.nom} {selectedEnseignant.prenom}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date de naissance</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.dateNaissance}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lieu de naissance</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.lieuNaissance}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adresse</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.adresse}</div>
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Informations professionnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Diplôme</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.diplome}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Spécialité</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.specialite}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Années d'expérience</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.anneeExperience} ans</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Filière enseignée</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.filiereEnseignee}</div>
                </div>
              </div>
              {selectedEnseignant.coursEnseignes && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cours enseignés</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.coursEnseignes}</div>
                </div>
              )}
            </div>

            {/* Informations de contact */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.email}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Téléphone</div>
                  <div className="font-semibold text-gray-900">{selectedEnseignant.telephone}</div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Documents fournis
              </h4>
              <div className="space-y-4">
                {selectedEnseignant.documents.map((doc, index) => (
                  <DocumentViewerEnseignant 
                    key={index} 
                    document={doc} 
                    enseignantId={selectedEnseignant.id}
                    canUpload={false}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            {selectedEnseignant.statut === 'en_attente' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEnseignantToValidate(selectedEnseignant.id);
                    setShowValidationModalEnseignant(true);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Valider la candidature
                </button>
                <button
                  onClick={() => {
                    setEnseignantToReject(selectedEnseignant.id);
                    setShowRefusalModalEnseignant(true);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Gestionnaire de recherche
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Gestionnaire des filtres
  const handleFilterStatusChange = useCallback((e) => {
    setFilterStatus(e.target.value);
  }, []);

  const handleFilterAnneeChange = useCallback((e) => {
    setFilterAnnee(e.target.value);
  }, []);

  const handleFilterFiliereChange = useCallback((e) => {
    setFilterFiliere(e.target.value);
  }, []);

  // Composant pour afficher le badge de statut
  const StatutBadge = ({ statut }) => {
    const styles = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      validee: 'bg-green-100 text-green-800 border-green-300',
      approuve: 'bg-green-100 text-green-800 border-green-300',
      rejetee: 'bg-red-100 text-red-800 border-red-300'
    };
    const labels = {
      en_attente: 'En attente',
      validee: 'Validée',
      approuve: 'Approuvée',
      rejetee: 'Rejetée'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[statut]}`}>
        {labels[statut]}
      </span>
    );
  };

  // Composant pour visualiser et uploader les documents
  const DocumentViewer = ({ document, etudiantId, canUpload = false }) => {
    const documentKey = `${etudiantId}_${document.type}`;
   // console.log(document);
    
    const selectedFile = selectedDocuments[documentKey];
    const documentPreview = documentPreviews[documentKey];

    const getDocumentIcon = (type) => {
      const icons = {
        'acte_naissance': '📋',
        'cip': '🆔', 
        'diplome_bac': '🎓',
        'photo': '🖼️',
        'pdf': '📄',
        'image': '🖼️'
      };
      return icons[type] || '📄';
    };

    const getDocumentLabel = (type) => {
      const labels = {
        'acte_naissance': 'Acte de naissance',
        'cip': 'Carte CIP',
        'diplome_bac': 'Diplôme de Bac ou Attestation',
        'photo': 'Photo d\'identité'
      };
      return labels[type] || document.nom;
    };

    return (
      <div className="flex flex-col bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getDocumentIcon(document.type)}</div>
            <div>
              <span className="font-medium text-gray-900">{getDocumentLabel(document.type)}</span>
              <div className="text-xs text-gray-500 uppercase">{document.type}</div>
            </div>
          </div>
          
          {document.statut === 'valide' ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              ✓ Validé
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              En attente
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {document.url && document.url !== '#' && (
            <button 
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
              onClick={() => window.open(`${API_URL_BASE+document.url}`, '_blank')}
            >
              <Eye className="w-4 h-4" />
              Voir le document
            </button>
          )}
          
          {canUpload && document.statut !== 'valide' && (
            <div className="flex-1">
              <input
                type="file"
                id={`document-${etudiantId}-${document.type}`}
                onChange={(e) => handleDocumentChange(e, etudiantId, document.type)}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <label 
                htmlFor={`document-${etudiantId}-${document.type}`}
                className="block w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm text-center cursor-pointer"
              >
                {selectedFile ? 'Fichier sélectionné' : 'Choisir un fichier'}
              </label>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">
                  📎 {selectedFile.name}
                </p>
                <p className="text-blue-600 text-xs">
                  Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Prêt pour validation
              </span>
            </div>
            
            {documentPreview && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <label className="block text-xs text-blue-700 mb-1">Aperçu:</label>
                <img 
                  src={documentPreview} 
                  alt="Preview document" 
                  className="max-w-full max-h-32 object-contain rounded border border-blue-300"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

    // Section Gestion des Inscriptions
    const SectionInscriptions = () => (
      <div className="space-y-6">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="validee">Validées</option>
                <option value="rejetee">Rejetées</option>
              </select>
              <select
                value={filterAnnee}
                onChange={handleFilterAnneeChange}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all duration-200"
              >
                <option value="all">Toutes les années</option>
                {anneesAcademiques.map(annee => (
                  <option key={annee} value={annee}>{annee}</option>
                ))}
              </select>
              <select
                value={filterFiliere}
                onChange={handleFilterFiliereChange}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all duration-200"
              >
                <option value="all">Toutes les filières</option>
                {filieres.map(filiere => (
                  <option key={filiere} value={filiere}>{filiere}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
  
        {/* État de chargement et erreur */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chargement des étudiants</h3>
            <p className="text-gray-600">Récupération des données en cours...</p>
          </div>
        )}
  
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-bold text-red-800">Erreur de chargement</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchEtudiants}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Statistiques rapides */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-700 text-sm font-medium">En attente</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-1">
                      {inscriptions.filter(i => i.statut === 'en_attente').length}
                    </p>
                  </div>
                  <div className="bg-yellow-200 p-3 rounded-lg">
                    <Filter className="w-6 h-6 text-yellow-700" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-sm font-medium">Validées</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {inscriptions.filter(i => i.statut === 'validee').length}
                    </p>
                  </div>
                  <div className="bg-green-200 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-sm font-medium">Rejetées</p>
                    <p className="text-3xl font-bold text-red-900 mt-1">
                      {inscriptions.filter(i => i.statut === 'rejetee').length}
                    </p>
                  </div>
                  <div className="bg-red-200 p-3 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-700" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-sm font-medium">Documents manquants</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {inscriptions.reduce((count, ins) => {
                        const missingDocs = ins.documents.filter(doc => doc.statut !== 'valide').length;
                        return count + missingDocs;
                      }, 0)}
                    </p>
                  </div>
                  <div className="bg-blue-200 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>
            </div>
  
            {/* Liste des inscriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {inscriptionsFiltrees.length === 0 ? (
                <div className="p-12 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun étudiant trouvé</h3>
                  <p className="text-gray-600">
                    {inscriptions.length === 0 
                      ? "Aucun étudiant n'est inscrit pour le moment." 
                      : "Aucun étudiant ne correspond aux critères de recherche."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Étudiant</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Année/Filière</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date inscription</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inscriptionsFiltrees.map((ins) => (
                        <tr key={ins.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{ins.nom} {ins.prenom}</div>
                                {ins.matricule && (
                                  <div className="text-xs text-gray-500 font-mono">{ins.matricule}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{ins.anneeAcademique}</div>
                            <div className="text-xs text-gray-500">{ins.filiere}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{ins.email}</div>
                            <div className="text-xs text-gray-500">{ins.telephone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ins.dateInscription}</td>
                          <td className="px-6 py-4">
                            <StatutBadge statut={ins.statut} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedInscription(ins)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                Détails
                              </button>
                              <button
                                onClick={() => setEditingStudent(ins)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                              >
                                Modifier
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  

  // Section Validation des Enseignants
  const SectionEnseignants = () => (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-all duration-200"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="validee">Validées</option>
              <option value="rejetee">Rejetées</option>
            </select>
            <select
              value={filterFiliere}
              onChange={(e) => setFilterFiliere(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-all duration-200"
            >
              <option value="all">Toutes les filières</option>
              {filieres.map(filiere => (
                <option key={filiere} value={filiere}>{filiere}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* État de chargement et erreur */}
      {loadingEnseignants && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chargement des enseignants</h3>
          <p className="text-gray-600">Récupération des données en cours...</p>
        </div>
      )}

      {/* Statistiques rapides */}
      {!loadingEnseignants && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-700 text-sm font-medium">En attente</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {enseignants.filter(e => e.statut === 'en_attente').length}
                  </p>
                </div>
                <div className="bg-yellow-200 p-3 rounded-lg">
                  <Filter className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Validées</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {enseignants.filter(e => e.statut === 'validee').length}
                  </p>
                </div>
                <div className="bg-green-200 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium">Rejetées</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">
                    {enseignants.filter(e => e.statut === 'rejetee').length}
                  </p>
                </div>
                <div className="bg-red-200 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Liste des enseignants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {enseignants.length === 0 ? (
              <div className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun enseignant trouvé</h3>
                <p className="text-gray-600">
                  Aucune candidature d'enseignant n'est enregistrée pour le moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Enseignant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Diplôme/Spécialité</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Filière/Expérience</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date candidature</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {enseignants
                      .filter(ens => {
                        const matchSearch = ens.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         ens.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         ens.email.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchFilter = filterStatus === 'all' || ens.statut === filterStatus;
                        const matchFiliere = filterFiliere === 'all' || ens.filiereEnseignee === filterFiliere;
                        return matchSearch && matchFilter && matchFiliere;
                      })
                      .map((ens) => (
                      <tr key={ens.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{ens.nom} {ens.prenom}</div>
                              <div className="text-xs text-gray-500">{ens.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{ens.diplome}</div>
                          <div className="text-xs text-gray-500">{ens.specialite}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{ens.filiereEnseignee}</div>
                          <div className="text-xs text-gray-500">{ens.anneeExperience} ans d'expérience</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ens.dateCandidature}</td>
                        <td className="px-6 py-4">
                          <StatutBadge statut={ens.statut} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedEnseignant(ens)}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                            >
                              Détails
                            </button>
                            <button
                              onClick={() => setEditingEnseignant(ens)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                            >
                              Modifier
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // ... (le reste du code existant pour les étudiants reste inchangé)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Secrétariat</h1>
              <p className="text-gray-600 mt-1">Gestion administrative et validation des inscriptions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Connecté en tant que</div>
                <div className="font-semibold text-gray-900"> { `${secretaire.nom +' '+ secretaire.prenom }` } ({ secretaire.role })</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                 <span style={{textTransform:'uppercase'}}>S{secretaire.role?.charAt(0)}</span>
              </div>
              <button 
  onClick={handleLogout} 
  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200"
>
  Se déconnecter
</button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="relative flex gap-1">
            <button
              onClick={() => setActiveTab('inscriptions')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'inscriptions'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Validation des inscriptions
              {activeTab === 'inscriptions' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('enseignants')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'enseignants'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Validation des enseignants
              {activeTab === 'enseignants' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'documents'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gestion des documents
              {activeTab === 'documents' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('autres')}
              className={`px-6 py-4 font-semibold transition relative ${
                activeTab === 'autres'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Autres actions
              {activeTab === 'autres' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'inscriptions' && <SectionInscriptions />}
        {activeTab === 'enseignants' && <SectionEnseignants />}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Gestion des documents</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              La gestion des documents est maintenant intégrée dans les sections "Validation des inscriptions" 
              et "Validation des enseignants". Vous pouvez uploader et gérer les documents directement depuis 
              les détails de chaque étudiant ou enseignant.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button 
                onClick={() => setActiveTab('inscriptions')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Voir les inscriptions
              </button>
              <button 
                onClick={() => setActiveTab('enseignants')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Voir les enseignants
              </button>
            </div>
          </div>
        )}
        {activeTab === 'autres' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Autres actions</h3>
            <p className="text-gray-600 max-w-md mx-auto">Ajoutez ici d'autres fonctionnalités administratives selon vos besoins.</p>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Configurer cette section
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ModalDetails />
      <ModalRefus />
      <ModalValidation />
      <ModalModificationEtudiant />
      <ModalDetailsEnseignant />
      <ModalRefusEnseignant />
      <ModalValidationEnseignant />
      <ModalModificationEnseignant />

      {/* Overlay de chargement global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-gray-700">Traitement en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Secretariat;