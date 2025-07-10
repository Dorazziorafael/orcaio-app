// src/components/ProductManager/ProductList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import styles from './ProductManager.module.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que quer apagar este produto do catálogo?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Catálogo de Produtos e Serviços</h1>
        <button onClick={() => navigate('/produtos/novo')}>Adicionar Novo Produto</button>
      </div>

      <div className={styles.listSection}>
        <table>
          <thead>
            <tr>
              <th>Nome do Produto/Serviço</th>
              <th>Custo Total (R$)</th>
              <th>Preço de Venda (R$)</th>
              <th>Margem (%)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.totalProductCost.toFixed(2)}</td>
                <td>{product.finalSalePrice.toFixed(2)}</td>
                <td>{product.profitMarginPercent}%</td>
                <td>
                  <button onClick={() => navigate(`/produtos/editar/${product.id}`)} className={styles.editBtn}>Editar</button>
                  <button onClick={() => handleDelete(product.id)} className={styles.deleteBtn}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p>Nenhum produto ou serviço cadastrado.</p>}
      </div>
    </div>
  );
}

export default ProductList;