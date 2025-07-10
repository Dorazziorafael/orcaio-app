// src/components/MaterialsManager/MaterialForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import styles from './MaterialsManager.module.css';

function MaterialForm() {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { itemId } = useParams(); // Pega o 'itemId' da URL, se existir

  useEffect(() => {
    if (itemId) { // Se existe um itemId, estamos em modo de edição
      const fetchMaterial = async () => {
        const materialDocRef = doc(db, "materials", itemId);
        const materialDoc = await getDoc(materialDocRef);
        if (materialDoc.exists()) {
          const data = materialDoc.data();
          setName(data.name);
          setUnit(data.unit);
          setPrice(data.price);
        }
      };
      fetchMaterial();
    }
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const materialData = { name, unit, price: parseFloat(price) };

    try {
      if (itemId) {
        await updateDoc(doc(db, "materials", itemId), materialData);
      } else {
        await addDoc(collection(db, "materials"), materialData);
      }
      navigate('/itens-custo'); // Volta para a lista após salvar
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o item.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>{itemId ? 'Editar Item de Custo' : 'Adicionar Novo Item de Custo'}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome do Item</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="unit">Unidade de Medida</label>
          <select id="unit" value={unit} onChange={e => setUnit(e.target.value)}>
            <option value="unidade">Unidade (un)</option>
            <option value="metro">Metro (m)</option>
            <option value="m2">Metro Quadrado (m²)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="litro">Litro (L)</option>
            <option value="hora">Hora (h)</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="price">Preço por Unidade (R$)</label>
          <input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required step="0.01" />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" onClick={() => navigate('/itens-custo')} className={styles.cancelBtn}>Voltar</button>
        </div>
      </form>
    </div>
  );
}

export default MaterialForm;