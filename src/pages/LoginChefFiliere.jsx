import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, Shield, GraduationCap, Globe, BookOpen, Languages, Lightbulb } from 'lucide-react';
import { API_URL_BASE, URL_BASE } from '../api/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const LoginChefFiliere = () => {
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [credentials, setCredentials] = useState({ login: '', mot_de_passe: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // VÉRIFICATION SI DÉJÀ CONNECTÉ - AJOUTEZ CE CODE
  useEffect(() => {
    const checkIfAlreadyLoggedIn = () => {
      const chefFiliereData = localStorage.getItem('chef_filiere');
      const userRole = localStorage.getItem('user_role');
      
      if (chefFiliereData && userRole === 'chef_filiere') {
        const chefData = JSON.parse(chefFiliereData);
        
        // Rediriger vers le dashboard approprié
        switch (chefData.filiere) {
          case 'Anglais':
            navigate('/chef-anglais');
            break;
          case 'Philosophie':
            navigate('/chef-philo');
            break;
          case 'Lettres Modernes':
            navigate('/chef-lettres-modernes');
            break;
          case 'Espagnol':
            navigate('/chef-espagnol');
            break;
          default:
            // Si la filière n'est pas reconnue, déconnecter
            localStorage.removeItem('chef_filiere');
            localStorage.removeItem('user_role');
        }
      }
    };

    checkIfAlreadyLoggedIn();
  }, [navigate]);

  const filieres = [
    {
      id: 'anglais',
      nom: 'Anglais',
      icon: Globe,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Langue & Civilisation Anglophone'
    },
    {
      id: 'lettres_modernes',
      nom: 'Lettres Modernes',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Littérature & Sciences du Langage'
    },
    {
      id: 'espagnol',
      nom: 'Espagnol',
      icon: Languages,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Langue & Culture Hispanophone'
    },
    {
      id: 'philosophie',
      nom: 'Philosophie',
      icon: Lightbulb,
      color: 'from-indigo-500 to-violet-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Pensée & Réflexion Critique'
    }
  ];

  const handleFiliereSelect = (filiere) => {
    setSelectedFiliere(filiere);
  };

  const handleBack = () => {
    setSelectedFiliere(null);
    setCredentials({ login: '', mot_de_passe: '' });
  };

  const handleLogin = async () => {
    if (!credentials.login || !credentials.mot_de_passe) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs manquants',
        text: 'Veuillez remplir tous les champs',
        background: '#1e1b4b',
        color: 'white',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL_BASE}/api/login_chef_filiere.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login: credentials.login,
          mot_de_passe: credentials.mot_de_passe
        })
      });

      const result = await response.json();

      if (result.success) {
        // Stocker les informations de l'utilisateur
        localStorage.setItem('chef_filiere', JSON.stringify(result.data));
        localStorage.setItem('user_role', 'chef_filiere');
        localStorage.setItem('chef_filiere_token', Date.now().toString()); // Token simple
        
        Swal.fire({
          title: 'Connexion réussie!',
          text: `Bienvenue ${result.data.prenom} ${result.data.nom}`,
          icon: 'success',
          background: '#1e1b4b',
          color: 'white',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Accéder au tableau de bord'
        }).then(() => {
          switch (result.data.filiere) {
            case 'Anglais':
              navigate('/chef-anglais');
              break;
            case 'Philosophie':
              navigate('/chef-philo');
              break;
            case 'Lettres Modernes':
              navigate('/chef-lettres-modernes');
              break;
            case 'Espagnol':
              navigate('/chef-espagnol');
              break;
          }
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: error.message,
        background: '#1e1b4b',
        color: 'white',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      {/* Particules d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-full max-w-6xl">
        {!selectedFiliere ? (
          // Sélection de la filière
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl mb-6 border border-white/30 shadow-2xl">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Espace Chef de Filière
            </h1>
            <p className="text-xl text-indigo-200 mb-4">
              Faculté des Lettres, Langues et Philosophie
            </p>
            <p className="text-lg text-indigo-300 mb-12">
              Sélectionnez votre filière pour accéder au tableau de bord
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {filieres.map((filiere) => {
                const IconComponent = filiere.icon;
                return (
                  <button
                    key={filiere.id}
                    onClick={() => handleFiliereSelect(filiere)}
                    className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-left overflow-hidden shadow-xl hover:shadow-2xl"
                  >
                    {/* Gradient de fond au hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${filiere.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    
                    <div className="relative">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${filiere.color} rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {filiere.nom}
                      </h3>
                      <p className="text-indigo-200 mb-4 text-sm">
                        {filiere.description}
                      </p>
                      
                      <div className="flex items-center text-white font-medium group-hover:translate-x-2 transition-transform">
                        Accéder au tableau de bord
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Formulaire de connexion
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
              {/* En-tête avec icône de la filière */}
              <div className="text-center mb-8">
                <button
                  onClick={handleBack}
                  className="absolute top-8 left-8 text-white/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  ← Retour
                </button>
                
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${selectedFiliere.color} rounded-2xl mb-4 shadow-xl`}>
                  {React.createElement(selectedFiliere.icon, { className: "w-10 h-10 text-white" })}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedFiliere.nom}
                </h2>
                <p className="text-indigo-200 text-sm">
                  {selectedFiliere.description}
                </p>
              </div>

              {/* Formulaire */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Identifiant (Login)
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                    <input
                      type="text"
                      name="login"
                      value={credentials.login}
                      onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="Entrez votre identifiant"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="mot_de_passe"
                      value={credentials.mot_de_passe}
                      onChange={(e) => setCredentials({ ...credentials, mot_de_passe: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="Entrez votre mot de passe"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white transition-colors text-lg"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

          {
            /*
                  <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-indigo-200 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-2 focus:ring-white/50"
                    />
                    <span className="ml-2">Se souvenir de moi</span>
                  </label>
                  <button className="text-indigo-300 hover:text-white transition-colors">
                    Mot de passe oublié ?
                  </button>
                </div> */
          }

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${selectedFiliere.color} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Se connecter
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
            
            </div>
          </div>
        )}

        {/* Footer global */}
        <div className="text-center mt-8">
          <p className="text-indigo-200 text-sm">
            © 2024 Système de Gestion des Épreuves - Faculté LLSH
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginChefFiliere;