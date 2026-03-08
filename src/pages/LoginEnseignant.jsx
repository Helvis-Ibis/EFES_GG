import React, { useState, useEffect } from 'react';
import { Lock, User, Mail, GraduationCap, BookOpen, Globe, Languages, Lightbulb, Shield, ArrowRight, Eye, EyeOff, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { URL_BASE } from '../api/api';

const LoginEnseignant = () => {
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0: initial, 1: email sent, 2: code verification
  const [resetData, setResetData] = useState({
    email: '',
    token: '',
    verification_code: ''
  });
  
  const navigate = useNavigate();

  // VÉRIFICATION SI DÉJÀ CONNECTÉ - AMÉLIORATION
  useEffect(() => {
    const enseignantToken = localStorage.getItem('enseignant_token');
    const enseignantData = localStorage.getItem('enseignant_data');
    
    if (enseignantToken && enseignantData) {
      // Rediriger vers le dashboard enseignant si déjà connecté
      navigate('/Enseignant-dashboard', {
        state: {
          enseignantData: JSON.parse(enseignantData)
        }
      });
    }
  }, [navigate]);

  const filieres = [
    { id: 'anglais', nom: 'Anglais', icon: Globe, color: 'from-blue-500 to-cyan-600' },
    { id: 'lettres_modernes', nom: 'Lettres Modernes', icon: BookOpen, color: 'from-purple-500 to-pink-600' },
    { id: 'espagnol', nom: 'Espagnol', icon: Languages, color: 'from-orange-500 to-red-600' },
    { id: 'philosophie', nom: 'Philosophie', icon: Lightbulb, color: 'from-indigo-500 to-violet-600' }
  ];

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Swal.fire('Attention!', 'Veuillez remplir tous les champs', 'warning');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      Swal.fire('Erreur!', 'Veuillez entrer une adresse email valide', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(URL_BASE.LOGIN_ENSEIGNANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Stocker le token et les données de l'enseignant
        localStorage.setItem('enseignant_token', data.token);
        localStorage.setItem('enseignant_data', JSON.stringify(data.enseignant));
        
        // Si "Se souvenir de moi" est coché, stocker les infos plus longtemps
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
        }

        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie!',
          text: `Bienvenue ${data.enseignant.prenoms} ${data.enseignant.nom}`,
          showConfirmButton: false,
          timer: 1500,
          background: '#1e293b',
          color: 'white'
        }).then(() => {
          // Redirection avec les données dans le state
          navigate('/Enseignant-dashboard', { 
            state: { 
              enseignantData: data.enseignant
            }
          });
        });

      } else {
        Swal.fire('Erreur!', data.message || 'Email ou mot de passe incorrect', 'error');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      Swal.fire('Erreur!', 'Erreur de connexion au serveur. Veuillez réessayer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Mot de passe oublié?',
      html: `
        <div class="text-left">
          <p class="mb-4">Entrez votre adresse email pour recevoir un code de réinitialisation :</p>
          <input type="email" id="email" class="swal2-input" placeholder="votre.email@efes-gani.bj">
          <p class="text-sm text-gray-500 mt-2">Un code de vérification vous sera envoyé par email.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Envoyer le code',
      cancelButtonText: 'Annuler',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const email = Swal.getPopup().querySelector('#email').value;
        
        if (!email) {
          Swal.showValidationMessage('Veuillez entrer votre email');
          return false;
        }
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Veuillez entrer une adresse email valide');
          return false;
        }
  
        try {
          const response = await fetch(URL_BASE.FORGOT_PASSWORD_ENSEIGNANT(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          });
  
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.message);
          }
          
          return { ...data, email };
        } catch (error) {
          Swal.showValidationMessage(`Erreur: ${error.message}`);
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        setResetData({
          email: result.value.email,
          token: result.value.token,
          verification_code: result.value.verification_code
        });
        setResetStep(1);
        
        // Afficher le code ET demander la vérification
        Swal.fire({
          icon: 'success',
          title: 'Code envoyé!',
          html: `
            <div class="text-center">
              <p class="mb-4">Un code a été envoyé à votre email.</p>
              
              <p class="text-sm text-gray-600 mb-4">
                Entrez ce code dans le champ ci-dessous pour vérifier votre identité.
              </p>
              <input 
                type="text" 
                id="verificationCode" 
                class="swal2-input" 
                placeholder="Entrez le code à 6 chiffres"
                maxlength="6"
                style="text-align: center; font-size: 18px; letter-spacing: 5px;"
              >
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Vérifier le code',
          cancelButtonText: 'Annuler',
          preConfirm: () => {
            const code = Swal.getPopup().querySelector('#verificationCode').value;
            if (!code) {
              Swal.showValidationMessage('Veuillez entrer le code de vérification');
              return false;
            }
            if (code.length !== 6) {
              Swal.showValidationMessage('Le code doit contenir 6 chiffres');
              return false;
            }
            return code;
          }
        }).then((verificationResult) => {
          if (verificationResult.isConfirmed) {
            verifyResetCode();
          }
        });
      }
    });
  };

  const verifyResetCode = async () => {
    try {
      const response = await fetch(URL_BASE.VERIFY_RESET_CODE(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_code: resetData.verification_code
        })
      });
  
      const data = await response.json();
      
      if (data.success) {
        // Afficher directement les champs de réinitialisation
        Swal.fire({
          icon: 'success',
          title: 'Code vérifié!',
          html: `
            <div class="text-left">
              <p class="mb-4">Votre identité a été vérifiée. Veuillez créer votre nouveau mot de passe :</p>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                <div class="relative">
                  <input 
                    type="password" 
                    id="newPassword" 
                    class="swal2-input" 
                    placeholder="Minimum 8 caractères"
                    style="width: 100%; padding-right: 40px;"
                  >
                  <button 
                    type="button" 
                    id="toggleNewPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    style="background: none; border: none; cursor: pointer;"
                  >
                    👁️
                  </button>
                </div>
              </div>
  
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                <div class="relative">
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    class="swal2-input" 
                    placeholder="Retapez votre mot de passe"
                    style="width: 100%; padding-right: 40px;"
                  >
                  <button 
                    type="button" 
                    id="toggleConfirmPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    style="background: none; border: none; cursor: pointer;"
                  >
                    👁️
                  </button>
                </div>
              </div>
  
              <div class="text-xs text-gray-500 mt-4">
                <p>✅ Le mot de passe doit contenir au moins 8 caractères</p>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Réinitialiser',
          cancelButtonText: 'Annuler',
          preConfirm: () => {
            const newPassword = Swal.getPopup().querySelector('#newPassword').value;
            const confirmPassword = Swal.getPopup().querySelector('#confirmPassword').value;
            
            if (!newPassword || !confirmPassword) {
              Swal.showValidationMessage('Veuillez remplir tous les champs');
              return false;
            }
            
            if (newPassword.length < 8) {
              Swal.showValidationMessage('Le mot de passe doit contenir au moins 8 caractères');
              return false;
            }
            
            if (newPassword !== confirmPassword) {
              Swal.showValidationMessage('Les mots de passe ne correspondent pas');
              return false;
            }
            
            return { newPassword, confirmPassword };
          },
          didOpen: () => {
            // Gestion de l'affichage/masquage du mot de passe
            const toggleNewPassword = document.getElementById('toggleNewPassword');
            const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            
            toggleNewPassword.addEventListener('click', () => {
              const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
              newPasswordInput.setAttribute('type', type);
              toggleNewPassword.textContent = type === 'password' ? '👁️' : '🔒';
            });
            
            toggleConfirmPassword.addEventListener('click', () => {
              const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
              confirmPasswordInput.setAttribute('type', type);
              toggleConfirmPassword.textContent = type === 'password' ? '👁️' : '🔒';
            });
          }
        }).then((result) => {
          if (result.isConfirmed) {
            resetPassword( result.value.newPassword, result.value.confirmPassword);
          }
        });
      } else {
        Swal.fire('Erreur!', data.message || 'Code de vérification incorrect', 'error');
      }
    } catch (error) {
      Swal.fire('Erreur!', 'Erreur de connexion au serveur', 'error');
    }
  };
  
  const resetPassword = async ( password, confirmPassword) => {
    try {
      const response = await fetch(URL_BASE.RESET_PASSWORD_ENSEIGNANT(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
       //   token: token,
          password: password,
          confirm_password: confirmPassword
        })
      });
  
      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Mot de passe réinitialisé!',
          text: data.message,
          confirmButtonText: 'Se connecter'
        }).then(() => {
          // Rediriger vers la page de connexion
          navigate('/LoginEnseignant');
        });
      } else {
        Swal.fire('Erreur!', data.message || 'Erreur lors de la réinitialisation', 'error');
      }
    } catch (error) {
      Swal.fire('Erreur!', 'Erreur de connexion au serveur', 'error');
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Particules d'arrière-plan animées */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-1/4 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-1/4 -right-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Partie gauche - Information */}
          <div className="text-white">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">EFES Gnon-Gani</h1>
                  <p className="text-indigo-200 text-lg">Espace Enseignants</p>
                </div>
              </div>
              
              <p className="text-lg mb-8 leading-relaxed">
                Connectez-vous pour accéder à votre espace personnel de gestion des épreuves, 
                suivi des étudiants et partage de ressources pédagogiques.
              </p>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Filières disponibles :</h3>
                <div className="grid grid-cols-2 gap-4">
                  {filieres.map((filiere) => {
                    const IconComponent = filiere.icon;
                    return (
                      <div 
                        key={filiere.id}
                        className={`bg-gradient-to-r ${filiere.color} rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                      >
                        <IconComponent className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white font-medium text-sm">{filiere.nom}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-semibold mb-2">📋 Nouveau sur la plateforme ?</h4>
                <p className="text-sm text-indigo-200 mb-3">
                  Les enseignants doivent d'abord s'inscrire via le formulaire de candidature.
                </p>
                <button 
                  onClick={() => navigate('/inscription_enseignant')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-white/30"
                >
                  Postuler comme enseignant
                </button>
              </div>
            </div>
          </div>

          {/* Partie droite - Formulaire de connexion */}
          <div className="w-full">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
              {/* En-tête du formulaire */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-xl">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Connexion Enseignant
                </h2>
                <p className="text-indigo-200">
                  Connectez-vous pour accéder à votre espace
                </p>
              </div>

              {/* Formulaire */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Adresse Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                    <input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="votre.email@efes-gani.bj"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="Entrez votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-indigo-200 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-white/50 cursor-pointer"
                    />
                    <span className="ml-2 group-hover:text-white transition-colors">Se souvenir de moi</span>
                  </label>
                  <button 
                    onClick={handleForgotPassword}
                    className="text-indigo-300 hover:text-white transition-colors font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            
            </div>
          </div>
        </div>

        {/* Footer global */}
        <div className="text-center mt-8">
          <p className="text-indigo-200 text-sm">
            © 2024 Système de Gestion des Épreuves - EFES Gnon-Gani - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginEnseignant;