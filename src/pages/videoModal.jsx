import React, { useEffect } from 'react';
import { X } from 'lucide-react'; // Icône de fermeture

/**
 * Composant VideoModal pour afficher une vidéo dans un modal.
 * @param {boolean} isOpen - Indique si le modal est ouvert.
 * @param {function} onClose - Fonction à appeler pour fermer le modal.
 * @param {string} videoUrl - L'URL de la vidéo à afficher.
 * @param {string} videoTitle - Le titre de la vidéo.
 */
const VideoModal = ({ isOpen, onClose, videoUrl, videoTitle }) => {

    // Empêcher le défilement du corps lorsque le modal est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset'; // Nettoyage au démontage
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        // Overlay (Arrière-plan sombre)
        <div style={{ opacity : '1' ,height:'75vh' , margin :'auto', width :'75%' }} className="rounded fixed inset-0 z-50 flex items-center justify-center bg-black  p-4" onClick={onClose}>
            {/* Conteneur du Modal (cliquer ici ne ferme PAS le modal) */}
             {/* Bouton de Fermeture */}
                <button style={{padding : '5px' , }}
                    onClick={onClose}
                    className="absolute top-0 right-0 m-3 p-3 text-white bg-red-500 rounded-full hover:bg-red-600 transition z-99"
                    aria-label="Fermer la vidéo"
                >
                    <X className="w-6 h-6" />
                </button>

            <div style={{width : '70%'}}
                className="relative   rounded-lg p-4"
                onClick={(e) => e.stopPropagation()} // Empêche la fermeture lors du clic à l'intérieur
            >
               
                {/* Titre de la Vidéo */}
               

                {/* Conteneur de l'Iframe (pour le responsive design) */}
                <div className="relative pt-[56.25%]"> {/* 56.25% pour un ratio 16:9 */}
                    {videoUrl && (
                        <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            src={videoUrl}
                            title={videoTitle}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            frameBorder="0"
                            loading="lazy"
                            // Ajoutez ?autoplay=1 pour démarrer automatiquement si votre source le permet
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoModal;