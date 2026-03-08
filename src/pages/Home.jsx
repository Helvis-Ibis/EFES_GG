import React, { useState, useEffect } from 'react';
import { Menu, X, Award, Heart, School, Target, History,
   Users, BookOpen, Globe, Mail, Phone, MapPin, Facebook, 
   ChevronLeft, ChevronRight, Image, AlertCircle,
   Linkedin, Twitter, GraduationCap, Building2, Laptop, 
   PlayCircle, Calendar, TrendingUp, CheckCircle, Star, 
   ChevronDown, ChevronUp, FileText, Download, Eye,Lock, ArrowRight,
   Building, Settings, UserCheck, Shield, ClipboardList, BarChart3 } from 'lucide-react';
    import { newsItems } from '../data/news';
    import { videos } from '../data/videos';
    import image_home from '../assets/images/shutterstock_393946957-1.jpg';
    import image2 from '../assets/images/image2.jpg';
    import image3 from '../assets/images/image3.jpg';
    import image4 from '../assets/images/image4.png';
    import image5 from '../assets/images/img2.jpg';
    import image6 from '../assets/images/img3.jpg';
    import image7 from '../assets/images/img4.jpg';
    import image8 from '../assets/images/img7.jpg';
    import VideoModal from './VideoModal';
    import { Liens } from '../data/Liens';
    import Navbar from '../components/Navbar';
    import Swal from 'sweetalert2';
    import { API_URL_BASE, URL_BASE } from '../api/api';

    const Home = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedVideo, setSelectedVideo] = useState(null);
      const [currentImageIndex, setCurrentImageIndex] = useState(0);
      const [openNewsId, setOpenNewsId] = useState(null);
      const [activePubCategory, setActivePubCategory] = useState('Tous');
    
      // États pour l'authentification étudiant - Récupérer depuis localStorage
      const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(() => {
        // Récupérer l'état d'authentification depuis localStorage au chargement
        const savedAuth = localStorage.getItem('efes_student_authenticated');
        return savedAuth === 'true';
      });
      const [showAuthModal, setShowAuthModal] = useState(false);
      const [matricule, setMatricule] = useState('');
      const [authLoading, setAuthLoading] = useState(false);
    
      // NOUVEAUX ÉTATS pour les publications
      const [publications, setPublications] = useState([]);
      const [loadingPublications, setLoadingPublications] = useState(false);
      const [publicationsError, setPublicationsError] = useState(null);

      // ====== AJOUTEZ CES ÉTATS AU DÉBUT DE VOTRE COMPOSANT Home ======

      const [annonces, setAnnonces] = useState([]);
      const [loadingAnnonces, setLoadingAnnonces] = useState(false);
      const [annoncesError, setAnnoncesError] = useState(null);
      const [selectedAnnonce, setSelectedAnnonce] = useState(null);
      const [showAnnonceModal, setShowAnnonceModal] = useState(false);

    
      // Tableau d'images pour le carousel
      const backgroundImages = [
        image8
      ];
    
      useEffect(() => {
        const loadAnnonces = async () => {
          setLoadingAnnonces(true);
          setAnnoncesError(null);
          
          try {
            const response = await fetch(`${URL_BASE.API_ANNONCES()}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
      
            if (!response.ok) {
              throw new Error('Erreur lors du chargement des annonces');
            }
      
            const data = await response.json();
            
            if (data.success) {
              setAnnonces(data.data || []);
            } else {
              throw new Error(data.message || 'Erreur lors du chargement des annonces');
            }
          } catch (error) {
            console.error('Erreur lors du chargement des annonces:', error);
            setAnnoncesError(error.message);
            setAnnonces([]);
          } finally {
            setLoadingAnnonces(false);
          }
        };
      
        loadAnnonces();
      }, []);

            
      // ====== FONCTIONS POUR GÉRER LA MODAL D'ANNONCE ======

      const openAnnonceModal = (annonce) => {
        setSelectedAnnonce(annonce);
        setCurrentImageIndex(0);
        setShowAnnonceModal(true);
      };

      const closeAnnonceModal = () => {
        setShowAnnonceModal(false);
        setSelectedAnnonce(null);
        setCurrentImageIndex(0);
      };

      const nextImage = () => {
        if (selectedAnnonce) {
          const images = JSON.parse(selectedAnnonce.images || '[]');
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
      };

      const prevImage = () => {
        if (selectedAnnonce) {
          const images = JSON.parse(selectedAnnonce.images || '[]');
          setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
      };


      // Défilement automatique toutes les minutes
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentImageIndex((prevIndex) => 
            prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
          );
        }, 60000);
    
        return () => clearInterval(interval);
      }, [backgroundImages.length]);
    
      // NOUVEAU : Charger les publications depuis l'API
      useEffect(() => {
        const loadPublications = async () => {
          setLoadingPublications(true);
          setPublicationsError(null);
          
          try {
            const response = await fetch(`${URL_BASE.PUBLICATIONS()}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              } 
            });
    
            if (!response.ok) {
              throw new Error('Erreur lors du chargement des publications');
            }
    
            const data = await response.json();
            
            if (data.success) {
              // Transformer les données de l'API pour correspondre à votre structure
              const transformedPublications = data.data.map(pub => ({
                id: pub.id,
                title: pub.titre,
                description: pub.description,
                type: pub.type_fichier,
                size: pub.taille_fichier,
                chemin_fichier: pub.chemin_fichier,
                date: new Date(pub.date_publication).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }),
                category: pub.categorie,
                downloads: pub.telechargements || 0,
                featured: pub.est_vedette === 1,
                // Ajouter des couleurs par défaut basées sur la catégorie
                color: getCategoryColor(pub.categorie)
              }));
              
              setPublications(transformedPublications);
            } else {
              throw new Error(data.message || 'Erreur lors du chargement des publications');
            }
          } catch (error) {
            console.error('Erreur lors du chargement des publications:', error);
            setPublicationsError(error.message);
            // En cas d'erreur, utiliser les données par défaut
            setPublications(getDefaultPublications());
          } finally {
            setLoadingPublications(false);
          }
        };
    
        // Charger les publications seulement si l'utilisateur est authentifié
        if (isStudentAuthenticated) {
          loadPublications();
        } else {
          // Réinitialiser les publications si l'utilisateur se déconnecte
          setPublications([]);
        }
      }, [isStudentAuthenticated]);
    
      // Fonction pour ouvrir le modal d'authentification
      const handlePublicationAccess = () => {
        if (!isStudentAuthenticated) {
          setShowAuthModal(true);
        }
      };
    
      // Données par défaut en cas d'erreur
      const getDefaultPublications = () => {
        return [
          {
            id: 1,
            title: "Guide de l'Étudiant EFES GG 2024",
            description: "Guide complet pour les étudiants avec toutes les informations académiques et administratives",
            type: "PDF",
            size: "2.4 MB",
            date: "15 Mars 2024",
            category: "Etudiant(s)",
            downloads: 1247,
            featured: true,
            color: "from-blue-500 to-cyan-500"
          },
          // ... autres publications par défaut
        ];
      };
    
      // Fonction pour obtenir une couleur basée sur la catégorie
      const getCategoryColor = (category) => {
        const colorMap = {
          'Etudiant(s)': 'from-blue-500 to-cyan-500',
          'Administration-communiqué(s)': 'from-purple-500 to-pink-500',
          'Enseignant(s)': 'from-green-500 to-emerald-500',
          'Programmation(s)': 'from-orange-500 to-red-500',
          'extentions de l\'école': 'from-indigo-500 to-blue-500',
          'Activité(s) interne(s)': 'from-rose-500 to-purple-500',
          'Activité(s) extra-scolaire': 'from-teal-500 to-green-500'
        };
        
        return colorMap[category] || 'from-gray-500 to-gray-600';
      };
    
      // Fonction pour vérifier le matricule - MODIFIÉE pour sauvegarder l'état
      const verifyMatricule = async () => {
        if (!matricule.trim()) {
          Swal.fire({
            icon: 'error',
            title: 'Champ requis',
            text: 'Veuillez entrer votre numéro matricule',
            confirmButtonText: 'OK'
          });
          return;
        }
    
        setAuthLoading(true);
    
        try {
          const response = await fetch(`${URL_BASE.VERIFY_MATRICULE()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matricule: matricule.trim() })
          });
    
          const data = await response.json();
    
          if (data.success) {
            // Sauvegarder l'état d'authentification dans localStorage
            localStorage.setItem('efes_student_authenticated', 'true');
            localStorage.setItem('efes_student_matricule', matricule.trim());
            localStorage.setItem('efes_student_nom', data.etudiant.nom);
            localStorage.setItem('efes_student_prenom', data.etudiant.prenom);
            
            setIsStudentAuthenticated(true);
            setShowAuthModal(false);
            setMatricule('');
            
            Swal.fire({
              icon: 'success',
              title: 'Authentification réussie !',
              text: `Bienvenue ${data.etudiant.nom} ${data.etudiant.prenom}`,
              confirmButtonText: 'Accéder aux publications'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Matricule invalide',
              text: data.message || 'Le numéro matricule que vous avez saisi est incorrect.',
              confirmButtonText: 'Réessayer'
            });
          }
        } catch (error) {
          console.error('Erreur lors de la vérification:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur de connexion',
            text: 'Impossible de vérifier votre matricule. Veuillez réessayer.',
            confirmButtonText: 'OK'
          });
        } finally {
          setAuthLoading(false);
        }
      };
    
      // Fonction pour se déconnecter - MODIFIÉE pour supprimer le localStorage
      const handleLogout = () => {
        // Supprimer les données d'authentification du localStorage
        localStorage.removeItem('efes_student_authenticated');
        localStorage.removeItem('efes_student_matricule');
        localStorage.removeItem('efes_student_nom');
        localStorage.removeItem('efes_student_prenom');
        
        setIsStudentAuthenticated(false);
        Swal.fire({
          icon: 'info',
          title: 'Déconnexion',
          text: 'Vous avez été déconnecté de l\'espace publications.',
          confirmButtonText: 'OK'
        });
      };
    
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Ajoutez ces fonctions dans votre composant
const openModal = (video) => {
  setSelectedVideo(video);
  setIsModalOpen(true);
};

  const toggleNewsDropdown = (id) => {
    setOpenNewsId(openNewsId === id ? null : id);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Votre logique de scroll si nécessaire
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  



  const stats = [
    { number: "20+", label: "Années d'Expérience", icon: <History className="w-6 h-6" /> },
    { number: "5", label: "Villes d'Implantation", icon: <MapPin className="w-6 h-6" /> },
    { number: "100%", label: "Réussite Qualité", icon: <Award className="w-6 h-6" /> },
    { number: "2025", label: "Ouverture Officielle", icon: <Calendar className="w-6 h-6" /> }
  ];

  const programs = [
    {
      title: "Formation Initiale",
      level: "BAPES 1 , 2 et 3 (Licence Professionnel)",
      duration: "3 ans",
      description: "Formation complète pour devenir enseignant du secondaire avec stages pratiques.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Formation Continue",
      level: "Certification",
      duration: "Flexible",
      description: "Perfectionnement pédagogique pour enseignants en exercice.",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      title: "Master en Éducation",
      level: "CAPES 1 et 2 (Master Professionnel)",
      duration: "2 ans",
      description: "Approfondissement en sciences de l'éducation et pédagogie avancée.",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Recherche Pédagogique",
      level: "Recherche",
      duration: "Variable",
      description: "Développement de pratiques éducatives innovantes adaptées au contexte socioculturel béninois.",
      color: "bg-gradient-to-br from-rose-500 to-rose-600"
    }
  ];

  {/* Modal d'authentification étudiant */}

  // Nouvelles données pour les dropdowns d'actualités
  const newsDropdownItems = [
    {
      id: 1,
      title: "Événement National",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            L'EFES GG participe activement aux événements nationaux liés à l'éducation et à la formation des enseignants.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Nous collaborons avec le Ministère de l'Éducation pour améliorer la qualité de l'enseignement secondaire au Bénin.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800 font-medium">
              Partenaire engagé dans la réforme éducative nationale.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Événement EFES GG",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Découvrez les événements exclusifs organisés par notre établissement pour promouvoir l'excellence éducative.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-2">Journées Portes Ouvertes</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Présentation de nos formations innovantes</li>
                <li>• Rencontre avec nos enseignants et étudiants</li>
                <li>• Visite guidée de nos infrastructures</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-2">Séminaires Pédagogiques</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Ateliers de perfectionnement</li>
                <li>• Conférences avec experts internationaux</li>
                <li>• Échanges de bonnes pratiques</li>
              </ul>
            </div>
          </div>
          
          <p className="text-gray-700 leading-relaxed font-medium">
            Des événements conçus pour inspirer, former et connecter la communauté éducative.
          </p>
        </div>
      )
    },
    {
      id: 3,
      title: "International",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            L'EFES GG s'inscrit dans une dynamique internationale avec des partenariats stratégiques à travers le monde.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Nous participons à des programmes d'échange et collaborons avec des institutions éducatives de renom.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <p className="text-purple-800 font-medium">
              Une vision globale pour une éducation d'excellence.
            </p>
          </div>
        </div>
      )
    }
  ];

  // Objectifs EFES GG
  const objectives = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Formation Humaine et Professionnelle",
      description: "Une formation humaine et professionnelle pour un développement humain intégral",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Formation Initiale Professionnalisante",
      description: "Offrir une formation initiale professionnalisante aux futurs enseignants du secondaire",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Qualité de l'Éducation Nationale",
      description: "Contribuer à la qualité de l'éducation nationale, notamment dans les régions du Nord",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestion Administrative",
      description: "Former des enseignants à la gestion administrative des établissements scolaires",
      color: "from-rose-500 to-rose-600"
    }
  ];

  // Structure organisationnelle
  const organizationalStructure = {
    strategic: [
     
      {
        title: "Conseil d'Administration",
        description: "",
        icon: <Users className="w-8 h-8" />,
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "Direction de l'École",
        description: "",
        icon: <Settings className="w-8 h-8" />,
        color: "from-green-500 to-green-600"
      }
    ],
    operational: [
      {
        title: "Direction Générale",
        description: "- Direction administrative et financière \n - Service de la scolarité \n - Service logistique" ,
        icon: <BarChart3 className="w-8 h-8" />,
        color: "from-indigo-500 to-indigo-600"
      },
      {
        title: "Direction de l'EFES GNON GANI",
        description: "- Direction des Études \n - Prefet de discipline \n - Gouvernement Estudiantin",
        icon: <BookOpen className="w-8 h-8" />,
        color: "from-purple-500 to-purple-600"
      },
      
     
    ],
    consultative: [
      {
        title: "Conseil des Chefs Filières",
        description: "Coordination des programmes académiques",
        icon: <Users className="w-8 h-8" />,
        color: "from-violet-500 to-violet-600"
      },
      {
        title: "Conseil Scientifique et Pédagogique",
        description: "Orientation scientifique et pédagogique",
        icon: <BookOpen className="w-8 h-8" />,
        color: "from-amber-500 to-amber-600"
      },
      {
        title: "Comité de Gestion",
        description: "Gestion participative de l'établissement",
        icon: <Settings className="w-8 h-8" />,
        color: "from-emerald-500 to-emerald-600"
      },
      {
        title: "Commission d'Admission",
        description: "Sélection et admission des étudiants",
        icon: <ClipboardList className="w-8 h-8" />,
        color: "from-sky-500 to-sky-600"
      },
      {
        title: "Gouvernement des Étudiants",
        description: "Représentation étudiante et vie campus",
        icon: <UserCheck className="w-8 h-8" />,
        color: "from-pink-500 to-pink-600"
      }
    ]
  };

  // Publications de l'établissement avec nouvelles catégories


  const categories = ['Tous','Etudiant(s)','Enseignant(s)', 'Administration-communiqué(s)', 'Programmation(s)', 'extentions de l\'école','Activité(s) interne(s)', 'Activité(s) extra-scolaire'];

  const filteredPublications = activePubCategory === 'Tous' 
    ? publications 
    : publications.filter(pub => pub.category === activePubCategory);

const handlePublicationClick = async (publication) => {
  console.log(publication);
  
  Swal.fire({
    title: publication.title,
    html: `
      <div class="text-left">
        <p class="mb-2"><strong>Description:</strong> ${publication.description}</p>
        <p class="mb-2"><strong>Catégorie:</strong> ${publication.category}</p>
        <p class="mb-2"><strong>Taille:</strong> ${publication.size}</p>
        <p class="mb-4"><strong>Date:</strong> ${publication.date}</p>
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    //confirmButtonText: 'Télécharger',
    cancelButtonText: 'Visualiser',
   // confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    showDenyButton: true,
    denyButtonText: 'Fermer',
    denyButtonColor: '#dc2626'
  }).then(async (result) => {
    if (result.isConfirmed) {
      /*
      try {
        // Appel API pour incrémenter le compteur de téléchargements
        await fetch(`${URL_BASE.INCREMENT_DOWNLOADS(publication.id)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Mettre à jour localement le compteur
        setPublications(prev => prev.map(pub => 
          pub.id === publication.id 
            ? { ...pub, downloads: pub.downloads + 1 }
            : pub
        ));
        
        Swal.fire('Téléchargement', 'Le téléchargement va commencer...', 'success');
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        Swal.fire('Téléchargement', 'Le téléchargement va commencer...', 'success');
      } */
    } else if (result.dismiss !== Swal.DismissReason.deny) {
      // Ouvrir le fichier dans un nouvel onglet
      if (publication.chemin_fichier) {
        // Créer l'URL complète du fichier
        const fileUrl = `${API_URL_BASE}/${publication.chemin_fichier}`;
        
        // Ouvrir dans un nouvel onglet
        window.open(fileUrl, '_blank');
        
        Swal.fire('Succès', 'Document ouvert dans un nouvel onglet', 'success');
      } else {
        Swal.fire('Erreur', 'Aucun fichier disponible pour cette publication', 'error');
      }
    }
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .glass { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .gradient-text { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); -webkit-backdrop-filter: blur(10px); }
        
        /* Animation de transition pour les images */
        .image-transition {
          transition: opacity 1.5s ease-in-out;
        }

        /* Animation pour les dropdowns */
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .dropdown-enter {
          animation: slideDown 0.3s ease-out forwards;
        }

        /* Animation pour les cartes de publications */
        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .card-entrance {
          animation: cardEntrance 0.6s ease-out;
        }
      `}</style>

      {/* Navigation */}
      <Navbar/>

      {/* Hero Section avec carousel d'images */}
      <section id="accueil" className="pt-32 pb-20 px-4 relative overflow-hidden min-h-screen flex items-center">
        {/* Carousel d'images de fond */}
        <div className="absolute inset-0 overflow-hidden">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat image-transition ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`
              }}
            >
              {/* Overlay sombre pour améliorer la lisibilité du texte */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Indicateurs de progression (optionnel) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>

        {/* Timer visuel (optionnel) */}
        <div className="absolute top-8 right-8 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Prochaine image: <span className="font-mono">60s</span>
        </div>

        {/* Éléments décoratifs existants */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20" style={{animationDelay: '0.5s'}}></div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          {/* Section texte avec fond semi-transparent pour meilleure lisibilité */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="bg-white/10  rounded-3xl p-12 border border-white/20 shadow-2xl">
              <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
                École de Formation des
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-200 mt-2">
                  Enseignants du Secondaire
                </span>
              </h2>
              <p style={{marginBottom: '2em', marginTop: '2em'}} className="text-2xl md:text-3xl text-white font-light drop-shadow-lg">
                <span className="font-semibold text-blue-200">GNON GANI</span> - SU TII TONUKO, SE REALISER SOI-MEME
              </p>
              <p style={{marginBottom: '2em', marginTop: '2em'}} className="text-xl text-white/90 mx-auto max-w-3xl drop-shadow-lg">
                Un réseau éducatif de 20 ans d'excellence au service du développement humain intégral
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white transform hover:scale-110 transition-all duration-300 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm md:text-base font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      

      {/* Section Historique EFES GG */}
      <section id="histoire" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <History className="w-10 h-10 text-blue-600" />
              Notre Histoire
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez le parcours exceptionnel qui a conduit à la création de l'EFES GG
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl mb-8">
                  <h3 className="text-2xl font-bold mb-4">Bref Historique de l'EFES GG</h3>
                  <p className="text-blue-100 leading-relaxed">
                    EFES GG est le point d'arrivée d'une marche dans notre rêve à donner à nos concitoyens 
                    des leviers pour leur propre développement humain intégral.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    <strong>Depuis une vingtaine d'années</strong>, patiemment et avec amour, nous avons commencé 
                    par une petite école de village à <strong>Sirarou au complexe Léonard GORAGUI en 2006</strong>.
                  </p>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-yellow-800 font-medium">
                      Ce rêve a germé et fleuri en plusieurs terres favorables à travers le Bénin.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <School className="w-5 h-5" />
                      Kandi
                    </h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        De la maternelle à la terminale
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        CQM au CEAP en génie civil
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                      <School className="w-5 h-5" />
                      Banikoara
                    </h4>
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        De la maternelle à la terminale
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        CQM au CEAP en électricité
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                      <School className="w-5 h-5" />
                      Kerou
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        De la maternelle au primaire
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        CEAP au BAC en secrétariat et comptabilité
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      <School className="w-5 h-5" />
                      Parakou
                    </h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        2 écoles maternelles et primaires
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        1 école secondaire
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        L'université EFES GG
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-blue-800 font-semibold">
                    Nous nous réjouissons de pouvoir offrir un espace éducatif de qualité pour le développement 
                    humain intégral de nos élèves depuis la maternelle jusqu'au métier.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Un Réseau Éducatif Intégré</h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  <strong>EFES GNON GANI</strong> appartient donc à un réseau de complexes scolaires qui vont 
                  certainement l'alimenter d'étudiants ayant une bonne base humaine et intellectuelle.
                </p>
                <div className="mt-6 bg-white p-4 rounded-lg inline-block">
                  <p className="text-gray-600 italic">
                    "EFES GG est à vrai dire la réussite du succès de la bonne relation d'un couple heureux et dévoué : 
                    <strong> ZEDAGA-FVPT</strong> en matière de coopération au développement."
                  </p>
                </div>
                <p className="mt-4 text-gray-600">
                  En effet nous avons travaillé dans un climat de respect mutuel, de franchise et surtout d'amitié. 
                  Nous avons compris que <strong>se former et informer reste source de toute maturation humaine</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nouvelle Section : Structure de l'École */}
      <section id="structure" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Organigramme de l'EFES GNON GANI</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez l'organigramme fonctionnel de l'EFES GNON GANI
            </p>
          </div>

          {/* Niveau Stratégique */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Organe décisionnel
              </h3>
              <p className="text-gray-600 text-lg">Organes de gouvernance et de pilotage stratégique</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {organizationalStructure.strategic.map((item, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 hover-lift border-2 border-gray-200 group cursor-pointer transition-all duration-300"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Niveau Opérationnel */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
              Organe Opérationnel
              </h3>
              <p className="text-gray-600 text-lg">Services et directions en charge de la mise en œuvre</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {organizationalStructure.operational.map((item, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 hover-lift border-2 border-gray-200 group cursor-pointer transition-all duration-300"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Organes Consultatifs */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Organes Consultatifs
              </h3>
              <p className="text-gray-600 text-lg">Comités et conseils d'orientation et de participation</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {organizationalStructure.consultative.map((item, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 hover-lift border-2 border-gray-200 group cursor-pointer transition-all duration-300"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Légende et informations complémentaires */}
          
        </div>
      </section>

      {/* Pourquoi EFES GG Section */}
      <section id="why" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pourquoi EFES GG ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les raisons fondamentales qui font de notre école un choix d'excellence pour la formation des enseignants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {objectives.map((objective, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 hover-lift border border-gray-200 group cursor-pointer transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${objective.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {objective.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {objective.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {objective.description}
                </p>
              </div>
            ))}
          </div>

          {/* Section supplémentaire avec texte détaillé */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Notre Mission Éducative
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    <strong>EFES GG</strong> s'engage à former une nouvelle génération d'enseignants 
                    capables de répondre aux défis éducatifs du 21ème siècle, particulièrement 
                    dans les régions du Nord du Bénin.
                  </p>
                  <p className="leading-relaxed">
                    Notre approche combine <strong>l'excellence académique</strong>, 
                    <strong> le développement humain intégral</strong> et 
                    <strong> la professionnalisation</strong> pour garantir 
                    un impact durable sur le système éducatif national.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-sm text-gray-600">Approche Professionnalisante</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">360°</div>
                  <div className="text-sm text-gray-600">Développement Humain</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">Nord</div>
                  <div className="text-sm text-gray-600">Focus Régional</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="text-3xl font-bold text-rose-600 mb-2">20+</div>
                  <div className="text-sm text-gray-600">Ans d'Expertise</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="nos_offres" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Nos Offres</h2>
            <p style={{margin: '20px'}} className="text-xl text-gray-600 mx-auto">Former les enseignants du secondaire avec excellence et professionnalisme</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            {programs.map((program, index) => (
              <div  key={index} className="bg-white rounded-2xl p-6 hover-lift border-2 border-transparent hover:border-blue-200 transition-all group">
                <div className={`${program.color} w-full h-32 rounded-xl mb-6 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                  <div className="text-center">
                    <div className="text-1xl font-bold mb-1">{program.level}</div>
                    <div className="text-sm opacity-90">{program.duration}</div>
                  </div>
                </div>
                <h3 style={{margin: '10px'}} className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{program.title}</h3>
                <p style={{margin: '10px'}} className="text-gray-600 text-sm leading-relaxed mb-4">{program.description}</p>
                {
                  /*
                  <button style={{padding: '10px'}} className="cursor-pointer w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                  Plus d'infos <ChevronRight className="w-4 h-4" />
                </button> */
                }
              </div>
            ))}
          </div>
        </div>
      </section>


{/* Publications Section */}
<section id="publications" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
  {/* Éléments décoratifs */}
  <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 animate-float"></div>
  <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-20" style={{animationDelay: '1s'}}></div>
  
  <div className="max-w-7xl mx-auto relative z-10">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Publications</h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        {isStudentAuthenticated 
          ? 'Accédez à nos documents officiels, rapports et publications pédagogiques'
          : 'Espace réservé aux étudiants de l\'EFES GG'
        }
      </p>
      
      {/* Badge d'authentification */}
      {isStudentAuthenticated && (
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Étudiant authentifié</span>
          <button 
            onClick={handleLogout}
            style={{backgroundColor : 'red'}}
            className="btn text-light text-sm ml-2 px-3 py-1 rounded"
          >
            Se déconnecter
          </button>
        </div>
      )}

      {/* Filtres par catégorie (seulement si authentifié) */}
      {isStudentAuthenticated && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActivePubCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                activePubCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>

    {!isStudentAuthenticated ? (
      // Section d'authentification
      <div className="bg-white rounded-2xl p-12 text-center shadow-xl max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-blue-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Accès Réservé aux Étudiants
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Cette section est exclusivement réservée aux étudiants de l'EFES GG. 
          Veuillez vous authentifier avec votre numéro matricule pour accéder aux publications.
        </p>
        
        <button
          onClick={handlePublicationAccess}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
        >
          <UserCheck className="w-5 h-5" />
          S'authentifier avec mon matricule
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Vous devez être un étudiant inscrit à l'EFES GG pour accéder à cette section
        </p>
      </div>
    ) : (
     // Contenu des publications (seulement si authentifié)
<>
  {loadingPublications ? (
    // Indicateur de chargement
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Chargement des publications...</p>
    </div>
  ) : publicationsError ? (
    // Message d'erreur
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
        <p className="text-red-600 font-semibold">Erreur de chargement</p>
        <p className="text-red-500 text-sm mt-2">{publicationsError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  ) : publications.length === 0 ? (
    // Aucune publication
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Aucune publication disponible pour le moment.</p>
    </div>
  ) : (
   // REMPLACEZ LA PARTIE "Contenu des publications" PAR CE CODE

<>
  {loadingPublications ? (
    // Indicateur de chargement
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Chargement des publications...</p>
    </div>
  ) : publicationsError ? (
    // Message d'erreur
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
        <p className="text-red-600 font-semibold">Erreur de chargement</p>
        <p className="text-red-500 text-sm mt-2">{publicationsError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  ) : publications.length === 0 ? (
    // Aucune publication
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Aucune publication disponible pour le moment.</p>
    </div>
  ) : (
    // REMPLACEZ LA PARTIE "Contenu des publications" PAR CE CODE

// Contenu des publications (seulement si authentifié)
<>
  {loadingPublications ? (
    // Indicateur de chargement
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Chargement des publications...</p>
    </div>
  ) : publicationsError ? (
    // Message d'erreur
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
        <p className="text-red-600 font-semibold">Erreur de chargement</p>
        <p className="text-red-500 text-sm mt-2">{publicationsError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  ) : publications.length === 0 ? (
    // Aucune publication
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Aucune publication disponible pour le moment.</p>
    </div>
  ) : (
    // Affichage des publications avec présentation intégrée
    <>
      {/* Section Annonces EFES GNON GANI */}
      <div className="mb-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-8 md:p-12 border-2 border-purple-100 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg animate-float">
            <Image className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Annonces EFES GNON GANI
          </h3>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Restez informés de toutes nos actualités, événements et communications importantes
          </p>
        </div>

        {loadingAnnonces ? (
          // Chargement des annonces
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Chargement des annonces...</p>
          </div>
        ) : annoncesError ? (
          // Erreur de chargement
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-semibold text-center">Erreur de chargement des annonces</p>
            <p className="text-red-500 text-sm text-center mt-2">{annoncesError}</p>
          </div>
        ) : annonces.length === 0 ? (
          // Aucune annonce
          <div className="bg-white rounded-xl p-8 text-center border-2 border-gray-200">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Aucune annonce disponible pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Consultez cette section régulièrement pour rester informé</p>
          </div>
        ) : (
          // Affichage des annonces
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {annonces.slice(0, 6).map((annonce, index) => {
              const images = JSON.parse(annonce.images || '[]');
              const firstImage = images[0];

              
              return (
                <div
                  key={annonce.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl border-2 border-transparent hover:border-purple-300 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => {
                    setSelectedAnnonce(annonce);
                    setCurrentImageIndex(0);
                    setShowAnnonceModal(true);
                  }}
                >
                  {/* Image miniature */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                    {firstImage ? (
                      <img
                        src={`${API_URL_BASE}/${firstImage.url}`}
                        alt={annonce.titre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EImage%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Badge nombre d'images */}
                    {images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        {images.length}
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {annonce.titre}
                    </h4>
                    
                    {annonce.description && (
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                        {annonce.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(annonce.date_publication).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <button className="text-purple-600 font-semibold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                        Voir
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bouton "Voir toutes les annonces" si plus de 6 annonces */}
        {annonces.length > 6 && (
          <div className="text-center mt-8">
            <a
              href="#annonces"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Voir toutes les annonces ({annonces.length})
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Publications en vedette */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-500" />
          Publications en Vedette
        </h3>
        
        {filteredPublications.filter(pub => pub.featured).length === 0 ? (
          <div className="text-center py-8 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-yellow-700 font-medium">Aucune publication en vedette pour cette catégorie</p>
            <p className="text-yellow-600 text-sm mt-1">Consultez "Toutes les Publications" ci-dessous</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPublications
              .filter(pub => pub.featured)
              .map((pub, index) => (
                <div 
                  key={pub.id}
                  className="bg-white rounded-2xl p-6 hover-lift border-2 border-transparent hover:border-blue-200 transition-all duration-500 group cursor-pointer card-entrance"
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => handlePublicationClick(pub)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${pub.color}`}></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {pub.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                      <Star className="w-3 h-3" />
                      Vedette
                    </div>
                  </div>

                  <div className={`w-16 h-16 bg-gradient-to-r ${pub.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <FileText className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {pub.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                    {pub.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {pub.downloads} téléchargements
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {pub.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{pub.date}</span>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors bg-gray-50 hover:bg-green-50 rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Toutes les publications */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Toutes les Publications
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredPublications.filter(pub => !pub.featured).length} document(s)
          </span>
        </div>
        
        {filteredPublications.filter(pub => !pub.featured).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Aucune publication disponible pour cette catégorie</p>
            <p className="text-gray-500 text-sm mt-2">
              Sélectionnez "Tous" dans les filtres pour voir toutes les publications
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications
              .filter(pub => !pub.featured)
              .map((pub, index) => (
                <div 
                  key={pub.id}
                  className="bg-white rounded-xl p-6 hover-lift border border-gray-200 group cursor-pointer transition-all duration-300 card-entrance"
                  style={{animationDelay: `${index * 0.1 + 0.3}s`}}
                  onClick={() => handlePublicationClick(pub)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${pub.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      {pub.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {pub.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                    {pub.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {pub.category}
                    </span>
                    <span>{pub.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{pub.date}</span>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )}
</>
  )}
</>
  )}
</>
    )}
  </div>
</section>



    {/* News & Videos */}
    <section id="actualite" className="py-20 px-8 bg-gradient-to-b from-gray-50 via-white to-blue-50">
        <div className="w-full">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Section Actualités */}
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Actualités EFES GG
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"></div>
              </div>
              
              <div className="space-y-5">
                {newsDropdownItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="group relative border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <button
                      onClick={() => toggleNewsDropdown(item.id)}
                      className="relative w-full flex items-center justify-between p-7 bg-gradient-to-r from-white to-gray-50 group-hover:from-blue-50 group-hover:to-green-50 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className={`transform transition-all duration-500 ${openNewsId === item.id ? 'rotate-180 scale-110' : 'scale-100'}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-green-200">
                          {openNewsId === item.id ? 
                            <ChevronUp className="w-5 h-5 text-blue-600" /> : 
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          }
                        </div>
                      </div>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-500 ${
                        openNewsId === item.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-7 bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 border-t-2 border-gray-200">
                        <div className="prose prose-lg max-w-none text-gray-700">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Vidéos */}
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                  EFES GG en Vidéos
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                    onClick={() => openModal(video)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image avec overlay */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" 
                      />
                      {/* Gradient overlay animé */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-blue-900/90 transition-all duration-500"></div>
                      
                      {/* Badge "Nouveau" ou durée */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        NOUVEAU
                      </div>
                    </div>
                    
                    {/* Bouton play animé */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Cercle pulsant */}
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                          <PlayCircle className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Titre avec effet glassmorphism */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 backdrop-blur-sm bg-white/10">
                      <h4 className="text-white font-bold text-lg drop-shadow-lg group-hover:text-yellow-300 transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"></div>
                        <span className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          Voir la vidéo
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <VideoModal
                isOpen={isModalOpen}
                onClose={closeModal}
                videoUrl={selectedVideo ? selectedVideo.link : ''}
                videoTitle={selectedVideo ? selectedVideo.title : ''}
              />
            </div>
          </div>
        </div>
      </section>



      {showAuthModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6" />
          <h3 className="text-xl font-bold">Authentification Étudiant</h3>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          Accédez à l'espace publications EFES GG
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Numéro Matricule *
          </label>
          <input
            type="text"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            placeholder="Ex: EFES2024001"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            onKeyPress={(e) => e.key === 'Enter' && verifyMatricule()}
          />
          <p className="text-xs text-gray-500 mt-2">
            Entrez votre numéro matricule EFES GG pour vous authentifier
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAuthModal(false)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={verifyMatricule}
            disabled={authLoading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {authLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Se connecter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}



{/* Modal de visualisation d'annonce avec galerie */}
{showAnnonceModal && selectedAnnonce && (
  <div 
    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in-up"
    onClick={() => {
      setShowAnnonceModal(false);
      setSelectedAnnonce(null);
      setCurrentImageIndex(0);
    }}
  >
    <div 
      className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">{selectedAnnonce.titre}</h3>
          <div className="flex items-center gap-4 text-purple-100 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(selectedAnnonce.date_publication).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span>{JSON.parse(selectedAnnonce.images || '[]').length} image(s)</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAnnonceModal(false);
            setSelectedAnnonce(null);
            setCurrentImageIndex(0);
          }}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:rotate-90 duration-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
        {/* Galerie d'images */}
        <div className="relative bg-black">
          {(() => {
            const images = JSON.parse(selectedAnnonce.images || '[]');
            const currentImage = images[currentImageIndex];
            
            return (
              <>
                {/* Image principale en grand */}
                <div className="relative min-h-[60vh] flex items-center justify-center p-4">
                  {currentImage ? (
                    <img
                      src={`${API_URL_BASE}/${currentImage.url}`}                                                                                
                      alt={`${selectedAnnonce.titre} - Image ${currentImageIndex + 1}`}
                      className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Image className="w-24 h-24 mx-auto mb-4 opacity-50" />
                      <p>Aucune image disponible</p>
                    </div>
                  )}
                </div>

                {/* Contrôles de navigation (si plusieurs images) */}
                {images.length > 1 && (
                  <>
                    {/* Bouton Précédent */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 group"
                    >
                      <ChevronLeft className="w-7 h-7 text-gray-800 group-hover:text-purple-600" />
                    </button>
                    
                    {/* Bouton Suivant */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 group"
                    >
                      <ChevronRight className="w-7 h-7 text-gray-800 group-hover:text-purple-600" />
                    </button>

                    {/* Indicateur de position avec style moderne */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full text-base font-semibold shadow-xl">
                      <span className="text-purple-300">{currentImageIndex + 1}</span>
                      <span className="mx-2 text-gray-400">/</span>
                      <span>{images.length}</span>
                    </div>

                    {/* Points de navigation */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          className={`transition-all duration-300 rounded-full ${
                            idx === currentImageIndex
                              ? 'w-8 h-2 bg-purple-500'
                              : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>

        {/* Miniatures cliquables (si plusieurs images) */}
        {(() => {
          const images = JSON.parse(selectedAnnonce.images || '[]');
          
          if (images.length > 1) {
            return (
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-y border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Toutes les images ({images.length})
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all transform ${
                        idx === currentImageIndex
                          ? 'border-purple-600 scale-110 shadow-xl ring-2 ring-purple-300'
                          : 'border-gray-300 hover:border-purple-400 hover:scale-105'
                      }`}
                    >
                      <img
                        src={`${API_URL_BASE}/${img.url}`}
                        alt={`Miniature ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23e5e7eb" width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3E%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Description */}
        {selectedAnnonce.description && (
          <div className="p-6 bg-white">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Description
            </h4>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {selectedAnnonce.description}
              </p>
            </div>
          </div>
        )}

        {/* Bouton de fermeture en bas */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              setShowAnnonceModal(false);
              setSelectedAnnonce(null);
              setCurrentImageIndex(0);
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Footer */}
  
    </div>
  );
}

export default Home;