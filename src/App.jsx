// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import BudgetCreator from './components/BudgetCreator/BudgetCreator.jsx';
import MaterialList from './components/MaterialsManager/MaterialList.jsx';
import MaterialForm from './components/MaterialsManager/MaterialForm.jsx';
import CustomerList from './components/CustomerManager/CustomerList.jsx';
import CustomerForm from './components/CustomerManager/CustomerForm.jsx';
import ProductList from './components/ProductManager/ProductList.jsx';
import ProductForm from './components/ProductManager/ProductForm.jsx';

import './App.css'; // O seu App.css continua como estava, com os estilos da navbar antiga

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orcamentos" element={<Dashboard />} /> {/* Rota para "Meus Orçamentos" */}
            <Route path="/orcamentos/novo" element={<BudgetCreator />} />

            <Route path="/itens-custo" element={<MaterialList />} />
            <Route path="/itens-custo/novo" element={<MaterialForm />} />
            <Route path="/itens-custo/editar/:itemId" element={<MaterialForm />} />
            
            <Route path="/clientes" element={<CustomerList />} />
            <Route path="/clientes/novo" element={<CustomerForm />} />
            <Route path="/clientes/editar/:customerId" element={<CustomerForm />} />
            
            <Route path="/produtos" element={<ProductList />} />
            <Route path="/produtos/novo" element={<ProductForm />} />
            <Route path="/produtos/editar/:productId" element={<ProductForm />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;