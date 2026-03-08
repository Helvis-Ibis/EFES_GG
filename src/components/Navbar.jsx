import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import {Liens} from '../data/Liens';
import zedaga from '../assets/zedaga.jpeg';
import vie from '../assets/vie.jpeg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

 
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-2xl' 
          : 'bg-gradient-to-r from-green-50/90 to-blue-50/90 backdrop-blur-md'
      }`}>
        {/* Première ligne - Deux logos */}
        <div className="border-b border-gray-200/50">
          <div className="w-full ">
            <div className="flex justify-around items-center h-14 sm:h-16 lg:h-20">
              {/* Premier logo */}
              <a href="/">
              <div className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <img className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover" src={logo} alt="EFES GG" />
                  </div>
                </div>
                <div>
                  <h1 className="text-sm sm:text-base lg:text-xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EFES GG
                  </h1>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-600 tracking-wide hidden sm:block">
                    Former pour Transformer
                  </p>
                </div>
              </div>
              </a>
              

              {/* Deuxième logo */}
              <a href="https://fondation-viepourtous.org/" target='_blank'>
              <div className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <img className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover" src={vie} alt="EFES GG" />
                  </div>
                </div>
                <div>
                  <h1 className="text-sm sm:text-base lg:text-xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Fondation Vie Pour Tous
                  </h1>
                 
                </div>
              </div>
              </a>
              
              {/* troisieme logo */}
              <a href="https://zedaga.ch/" target='_blank'>
              <div className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <img className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover" src={zedaga} alt="EFES GG" />
                  </div>
                </div>
                <div>
                  <h1 className="text-sm sm:text-base lg:text-xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ZEDAGA
                  </h1>
                  
                </div>
              </div>
              </a>
              
            </div>
          </div>
        </div>

        {/* Deuxième ligne - Menu principal */}
        <div className="w-full ">
          <div className="flex justify-around w-full items-center h-16 sm:h-18 lg:h-20">
            {/* Logo principal */}
            <a href="#accueil" className="flex  items-center space-x-2 sm:space-x-3 lg:space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl sm:rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <img className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover" src={logo} alt="EFES GG" />
                </div>
              </div>
              <div>
                <h1 className=" lg:text-1xl font-black bg-gradient-to-r from-green-600 via-blue-600
                 to-purple-600 bg-clip-text text-transparent">
                  EFES GG
                </h1>
                <p className="text-[8px] sm:text-xs font-semibold text-gray-600 tracking-wide hidden sm:block">
                  Former pour Transformer
                </p>
              </div>
            </a>

            {/* Menu Desktop */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {Liens.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  className="relative px-3 xl:px-4 py-2 text-sm xl:text-base text-gray-700 font-semibold hover:text-blue-600 transition-all duration-300 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-green-600 to-blue-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
                </a>
              ))}
            </div>

            {/* Boutons CTA Desktop */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              <a
                href="/inscription"
                className="relative px-3 xl:px-6 py-2 xl:py-3 text-sm xl:text-base font-bold text-white rounded-xl overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:scale-105"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center space-x-1 xl:space-x-2 whitespace-nowrap">
                  <span>Inscription Étudiant</span>
                  <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4 transform group-hover:translate-y-1 transition-transform" />
                </span>
              </a>
              
              <a
                href="/inscription_enseignant"
                className="relative px-3 xl:px-6 py-2 xl:py-3 text-sm xl:text-base font-bold text-white rounded-xl overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 group-hover:scale-105"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center space-x-1 xl:space-x-2 whitespace-nowrap">
                  <span>Dépôt dossier Enseignant</span>
                  <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4 transform group-hover:translate-y-1 transition-transform" />
                </span>
              </a>

              <a
                href="/LoginEnseignant"
                className="relative px-3 xl:px-6 py-2 xl:py-3 text-sm xl:text-base font-bold text-white rounded-xl overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:scale-105"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center space-x-1 xl:space-x-2 whitespace-nowrap">
              <span> Connexion enseignant</span>
                  <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4 transform group-hover:translate-y-1 transition-transform" />
                </span>
              </a>
            </div>

            {/* Bouton Menu Mobile */}
            <button
              className="lg:hidden relative w-10 h-10 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center text-gray-700 hover:from-green-200 hover:to-blue-200 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-b from-white to-gray-50 border-t-2 border-gray-100 shadow-2xl">
            <div className="px-4 py-6 space-y-2">
              {Liens.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  className="block px-5 py-3 text-sm sm:text-base text-gray-700 font-semibold hover:text-blue-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-xl transition-all duration-300 transform hover:translate-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    {item.label}
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </span>
                </a>
              ))}
              
              <div className="pt-4 space-y-3 border-t-2 border-gray-200">
                <a
                  href="/inscription"
                  className="block text-center px-5 py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription Étudiant
                </a>
                
                <a
                  href="/inscription_enseignant"
                  className="block text-center px-5 py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription Enseignant
                </a>
                <a
                  href="/LoginEnseignant"
                  className="block text-center px-5 py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter en tant qu'enseignant
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer pour éviter que le contenu soit caché sous la navbar */}
      <div className="h-32 sm:h-36 lg:h-40"></div>
    </>
  );
};

export default Navbar;