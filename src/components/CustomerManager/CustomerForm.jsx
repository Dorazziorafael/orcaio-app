// src/components/CustomerManager/CustomerForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { IMaskInput } from 'react-imask';
import styles from './CustomerManager.module.css';

function CustomerForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { customerId } = useParams();

  useEffect(() => {
    if (customerId) {
      const fetchCustomer = async () => {
        const customerDoc = await getDoc(doc(db, "customers", customerId));
        if (customerDoc.exists()) {
          const data = customerDoc.data();
          setName(data.name);
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setCnpj(data.cnpj || '');
        }
      };
      fetchCustomer();
    }
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert("O nome do cliente é obrigatório.");
      return;
    }
    setIsLoading(true);
    const customerData = { name, phone, email, cnpj };

    try {
      if (customerId) {
        await updateDoc(doc(db, "customers", customerId), customerData);
      } else {
        await addDoc(collection(db, "customers"), customerData);
      }
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>{customerId ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="phone">Telefone</label>
          <IMaskInput mask="(00) 00000-0000" id="phone" value={phone} onAccept={(value) => setPhone(value)} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="cnpj">CNPJ</label>
          <IMaskInput mask="00.000.000/0000-00" id="cnpj" value={cnpj} onAccept={(value) => setCnpj(value)} />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" onClick={() => navigate('/clientes')} className={styles.cancelBtn}>Voltar</button>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;