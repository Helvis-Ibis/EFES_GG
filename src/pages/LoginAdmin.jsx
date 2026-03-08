import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, Shield, Mail, ArrowLeft } from "lucide-react";
import { URL_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [Token, settoken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password

  const navigate = useNavigate();

  // REDIRECTION SI DÉJÀ CONNECTÉ
  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');
    const userRole = localStorage.getItem('user_role');
    
    if (sessionToken && userRole === 'admin') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!login || !password) {
      setMessage("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(URL_BASE.LOGIN_ADMIN(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Connexion administrateur réussie ✅ Redirection...");
        
        // Sauvegarder les informations de session
        localStorage.setItem('session_token', data.user.session_token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem('niveau_acces', data.user.niveau_acces);
        
        // Redirection vers le tableau de bord admin
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        setMessage(data.message || "Erreur de connexion administrateur");
      }
    } catch (error) {
      console.error('Erreur de connexion admin:', error);
      setMessage("Erreur de connexion au serveur d'administration");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email) {
      setMessage("Veuillez saisir votre email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(URL_BASE.FORGOT_PASSWORD(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email , action : 'request_reset' })
      });

      const result = await response.json();

      if (result.success) {
        const code = result.code;
        setGeneratedCode(code);
        settoken(result.token);
        setCodeSent(true);
        setStep(2);
        setMessage("Code de vérification envoyé à votre email ✅");
      } else {
        setMessage(result || "Erreur lors de l'envoi du code");
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = (e) => {
    e.preventDefault();
    setMessage("");

    if (!verificationCode) {
      setMessage("Veuillez saisir le code de vérification");
      return;
    }

   // alert(verificationCode)

   // alert(generatedCode)


    if (verificationCode == generatedCode) {
      setStep(3);
      setMessage("Code vérifié ✅ Veuillez définir votre nouveau mot de passe");
    } else {
      setMessage("Code de vérification incorrect");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      // Ici vous devrez implémenter l'appel API pour réinitialiser le mot de passe
      // Pour l'instant, simulation de succès
      try {
        const response = await fetch(URL_BASE.FORGOT_PASSWORD(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email , action : 'reset_password' , token : Token , new_password : newPassword})
        });


        
  
        const result = await response.json();

        //console.log(result);
        
  
        if (result.success) {
          setTimeout(() => {
            setMessage("Mot de passe réinitialisé avec succès ✅");
            setTimeout(() => {
              setForgotPassword(false);
              setStep(1);
              setEmail("");
              setVerificationCode("");
              setNewPassword("");
              setConfirmPassword("");
              setCodeSent(false);
            }, 2000);
          }, 1000);
          navigate("/LoginAdmin");
        } else {
          setMessage(result || "Erreur lors de la mise ajour");
        }
      } catch (error) {
        console.error('Erreur:', error);
        setMessage("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
     

      //navigate("/LoginAdmin");
    } catch (error) {
      setMessage("Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleBackToLogin = () => {
    setForgotPassword(false);
    setStep(1);
    setEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCodeSent(false);
    setMessage("");
  };

  // Comptes admin de démonstration
  const handleDemoLogin = (type) => {
    if (type === 'superadmin') {
      setLogin('superadmin');
      setPassword('password');
    } else if (type === 'admin') {
      setLogin('admin');
      setPassword('password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <motion.div
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border-t-4 border-green-500"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* En-tête avec bouton retour pour mot de passe oublié */}
        <div className="text-center mb-6">
          {forgotPassword && (
            <button
              onClick={handleBackToLogin}
              className="flex items-center text-sm text-green-600 hover:text-green-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à la connexion
            </button>
          )}
          
          <div className="flex items-center justify-center mb-2">
            <Shield className="text-green-600 mr-2" size={28} />
            <h1 className="text-3xl font-bold text-green-700">
              {forgotPassword ? "Mot de passe oublié" : "Administration EFES GG"}
            </h1>
          </div>
          <p className="text-gray-500">
            {forgotPassword 
              ? "Réinitialisez votre mot de passe administrateur" 
              : "Accès réservé à l'administration générale"}
          </p>
          <div className="mt-2">
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Zone sécurisée
            </span>
          </div>
        </div>

        {/* FORMULAIRE DE CONNEXION PRINCIPAL */}
        {!forgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant administrateur
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Votre identifiant admin"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe administrateur
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe admin"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 pr-10 transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authentification...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Accéder à l'administration
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORMULAIRE MOT DE PASSE OUBLIÉ */
          <form onSubmit={
            step === 1 ? handleForgotPassword : 
            step === 2 ? verifyCode : 
            resetPassword
          } className="space-y-5">
            
            {/* Étape 1: Email */}
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email administrateur
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.admin"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Un code de vérification sera envoyé à cette adresse email
                </p>
              </div>
            )}

            {/* Étape 2: Code de vérification */}
            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code reçu par email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-center text-lg font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Vérifiez votre boîte email pour le code de vérification
                </p>
              </div>
            )}

            {/* Étape 3: Nouveau mot de passe */}
            {step === 3 && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Votre nouveau mot de passe"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 pr-10 transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {step === 1 ? "Envoi en cours..." : 
                   step === 2 ? "Vérification..." : 
                   "Réinitialisation..."}
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  {step === 1 ? "Envoyer le code" : 
                   step === 2 ? "Vérifier le code" : 
                   "Réinitialiser le mot de passe"}
                </>
              )}
            </button>
          </form>
        )}

        {/* Message d'erreur ou succès */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center mt-4 text-sm font-medium p-3 rounded-lg ${
              message?.includes("réussie") || message?.includes("succès") || message?.includes("✅")
                ? "text-green-700 bg-green-50 border border-green-200" 
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </motion.p>
        )}

        {/* Liens utiles */}
        <div className="text-center mt-6 space-y-2">
          {!forgotPassword ? (
            <button 
              onClick={() => setForgotPassword(true)}
              className="text-green-600 text-sm hover:underline block w-full"
            >
              Mot de passe administrateur oublié ?
            </button>
          ) : null}
          
          <a href="/LoginSecretaire" className="text-blue-500 text-sm hover:underline block">
            Accès secrétariat
          </a>
          <a href="/login-chef-filiere" className="text-purple-500 text-sm hover:underline block">
            Accès chef de filière
          </a>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>Connexion sécurisée SSL - Journalisée</span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Système d'administration EFES GG © 2024 - Toutes les activités sont journalisées
          </p>
        </div>
      </motion.div>
    </div>
  );
}