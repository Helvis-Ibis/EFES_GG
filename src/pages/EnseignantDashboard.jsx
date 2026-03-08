import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, Image, Video, ExternalLink, X, Plus, Check, Clock, Eye, Trash2, BookOpen, Calendar, Users, Edit, AlertTriangle } from 'lucide-react';
import { URL_BASE } from '../api/api';
import Swal from 'sweetalert2';
import { useLocation , useNavigate } from 'react-router-dom';

const EnseignantDashboard = () => {

  const location = useLocation();
  
  const navigate = useNavigate();

  // État enseignant avec valeur par défaut
  const [enseignant, setEnseignant] = useState({
    id: location.state?.enseignantData?.id || '',
    nom: location.state?.enseignantData?.nom || '',
    prenom: location.state?.enseignantData?.prenoms || '',
    email: location.state?.enseignantData?.email || '',
    filiere: location.state?.enseignantData?.filiere_enseignee || '',
    categorie: "Enseignant(s)"
  });
  const [activeTab, setActiveTab] = useState('publications');
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [showEpreuveModal, setShowEpreuveModal] = useState(false);
  const [showEpreuveDetailModal, setShowEpreuveDetailModal] = useState(false);
  const [showPublicationDetailModal, setShowPublicationDetailModal] = useState(false);
  const [showEditPublicationModal, setShowEditPublicationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEpreuve, setSelectedEpreuve] = useState(null);
  const [selectedPublication, setSelectedPublication] = useState(null);


  // États pour les formulaires
  const [publicationForm, setPublicationForm] = useState({
    titre: '',
    contenu: '',
    type_media: 'texte',
    fichier: null,
    fichier_nom: ''
  });

  const [epreuveForm, setEpreuveForm] = useState({
    titre: '',
    description: '',
    annee_academique: '2024-2025',
    fichier_nom: ''
  });

  const [publications, setPublications] = useState([]);
  const [epreuves, setEpreuves] = useState([]);

  // Fonctions pour les publications
  const createPublication = async (publicationData) => {
    try {
      const response = await fetch(URL_BASE.CRUD_PUBLICATION_ENSEIGNANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enseignant_id: enseignant.id,
          titre: publicationData.titre,
          description: publicationData.contenu,
          categorie: enseignant.categorie,
          nom_fichier: publicationData.fichier_nom,
          type_fichier: publicationData.type_media
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la publication:', error);
      throw error;
    }
  };

   // VÉRIFICATION DE L'AUTHENTIFICATION - AJOUTEZ CE CODE
   useEffect(() => {
    const checkAuth = () => {
      const enseignantToken = localStorage.getItem('enseignant_token');
      const enseignantData = localStorage.getItem('enseignant_data');
      
      if (!enseignantToken || !enseignantData) {
        Swal.fire({
          title: 'Accès non autorisé',
          text: 'Vous devez être connecté en tant qu\'enseignant pour accéder à cette page',
          icon: 'warning',
          confirmButtonText: 'Se connecter',
          background: '#1e293b',
          color: 'white'
        }).then(() => {
          navigate('/LoginEnseignant');
        });
        return;
      }

      // Vérifier si les données sont passées via location.state
      if (!location.state?.enseignantData) {
        // Récupérer les données depuis localStorage
        try {
          const savedData = JSON.parse(enseignantData);
          setEnseignant({
            id: savedData.id,
            nom: savedData.nom,
            prenom: savedData.prenoms,
            email: savedData.email,
            filiere: savedData.filiere_enseignee,
            categorie: "Enseignant(s)"
          });
        } catch (error) {
          console.error('Erreur lors du parsing des données enseignant:', error);
          navigate('/LoginEnseignant');
        }
      }
    };

    checkAuth();
  }, [location, navigate]);

  
  const fetchPublications = async () => {
    
    try {
      const response = await fetch(URL_BASE.CRUD_PUBLICATION_ENSEIGNANT_KEY(enseignant.id));
      const result = await response.json();

    console.log(result.data);

      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des publications:', error);
      return [];
    }
  };

  const updatePublication = async (publicationId, publicationData) => {
    try {
      const response = await fetch(URL_BASE.CRUD_PUBLICATION_ENSEIGNANT(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: publicationId,
          titre: publicationData.titre,
          description: publicationData.contenu,
          nom_fichier: publicationData.fichier_nom,
          type_fichier: publicationData.type_media
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la publication:', error);
      throw error;
    }
  };

  const deletePublication = async (publicationId) => {
    try {
      const response = await fetch(URL_BASE.CRUD_PUBLICATION_ENSEIGNANT(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: publicationId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la publication:', error);
      throw error;
    }
  };

  // Fonctions pour les épreuves
  const createEpreuve = async (epreuveData) => {
    try {
      const response = await fetch(URL_BASE.CRUD_EPREUVES_ENSEIGNANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: epreuveData.titre,
          description: epreuveData.description,
          annee_academique: epreuveData.annee_academique,
          fichier_nom: epreuveData.fichier_nom,
          filiere: enseignant.filiere,
          enseignant_id: enseignant.id // AJOUTER CETTE LIGNE
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'épreuve:', error);
      throw error;
    }
  };

  const fetchEpreuves = async () => {
    try {
      const response = await fetch(URL_BASE.CRUD_EPREUVES_ENSEIGNANT_KEY(enseignant.id));
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des épreuves:', error);
      return [];
    }
  };

  const marquerEpreuveErreur = async (epreuveId, raison) => {
    try {
      const response = await fetch(URL_BASE.CRUD_EPREUVES_ENSEIGNANT(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: epreuveId,
          marque_erreur: true,
          raison_erreur: raison
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de l\'erreur:', error);
      throw error;
    }
  };

  // Handlers
  const handleDeletePublication = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas annuler cette action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await deletePublication(id);
        setPublications(publications.filter(p => p.id !== id));
        Swal.fire('Supprimé!', 'La publication a été supprimée avec succès.', 'success');
      } catch (error) {
        Swal.fire('Erreur!', 'Erreur lors de la suppression: ' + error.message, 'error');
      }
    }
  };

  const handlePublicationSubmit = async () => {
    if (!publicationForm.titre || !publicationForm.contenu) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await createPublication(publicationForm);
      
      const newPublication = {
        id: result.data.id,
        titre: publicationForm.titre,
        contenu: publicationForm.contenu,
        type_media: publicationForm.type_media,
        fichier_nom: publicationForm.fichier_nom,
        categorie: enseignant.categorie,
        date: result.data.date_publication ? result.data.date_publication.split(' ')[0] : new Date().toISOString().split('T')[0],
        vues: 0,
        statut: "publié"
      };
      
      setPublications([newPublication, ...publications]);
      setShowPublicationModal(false);
      setPublicationForm({ titre: '', contenu: '', type_media: 'texte', fichier: null, fichier_nom: '' });
      Swal.fire('Succès', 'Publication créée avec succès !', 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors de la création de la publication: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPublication = async () => {
    if (!publicationForm.titre || !publicationForm.contenu) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setLoading(true);
    try {
      await updatePublication(selectedPublication.id, publicationForm);
      
      setPublications(publications.map(pub => 
        pub.id === selectedPublication.id 
          ? { ...pub, ...publicationForm }
          : pub
      ));
      
      setShowEditPublicationModal(false);
      setPublicationForm({ titre: '', contenu: '', type_media: 'texte', fichier: null, fichier_nom: '' });
      setSelectedPublication(null);
      Swal.fire('Succès', 'Publication modifiée avec succès !', 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors de la modification de la publication: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEpreuveSubmit = async () => {
    if (!epreuveForm.titre || !epreuveForm.description || !epreuveForm.fichier_nom) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await createEpreuve(epreuveForm);
      
      const newEpreuve = {
        id: result.data.id,
        ...epreuveForm,
        heure: result.data.heure,
        statut: "en_attente",
        date_envoi: result.data.date_creation ? result.data.date_creation.split(' ')[0] : new Date().toISOString().split('T')[0]
      };
      
      setEpreuves([newEpreuve, ...epreuves]);
      setShowEpreuveModal(false);
      setEpreuveForm({ titre: '', description: '', annee_academique: '2024-2025', fichier_nom: '' });
      Swal.fire('Succès', `Épreuve envoyée au chef de filière ${enseignant.filiere} !`, 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors de l\'envoi de l\'épreuve: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarquerErreur = async (epreuveId) => {
    const { value: raison } = await Swal.fire({
      title: 'Marquer comme erreur',
      input: 'textarea',
      inputLabel: 'Raison de l\'erreur',
      inputPlaceholder: 'Expliquez pourquoi cette épreuve contient une erreur...',
      inputAttributes: {
        'aria-label': 'Expliquez pourquoi cette épreuve contient une erreur'
      },
      showCancelButton: true,
      confirmButtonText: 'Marquer comme erreur',
      cancelButtonText: 'Annuler'
    });

    if (raison) {
      try {
        await marquerEpreuveErreur(epreuveId, raison);
        
        setEpreuves(epreuves.map(epreuve => 
          epreuve.id === epreuveId 
            ? { ...epreuve, marque_erreur: true, raison_erreur: raison }
            : epreuve
        ));
        
        Swal.fire('Succès', 'Épreuve marquée comme contenant une erreur', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Erreur lors du marquage: ' + error.message, 'error');
      }
    }
  };

  const handleViewPublication = (publication) => {
    setSelectedPublication(publication);
    setShowPublicationDetailModal(true);
  };

  const handleEditPublicationClick = (publication) => {
    setSelectedPublication(publication);
    setPublicationForm({
      titre: publication.titre,
      contenu: publication.contenu,
      type_media: publication.type_media,
      fichier_nom: publication.fichier_nom
    });
    setShowEditPublicationModal(true);
  };

  const handleViewEpreuve = (epreuve) => {
    setSelectedEpreuve(epreuve);
    setShowEpreuveDetailModal(true);
  };

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      const pubs = await fetchPublications();
      const epreuvesData = await fetchEpreuves();
      
      setPublications(pubs.map(pub => ({
        id: pub.id,
        titre: pub.titre,
        contenu: pub.description,
        type_media: pub.type_fichier,
        fichier_nom: pub.nom_fichier,
        categorie: pub.categorie,
        date: pub.date_publication ? pub.date_publication.split(' ')[0] : new Date().toISOString().split('T')[0],
        vues: 0,
        statut: pub.statut
      })));
      
      setEpreuves(epreuvesData.map(epreuve => ({
        id: epreuve.id,
        titre: epreuve.titre,
        description: epreuve.description,
        annee_academique: epreuve.annee_academique,
        heure: epreuve.heure,
        fichier_nom: epreuve.fichier_nom,
        statut: epreuve.statut,
        date_envoi: epreuve.date_creation ? epreuve.date_creation.split(' ')[0] : new Date().toISOString().split('T')[0],
        marque_erreur: epreuve.marque_erreur,
        raison_erreur: epreuve.raison_erreur
      })));
    };
    
    loadData();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler',
      background: '#1e293b',
      color: 'white'
    }).then((result) => {
      if (result.isConfirmed) {
        // Supprimer toutes les données de session enseignant
        localStorage.removeItem('enseignant_token');
        localStorage.removeItem('enseignant_data');
        localStorage.removeItem('remember_me');
        
        // Afficher un message de confirmation
        Swal.fire({
          title: 'Déconnecté !',
          text: 'Vous avez été déconnecté avec succès.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: 'white'
        }).then(() => {
          // Rediriger vers la page de connexion enseignant
          navigate('/LoginEnseignant');
        });
      }
    });
  };


  const getStatutBadge = (statut) => {
    if (statut === 'approuve') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          <Check className="w-3 h-3" />
          Approuvé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
        <Clock className="w-3 h-3" />
        En attente
      </span>
    );
  };

  const getErreurBadge = (epreuve) => {
    if (epreuve.marque_erreur) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Contient une erreur
        </span>
      );
    }
    return null;
  };

  // Statistiques
  const stats = {
    publications: publications.length,
    epreuves: epreuves.length,
    enAttente: epreuves.filter(e => e.statut === 'en_attente').length,
    approuves: epreuves.filter(e => e.statut === 'approuve').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Enseignant</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour, {enseignant.prenom} {enseignant.nom}
              </h1>
              <p className="text-blue-100">
                Filière: {enseignant.filiere} • Catégorie: {enseignant.categorie}
              </p>
            </div>
                    {/* Bouton de déconnexion */}
            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 backdrop-blur-sm hover:bg-red-500 border border-white/30 rounded-xl transition-all duration-200 hover:scale-105"
              title="Se déconnecter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.publications}</div>
              <div className="text-sm text-blue-100">Publications</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.epreuves}</div>
              <div className="text-sm text-blue-100">Épreuves envoyées</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.enAttente}</div>
              <div className="text-sm text-blue-100">En attente</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.approuves}</div>
              <div className="text-sm text-blue-100">Approuvées</div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('publications')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'publications'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                Publications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('epreuves')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'epreuves'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Épreuves
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Tab Publications */}
            {activeTab === 'publications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Mes Publications</h2>
                  <button
                    onClick={() => setShowPublicationModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle Publication
                  </button>
                </div>

                <div className="space-y-4">
                  {publications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune publication pour le moment
                    </div>
                  ) : (
                    publications.map(pub => (
                      <div key={pub.id} className="bg-gradient-to-r from-white to-blue-50/30 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{pub.titre}</h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">{pub.contenu}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {pub.date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {pub.vues} vues
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                {pub.categorie}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleViewPublication(pub)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Voir la publication"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditPublicationClick(pub)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Modifier la publication"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePublication(pub.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Supprimer la publication"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab Épreuves */}
            {activeTab === 'epreuves' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Mes Épreuves</h2>
                  <button
                    onClick={() => setShowEpreuveModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Envoyer une Épreuve
                  </button>
                </div>

                <div className="space-y-4">
                  {epreuves.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune épreuve pour le moment
                    </div>
                  ) : (
                    epreuves.map(epreuve => (
                      <div key={epreuve.id} className="bg-gradient-to-r from-white to-indigo-50/30 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-gray-900">{epreuve.titre}</h3>
                              {getStatutBadge(epreuve.statut)}
                              {getErreurBadge(epreuve)}
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{epreuve.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium">
                                {epreuve.annee_academique}
                              </span>
                              <span>Heure: {epreuve.heure}</span>
                              <span>Fichier: {epreuve.fichier_nom}</span>
                              <span>Envoyé le: {epreuve.date_envoi}</span>
                            </div>
                            {epreuve.raison_erreur && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">
                                  <strong>Raison de l'erreur:</strong> {epreuve.raison_erreur}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleViewEpreuve(epreuve)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(!epreuve.marque_erreur || epreuve.statut == "approuve") ? (
                              <button
                                onClick={() => handleMarquerErreur(epreuve.id)}
                                className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                title="Marquer comme erreur"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            ):(
                              <></>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nouvelle Publication */}
      {showPublicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Nouvelle Publication</h3>
              <button onClick={() => setShowPublicationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={publicationForm.titre}
                  onChange={(e) => setPublicationForm({ ...publicationForm, titre: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de la publication"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie (fixe)</label>
                <input
                  type="text"
                  value={enseignant.categorie}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu *</label>
                <textarea
                  value={publicationForm.contenu}
                  onChange={(e) => setPublicationForm({ ...publicationForm, contenu: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contenu de la publication..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de média</label>
                <select
                  value={publicationForm.type_media}
                  onChange={(e) => setPublicationForm({ ...publicationForm, type_media: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="texte">Texte uniquement</option>
                  <option value="image">Image (JPG, PNG, GIF)</option>
                  <option value="pdf">Document PDF</option>
                  <option value="audio">Audio (MP3, WAV)</option>
                </select>
              </div>
              {publicationForm.type_media !== 'texte' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {publicationForm.type_media === 'image' && 'Fichier Image *'}
                    {publicationForm.type_media === 'pdf' && 'Fichier PDF *'}
                    {publicationForm.type_media === 'audio' && 'Fichier Audio *'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      {publicationForm.type_media === 'image' && 'Cliquez pour télécharger une image'}
                      {publicationForm.type_media === 'pdf' && 'Cliquez pour télécharger un PDF'}
                      {publicationForm.type_media === 'audio' && 'Cliquez pour télécharger un audio'}
                    </p>
                    
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept={
                        publicationForm.type_media === 'image' ? '.jpg,.jpeg,.png,.gif' :
                        publicationForm.type_media === 'pdf' ? '.pdf' :
                        '.mp3,.wav'
                      }
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPublicationForm({
                            ...publicationForm,
                            fichier: file,
                            fichier_nom: file.name
                          });
                        }
                      }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload').click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choisir un fichier
                    </button>
                    
                    {publicationForm.fichier_nom && (
                      <p className="mt-2 text-sm text-green-600">
                        Fichier sélectionné: {publicationForm.fichier_nom}
                      </p>
                    )}
                    
                    <input
                      type="text"
                      value={publicationForm.fichier_nom}
                      onChange={(e) => setPublicationForm({ ...publicationForm, fichier_nom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                      placeholder={
                        publicationForm.type_media === 'image' ? 'Ex: photo.jpg' :
                        publicationForm.type_media === 'pdf' ? 'Ex: document.pdf' :
                        'Ex: audio.mp3'
                      }
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePublicationSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Publication...' : 'Publier'}
                </button>
                <button
                  onClick={() => setShowPublicationModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Épreuve */}
      {showEpreuveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Envoyer une Épreuve</h3>
              <button onClick={() => setShowEpreuveModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Destination:</strong> Chef de filière {enseignant.filiere}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'épreuve *</label>
                <input
                  type="text"
                  value={epreuveForm.titre}
                  onChange={(e) => setEpreuveForm({ ...epreuveForm, titre: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Examen Final - Grammaire Anglaise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={epreuveForm.description}
                  onChange={(e) => setEpreuveForm({ ...epreuveForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez le contenu de l'épreuve..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année académique</label>
                <select
                  value={epreuveForm.annee_academique}
                  onChange={(e) => setEpreuveForm({ ...epreuveForm, annee_academique: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2022-2023">2022-2023</option>
                </select>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>📌 Information:</strong> L'heure d'envoi sera générée automatiquement lors de la soumission de l'épreuve.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier de l'épreuve (PDF) *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Cliquez pour télécharger ou glissez-déposez</p>
                  
                  <input
                    type="file"
                    id="epreuve-file-upload"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEpreuveForm({
                          ...epreuveForm,
                          fichier: file,
                          fichier_nom: file.name
                        });
                      }
                    }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('epreuve-file-upload').click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choisir un fichier PDF
                  </button>
                  
                  {epreuveForm.fichier_nom && (
                    <p className="mt-2 text-sm text-green-600">
                      Fichier sélectionné: {epreuveForm.fichier_nom}
                    </p>
                  )}
                  
                  <input
                    type="text"
                    value={epreuveForm.fichier_nom}
                    onChange={(e) => setEpreuveForm({ ...epreuveForm, fichier_nom: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    placeholder="Nom du fichier (ex: examen_final.pdf)"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEpreuveSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Envoi...' : 'Envoyer au Chef de Filière'}
                </button>
                <button
                  onClick={() => setShowEpreuveModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Épreuve */}
      {showEpreuveDetailModal && selectedEpreuve && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Détails de l'Épreuve</h3>
              <button onClick={() => setShowEpreuveDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <p className="text-gray-900 font-medium">{selectedEpreuve.titre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedEpreuve.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Année académique</label>
                  <p className="text-gray-600">{selectedEpreuve.annee_academique}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure d'envoi</label>
                  <p className="text-gray-600">{selectedEpreuve.heure}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <p className="text-gray-600">{selectedEpreuve.fichier_nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="mt-1">
                  {getStatutBadge(selectedEpreuve.statut)}
                </div>
              </div>
              {selectedEpreuve.marque_erreur && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-red-700 mb-2">Raison de l'erreur</label>
                  <p className="text-red-600 whitespace-pre-wrap">{selectedEpreuve.raison_erreur}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEpreuveDetailModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Publication */}
      {showPublicationDetailModal && selectedPublication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Détails de la Publication</h3>
              <button onClick={() => setShowPublicationDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <p className="text-gray-900 font-medium text-lg">{selectedPublication.titre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{selectedPublication.contenu}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <p className="text-gray-600">{selectedPublication.categorie}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                  <p className="text-gray-600">{selectedPublication.date}</p>
                </div>
              </div>
              {selectedPublication.fichier_nom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fichier joint</label>
                  <p className="text-gray-600">{selectedPublication.fichier_nom}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPublicationDetailModal(false);
                    handleEditPublicationClick(selectedPublication);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setShowPublicationDetailModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification Publication */}
      {showEditPublicationModal && selectedPublication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Modifier la Publication</h3>
              <button onClick={() => setShowEditPublicationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={publicationForm.titre}
                  onChange={(e) => setPublicationForm({ ...publicationForm, titre: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de la publication"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie (fixe)</label>
                <input
                  type="text"
                  value={enseignant.categorie}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu *</label>
                <textarea
                  value={publicationForm.contenu}
                  onChange={(e) => setPublicationForm({ ...publicationForm, contenu: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contenu de la publication..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de média</label>
                <select
                  value={publicationForm.type_media}
                  onChange={(e) => setPublicationForm({ ...publicationForm, type_media: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="texte">Texte uniquement</option>
                  <option value="image">Image (JPG, PNG, GIF)</option>
                  <option value="pdf">Document PDF</option>
                  <option value="audio">Audio (MP3, WAV)</option>
                </select>
              </div>
              {publicationForm.type_media !== 'texte' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {publicationForm.type_media === 'image' && 'Fichier Image'}
                    {publicationForm.type_media === 'pdf' && 'Fichier PDF'}
                    {publicationForm.type_media === 'audio' && 'Fichier Audio'}
                  </label>
                  <input
                    type="text"
                    value={publicationForm.fichier_nom}
                    onChange={(e) => setPublicationForm({ ...publicationForm, fichier_nom: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      publicationForm.type_media === 'image' ? 'Ex: photo.jpg' :
                      publicationForm.type_media === 'pdf' ? 'Ex: document.pdf' :
                      'Ex: audio.mp3'
                    }
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditPublication}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Modifier la Publication'}
                </button>
                <button
                  onClick={() => setShowEditPublicationModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnseignantDashboard;