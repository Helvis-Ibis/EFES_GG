// src/pages/Admin.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, Plus, Edit, Trash2, Eye, Upload, FileText, 
  BookOpen, Users, Settings, BarChart, Download,Image,
  X, Check, AlertCircle, Search, Filter, User,
  Mail, Phone, MapPin, Lock, Key, Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { API_URL_BASE, URL_BASE } from '../api/api';
import { filieres } from '../data/news';


const Admin = () => {
  const [activeTab, setActiveTab] = useState('publications');
  const [publications, setPublications] = useState([]);
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    description: '',
    category: 'Etudiant(s)',
    file: "",
    fileName: 'aucun',
    isFeatured: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loading, setLoading] = useState(false);

  const [annonces, setAnnonces] = useState([]);
const [annonceFormData, setAnnonceFormData] = useState({
  id: null,
  title: '',
  description: '',
  images: [],
  imageFiles: []
});
const [isEditingAnnonce, setIsEditingAnnonce] = useState(false);
const [previewImages, setPreviewImages] = useState([]);

  const navigate = useNavigate();


  // Charger les annonces
const loadAnnonces = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${URL_BASE.API_ANNONCES()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.data.length > 0) {
        setAnnonces(data.data);
      }
    } else {
      throw new Error('Erreur lors du chargement des annonces');
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    setAnnonces([]);
  } finally {
    setLoading(false);
  }
};

// Gérer le changement des champs du formulaire annonce
const handleAnnonceInputChange = (e) => {
  const { name, value } = e.target;
  setAnnonceFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Gérer l'ajout d'images
const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  
  // Validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5 MB
  
  const validFiles = files.filter(file => {
    if (!validTypes.includes(file.type)) {
      Swal.fire('Erreur', `Le fichier ${file.name} n'est pas une image valide`, 'error');
      return false;
    }
    if (file.size > maxSize) {
      Swal.fire('Erreur', `Le fichier ${file.name} dépasse 5 MB`, 'error');
      return false;
    }
    return true;
  });

   // Créer des URLs de prévisualisation
   const previews = validFiles.map(file => URL.createObjectURL(file));
   
  setAnnonceFormData(prev => ({
    ...prev,
    imageFiles: [...prev.imageFiles, ...validFiles]
  }));
  
  setPreviewImages(prev => [...prev, ...previews]);
};

// Supprimer une image de la prévisualisation
const removePreviewImage = (index) => {
  setPreviewImages(prev => prev.filter((_, i) => i !== index));
  setAnnonceFormData(prev => ({
    ...prev,
    imageFiles: prev.imageFiles.filter((_, i) => i !== index)
  }));
};

