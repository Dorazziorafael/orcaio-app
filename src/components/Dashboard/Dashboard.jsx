// src/components/Dashboard/Dashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faFileAlt, faChartLine, faClock, faArrowUp, faEye, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

// Componente para os cartões de estatísticas
const StatCard = ({ title, value, icon, trend, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">R$ {value.toFixed(2)}</h3>
      </div>
      <div className={`${bgColor} p-3 rounded-full`}>
        <FontAwesomeIcon icon={icon} className={`${iconColor} text-xl`} />
      </div>
    </div>
    {trend && <p className="text-green-500 mt-2 text-sm font-medium"><FontAwesomeIcon icon={faArrowUp} className="mr-1" /> {trend}</p>}
  </div>
);

// Componente para a "badge" de status
const StatusBadge = ({ status }) => {
  const styles = {
    Pendente: 'bg-yellow-100 text-yellow-800',
    Aprovado: 'bg-green-100 text-green-800',
    Recusado: 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

function Dashboard() {
  const [budgets, setBudgets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBudgets = async () => {
      const querySnapshot = await getDocs(collection(db, "budgets"));
      setBudgets(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchBudgets();
  }, []);

  // Calcula as estatísticas
  const stats = useMemo(() => {
    const totalValue = budgets.reduce((acc, budget) => acc + budget.total, 0);
    const totalCost = budgets.reduce((acc, budget) => acc + (budget.budget?.totalProductCost || 0), 0);
    const totalProfit = totalValue - totalCost;
    return { totalValue, totalProfit };
  }, [budgets]);

  return (
    <div>
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Painel de Orçamentos</h2>
          <p className="text-gray-600">Gerencie todos os seus orçamentos em um só lugar</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button onClick={() => navigate('/orcamentos/novo')} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Novo Orçamento
          </button>
          <button className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg flex items-center transition">
            <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrar
          </button>
        </div>
      </div>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total em Orçamentos" value={stats.totalValue} icon={faFileAlt} trend="12% desde o mês passado" bgColor="bg-primary-100" iconColor="text-primary-600" />
        <StatCard title="Lucro Total" value={stats.totalProfit} icon={faChartLine} trend="8% desde o mês passado" bgColor="bg-green-100" iconColor="text-green-600" />
        {/* Card de pendentes pode ser implementado depois */}
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500">Orçamentos Pendentes</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{budgets.filter(b => b.status === 'Pendente').length}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
                </div>
            </div>
        </div>
      </div>
      
      {/* Tabela de Orçamentos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => (
                <tr key={budget.id} className="transition duration-150 ease-in-out hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{budget.customer.name}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{new Date(budget.createdAt.seconds * 1000).toLocaleDateString()}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">R$ {budget.total.toFixed(2)}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={budget.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3"><FontAwesomeIcon icon={faEye} /></button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3"><FontAwesomeIcon icon={faEdit} /></button>
                    <button className="text-red-600 hover:text-red-900"><FontAwesomeIcon icon={faTrashAlt} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;