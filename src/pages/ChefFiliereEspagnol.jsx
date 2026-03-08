// src/pages/ChefFiliereEspagnol.jsx
import React from 'react';
import ChefFiliereBase from './ChefFiliereBase';

const ChefFiliereEspagnol = () => {
  const user = JSON.parse(localStorage.getItem('current_user') || '{}');
  
  return (
    <ChefFiliereBase 
      filiere="Espagnol" 
      user={user}
    />
  );
};

export default ChefFiliereEspagnol;