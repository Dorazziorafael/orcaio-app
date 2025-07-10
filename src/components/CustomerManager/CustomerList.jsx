// src/components/CustomerManager/CustomerList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import styles from './CustomerManager.module.css';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    setCustomers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que quer apagar este cliente?")) {
      try {
        await deleteDoc(doc(db, "customers", id));
        fetchCustomers();
      } catch (err) {
        console.error("Erro ao apagar cliente: ", err);
        alert("Não foi possível apagar o cliente.");
      }
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Clientes</h1>
        <button onClick={() => navigate('/clientes/novo')}>Adicionar Novo Cliente</button>
      </div>

      <div className={styles.listSection}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>CNPJ</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.email}</td>
                <td>{customer.cnpj}</td>
                <td>
                  <button onClick={() => navigate(`/clientes/editar/${customer.id}`)} className={styles.editBtn}>Editar</button>
                  <button onClick={() => handleDelete(customer.id)} className={styles.deleteBtn}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p>Nenhum cliente cadastrado.</p>}
      </div>
    </div>
  );
}

export default CustomerList;