import './App.css'
import { Routes, Route } from 'react-router-dom'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Ecole from './pages/Ecole.jsx'
import Formations from './pages/Formations.jsx'
import Inscription from './pages/Inscription.jsx'
import Actualites from './pages/Actualites.jsx'
import Videos from './pages/Videos.jsx'
import Contact from './pages/Contact.jsx'
import Secretariat from './pages/Secretariat.jsx'
import LoginSecretaire from './pages/LoginSecretaire.jsx'
import LoginAdmin from './pages/LoginAdmin.jsx'
import Admin from './pages/Admin.jsx'
import InscriptionEnseignant from './pages/InscriptionEnseignant.jsx'
import ChefFiliereAnglais from './pages/ChefFiliereAnglais.jsx'
import ChefFiliereLettreModerne from './pages/ChefFiliereLettreModerne.jsx'
import ChefFiliereEspagnol from './pages/ChefFiliereEspagnol.jsx'
import ChefFilierePhilo from './pages/ChefFilierePhilo.jsx'
import LoginChefFiliere from './pages/LoginChefFiliere.jsx'
import EnseignantDashboard from './pages/EnseignantDashboard.jsx'
import LoginEnseignant from './pages/LoginEnseignant.jsx'


function App() {
  return (
    <div className="app-container">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ecole" element={<Ecole />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/inscription" element={<Inscription />} /> 
          <Route path="/inscription_enseignant" element={<InscriptionEnseignant />} /> 
          <Route path="/secretariat" element={<Secretariat />} /> 
          <Route path="/LoginSecretaire" element={<LoginSecretaire />} /> 
          <Route path="/Admin" element={<Admin />} /> 
          <Route path="/LoginAdmin" element={<LoginAdmin />} /> 
          <Route path="/LoginEnseignant" element={<LoginEnseignant />} /> 
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chef-anglais" element={<ChefFiliereAnglais />} />
          <Route path="/chef-lettres-modernes" element={<ChefFiliereLettreModerne />} />
          <Route path="/chef-espagnol" element={<ChefFiliereEspagnol />} />
          <Route path="/chef-philo" element={<ChefFilierePhilo />} />
          <Route path="/login-chef-filiere" element={<LoginChefFiliere />} />
          <Route path="/Enseignant-dashboard" element={<EnseignantDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