// Soumettre le formulaire d'annonce
const handleAnnonceSubmit = async (e) => {
  e.preventDefault();
  
  if (!annonceFormData.title) {
    Swal.fire('Erreur', 'Le titre est obligatoire', 'error');
    return;
  }
  
  // Pour la modification, on n'exige pas de nouvelles images
  if (annonceFormData.imageFiles.length === 0 && !isEditingAnnonce) {
    Swal.fire('Erreur', 'Au moins une image est obligatoire', 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    if (isEditingAnnonce) {
      // ===== MODE MODIFICATION =====
      
      // Si de nouvelles images sont ajoutées, utiliser FormData
      if (annonceFormData.imageFiles.length > 0) {
        const formData = new FormData();
        formData.append('id', annonceFormData.id);
        formData.append('title', annonceFormData.title);
        formData.append('description', annonceFormData.description || '');
        
        // Ajouter les nouvelles images
        annonceFormData.imageFiles.forEach((file) => {
          formData.append('images[]', file);
        });
        
        const response = await fetch(`${URL_BASE.API_ANNONCES()}`, {
          method: 'PUT',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          await loadAnnonces();
          Swal.fire('Succès', 'Annonce modifiée avec succès', 'success');
          resetAnnonceForm();
        } else {
          throw new Error(data.message || 'Erreur lors de la modification');
        }
      } else {
        // Modification sans nouvelles images (seulement titre/description)
        const response = await fetch(`${URL_BASE.API_ANNONCES()}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: annonceFormData.id,
            title: annonceFormData.title,
            description: annonceFormData.description || '',
            images: annonceFormData.images // Conserver les images existantes
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          await loadAnnonces();
          Swal.fire('Succès', 'Annonce modifiée avec succès', 'success');
          resetAnnonceForm();
        } else {
          throw new Error(data.message || 'Erreur lors de la modification');
        }
      }
    } else {
      // ===== MODE CRÉATION =====
      const formData = new FormData();
      formData.append('title', annonceFormData.title);
      formData.append('description', annonceFormData.description || '');
      
      // Ajouter les images
      annonceFormData.imageFiles.forEach((file) => {
        formData.append('images[]', file);
      });
      
      const response = await fetch(`${URL_BASE.API_ANNONCES()}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadAnnonces();
        Swal.fire('Succès', 'Annonce créée avec succès', 'success');
        resetAnnonceForm();
      } else {
        throw new Error(data.message || 'Erreur lors de la création');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    Swal.fire('Erreur', error.message || 'Impossible de sauvegarder l\'annonce', 'error');
  } finally {
    setLoading(false);
  }
};

// Réinitialiser le formulaire d'annonce
const resetAnnonceForm = () => {
  setAnnonceFormData({
    id: null,
    title: '',
    description: '',
    images: [],
    imageFiles: []
  });
  setPreviewImages([]);
  setIsEditingAnnonce(false);
};

// Éditer une annonce
const editAnnonce = (annonce) => {
  console.log('Édition annonce:', annonce); // Pour déboguer
  
  const images = JSON.parse(annonce.images || '[]');
  
  setAnnonceFormData({
    id: annonce.id, // ← IMPORTANT : l'ID doit être défini
    title: annonce.titre,
    description: annonce.description || '',
    images: images, // Conserver les images existantes
    imageFiles: [] // Pas de nouveaux fichiers au départ
  });
  
  // Prévisualiser les images existantes
  setPreviewImages(images.map(img => `${API_URL_BASE}/${img.url}`));
  
  setIsEditingAnnonce(true);
  
  // Scroller vers le formulaire
  setTimeout(() => {
    const formElement = document.querySelector('[data-annonce-form]');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};
// Supprimer une annonce
const deleteAnnonce = async (annonce) => {
  Swal.fire({
    title: 'Confirmer la suppression',
    text: `Êtes-vous sûr de vouloir supprimer "${annonce.titre}" ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${URL_BASE.API_ANNONCES()}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: annonce.id })
        });

        const data = await response.json();

        if (data.success) {
          await loadAnnonces();
          Swal.fire('Supprimé!', 'L\'annonce a été supprimée.', 'success');
        } else {
          throw new Error(data.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Swal.fire('Erreur', 'Impossible de supprimer l\'annonce', 'error');
      }
    }
  });
};

// MODIFIEZ votre useEffect pour charger les annonces
useEffect(() => {
  loadPublications();
  loadAllPersonnel();
  loadAdminSettings();
  loadAnnonces(); // ← AJOUTEZ CETTE LIGNE
}, []);

  // VÉRIFICATION DE L'AUTHENTIFICATION - AJOUTEZ CE CODE
  useEffect(() => {
    const checkAuth = () => {
      const sessionToken = localStorage.getItem('session_token');
      const userRole = localStorage.getItem('user_role');
      
      if (!sessionToken || userRole !== 'admin') {
        Swal.fire({
          title: 'Accès non autorisé',
          text: 'Vous devez être connecté en tant qu\'administrateur pour accéder à cette page',
          icon: 'warning',
          confirmButtonText: 'Se connecter'
        }).then(() => {
          navigate('/LoginAdmin');
        });
        return;
      }
    };

    checkAuth();
  }, [navigate]);


  // États pour les paramètres administrateur
  const [adminSettings, setAdminSettings] = useState({
    // Informations personnelles
    nom: 'Admin',
    prenom: 'EFES GG',
    email: 'admin@efesgg.bj',
    telephone: '+229 XX XX XX XX',
    
    // Informations de connexion
    nomUtilisateur: 'admin_efesgg',
    motDePasse: '',
    confirmationMotDePasse: '',
    
    // Sécurité
    doubleAuthentification: false,
    notificationsConnexion: true,
    sessionTimeout: 30 // minutes
  });

  // États pour la gestion du personnel
  const [personnel, setPersonnel] = useState({
    secretaires: [],
    directeursEtude: [],
    chefsFiliere: []
  });
  const [selectedPersonnelType, setSelectedPersonnelType] = useState('secretaires');

  // États pour gérer l'édition du personnel
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [editingType, setEditingType] = useState(null);

// Options pour les sélecteurs
const rolesDirecteur = ['Doyen', 'Directeur_Etudes', 'Vice_Doyen'];
const grades = ['Professeur', 'Maitre de Conférences', 'Maître Assistant', 'Assistant'];
const departements = ['Scolarité', 'Administration', 'Finances', 'Pédagogie', 'Recherche'];

  // Postes disponibles
  const postes = ['Secrétaire', 'Directeur des Études', 'Chef de Filière', 'Enseignant', 'Assistant', 'Comptable'];


  // MODIFIEZ LA FONCTION DE DÉCONNEXION
  const handleLogout = () => {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Se déconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Supprimer toutes les données de session
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_role');
        localStorage.removeItem('niveau_acces');
        
        Swal.fire({
          title: 'Déconnecté',
          text: 'Vous avez été déconnecté avec succès',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/LoginAdmin');
        });
      }
    });
  };

  // Fonctions pour charger les différents types de personnel
const loadSecretaires = async () => {
  try {
    const response = await fetch(`${URL_BASE.SECRETAIRES()}`);
    if (response.ok) {
      const data = await response.json();
      setPersonnel(prev => ({ ...prev, secretaires: data.data || [] }));
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API secrétaires:', errorData);
      setPersonnel(prev => ({ ...prev, secretaires: [] }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des secrétaires:', error);
    setPersonnel(prev => ({ ...prev, secretaires: [] }));
  }
};

const loadDirecteursEtude = async () => {
  try {
    const response = await fetch(`${URL_BASE.DIRECTEURS_ETUDE()}`);
    if (response.ok) {
      const data = await response.json();
      setPersonnel(prev => ({ ...prev, directeursEtude: data.data || [] }));
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API directeurs:', errorData);
      setPersonnel(prev => ({ ...prev, directeursEtude: [] }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des directeurs:', error);
    setPersonnel(prev => ({ ...prev, directeursEtude: [] }));
  }
};

const loadChefsFiliere = async () => {
  try {
    const response = await fetch(`${URL_BASE.CHEFS_FILIERE()}`);
    if (response.ok) {
      const data = await response.json();
      setPersonnel(prev => ({ ...prev, chefsFiliere: data.data || [] }));
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API chefs de filière:', errorData);
      setPersonnel(prev => ({ ...prev, chefsFiliere: [] }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des chefs de filière:', error);
    setPersonnel(prev => ({ ...prev, chefsFiliere: [] }));
  }
};

// Charger tout le personnel
const loadAllPersonnel = async () => {
  await loadSecretaires();
  await loadDirecteursEtude();
  await loadChefsFiliere();
};

// Dans useEffect, remplacez loadPersonnel() par loadAllPersonnel()
useEffect(() => {
  loadPublications();
  loadAllPersonnel();
  loadAdminSettings();
}, []);

// Sauvegarder un secrétaire
const saveSecretaire = async (formData) => {
  console.log('Sauvegarde secrétaire:', formData);
  
  if (!formData.nom || !formData.prenom || !formData.email || !formData.login) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  // Validation du mot de passe
  if (formData.mot_de_passe || formData.confirmation_mot_de_passe) {
    if (formData.mot_de_passe !== formData.confirmation_mot_de_passe) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }
  }
  
  // Pour la création, le mot de passe est obligatoire
  if (!formData.id && !formData.mot_de_passe) {
    Swal.fire('Erreur', 'Le mot de passe est obligatoire pour la création', 'error');
    return;
  }

  setLoading(true);
  try {
    const url = `${URL_BASE.SECRETAIRES()}`;
    const method = formData.id ? 'PUT' : 'POST';

    const dataToSend = {
      ...formData,
      confirmation_mot_de_passe: undefined
    };
    
    // Si c'est une modification et que le mot de passe est vide, ne pas l'envoyer
    if (formData.id && !formData.mot_de_passe) {
      delete dataToSend.mot_de_passe;
    }

    console.log('Envoi requête:', { url, method, data: dataToSend });

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)
    });

    const data = await response.json();
    console.log('Réponse API:', data);

    if (data.success) {
      await loadSecretaires();
      Swal.fire('Succès', `Secrétaire ${formData.id ? 'modifié' : 'ajouté'} avec succès`, 'success');
      setEditingPersonnel(null);
      setEditingType(null);
    } else {
      throw new Error(data.message || 'Erreur lors de la sauvegarde');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    Swal.fire('Erreur', error.message || 'Impossible de sauvegarder le secrétaire', 'error');
  } finally {
    setLoading(false);
  }
};
// Sauvegarder un directeur d'étude
const saveDirecteurEtude = async (formData) => {
  console.log('Sauvegarde directeur:', formData);
  
  if (!formData.nom || !formData.prenom || !formData.email || !formData.login) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  // Validation du mot de passe
  if (formData.mot_de_passe || formData.confirmation_mot_de_passe) {
    if (formData.mot_de_passe !== formData.confirmation_mot_de_passe) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }
  }
  
  // Pour la création, le mot de passe est obligatoire
  if (!formData.id && !formData.mot_de_passe) {
    Swal.fire('Erreur', 'Le mot de passe est obligatoire pour la création', 'error');
    return;
  }

  setLoading(true);
  try {
    const url = `${URL_BASE.DIRECTEURS_ETUDE()}`;
    const method = formData.id ? 'PUT' : 'POST';

    const dataToSend = {
      ...formData,
      confirmation_mot_de_passe: undefined
    };
    
    // Si c'est une modification et que le mot de passe est vide, ne pas l'envoyer
    if (formData.id && !formData.mot_de_passe) {
      delete dataToSend.mot_de_passe;
    }

    console.log('Envoi requête:', { url, method, data: dataToSend });

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)
    });

    const data = await response.json();
    console.log('Réponse API:', data);

    if (data.success) {
      await loadDirecteursEtude();
      Swal.fire('Succès', `Directeur d'étude ${formData.id ? 'modifié' : 'ajouté'} avec succès`, 'success');
      setEditingPersonnel(null);
      setEditingType(null);
    } else {
      throw new Error(data.message || 'Erreur lors de la sauvegarde');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    Swal.fire('Erreur', error.message || 'Impossible de sauvegarder le directeur d\'étude', 'error');
  } finally {
    setLoading(false);
  }
};



// Sauvegarder un chef de filière
const saveChefFiliere = async (formData) => {
  console.log('Sauvegarde chef de filière:', formData);
  
  if (!formData.nom || !formData.prenom || !formData.email || !formData.login || !formData.filiere) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  // Validation du mot de passe
  if (formData.mot_de_passe || formData.confirmation_mot_de_passe) {
    if (formData.mot_de_passe !== formData.confirmation_mot_de_passe) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }
  }
  
  // Pour la création, le mot de passe est obligatoire
  if (!formData.id && !formData.mot_de_passe) {
    Swal.fire('Erreur', 'Le mot de passe est obligatoire pour la création', 'error');
    return;
  }

  setLoading(true);
  try {
    const url = `${URL_BASE.CHEFS_FILIERE()}`;
    const method = formData.id ? 'PUT' : 'POST';

    const dataToSend = {
      ...formData,
      confirmation_mot_de_passe: undefined
    };
    
    // Si c'est une modification et que le mot de passe est vide, ne pas l'envoyer
    if (formData.id && !formData.mot_de_passe) {
      delete dataToSend.mot_de_passe;
    }

    //console.log('Envoi requête:', { url, method, data: dataToSend });

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)
    });

    const data = await response.json();
    console.log('Réponse API:', data);

    if (data.success) {
      await loadChefsFiliere();
      Swal.fire('Succès', `Chef de filière ${formData.id ? 'modifié' : 'ajouté'} avec succès`, 'success');
      setEditingPersonnel(null);
      setEditingType(null);
    } else {
      throw new Error(data.message || 'Erreur lors de la sauvegarde');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    Swal.fire('Erreur', error.message || 'Impossible de sauvegarder le chef de filière', 'error');
  } finally {
    setLoading(false);
  }
};
// Fonctions d'édition
const editSecretaire = (secretaire) => {
  console.log('Édition secrétaire:', secretaire);
  if (!secretaire || (!secretaire.id && !secretaire.id_secretaire)) {
    console.error('Données secrétaire invalides:', secretaire);
    Swal.fire('Erreur', 'Données du secrétaire invalides', 'error');
    return;
  }
  // Normaliser toutes les données pour s'assurer que tous les champs sont présents
  const normalizedData = {
    id: secretaire.id || secretaire.id_secretaire,
    nom: secretaire.nom || '',
    prenom: secretaire.prenom || '',
    email: secretaire.email || '',
    telephone: secretaire.telephone || '',
    login: secretaire.login || '',
    departement: secretaire.departement || 'Scolarité',
    permissions: secretaire.permissions || [],
    statut: secretaire.statut || 'actif'
  };
  console.log('Données normalisées:', normalizedData);
  setEditingPersonnel(normalizedData);
  setEditingType('secretaires');
  setSelectedPersonnelType('secretaires');
  // Scroller vers le formulaire après un court délai pour laisser le DOM se mettre à jour
  setTimeout(() => {
    const formElement = document.querySelector('[data-personnel-form]');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const editDirecteurEtude = (directeur) => {
  console.log('Édition directeur:', directeur);
  if (!directeur || (!directeur.id && !directeur.id_directeur)) {
    console.error('Données directeur invalides:', directeur);
    Swal.fire('Erreur', 'Données du directeur invalides', 'error');
    return;
  }
  // Normaliser toutes les données pour s'assurer que tous les champs sont présents
  const normalizedData = {
    id: directeur.id || directeur.id_directeur,
    nom: directeur.nom || '',
    prenom: directeur.prenom || '',
    email: directeur.email || '',
    telephone: directeur.telephone || '',
    login: directeur.login || '',
    role: directeur.role || 'Directeur_Etudes',
    faculte_uas: directeur.faculte_uas || '',
    departement: directeur.departement || '',
    grade: directeur.grade || 'Professeur',
    statut: directeur.statut || 'actif'
  };
  console.log('Données normalisées:', normalizedData);
  setEditingPersonnel(normalizedData);
  setEditingType('directeursEtude');
  setSelectedPersonnelType('directeursEtude');
  // Scroller vers le formulaire
  setTimeout(() => {
    const formElement = document.querySelector('[data-personnel-form]');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const editChefFiliere = (chef) => {
  console.log('Édition chef de filière:', chef);
  if (!chef || (!chef.id && !chef.id_chef_filiere)) {
    console.error('Données chef invalides:', chef);
    Swal.fire('Erreur', 'Données du chef de filière invalides', 'error');
    return;
  }
  // Normaliser toutes les données pour s'assurer que tous les champs sont présents
  const normalizedData = {
    id: chef.id || chef.id_chef_filiere,
    nom: chef.nom || '',
    prenom: chef.prenom || '',
    email: chef.email || '',
    telephone: chef.telephone || '',
    login: chef.login || '',
    filiere: chef.filiere || '',
    grade: chef.grade || 'Professeur',
    specialite: chef.specialite || '',
    statut: chef.statut || 'actif'
  };
  console.log('Données normalisées:', normalizedData);
  setEditingPersonnel(normalizedData);
  setEditingType('chefsFiliere');
  setSelectedPersonnelType('chefsFiliere');
  // Scroller vers le formulaire
  setTimeout(() => {
    const formElement = document.querySelector('[data-personnel-form]');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const deletePersonnel = async (type, id, nom, prenom) => {
  console.log('Suppression personnel:', { type, id, nom, prenom });
  
  if (!id) {
    Swal.fire('Erreur', 'ID du membre du personnel manquant', 'error');
    return;
  }

  Swal.fire({
    title: 'Confirmer la suppression',
    text: `Êtes-vous sûr de vouloir supprimer "${prenom} ${nom}" ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then(async (result) => {
    if (result.isConfirmed) {
      setLoading(true);
      try {
        let url;
        switch (type) {
          case 'secretaires':
            url = `${URL_BASE.SECRETAIRES()}`;
            break;
          case 'directeursEtude':
            url = `${URL_BASE.DIRECTEURS_ETUDE()}`;
            break;
          case 'chefsFiliere':
            url = `${URL_BASE.CHEFS_FILIERE()}`;
            break;
          default:
            setLoading(false);
            Swal.fire('Erreur', 'Type de personnel invalide', 'error');
            return;
        }

        console.log('Envoi requête DELETE:', { url, id });

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        });

        // Vérifier si la réponse est ok avant de parser le JSON
        if (!response.ok) {
          let errorMessage = `Erreur HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Si la réponse n'est pas du JSON, utiliser le message par défaut
            errorMessage = `Erreur serveur (${response.status}): ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Réponse suppression:', data);

        if (data.success) {
          await loadAllPersonnel();
          Swal.fire('Supprimé!', 'Le membre du personnel a été supprimé.', 'success');
        } else {
          throw new Error(data.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        
        // Gérer spécifiquement les erreurs réseau
        let errorMessage = 'Impossible de supprimer le membre du personnel';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez que le serveur est en cours d\'exécution et que l\'URL est correcte.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
          footer: `<small>URL: ${url || 'non définie'}</small>`
        });
      } finally {
        setLoading(false);
      }
    }
  });
};

  // Catégories disponibles pour les publications
  const categories = [
    'Etudiant(s)',
    'Enseignant(s)', 
    'Administration-communiqué(s)',
    'Programmation(s)',
    'Extentions de l\'école',
    'Activité(s) interne(s)',
    'Activité(s) extra-scolaire'
  ];

  // Ajouter cette constante après les autres constantes
const categoryColors = {
  'Etudiant(s)': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  'Enseignant(s)': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  'Administration-communiqué(s)': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  'Programmation(s)': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200'
  },
  'Extentions de l\'école': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  'Activité(s) interne(s)': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200'
  },
  'Activité(s) extra-scolaire': {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200'
  }
};

// Fonction utilitaire pour obtenir les classes de couleur
const getCategoryColor = (category) => {
  return categoryColors[category] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };
};

  // Charger les publications depuis l'API
  const loadPublications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${URL_BASE.API_PUBLICATIONS()}`);
      if (response.ok) {
        const data = await response.json();
       // console.log(data.data);
        if(data.data.length > 0) {
          setPublications(data.data);
        }
      } else {
        throw new Error('Erreur lors du chargement des publications');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      // Fallback aux données mock si l'API n'est pas disponible
      const mockPublications = [
        {
          id: 1,
          title: "Guide Pédagogique EFES GG 2024",
          description: "Guide complet des méthodes pédagogiques innovantes appliquées dans notre établissement",
          category: "Enseignant(s)",
          fileName: "guide-pedagogique-2024.pdf",
          fileSize: "2.4 MB",
          uploadDate: "2024-03-15",
          downloads: 1247,
          isFeatured: true,
          status: "published"
        },
        {
          id: 2,
          title: "Rapport Annuel 2023-2024",
          description: "Bilan des activités et réalisations de l'EFES GG pour l'année académique 2023-2024",
          category: "Administration-communiqué(s)",
          fileName: "rapport-annuel-2024.pdf",
          fileSize: "5.1 MB",
          uploadDate: "2024-01-10",
          downloads: 892,
          isFeatured: true,
          status: "published"
        }
      ];
      setPublications(mockPublications);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSettings = async () => {
    try {
      // Récupérer le token de session depuis localStorage
      const sessionToken = localStorage.getItem('session_token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter le token si disponible
      if (sessionToken) {
        headers['X-Session-Token'] = sessionToken;
      }
  
      const response = await fetch(`${URL_BASE.ADMIN_SETTINGS()}`, {
        method: 'GET',
        headers: headers
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Mettre à jour les paramètres avec les données de l'API
          setAdminSettings(prev => ({
            ...prev,
            nom: data.data.nom || prev.nom,
            prenom: data.data.prenom || prev.prenom,
            email: data.data.email || prev.email,
            telephone: data.data.telephone || prev.telephone,
            nomUtilisateur: data.data.login || prev.nomUtilisateur,
            // Ne pas pré-remplir le mot de passe pour des raisons de sécurité
            motDePasse: '',
            confirmationMotDePasse: ''
          }));
          
          // Synchroniser aussi l'état local
          setLocalSettings(prev => ({
            ...prev,
            nom: data.data.nom || prev.nom,
            prenom: data.data.prenom || prev.prenom,
            email: data.data.email || prev.email,
            telephone: data.data.telephone || prev.telephone,
            nomUtilisateur: data.data.login || prev.nomUtilisateur,
            motDePasse: '',
            confirmationMotDePasse: ''
          }));
        }
      } else {
        console.error('Erreur lors du chargement des paramètres admin');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres admin:', error);
    }
  };




  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));

    if (type === 'file' && files[0]) {
      setFormData(prev => ({
        ...prev,
        fileName: files[0].name
      }));
    }
  };

  const handleAdminSettingsChange = (field, value) => {
    setAdminSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestion de la soumission des publications
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.title || !formData.description ) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  setLoading(true);

  try {
    const url = `${URL_BASE.API_PUBLICATIONS()}`;
    const method = isEditing ? 'PUT' : 'POST';

    // Préparer les données pour l'API
    const publicationData = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      isFeatured: formData.isFeatured
    };

    // Si c'est une modification et qu'un nouveau fichier est sélectionné
    if (formData.file) {
      // Utiliser FormData pour l'upload de fichier
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      Object.keys(publicationData).forEach(key => {
        formDataToSend.append(key, publicationData[key]);
      });

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        await loadPublications();
        Swal.fire('Succès', `Publication ${isEditing ? 'modifiée' : 'ajoutée'} avec succès`, 'success');
        resetForm();
      } else {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }
    } else {
      // Si pas de nouveau fichier, envoyer en JSON
      if (isEditing) {
        publicationData.fileName = formData.fileName;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publicationData)
      });

      const data = await response.json();

      if (data.success) {
        await loadPublications();
        Swal.fire('Succès', `Publication ${isEditing ? 'modifiée' : 'ajoutée'} avec succès`, 'success');
        resetForm();
      } else {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    Swal.fire('Erreur', 'Impossible de sauvegarder la publication', 'error');
  } finally {
    setLoading(false);
  }
};

  const saveAdminSettings = async () => {
    // Validation
    if (!adminSettings.nom || !adminSettings.prenom || !adminSettings.email || !adminSettings.nomUtilisateur) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (adminSettings.motDePasse && adminSettings.motDePasse !== adminSettings.confirmationMotDePasse) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }

    setLoading(true);
    try {
      // Préparer les données à envoyer
      const dataToSend = {
        nom: adminSettings.nom,
        prenom: adminSettings.prenom,
        email: adminSettings.email,
        telephone: adminSettings.telephone || null,
        nomUtilisateur: adminSettings.nomUtilisateur
      };

      // Ajouter le mot de passe seulement s'il est rempli
      if (adminSettings.motDePasse) {
        dataToSend.motDePasse = adminSettings.motDePasse;
      }

      console.log('Envoi requête mise à jour admin:', dataToSend);

      // Récupérer le token de session depuis localStorage
      const sessionToken = localStorage.getItem('session_token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter le token si disponible
      if (sessionToken) {
        headers['X-Session-Token'] = sessionToken;
      }

      const response = await fetch(`${URL_BASE.ADMIN_SETTINGS()}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      console.log('Réponse API:', data);

      if (data.success) {
        Swal.fire('Succès', 'Paramètres administrateur sauvegardés avec succès', 'success');
        
        // Réinitialiser les champs de mot de passe
        setAdminSettings(prev => ({
          ...prev,
          motDePasse: '',
          confirmationMotDePasse: ''
        }));
        
        // Recharger les paramètres pour s'assurer de la synchronisation
        await loadAdminSettings();
      } else {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres admin:', error);
      Swal.fire('Erreur', error.message || 'Impossible de sauvegarder les paramètres', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      category: 'Etudiant(s)',
      file: null,
      fileName: '',
      isFeatured: false
    });
    setIsEditing(false);
  };


  const editPublication = (publication) => {
    setFormData({
      id: publication.id,
      title: publication.titre,
      description: publication.description,
      category: publication.categorie,
      file: null,
      fileName: publication.nom_fichier,
      isFeatured: publication.est_vedette
    });
    setIsEditing(true);
  };

  // Supprimer une publication

const deletePublication = async (publication) => {
  Swal.fire({
    title: 'Confirmer la suppression',
    text: `Êtes-vous sûr de vouloir supprimer "${publication.titre}" ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${URL_BASE.API_PUBLICATIONS()}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: publication.id })
        });

        const data = await response.json();

        if (data.success) {
          await loadPublications(); // Recharger les données
          Swal.fire('Supprimé!', 'La publication a été supprimée.', 'success');
        } else {
          throw new Error(data.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Swal.fire('Erreur', 'Impossible de supprimer la publication', 'error');
      }
    }
  });
};
/*

  // Supprimer un membre du personnel
  const deletePersonnel = async (membre) => {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Êtes-vous sûr de vouloir supprimer "${membre.prenom} ${membre.nom}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${URL_BASE}/personnel.php`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: membre.id })
          });

          if (response.ok) {
            await loadPersonnel(); // Recharger les données
            Swal.fire('Supprimé!', 'Le membre du personnel a été supprimé.', 'success');
          } else {
            throw new Error('Erreur lors de la suppression');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          Swal.fire('Erreur', 'Impossible de supprimer le membre du personnel', 'error');
        }
      }
    });
  };
*/

  // Basculer le statut vedette
const toggleFeatured = async (publication) => {
  try {
    const response = await fetch(`${URL_BASE.API_PUBLICATIONS()}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: publication.id, 
        isFeatured: !publication.est_vedette,
        method: 'patch',
      })
    });

    const data = await response.json();

    if (data.success) {
      await loadPublications(); // Recharger les données
      Swal.fire('Succès', 'Statut vedette modifié avec succès', 'success');
    } else {
      throw new Error(data.message || 'Erreur lors de la mise à jour');
    }
  } catch (error) {
    console.error('Erreur lors du toggle featured:', error);
    Swal.fire('Erreur', 'Impossible de modifier le statut vedette', 'error');
  }
};
  // Filtrer les publications
  

const filteredPublications = publications.filter(pub => {
  const matchesSearch = pub.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pub.description?.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === 'Tous' || pub.categorie === selectedCategory;
  return matchesSearch && matchesCategory;
});



// Statistiques CORRIGÉES
const stats = {
  total: publications.length,
  featured: publications.filter(p => p.est_vedette).length,
  totalDownloads: publications.reduce((sum, pub) => sum + (pub.telechargements || 0), 0),
  recent: publications.filter(p => {
    if (!p.date_publication) return false;
    const pubDate = new Date(p.date_publication);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return pubDate > weekAgo;
  }).length,
  
  // CORRECTION FINALE POUR LES STATISTIQUES PERSONNEL
  personnelTotal: (personnel.secretaires?.length || 0) + 
                  (personnel.directeursEtude?.length || 0) + 
                  (personnel.chefsFiliere?.length || 0),
  personnelActifs: 
    (personnel.secretaires?.filter(p => p.statut === 'actif')?.length || 0) +
    (personnel.directeursEtude?.filter(p => p.statut === 'actif')?.length || 0) +
    (personnel.chefsFiliere?.filter(p => p.statut === 'actif')?.length || 0)
};

// Composant pour les paramètres administrateur CORRIGÉ
const AdminSettingsSection = () => {
  // ✅ État local pour éviter les re-renders du parent
  const [localSettings, setLocalSettings] = useState(adminSettings);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Synchroniser avec l'état parent quand il change
  useEffect(() => {
    setLocalSettings(adminSettings);
  }, [adminSettings]);

  // ✅ Handler stable avec useCallback
  const handleLocalChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // ✅ Handler pour la sauvegarde CORRIGÉ
  const handleSave = async () => {
    // Validation des champs obligatoires
    if (!localSettings.nom || !localSettings.prenom || !localSettings.email || !localSettings.nomUtilisateur) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (localSettings.motDePasse && localSettings.motDePasse !== localSettings.confirmationMotDePasse) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Préparer les données dans le format attendu par l'API
      const dataToSend = {
        nom: localSettings.nom,
        prenom: localSettings.prenom,
        email: localSettings.email,
        telephone: localSettings.telephone || '',
        nomUtilisateur: localSettings.nomUtilisateur
      };

      // Ajouter le mot de passe seulement s'il est rempli
      if (localSettings.motDePasse) {
        dataToSend.motDePasse = localSettings.motDePasse;
      }


      // Récupérer le token de session depuis localStorage
      const sessionToken = localStorage.getItem('session_token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter le token si disponible
      if (sessionToken) {
        headers['X-Session-Token'] = sessionToken;
      }

      // Appeler l'API de mise à jour des paramètres admin
      const response = await fetch(`${URL_BASE.ADMIN_SETTINGS()}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      console.log('Réponse API admin:', data);

      if (data.success) {
        // Mettre à jour l'état parent avec les données locales
        setAdminSettings(localSettings);
        
        Swal.fire('Succès', 'Paramètres administrateur sauvegardés avec succès', 'success');
        
        // Réinitialiser les champs de mot de passe
        setLocalSettings(prev => ({
          ...prev,
          motDePasse: '',
          confirmationMotDePasse: ''
        }));
        
        // Recharger les paramètres depuis l'API pour s'assurer de la synchronisation
        await loadAdminSettings();
      } else {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres admin:', error);
      Swal.fire('Erreur', error.message || 'Impossible de sauvegarder les paramètres', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête des paramètres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paramètres Administrateur</h2>
            <p className="text-gray-600">Gérez vos informations personnelles et la sécurité de votre compte</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Informations Personnelles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations Personnelles
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={localSettings.nom}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={localSettings.prenom}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre prénom"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={localSettings.email}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={localSettings.telephone}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+229 XX XX XX XX"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Informations de Connexion */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-green-600" />
            Informations de Connexion
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              name="nomUtilisateur"
              value={localSettings.nomUtilisateur}
              onChange={handleLocalChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="motDePasse"
                value={localSettings.motDePasse}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Laissez vide pour ne pas changer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmationMotDePasse"
                value={localSettings.confirmationMotDePasse}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirmez le mot de passe"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de Sécurité
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Sécurité du Compte
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="doubleAuthentification"
                checked={localSettings.doubleAuthentification}
                onChange={handleLocalChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Double authentification</div>
                <div className="text-sm text-gray-500">Exiger un code de vérification supplémentaire</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="notificationsConnexion"
                checked={localSettings.notificationsConnexion}
                onChange={handleLocalChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Notifications de connexion</div>
                <div className="text-sm text-gray-500">Recevoir des alertes pour les nouvelles connexions</div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai de session (minutes)
              </label>
              <input
                type="number"
                name="sessionTimeout"
                value={localSettings.sessionTimeout}
                onChange={handleLocalChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="240"
              />
            </div>
          </div>
        </div>
      </div>*/}
      

      {/* Gestion du Personnel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Gestion du Personnel
            </h3>
          </div>
        </div>

        {/* Navigation par type de personnel */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'secretaires', name: 'Secrétaires', count: personnel.secretaires.length },
              { id: 'directeursEtude', name: 'Directeurs d\'Étude', count: personnel.directeursEtude.length },
              { id: 'chefsFiliere', name: 'Chefs de Filière', count: personnel.chefsFiliere.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedPersonnelType(tab.id)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  selectedPersonnelType === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire selon le type sélectionné */}
        <div className="p-6 border-b border-gray-200 bg-gray-50" data-personnel-form>
          {selectedPersonnelType === 'secretaires' && (
            <SecretaireForm 
              initialData={editingType === 'secretaires' ? editingPersonnel : null}
              onSubmit={saveSecretaire}
              onCancel={() => {
                setEditingPersonnel(null);
                setEditingType(null);
              }}
              loading={loading}
              departements={departements}
            />
          )}

          {selectedPersonnelType === 'directeursEtude' && (
            <DirecteurEtudeForm 
              initialData={editingType === 'directeursEtude' ? editingPersonnel : null}
              onSubmit={saveDirecteurEtude}
              onCancel={() => {
                setEditingPersonnel(null);
                setEditingType(null);
              }}
              loading={loading}
              roles={rolesDirecteur}
              grades={grades}
              departements={departements}
            />
          )}

          {selectedPersonnelType === 'chefsFiliere' && (
            <ChefFiliereForm 
              initialData={editingType === 'chefsFiliere' ? editingPersonnel : null}
              onSubmit={saveChefFiliere}
              onCancel={() => {
                setEditingPersonnel(null);
                setEditingType(null);
              }}
              loading={loading}
              filieres={filieres}
              grades={grades}
            />
          )}
        </div>

        {/* Liste du personnel selon le type sélectionné */}
        <div className="p-6">
          {selectedPersonnelType === 'secretaires' && (
            <PersonnelList 
              data={personnel.secretaires}
              type="secretaires"
              onEdit={editSecretaire}
              onDelete={deletePersonnel}
              columns={['Nom', 'Prénom', 'Email', 'Département', 'Statut', 'Actions']}
            />
          )}

          {selectedPersonnelType === 'directeursEtude' && (
            <PersonnelList 
              data={personnel.directeursEtude}
              type="directeursEtude"
              onEdit={editDirecteurEtude}
              onDelete={deletePersonnel}
              columns={['Nom', 'Prénom', 'Email', 'Rôle', 'Grade', 'Statut', 'Actions']}
            />
          )}

          {selectedPersonnelType === 'chefsFiliere' && (
            <PersonnelList 
              data={personnel.chefsFiliere}
              type="chefsFiliere"
              onEdit={editChefFiliere}
              onDelete={deletePersonnel}
              columns={['Nom', 'Prénom', 'Email', 'Filière', 'Grade', 'Statut', 'Actions']}
            />
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* En-tête */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Administration EFES GG</h1>
                <p className="text-gray-600 mt-1">Gérez le contenu et les publications de votre établissement</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Connecté en tant que</div>
                  <div className="font-semibold text-gray-900"> Administrateur</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  AD
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'publications', name: 'Publications', icon: FileText },
              { id: 'annonces', name: 'Annonces Galerie', icon: Image }, // ← NOUVEAU
              { id: 'parametres', name: 'Paramètres', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Statistiques */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
              

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-blue-700">Publications totales</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{stats.featured}</div>
                    <div className="text-sm text-green-700">En vedette</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalDownloads}</div>
                    <div className="text-sm text-purple-700">Téléchargements</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{stats.personnelActifs}</div>
                    <div className="text-sm text-orange-700">Personnel actif</div>
                  </div>
                </div>

              {/* Actions rapides */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-3">Actions rapides</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('publications')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle publication
                  </button>
                  <button 
                    onClick={() => setActiveTab('parametres')}
                    className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Gérer le personnel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {activeTab === 'publications' && (
              <div className="space-y-6">
                {/* Formulaire d'ajout/modification */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {isEditing ? 'Modifier la publication' : 'Nouvelle publication'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Titre de la publication"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Description de la publication"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fichier *
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              name="file"
                              onChange={handleInputChange}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              <Upload className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {formData.fileName || 'Choisir un fichier'}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Mettre en vedette</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isEditing ? 'Modifier' : 'Publier'}
                      </button>
                      
                      {isEditing && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Liste des publications */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Publications ({filteredPublications.length})
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Tous">Toutes les catégories</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredPublications.map(publication => (
                      <div key={publication.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {publication.titre}
                              </h4>
                              {publication.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  <Eye className="w-3 h-3" />
                                  Vedette
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">{publication.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className={`${getCategoryColor(publication.categorie).bg} ${getCategoryColor(publication.categorie).text} px-2 py-1 rounded text-xs font-medium`}>
                                {publication.categorie}
                              </span>
                              <span>{publication.chemin_fichier}</span>
                              <span>{publication.taille_fichier}</span>
                              <span>{publication.date_publication}</span>
                              <span>{publication.telechargements} téléchargements</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => toggleFeatured(publication)}
                              className={`p-2 rounded-lg transition-colors ${
                                publication.est_vedette
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={publication.est_vedette ? 'Retirer des vedettes' : 'Mettre en vedette'}
                            >
                              <Eye className="w-4 h-4" />
                              
                            </button>
                            
                            <button
                              onClick={() => editPublication(publication)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => deletePublication(publication)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredPublications.length === 0 && (
                      <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune publication trouvée</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Paramètres */}
            {activeTab === 'parametres' && <AdminSettingsSection />}

{activeTab === 'annonces' && (
  <div className="space-y-6">
    {/* Formulaire d'ajout/modification d'annonce */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditingAnnonce ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
      </h2>
      
      <form onSubmit={handleAnnonceSubmit} className="space-y-4" data-annonce-form>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            name="title"
            value={annonceFormData.title}
            onChange={handleAnnonceInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Titre de l'annonce"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={annonceFormData.description}
            onChange={handleAnnonceInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description de l'annonce (optionnel)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images * (Format: JPG, PNG, GIF, WEBP - Max: 5 MB par image)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                onChange={handleImageChange}
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
              />
              <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Cliquer pour ajouter des images
                </span>
              </div>
            </label>
          </div>
          
          {/* Prévisualisation des images */}
          {previewImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {isEditingAnnonce && annonceFormData.imageFiles.length === 0 
                    ? 'Images actuelles (ajoutez de nouvelles images pour les remplacer)' 
                    : 'Prévisualisation des images'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Prévisualisation ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePreviewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer cette image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {isEditingAnnonce && annonceFormData.imageFiles.length === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Existante
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingAnnonce && annonceFormData.imageFiles.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Pour modifier les images, ajoutez-en de nouvelles ci-dessus
                  </p>
                )}
              </div>
            )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditingAnnonce ? 'Modifier' : 'Publier'}
          </button>
          
          {isEditingAnnonce && (
            <button
              type="button"
              onClick={resetAnnonceForm}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>

    {/* Liste des annonces */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Annonces ({annonces.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {annonces.map(annonce => {
          const images = JSON.parse(annonce.images || '[]');
          return (
            <div key={annonce.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {annonce.titre}
                  </h4>
                  
                  {annonce.description && (
                    <p className="text-gray-600 mb-3">{annonce.description}</p>
                  )}
                  
                  {/* Galerie d'images miniatures */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {images.slice(0, 5).map((img, idx) => (
                      <img
                        key={idx}
                        src={API_URL_BASE+'/'+img.url}
                        alt={`Image ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {images.length > 5 && (
                      <div className="w-20 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        +{images.length - 5}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{annonce.nombre_images} image(s)</span>
                    <span>{annonce.date_publication}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => editAnnonce(annonce)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteAnnonce(annonce)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {annonces.length === 0 && (
          <div className="p-12 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune annonce trouvée</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

            {/* Placeholders pour les autres onglets */}
            {['etudiants'].includes(activeTab) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gestion des Étudiants
                </h3>
                <p className="text-gray-600">
                  Cette section sera disponible dans une prochaine mise à jour.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant formulaire secrétaire
// Composant formulaire secrétaire CORRIGÉ
// Composant formulaire secrétaire CORRIGÉ
const SecretaireForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading, 
  departements 
}) => {
  // ✅ État local - ne cause pas de re-render du parent
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    login: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: '',
    departement: 'Scolarité',
    permissions: [],
    statut: 'actif'
  });

  // Mettre à jour le formulaire quand initialData change
  useEffect(() => {
    if (initialData) {
      // Normaliser toutes les données avec des valeurs par défaut pour éviter les champs vides
      setFormData({
        id: initialData.id || null,
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        email: initialData.email || '',
        telephone: initialData.telephone || '',
        login: initialData.login || '',
        departement: initialData.departement || 'Scolarité',
        permissions: Array.isArray(initialData.permissions) ? initialData.permissions : (typeof initialData.permissions === 'string' ? JSON.parse(initialData.permissions || '[]') : []),
        statut: initialData.statut || 'actif',
        mot_de_passe: '',
        confirmation_mot_de_passe: ''
      });
    } else {
      // Réinitialiser le formulaire quand initialData devient null
      setFormData({
        id: null,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        mot_de_passe: '',
        confirmation_mot_de_passe: '',
        departement: 'Scolarité',
        permissions: [],
        statut: 'actif'
      });
    }
  }, [initialData]);

  // ✅ Handler stable qui ne cause pas de re-render
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      id: null,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      login: '',
      mot_de_passe: '',
      confirmation_mot_de_passe: '',
      departement: 'Scolarité',
      permissions: [],
      statut: 'actif'
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {formData.id ? 'Modifier le secrétaire' : 'Nouveau secrétaire'}
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Login *</label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
          <select
            name="departement"
            value={formData.departement}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departements.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.id ? 'Nouveau mot de passe' : 'Mot de passe *'}
          </label>
          <input
            type="password"
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.id ? "Laisser vide pour ne pas modifier" : ""}
            required={!formData.id}
          />
          {formData.id && (
            <p className="text-xs text-gray-500 mt-1">Laisser vide pour conserver le mot de passe actuel</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.id ? 'Confirmer le nouveau mot de passe' : 'Confirmation *'}
          </label>
          <input
            type="password"
            name="confirmation_mot_de_passe"
            value={formData.confirmation_mot_de_passe}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.id ? "Confirmer le nouveau mot de passe" : ""}
            required={!formData.id}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {formData.id ? 'Modifier' : 'Ajouter'}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  );
};

const DirecteurEtudeForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading, 
  roles, 
  grades, 
  departements 
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    login: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: '',
    role: 'Directeur_Etudes',
    faculte_uas: '',
    departement: '',
    grade: 'Professeur',
    statut: 'actif'
  });

  useEffect(() => {
    if (initialData) {
      // Normaliser toutes les données avec des valeurs par défaut pour éviter les champs vides
      setFormData({
        id: initialData.id || null,
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        email: initialData.email || '',
        telephone: initialData.telephone || '',
        login: initialData.login || '',
        role: initialData.role || 'Directeur_Etudes',
        faculte_uas: initialData.faculte_uas || '',
        departement: initialData.departement || '',
        grade: initialData.grade || 'Professeur',
        statut: initialData.statut || 'actif',
        mot_de_passe: '',
        confirmation_mot_de_passe: ''
      });
    } else {
      // Réinitialiser le formulaire quand initialData devient null
      setFormData({
        id: null,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        mot_de_passe: '',
        confirmation_mot_de_passe: '',
        role: 'Directeur_Etudes',
        faculte_uas: '',
        departement: '',
        grade: 'Professeur',
        statut: 'actif'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      id: null,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      login: '',
      mot_de_passe: '',
      confirmation_mot_de_passe: '',
      role: 'Directeur_Etudes',
      faculte_uas: '',
      departement: '',
      grade: 'Professeur',
      statut: 'actif'
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {formData.id ? 'Modifier le directeur d\'étude' : 'Nouveau directeur d\'étude'}
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Login *</label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
          <input
            type="text"
            name="departement"
            value={formData.departement}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.id ? 'Nouveau mot de passe' : 'Mot de passe *'}
          </label>
          <input
            type="password"
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.id ? "Laisser vide pour ne pas modifier" : ""}
            required={!formData.id}
          />
          {formData.id && (
            <p className="text-xs text-gray-500 mt-1">Laisser vide pour conserver le mot de passe actuel</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.id ? 'Confirmer le nouveau mot de passe' : 'Confirmation *'}
          </label>
          <input
            type="password"
            name="confirmation_mot_de_passe"
            value={formData.confirmation_mot_de_passe}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.id ? "Confirmer le nouveau mot de passe" : ""}
            required={!formData.id}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {formData.id ? 'Modifier' : 'Ajouter'}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  );
};
const ChefFiliereForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading, 
  filieres, 
  grades 
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    login: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: '',
    filiere: '',
    grade: 'Professeur',
    specialite: '',
    statut: 'actif'
  });

  useEffect(() => {
    if (initialData) {
      // Normaliser toutes les données avec des valeurs par défaut pour éviter les champs vides
      setFormData({
        id: initialData.id || null,
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        email: initialData.email || '',
        telephone: initialData.telephone || '',
        login: initialData.login || '',
        filiere: initialData.filiere || '',
        grade: initialData.grade || 'Professeur',
        specialite: initialData.specialite || '',
        statut: initialData.statut || 'actif',
        mot_de_passe: '',
        confirmation_mot_de_passe: ''
      });
    } else {
      // Réinitialiser le formulaire quand initialData devient null
      setFormData({
        id: null,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        mot_de_passe: '',
        confirmation_mot_de_passe: '',
        filiere: '',
        grade: 'Professeur',
        specialite: '',
        statut: 'actif'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      id: null,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      login: '',
      mot_de_passe: '',
      confirmation_mot_de_passe: '',
      filiere: '',
      grade: 'Professeur',
      specialite: '',
      statut: 'actif'
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {formData.id ? 'Modifier le chef de filière' : 'Nouveau chef de filière'}
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Login *</label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filière *</label>
          <select
            name="filiere"
            value={formData.filiere}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionnez une filière</option>
            {filieres.map(filiere => (
              <option key={filiere} value={filiere}>{filiere}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
          <input
            type="text"
            name="specialite"
            value={formData.specialite}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.id ? 'Nouveau mot de passe' : 'Mot de passe *'}
          </label>
          <input
            type="password"
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.id ? "Laisser vide pour ne pas modifier" : ""}
            required={!formData.id}
          />
          {formData.id && (
            <p className="text-xs text-gray-500 mt-1">Laisser vide pour conserver le mot de passe actuel</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.id ? 'Confirmer le nouveau mot de passe' : 'Confirmation *'}
          </label>
          <input
            type="password"
            name="confirmation_mot_de_passe"
            value={formData.confirmation_mot_de_passe}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.id ? "Confirmer le nouveau mot de passe" : ""}
            required={!formData.id}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {formData.id ? 'Modifier' : 'Ajouter'}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  );
};

// Composant liste du personnel
const PersonnelList = ({ data, type, onEdit, onDelete, columns }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left text-gray-500">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          {columns.map(column => (
            <th key={column} className="px-4 py-3">{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((person, index) => (
          <tr key={person.id || index} className="bg-white border-b hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{person.nom}</td>
            <td className="px-4 py-3">{person.prenom}</td>
            <td className="px-4 py-3">{person.email}</td>
            <td className="px-4 py-3">
              {type === 'secretaires' && person.departement}
              {type === 'directeursEtude' && person.role}
              {type === 'chefsFiliere' && person.filiere}
            </td>
            <td className="px-4 py-3">
              {type === 'directeursEtude' && person.grade}
              {type === 'chefsFiliere' && person.grade}
              {type === 'secretaires' && '-'}
            </td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                person.statut === 'actif' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {person.statut === 'actif' ? 'Actif' : 'Inactif'}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Normaliser l'ID dans l'objet avant de l'envoyer
                    const normalizedPerson = { ...person };
                    if (!normalizedPerson.id) {
                      if (type === 'secretaires') normalizedPerson.id = person.id_secretaire;
                      else if (type === 'directeursEtude') normalizedPerson.id = person.id_directeur;
                      else if (type === 'chefsFiliere') normalizedPerson.id = person.id_chef_filiere;
                    }
                    
                    if (type === 'secretaires') onEdit(normalizedPerson);
                    else if (type === 'directeursEtude') onEdit(normalizedPerson);
                    else if (type === 'chefsFiliere') onEdit(normalizedPerson);
                  }}
                  className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    // Normaliser l'ID selon le type
                    let personId = person.id;
                    if (!personId) {
                      if (type === 'secretaires') personId = person.id_secretaire;
                      else if (type === 'directeursEtude') personId = person.id_directeur;
                      else if (type === 'chefsFiliere') personId = person.id_chef_filiere;
                    }
                    onDelete(type, personId, person.nom, person.prenom);
                  }}
                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
              Aucun membre trouvé
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Composants similaires pour DirecteurEtudeForm et ChefFiliereForm...
// (Je peux vous les fournir si besoin)

export default Admin;



