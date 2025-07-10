// src/components/MaterialsManager/MaterialList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import styles from './MaterialsManager.module.css';

function MaterialList() {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    const querySnapshot = await getDocs(collection(db, "materials"));
    const materialsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMaterials(materialsList);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que quer apagar este item?")) {
      try {
        await deleteDoc(doc(db, "materials", id));
        fetchMaterials(); // Atualiza a lista após apagar
      } catch (err) {
        console.error("Erro ao apagar o item: ", err);
        alert("Não foi possível apagar o item.");
      }
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Itens de Custo</h1>
        <button onClick={() => navigate('/itens-custo/novo')}>Adicionar Novo Item</button>
      </div>
      
      <div className={styles.listSection}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Unidade</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id}>
                <td>{material.name}</td>
                <td>{material.unit}</td>
                <td>{material.price.toFixed(2)}</td>
                <td>
                  <button onClick={() => navigate(`/itens-custo/editar/${material.id}`)} className={styles.editBtn}>Editar</button>
                  <button onClick={() => handleDelete(material.id)} className={styles.deleteBtn}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materials.length === 0 && <p>Nenhum item de custo cadastrado.</p>}
      </div>
    </div>
  );
}

export default MaterialList;