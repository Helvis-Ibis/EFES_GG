import { Menu, X, ChevronRight, Award,Heart,School,Target,History,
  Users, BookOpen, Globe, Mail, Phone, MapPin, Facebook, 
  Linkedin, Twitter, GraduationCap, Building2, Laptop, 
  PlayCircle, Calendar, TrendingUp, CheckCircle, Star, Send, ArrowRight } from 'lucide-react';
  import logo from '../assets/logo.jpeg';
  import  { Liens } from '../data/Liens';

function Footer() {

 const Reseaux = [
   {icon:Facebook,lien :'www.facebook.com'},
   {icon : Mail,lien :'mailto:administration@ecolesuperieuregnongani.org'}
 ] ;

 return (
    <footer id="contact" className="relative  from-gray-900 via-blue-900/20 to-gray-800 text-white py-20 px-8 overflow-hidden">
       {/* Effet de fond animé */}
       <div className="absolute inset-0 opacity-10">
         <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
       </div>

       <div className="relative w-full">
         <div className="grid md:grid-cols-4 gap-12 mb-16">
           {/* Section EFES GG */}
           <div className="md:col-span-2">
             <div className="flex items-center space-x-4 mb-6 group">
               <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                 <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                   <img className='w-14 h-14 rounded-xl object-cover' src={logo} alt="LOGO EFES GG" />
                 </div>
               </div>
               <div>
                 <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                   EFES GG
                 </h1>
                 <p className="text-sm text-gray-400 font-semibold">Former pour Transformer</p>
               </div>
             </div>
             
             <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
               École de Formation des Enseignants du Secondaire GNON GANI - Un réseau éducatif de 
               <span className="text-blue-400 font-bold"> 20 ans d'excellence</span> au service du développement humain intégral.
             </p>
             
             {/* Réseaux sociaux */}
             <div className="flex gap-4 mb-8">
               {Reseaux.map((Icon, idx) => (
                 <a 
                   key={idx} 
                   href={Icon.lien} 
                   className="group relative w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
                 >
                   <Icon.icon className="w-5 h-5 group-hover:scale-125 transition-transform" />
                   <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </a>
               ))}
             </div>

             {/* Newsletter
             
               <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
               <h4 className="font-bold text-lg mb-3 text-blue-300">📬 Newsletter</h4>
               <p className="text-gray-400 text-sm mb-4">Restez informé de nos actualités</p>
               <div className="flex gap-2">
                 <input 
                   type="email" 
                   placeholder="Votre email" 
                   className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                 />
                 <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg">
                   <Send className="w-5 h-5" />
                 </button>
               </div>
             </div>*/}
           
           </div>

           {/* Liens Rapides */}
           <div>
             <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
               <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-green-400 rounded-full"></div>
               <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                 Liens Rapides
               </span>
             </h4>
             <ul className="space-y-2 w-100">
               {Liens.map((item, idx) => (
                 <li key={idx}>
                   <a 
                     href={`${item.link}`} 
                     className=""
                   >
                    <div className="flex " style={{alignItems : 'center'}}>
                    <ArrowRight className="w-4 h-4 mx-3 transform group-hover:translate-x-2 transition-transform text-blue-400" />
                    <span className=" transition-transform">{item.label}</span>
                    </div>
                   </a>
                 </li>
               ))}
             </ul>
           </div>

           {/* Contact */}
           <div>
             <h4 id='joindre' className="font-bold text-xl mb-6 flex items-center gap-2">
               <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-blue-400 rounded-full"></div>
               <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                 Contact
               </span>
             </h4>
             <div className="space-y-5">
               <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-xl hover:from-blue-900/30 hover:to-green-900/30 transition-all duration-300">
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-white mb-1">Parakou, Bénin</p>
                   <p className="text-sm text-gray-400">3ᵉ arrondissement, Quartier Zongo</p>
                   <p className="text-xs text-gray-500 mt-1">Parcelle B lot 1610</p>
                 </div>
               </div>

               <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-xl hover:from-blue-900/30 hover:to-green-900/30 transition-all duration-300">
                 <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <Phone className="w-5 h-5" />
                 </div>
                 <span className="text-gray-300 group-hover:text-white transition-colors">+229 01 60 10 41 17</span>
               </div>

               <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-xl hover:from-blue-900/30 hover:to-green-900/30 transition-all duration-300">
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                   <Mail className="w-5 h-5" />
                 </div>
                 <span className="text-gray-300 group-hover:text-white transition-colors text-sm">administration@ecolesuperieuregnongani.org</span>
               </div>
             </div>
           </div>
         </div>

         {/* Séparateur avec effet brillant */}
         <div className="relative mb-8">
           <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
           <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent blur-sm"></div>
         </div>

         {/* Copyright */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-gray-400 text-sm flex items-center gap-2">
             <span className="text-blue-400">©</span> 2025 EFES GNON GANI. Tous droits réservés. 
             <span className="hidden md:inline">|</span>
             <span className="text-green-400">Fait au Bénin Dévéloppeur :  
                   <a className='text-gray-400 hover:text-blue transition-colors relative group' 
                    href="https://helvis-ibis.github.io/mon-Portfolio-/" target='_blank'>
                      @__@ Profil Helvis @__@
                  </a>
              </span> 
           </p>
          {
            /*
             <div className="flex gap-6 text-sm">
             {['Mentions légales', 'Confidentialité', 'CGU'].map((item, idx) => (
               <a 
                 key={idx} 
                 href="#" 
                 className="text-gray-400 hover:text-white transition-colors relative group"
               >
                 {item}
                 <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 group-hover:w-full transition-all duration-300"></span>
               </a>
             ))}
           </div> */
          }
         </div>
       </div>
     </footer>
 )
}

export default Footer