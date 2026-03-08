import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { URL_BASE } from "../api/api"; // Assurez-vous d'avoir votre configuration d'API
import { useNavigate } from "react-router-dom";

export default function LoginSecretaire() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  

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
      const response = await fetch(URL_BASE.LOGIN_SECRETAIRE(), {
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
        setMessage("Connexion réussie ✅ Redirection en cours...");
        
        // Sauvegarder les informations de session
        localStorage.setItem('session_token', data.user.session_token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        localStorage.setItem('user_role', 'secretaire');

        console.log(data);
        
        
        // Redirection vers le tableau de bord après un délai
        setTimeout(() => {
          navigate('/secretariat', { 
            state: { 
              user: data.user,
              loginTime: new Date().toISOString(),
              message: "Bienvenue dans votre espace secrétariat"
            }
          });
        }, 1500);
      } else {
        setMessage(data.message || "Erreur de connexion");
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setMessage("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Données de démo pour tester
  const handleDemoLogin = (type) => {
    if (type === 'secretariat1') {
      setLogin('secretariat1');
      setPassword('password');
    } else if (type === 'secretariat2') {
      setLogin('secretariat2');
      setPassword('password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <motion.div
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo / Titre */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Lock className="text-blue-600 mr-2" size={28} />
            <h1 className="text-3xl font-bold text-blue-700">Secrétariat UAS</h1>
          </div>
          <p className="text-gray-500">Connectez-vous à votre espace administratif</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identifiant
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Votre identifiant"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10 transition-all"
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Message d'erreur ou succès */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center mt-4 text-sm font-medium p-3 rounded-lg ${
              message.includes("réussie") 
                ? "text-green-700 bg-green-50 border border-green-200" 
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </motion.p>
        )}

        {/* Comptes de démonstration
        
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">
            Comptes de démonstration
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('secretariat1')}
              className="text-xs bg-blue-100 text-blue-700 py-2 px-3 rounded hover:bg-blue-200 transition-colors"
              disabled={loading}
            >
              Secrétariat 1
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('secretariat2')}
              className="text-xs bg-green-100 text-green-700 py-2 px-3 rounded hover:bg-green-200 transition-colors"
              disabled={loading}
            >
              Secrétariat 2
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Identifiants pré-remplis pour test
          </p>
        </div>*/}
      

        {/* Liens utiles */}
        

        {/* Informations système */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Système de gestion académique - EFES GNON GANI
          </p>
        </div>
      </motion.div>
    </div>
  );
}