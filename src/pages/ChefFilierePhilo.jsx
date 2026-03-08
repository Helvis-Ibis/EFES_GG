// src/pages/ChefFilierePhilo.jsx
import React from 'react';
import ChefFiliereBase from './ChefFiliereBase';

const ChefFilierePhilo = () => {
  const user = JSON.parse(localStorage.getItem('current_user') || '{}');
  
  return (
    <ChefFiliereBase 
      filiere="Philosophie" 
      user={user}
    />
  );
};

export default ChefFilierePhilo;