// src/components/Layout/Header.jsx

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faBars } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    // Função para definir o estilo do link ativo
    const getNavLinkClass = ({ isActive }) => 
      isActive 
        ? "bg-black/20 px-3 py-2 rounded-md font-medium" 
        : "px-3 py-2 rounded-md font-medium hover:bg-black/10 transition";

    return (
        <header className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-3xl" />
                        <h1 className="text-2xl font-bold">Orçaio</h1>
                    </Link>
                    <nav className="hidden md:flex space-x-2 items-center">
                        <NavLink to="/" className={getNavLinkClass} end>Início</NavLink>
                        <NavLink to="/orcamentos/novo" className={getNavLinkClass}>Novo Orçamento</NavLink>
                        <NavLink to="/clientes" className={getNavLinkClass}>Clientes</NavLink>
                        {/* Adicione outras rotas principais aqui, como Cadastros, se desejar */}
                    </nav>
                    <div className="md:hidden">
                        <button className="text-white focus:outline-none">
                            <FontAwesomeIcon icon={faBars} className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;