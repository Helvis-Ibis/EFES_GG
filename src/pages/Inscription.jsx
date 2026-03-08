import { Mail, Phone, User, Home, BookOpen, CheckSquare, Users, FileText, Camera } from 'lucide-react';
import '../style/inscription.css';
import React, { useState } from "react";
import { API_URL_BASE, URL_BASE } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { pieces } from '../data/news';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

const Inscription = () => {
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
    diplomeAcces: "BAC",
    diplomeAccesAutre: "",
    serieOption: "",
    anneeObtention: "",
    mentionObtenue: "",
    etablissementOrigine: "",
    filiereChoisie: "",
    tuteurNomPrenoms: "",
    tuteurLienParente: "",
    tuteurProfession: "",
    tuteurAdresse: "",
    tuteurTelephone: "",
    tuteurEmail: "",
    accepteEngagement: false,
  };

  const [formData, setFormData] = useState(initialState);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "accepteEngagement") {
      setFormData((prev) => ({
        ...prev,
        accepteEngagement: checked,
      }));
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

    if (!formData.accepteEngagement) {
      setMessage("⚠️ Veuillez accepter l'engagement.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.filiereChoisie) {
      setMessage("⚠️ Veuillez choisir une filière/département.");
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
      if (key !== 'accepteEngagement') {
        formD.append(key, formData[key]);
      }
    });
    
    // Ajouter la photo
    formD.append('photo', photo);
    
    formD.append('nomEngagement', formData.nom + " " + formData.prenoms);
    formD.append('accepteEngagement', formData.accepteEngagement);

    try {
      const response = await fetch(URL_BASE.INSCRIPTION_ETUDIANT(), {
        method: 'POST',
        body: formD
      });

      
      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Inscription effectuée avec succès !",
          text: "Veuillez-vous rapprocher de l'administration pour la validation de votre inscription. Merci",
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

  const renderHeader = (title, icon) => (
    <div style={{ padding: '1em' }} className="bg-gradient-to-r from-green-600 to-blue-600 flex items-center text-white px-4 py-4 rounded-t-xl shadow">
      {React.createElement(icon, { className: "w-5 h-5 mr-2 text-white" })}
      <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
    </div>
  );

  // Liste des pièces à fournir par filière
  const piecesParFiliere = {
    "Philosophie": [
      "Demande manuscrite adressée au Directeur",
      "Copie certifiée du certificat de nationalité",
      "Copie certifiée de l'acte de naissance",
      "Diplôme du BAC ou équivalent légalisé",
      "Quittance des frais d'inscription",
      "Chemise cartonnée à fermoir"
    ],
    "Anglais": [
      "Demande manuscrite adressée au Directeur",
      "Copie certifiée du certificat de nationalité",
      "Copie certifiée de l'acte de naissance",
      "Diplôme du BAC ou équivalent légalisé",
      "Quittance des frais d'inscription",
      "Chemise cartonnée à fermoir",
      "Attestation de niveau d'anglais (optionnel)"
    ],
    "Lettres Modernes": [
      "Demande manuscrite adressée au Directeur",
      "Copie certifiée du certificat de nationalité",
      "Copie certifiée de l'acte de naissance",
      "Diplôme du BAC ou équivalent légalisé",
      "Quittance des frais d'inscription",
      "Chemise cartonnée à fermoir",
      "Lettre de motivation manuscrite"
    ],
    "Espagnol": [
      "Demande manuscrite adressée au Directeur",
      "Copie certifiée du certificat de nationalité",
      "Copie certifiée de l'acte de naissance",
      "Diplôme du BAC ou équivalent légalisé",
      "Quittance des frais d'inscription",
      "Chemise cartonnée à fermoir",
      "Attestation de niveau d'espagnol (optionnel)"
    ]
  };

  const getPiecesPourFiliere = () => {
    return piecesParFiliere[formData.filiereChoisie] || [];
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-10">
        <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-green-800 text-white py-6 px-5 text-center">
            <h1 style={{ marginTop: '2em', padding: '10px' }} className="text-3xl md:text-4xl font-extrabold">
              📘 Fiche d'Inscription - EFES GNON GANI
            </h1>
            <p style={{ padding: '10px' }} className="text-gray-200 mt-1 text-sm py-3">
              Veuillez remplir soigneusement tous les champs ci-dessous.
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

            {/* SECTION 1 */}
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

                {renderInput("adresseComplete", "Adresse complète", "text", true, Home)}
                {renderInput("telephone", "Téléphone", "tel", true, Phone)}
                {renderInput("email", "E-mail", "email", true, Mail)}
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
                            Cette photo sera utilisée pour votre carte d'étudiant
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
                    <li>• Format portrait (vertical)</li>
                    <li>• Taille maximale : 5 Mo</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 3 */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("3. Informations Académiques", BookOpen)}
              <div className="p-6 grid md:grid-cols-2 gap-4">
                {renderInput("serieOption", "Série / Option", "text", true)}
                {renderInput("anneeObtention", "Année d'obtention", "number", true)}
                {renderInput("mentionObtenue", "Mention obtenue")}
                {renderInput("etablissementOrigine", "Établissement d'origine", "text", true)}
              </div>
            </section>

            {/* SECTION 4 - Filière Choisie avec Pièces à Fournir intégrées */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden bg-white shadow-sm">
              {renderHeader("4. Filière Choisie et Pièces à Fournir", CheckSquare)}
              <div className="p-6">
                {/* Sélection de la filière */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-4">
                    Choisissez votre filière :
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["Philosophie", "Anglais", "Lettres Modernes", "Espagnol"].map((filiere) => (
                      <label
                        key={filiere}
                        className={`
                          flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                          ${formData.filiereChoisie === filiere
                            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100 ring-inset"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                          }
                          ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        <input
                          type="radio"
                          name="filiereChoisie"
                          value={filiere}
                          checked={formData.filiereChoisie === filiere}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-2 border-gray-300"
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

                {/* Pièces à fournir - affichées automatiquement quand une filière est sélectionnée */}
                {formData.filiereChoisie && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        Pièces à fournir pour la filière  : <span className="text-blue-600">{formData.filiereChoisie }</span>
                           ( lors de la validation)
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      {getPiecesPourFiliere().map((piece, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-700 font-medium">{piece}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note importante :</strong> Tous les documents doivent être fournis en original et en copie. 
                        Les copies doivent être certifiées conformes aux originaux. Les photos d'identité doivent être récentes (moins de 6 mois).
                      </p>
                    </div>
                  </div>
                )}

                {!formData.filiereChoisie && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      Veuillez sélectionner une filière pour voir les pièces requises
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 5 */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("5. Informations du Tuteur / Parent", Users)}
              <div className="p-6 grid md:grid-cols-2 gap-4">
                {renderInput("tuteurNomPrenoms", "Nom et prénoms", "text", true)}
                {renderInput("tuteurLienParente", "Lien de parenté", "text", true)}
                {renderInput("tuteurProfession", "Profession", "text", true)}
                {renderInput("tuteurTelephone", "Téléphone", "tel", true, Phone)}
                {renderInput("tuteurEmail", "E-mail", "email", false, Mail)}
              </div>
            </section>

            {/* SECTION 6 - Engagement */}
            <section className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
              {renderHeader("6. Engagement de l'Étudiant(e)", CheckSquare)}
              <div className="p-6">
                <p className="text-gray-700 mb-4" style={{ margin: '10px' }}>
                  Je certifie sur l'honneur l'exactitude des informations fournies et
                  m'engage à respecter le règlement intérieur.
                </p>
                <label className={`flex items-center gap-2 bg-blue-50 p-3 rounded-lg ${isSubmitting ? "opacity-50" : ""}`}>
                  <input style={{ width: '20px' }}
                    type="checkbox"
                    name="accepteEngagement"
                    checked={formData.accepteEngagement}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded"
                    required
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium text-blue-700">
                    J'accepte le règlement intérieur.
                  </span>
                </label>
              </div>
            </section>

            {/* Submit */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <button 
                style={{ 
                  padding: '10px', 
                  width: '50%', 
                  margin: "2em",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                type="submit"
                disabled={isSubmitting}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 ${
                  isSubmitting ? 'bg-green-500' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement en cours...
                  </>
                ) : (
                  'Valider l\'Inscription'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Inscription;