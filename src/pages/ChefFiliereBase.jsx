import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Flag, Check, X, FileText, Filter, Calendar, Clock, FileCheck, LogOut } from 'lucide-react';
import { API_URL_BASE, URL_BASE } from '../api/api';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';

const ChefFiliereBase = () => {
  const [epreuves, setEpreuves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showErreurModal, setShowErreurModal] = useState(false);
  const [selectedEpreuve, setSelectedEpreuve] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    prenom: "Jean",
    nom: "Dupont",
    filiere: "Anglais"
  });

  const navigate = useNavigate();
  // VÉRIFICATION D'AUTHENTIFICATION - AJOUTEZ CE CODE
  useEffect(() => {
    const checkAuthentication = () => {
      const chefFiliereData = localStorage.getItem('chef_filiere');
      const userRole = localStorage.getItem('user_role');
      
      if (!chefFiliereData || userRole !== 'chef_filiere') {
        Swal.fire({
          title: 'Accès non autorisé',
          text: 'Vous devez être connecté en tant que chef de filière pour accéder à cette page',
          icon: 'warning',
          confirmButtonText: 'Se connecter',
          background: '#1e1b4b',
          color: 'white',
          confirmButtonColor: '#6366f1'
        }).then(() => {
          navigate('/login-chef-filiere');
        });
        return false;
      }
      return true;
    };

    // Vérifier l'authentification au chargement
    if (!checkAuthentication()) {
      return;
    }

    // Charger les données utilisateur si authentifié
    const loadUserData = () => {
      try {
        const chefData = localStorage.getItem('chef_filiere');
        if (chefData) {
          const parsedData = JSON.parse(chefData);
          setUser(parsedData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        handleLogout();
      }
    };

    loadUserData();
  }, [navigate]);

  // Fonction de déconnexion
 // FONCTION DE DÉCONNEXION AMÉLIORÉE
 const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Déconnexion',
    text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, se déconnecter',
    cancelButtonText: 'Annuler',
    background: '#1e1b4b',
    color: 'white'
  });

  if (result.isConfirmed) {
    try {
      // Appel à l'API de déconnexion si nécessaire
      const response = await fetch(`${API_URL_BASE}/logout_chef_filiere.php`, {
        method: 'POST',
        credentials: 'include'
      });

      // Nettoyer le localStorage
      localStorage.removeItem('chef_filiere');
      localStorage.removeItem('user_role');
      localStorage.removeItem('chef_filiere_token');
      sessionStorage.removeItem('chef_filiere_session');

      Swal.fire({
        title: 'Déconnecté!',
        text: 'Vous avez été déconnecté avec succès.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#1e1b4b',
        color: 'white'
      }).then(() => {
        navigate('/login-chef-filiere');
      });

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Nettoyage quand même en cas d'erreur
      localStorage.removeItem('chef_filiere');
      localStorage.removeItem('user_role');
      localStorage.removeItem('chef_filiere_token');
      
      Swal.fire({
        title: 'Déconnecté!',
        text: 'Vous avez été déconnecté.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#1e1b4b',
        color: 'white'
      }).then(() => {
        navigate('/login-chef-filiere');
      });
    }
  }
};

  // Fonction de déconnexion simple (alternative)
  const handleSimpleLogout = () => {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Effacer les données de session côté client
        localStorage.removeItem('chef_filiere_token');
        sessionStorage.removeItem('chef_filiere_session');
        
        // Redirection vers la page de connexion
        Swal.fire('Déconnecté!', 'Vous avez été déconnecté avec succès.', 'success');
        setTimeout(() => {
          window.location.href = `${URL_BASE}/login-chef-filiere`;
        }, 1500);
      }
    });
  };

 // Récupérer les informations de l'utilisateur connecté
 useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      // Vérifier d'abord l'authentification
      const chefFiliereData = localStorage.getItem('chef_filiere');
      if (!chefFiliereData) {
        handleLogout();
        return;
      }

      const response = await fetch(`${API_URL_BASE}/api/chef_filiere_info.php`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          // Mettre à jour le localStorage avec les données fraîches
          localStorage.setItem('chef_filiere', JSON.stringify(data.data));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
    }
  };

  fetchUserInfo();
}, []);

 // Récupérer les épreuves depuis l'API
 const fetchEpreuves = async () => {
  try {
    // Vérifier l'authentification avant de faire l'appel API
    const chefFiliereData = localStorage.getItem('chef_filiere');
    if (!chefFiliereData) {
      handleLogout();
      return;
    }

    setLoading(true);
    const response = await fetch(`${API_URL_BASE}/api/epreuves.php?filiere=${user.filiere}`, {
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success) {
      setEpreuves(result.data);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des épreuves:', error);
    Swal.fire('Erreur', 'Erreur lors du chargement des épreuves', 'error');
  } finally {
    setLoading(false);
  }
};

  // Approuver une épreuve
  const approuverEpreuve = async (epreuveId) => {
    try {
      const response = await fetch(`${API_URL_BASE}/api/epreuves.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: epreuveId,
          statut: 'approuve'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Mettre à jour l'état local
        setEpreuves(epreuves.map(epreuve => 
          epreuve.id === epreuveId 
            ? { ...epreuve, statut: 'approuve' }
            : epreuve
        ));
        Swal.fire('Succès', 'Épreuve approuvée avec succès', 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      Swal.fire('Erreur', 'Erreur lors de l\'approbation', 'error');
    }
  };

  // Télécharger un fichier
  const telechargerFichier = (epreuve, fichierChemin, fichierNom) => {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = `${API_URL_BASE}/${fichierChemin}`;
    link.download = fichierNom;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Marquer comme erreur
  const marquerErreur = async (epreuveId) => {
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
        const response = await fetch(`${API_URL_BASE}/api/epreuves.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            id: epreuveId,
            marque_erreur: true,
            raison_erreur: raison,
            statut: 'erreur'
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setEpreuves(epreuves.map(epreuve => 
            epreuve.id === epreuveId 
              ? { ...epreuve, marque_erreur: true, raison_erreur: raison, statut: 'erreur' }
              : epreuve
          ));
          Swal.fire('Succès', 'Épreuve marquée comme erreur', 'success');
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Erreur lors du marquage:', error);
        Swal.fire('Erreur', 'Erreur lors du marquage', 'error');
      }
    }
  };

  // Voir les détails d'une erreur
  const voirDetailsErreur = (epreuve) => {
    setSelectedEpreuve(epreuve);
    setShowErreurModal(true);
  };

  // Charger les épreuves au montage du composant
  useEffect(() => {
    fetchEpreuves();
  }, []);

  // Filtrer les épreuves
  const epreuvesFiltrees = epreuves.filter(epreuve => {
    const matchesSearch = epreuve.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         epreuve.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAnnee = !selectedAnnee || epreuve.annee_academique === selectedAnnee;
    const matchesStatut = !selectedStatut || epreuve.statut === selectedStatut;
    return matchesSearch && matchesAnnee && matchesStatut;
  });

  // Obtenir les années académiques uniques
  const anneesAcademiques = [...new Set(epreuves.map(e => e.annee_academique))];

  // Statistiques
  const stats = {
    total: epreuves.length,
    approuves: epreuves.filter(e => e.statut === 'approuve').length,
    enAttente: epreuves.filter(e => e.statut === 'en_attente').length,
    erreurs: epreuves.filter(e => e.marque_erreur).length
  };

  const getStatutBadge = (epreuve) => {
    if (epreuve.marque_erreur) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">
          <Flag className="w-3 h-3" />
          Erreur
        </span>
      );
    }
    if (epreuve.statut === 'approuve') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
          <Check className="w-3 h-3" />
          Approuvé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
        <Clock className="w-3 h-3" />
        En attente
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* En-tête avec gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <FileCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Chef de Filière</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Filière {user.filiere}
              </h1>
              <p className="text-blue-100">
                Gestion et validation des épreuves académiques
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-3">
                <div className="text-xs text-blue-100 mb-1">Connecté en tant que</div>
                <div className="font-semibold text-lg">{user.prenom} {user.nom}</div>
              </div>
              
               {/* Bouton de déconnexion */}
               <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 
                rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 text-white font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-blue-100">Total épreuves</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.approuves}</div>
              <div className="text-sm text-blue-100">Approuvées</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.enAttente}</div>
              <div className="text-sm text-blue-100">En attente</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.erreurs}</div>
              <div className="text-sm text-blue-100">Erreurs</div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre ou description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {(selectedAnnee || selectedStatut) && (
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année académique
                  </label>
                  <select
                    value={selectedAnnee}
                    onChange={(e) => setSelectedAnnee(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Toutes les années</option>
                    {anneesAcademiques.map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={selectedStatut}
                    onChange={(e) => setSelectedStatut(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="approuve">Approuvé</option>
                    <option value="erreur">Erreur</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liste des épreuves */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Épreuves de la filière
              </h2>
              <span className="text-sm text-gray-500">
                {epreuvesFiltrees.length} résultat{epreuvesFiltrees.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des épreuves...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {epreuvesFiltrees.map(epreuve => (
                <div key={epreuve.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
                  <div className="flex items-start gap-6">
                    {/* Icône de document */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {epreuve.titre}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {epreuve.description}
                          </p>
                        </div>
                        {getStatutBadge(epreuve)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {epreuve.annee_academique}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3.5 h-3.5" />
                          {epreuve.heure}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <FileText className="w-3.5 h-3.5" />
                          {epreuve.fichier_nom}
                        </span>
                      </div>

                      {epreuve.marque_erreur && epreuve.raison_erreur && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Raison de l'erreur:</span> {epreuve.raison_erreur}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => telechargerFichier(epreuve, epreuve.fichier_chemin, epreuve.fichier_nom)}
                        className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 hover:scale-110 transition-all shadow-sm"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      
                      {epreuve.marque_erreur ? (
                        <button
                          onClick={() => voirDetailsErreur(epreuve)}
                          className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 hover:scale-110 transition-all shadow-sm"
                          title="Voir les détails de l'erreur"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      ) : (
                        <>
                          {epreuve.statut !== 'approuve' && (
                            <button
                              onClick={() => approuverEpreuve(epreuve.id)}
                              className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 hover:scale-110 transition-all shadow-sm"
                              title="Approuver"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {epreuvesFiltrees.length === 0 && !loading && (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune épreuve trouvée
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Détails Erreur */}
      {showErreurModal && selectedEpreuve && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Détails de l'Erreur</h3>
              <button 
                onClick={() => setShowErreurModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Épreuve</label>
                <p className="text-gray-900 font-medium">{selectedEpreuve.titre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raison de l'erreur</label>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 whitespace-pre-wrap">{selectedEpreuve.raison_erreur}</p>
                </div>
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
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowErreurModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefFiliereBase;