import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Orçaio</h3>
                        <p className="text-gray-400">Soluções profissionais para gestão de orçamentos e projetos.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Início</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Sobre Nós</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Contato</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contato</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 w-4" /> Americana - SP</li>
                            <li className="flex items-center"><FontAwesomeIcon icon={faPhoneAlt} className="mr-2 w-4" /> (19) 98997-5189</li>
                            <li className="flex items-center"><FontAwesomeIcon icon={faEnvelope} className="mr-2 w-4" /> orcaio.orcamentos@gmail.com</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition"><FontAwesomeIcon icon={faFacebookF} className="text-xl" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><FontAwesomeIcon icon={faTwitter} className="text-xl" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><FontAwesomeIcon icon={faLinkedinIn} className="text-xl" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><FontAwesomeIcon icon={faInstagram} className="text-xl" /></a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Orçaio. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;