import { Mail, Phone, User, Home, BookOpen, CheckSquare, Users, FileText, Camera, GraduationCap, Lock } from 'lucide-react';
import '../style/inscription.css';
import React, { useState } from "react";
import { API_URL_BASE, URL_BASE } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

const InscriptionEnseignant = () => {
  const initialState = {
    nom: "",
    prenoms: "",
    dateNaissance: "",
    lieuNaissance: "",
    sexe: "",
    nationalite: "",
    matrimoniale: "Célibataire",
    matrimonialeAutre: "",
    adresseComplete: "",
    telephone: "",
    email: "",
    password: "",
    confirmPassword: "",
    diplome: "",
    specialite: "",
    anneeExperience: "",
    etablissementPrecedent: "",
    filiereEnseignee: "",
    coursEnseignes: "inedit",
    accepteEngagement: false,
  };

  const [formData, setFormData] = useState(initialState);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Au moins 8 caractères");
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Au moins une lettre minuscule");
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Au moins une lettre majuscule");
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Au moins un chiffre");
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("Au moins un caractère spécial (@$!%*?&)");
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "accepteEngagement") {
      setFormData((prev) => ({
        ...prev,
        accepteEngagement: checked,
      }));
    } else if (name === "password") {
      setFormData((prev) => ({
        ...prev,
        password: value,
      }));
      // Valider le mot de passe en temps réel
      if (value.length > 0) {
        setPasswordErrors(validatePassword(value));
      } else {
        setPasswordErrors([]);
      }
    } else if (name === "prenoms" || name === 'nom') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    // Vérification du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format non supporté",
        text: "Veuillez choisir une image au format JPG, JPEG ou PNG.",
        showConfirmButton: true,
      });
      e.target.value = '';
      return;
    }

    // Vérification de la taille (5 Mo maximum)
    const maxSize = 5 * 1024 * 1024; // 5 Mo en bytes
    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Fichier trop volumineux",
        text: "La photo ne doit pas dépasser 5 Mo. Veuillez choisir une image plus légère.",
        showConfirmButton: true,
      });
      e.target.value = '';
      return;
    }

    setPhoto(file);

    // Créer une preview de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    // Réinitialiser l'input file
    const fileInput = document.getElementById('photo');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    // Validation des mots de passe
    if (!formData.password) {
      setMessage("⚠️ Veuillez saisir un mot de passe.");
      setIsSubmitting(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setMessage("⚠️ Le mot de passe ne respecte pas les critères de sécurité.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("⚠️ Les mots de passe ne correspondent pas.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.accepteEngagement) {
      setMessage("⚠️ Veuillez accepter l'engagement.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.filiereEnseignee) {
      setMessage("⚠️ Veuillez choisir une filière à enseigner.");
      setIsSubmitting(false);
      return;
    }

    if (!photo) {
      Swal.fire({
        icon: "warning",
        title: "Photo requise",
        text: "Veuillez importer votre photo d'identité pour continuer.",
        showConfirmButton: true,
      });
      setIsSubmitting(false);
      return;
    }

    const formD = new FormData();
    
    // Ajouter tous les champs du formulaire
    Object.keys(formData).forEach(key => {
      if (key !== 'accepteEngagement' && key !== 'confirmPassword') {
        formD.append(key, formData[key]);
      }
    });
    
    // Ajouter la photo
    formD.append('photo', photo);
    
    formD.append('nomEngagement', formData.nom + " " + formData.prenoms);
    formD.append('accepteEngagement', formData.accepteEngagement);

    try {
      const response = await fetch(URL_BASE.INSCRIPTION_ENSEIGNANT(), {
        method: 'POST',
        body: formD
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Inscription effectuée avec succès !",
          text: "Votre Dépôt de dossier  a été enregistrée. Veuillez vous diriger, à présent, vers le secrétariat pour la suite du processus, en vous présentant avec les pièces demandées.",
          showConfirmButton: true,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "info",
          text: data.message,
          showConfirmButton: true,
        });
      }
    } catch (error) {
      setMessage("❌ Erreur de connexion au serveur.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (id, label, type = "text", required = false, icon = null) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1"
        style={{ margin: '5px' }}>
        {icon && React.createElement(icon, { className: "w-4 h-4 inline mr-1 text-blue-600" })}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={formData[id]}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-xl"
        disabled={isSubmitting}
      />
    </div>
  );

  const renderPasswordInput = (id, label, required = false) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1"
        style={{ margin: '5px' }}>
        <Lock className="w-4 h-4 inline mr-1 text-blue-600" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="password"
        id={id}
        name={id}
        value={formData[id]}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-xl"
        disabled={isSubmitting}
      />
      
      {/* Indicateur de force du mot de passe */}
      {id === "password" && formData.password && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <div className={`h-2 flex-1 rounded-full ${
              passwordErrors.length <= 2 ? 'bg-green-500' : 
              passwordErrors.length <= 4 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {passwordErrors.length === 0 ? 'Fort' : 
               passwordErrors.length <= 2 ? 'Moyen' : 'Faible'}
            </span>
          </div>
          
          {/* Critères de validation */}
          {formData.password && (
            <div className="text-xs text-gray-600 space-y-1">
              <div className={`${formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                • Au moins 8 caractères
              </div>
              <div className={`${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                • Au moins une minuscule
              </div>
              <div className={`${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                • Au moins une majuscule
              </div>
              <div className={`${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                • Au moins un chiffre
              </div>
              <div className={`${/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                • Au moins un caractère spécial (@$!%*?&)
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Vérification de la confirmation */}
      {id === "confirmPassword" && formData.confirmPassword && (
        <div className="mt-1">
          {formData.password === formData.confirmPassword ? (
            <div className="text-green-600 text-xs flex items-center">
              <span className="w-4 h-4 mr-1">✓</span> Les mots de passe correspondent
            </div>
          ) : (
            <div className="text-red-600 text-xs flex items-center">
              <span className="w-4 h-4 mr-1">✗</span> Les mots de passe ne correspondent pas
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTextarea = (id, label, required = false, icon = null) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1"
        style={{ margin: '5px' }}>
        {icon && React.createElement(icon, { className: "w-4 h-4 inline mr-1 text-blue-600" })}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        value={formData[id]}
        onChange={handleChange}
        required={required}
        rows="3"
        className="w-full px-3 py-2 border border-gray-300 rounded-xl"
        disabled={isSubmitting}
      />
    </div>
  );

  const renderHeader = (title, icon) => (
    <div style={{ padding: '1em' }} className="bg-gradient-to-r from-purple-600 to-blue-600 flex items-center text-white px-4 py-4 rounded-t-xl shadow">
      {React.createElement(icon, { className: "w-5 h-5 mr-2 text-white" })}
      <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
    </div>
  );

  // Liste des filières disponibles pour l'enseignement
  const filieresEnseignement = [
    "Philosophie",
    "Anglais", 
    "Lettres Modernes",
    "Espagnol",
  ];

  // Documents requis pour l'inscription enseignant
  
  const documentsRequises = [
    // Documents d'identité et légaux
    "Demande d’autorisation d’enseigner adressée au Ministre (précisant la/les matière(s))",
    "Extrait d’acte de naissance ou pièce en tenant lieu (Original ou Copie légalisée)",
    "Certificat de nationalité",
    "Extrait du casier judiciaire (datant de moins de 3 mois)",
    "Photocopie légalisée de la Carte Nationale d’Identité ou du Passeport",

    // Qualifications et Compétences
    "Copie légalisée des Diplômes ou Titres (Minimum Doctorat de 3ème cycle / PhD / Équivalent)",
    "Curriculum Vitae détaillé (y compris pour la Demande d'Ouverture de l'EPES)",
    "Lettre d’engagement ou Contrat de travail (exigé pour la Demande d'Ouverture de l'EPES)",
    
    // Aptitude Médicale
    "Certificat médical de visite et contre visite (datant de moins de 3 mois, délivré par médecin agréé par l’État)",
    "Certificat spécifique de non-bégaiement, de non-surdité et d’acuité visuelle (5/10 minimum)",
    
    // Finance/Administratif
    "Quittance de paiement des frais d’étude du dossier (25 000 FCFA à la DGES)"
];

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-10">
        <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-purple-800 text-white py-6 px-5 text-center">
            <h1 style={{ marginTop: '2em', padding: '10px' }} className="text-3xl md:text-4xl font-extrabold">
              🎓 Dépôt de dossier Enseignant - EFES GNON GANI
            </h1>
            <p style={{ padding: '10px' }} className="text-gray-200 mt-1 text-sm py-3">
              Veuillez remplir soigneusement tous les champs ci-dessous pour votre Dépôt de dossier .
            </p>
          </div>

          <form style={{ width: '70%', margin: 'auto' }} onSubmit={handleSubmit}
            className="p-6 md:p-10 space-y-8">
            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-center font-semibold ${
                  message.startsWith("✅")
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : message.startsWith("❌")
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                }`}
              >
                {message}
              </div>
            )}

            {/* SECTION 1 - Informations Personnelles */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("1. Informations Personnelles", User)}
              <div className="p-6 grid md:grid-cols-2 gap-4">
                {renderInput("nom", "Nom", "text", true)}
                {renderInput("prenoms", "Prénoms", "text", true)}
                {renderInput("dateNaissance", "Date de naissance", "date", true)}
                {renderInput("lieuNaissance", "Lieu de naissance", "text", true)}
                {renderInput("nationalite", "Nationalité", "text", true)}

                {/* Sexe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sexe <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6 mt-1">
                    {["Masculin", "Féminin"].map((s) => (
                      <label key={s} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sexe"
                          value={s}
                          onChange={handleChange}
                          checked={formData.sexe === s}
                          className="text-blue-600 focus:ring-blue-500"
                          required
                          disabled={isSubmitting}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Situation Matrimoniale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Situation Matrimoniale <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="matrimoniale"
                    value={formData.matrimoniale}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)">Marié(e)</option>
                    <option value="Divorcé(e)">Divorcé(e)</option>
                    <option value="Veuf(ve)">Veuf(ve)</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {formData.matrimoniale === "Autre" && 
                  renderInput("matrimonialeAutre", "Précisez votre situation", "text", true)
                }

                {renderInput("adresseComplete", "Adresse complète", "text", true, Home)}
                {renderInput("telephone", "Téléphone", "tel", true, Phone)}
                {renderInput("email", "E-mail", "email", true, Mail)}
                
                {/* Nouveaux champs mot de passe */}
                {renderPasswordInput("password", "Mot de passe", true)}
                {renderPasswordInput("confirmPassword", "Confirmation du mot de passe", true)}
              </div>
            </section>

            {/* SECTION 2 - Photo d'identité */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("2. Photo d'Identité", Camera)}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Zone d'upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Photo d'identité récente <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        onChange={handlePhotoChange}
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <label 
                        htmlFor="photo"
                        className={`cursor-pointer flex flex-col items-center justify-center gap-3 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Camera className="w-12 h-12 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Cliquez pour importer votre photo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Formats acceptés: JPG, JPEG, PNG
                          </p>
                          <p className="text-xs text-gray-500">
                            Taille maximale: 5 Mo
                          </p>
                        </div>
                      </label>
                    </div>

                    {photo && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">
                          ✓ Photo sélectionnée: {photo.name}
                        </p>
                        <p className="text-green-600 text-xs">
                          Taille: {(photo.size / 1024 / 1024).toFixed(2)} Mo
                        </p>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="mt-2 text-red-600 text-sm hover:text-red-700 font-medium"
                        >
                          ✗ Supprimer la photo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview de la photo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Aperçu de la photo
                    </label>
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                      {photoPreview ? (
                        <div className="text-center">
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="mx-auto w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Cette photo sera utilisée pour votre badge d'enseignant
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Aperçu de la photo apparaîtra ici
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    📋 Instructions pour la photo :
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Photo récente (moins de 6 mois)</li>
                    <li>• Fond blanc ou neutre</li>
                    <li>• Visage bien visible, sans accessoires</li>
                    <li>• Tenue professionnelle</li>
                    <li>• Format portrait (vertical)</li>
                    <li>• Taille maximale : 5 Mo</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 3 - Informations Académiques et Professionnelles */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("3. Informations Académiques et Professionnelles", GraduationCap)}
              <div className="p-6 grid md:grid-cols-2 gap-4">
                {renderInput("diplome", "Diplôme le plus élevé", "text", true)}
                {renderInput("specialite", "Spécialité", "text", true)}
                {renderInput("anneeExperience", "Années d'expérience en enseignement", "number", true)}
                {renderInput("etablissementPrecedent", "Établissement précédent", "text", false)}
                {/*renderTextarea("coursEnseignes", "Cours enseignés (séparés par des virgules)", true)*/}
              </div>
            </section>

            {/* SECTION 4 - Filière et Matières à Enseigner */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden bg-white shadow-sm">
              {renderHeader("4. Filière et Matières à Enseigner", BookOpen)}
              <div className="p-6">
                {/* Sélection de la filière */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-4">
                    Filière que vous souhaitez enseigner : <span className="text-red-500">*</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filieresEnseignement.map((filiere) => (
                      <label
                        key={filiere}
                        className={`
                          flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                          ${formData.filiereEnseignee === filiere
                            ? "border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-100 ring-inset"
                            : "border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-sm"
                          }
                          ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        <input
                          type="radio"
                          name="filiereEnseignee"
                          value={filiere}
                          checked={formData.filiereEnseignee === filiere}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 focus:ring-2 border-gray-300"
                          required
                          disabled={isSubmitting}
                        />
                        <span className="font-medium text-gray-900 text-sm sm:text-base ml-2">
                          {filiere}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Documents requis */}
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Documents à fournir pour compléter votre Dépôt de dossier  à EFES Gnon Gani
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    {documentsRequises.map((document, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-600 text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 font-medium">{document}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note importante :</strong> Tous les documents doivent être fournis en original pour vérification et en copie certifiée conforme. 
                      Les documents seront retournés après vérification.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5 - Engagement */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("5. Engagement du Candidat", CheckSquare)}
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Je soussigné(e) <strong>{formData.nom} {formData.prenoms}</strong>, certifie sur l'honneur l'exactitude des informations fournies dans le présent formulaire. 
                    Je m'engage à respecter le règlement intérieur de l'EFES GNON GANI, les valeurs académiques et éthiques de l'établissement, 
                    et à accomplir mes fonctions avec professionnalisme et dévouement.
                  </p>
                </div>
                <label className={`flex items-center gap-2 bg-green-50 p-4 rounded-lg ${isSubmitting ? "opacity-50" : ""}`}>
                  <input style={{ width: '20px' }}
                    type="checkbox"
                    name="accepteEngagement"
                    checked={formData.accepteEngagement}
                    onChange={handleChange}
                    className="h-5 w-5 text-green-600 rounded"
                    required
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium text-green-700">
                    J'accepte le règlement intérieur et m'engage à respecter les valeurs de l'établissement.
                  </span>
                </label>
              </div>
            </section>

            {/* Submit */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <button 
                style={{ 
                  padding: '12px', 
                  width: '50%', 
                  margin: "2em",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                type="submit"
                disabled={isSubmitting}
                className={`bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 ${
                  isSubmitting ? 'bg-purple-500' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Soumission en cours...
                  </>
                ) : (
                  'Soumettre le dossier '
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InscriptionEnseignant;