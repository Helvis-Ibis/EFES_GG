// src/pages/ChefFiliereLettreModerne.jsx
import React from 'react';
import ChefFiliereBase from './ChefFiliereBase';

const ChefFiliereLettreModerne = () => {
  const user = JSON.parse(localStorage.getItem('current_user') || '{}');
  
  return (
    <ChefFiliereBase 
      filiere="Lettres Modernes" 
      user={user}
    />
  );
};

export default ChefFiliereLettreModerne;