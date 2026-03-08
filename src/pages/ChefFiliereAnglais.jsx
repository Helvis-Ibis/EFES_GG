// src/pages/ChefFiliereAnglais.jsx
import React from 'react';
import ChefFiliereBase from './ChefFiliereBase';

const ChefFiliereAnglais = () => {
  // Récupérer les infos de l'utilisateur connecté depuis localStorage ou contexte
  const user = JSON.parse(localStorage.getItem('current_user') || '{}');
  
  return (
    <ChefFiliereBase 
      filiere="Anglais" 
      user={user}
    />
  );
};

export default ChefFiliereAnglais;