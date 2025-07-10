// src/components/ProductManager/ProductForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@/firebaseConfig.js';
import { collection, getDocs, doc, addDoc, updateDoc, getDoc } from "firebase/firestore"; 
import styles from './ProductManager.module.css';

function ProductForm() {
  // Estados de controlo
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  
  // Estados do formulário/calculadora
  const [productName, setProductName] = useState('');
  const [costRows, setCostRows] = useState([{ id: Date.now(), materialId: '', quantity: 1 }]);
  const [fixedCostPercent, setFixedCostPercent] = useState(10);
  const [profitMarginPercent, setProfitMarginPercent] = useState(20);

  const navigate = useNavigate();
  const { productId } = useParams();

  // Busca os materiais e, se estiver a editar, busca os dados do produto
  useEffect(() => {
    const fetchMaterials = async () => {
      const materialsSnapshot = await getDocs(collection(db, "materials"));
      setAvailableMaterials(materialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchProductForEdit = async () => {
      if (productId) {
        const productDocRef = doc(db, "products", productId);
        const productDoc = await getDoc(productDocRef);
        if (productDoc.exists()) {
          const data = productDoc.data();
          setProductName(data.name);
          setCostRows(data.costRows);
          setFixedCostPercent(data.fixedCostPercent);
          setProfitMarginPercent(data.profitMarginPercent);
        }
      }
    };

    fetchMaterials();
    fetchProductForEdit();
  }, [productId]);

  // --- Lógica da Calculadora ---
  const totalVariableCost = useMemo(() => {
    return costRows.reduce((total, row) => {
      if (!row.materialId || !row.quantity) return total;
      const material = availableMaterials.find(m => m.id === row.materialId);
      if (!material) return total;
      return total + (material.price * parseFloat(row.quantity));
    }, 0);
  }, [costRows, availableMaterials]);

  const fixedCostValue = totalVariableCost * (fixedCostPercent / 100);
  const totalProductCost = totalVariableCost + fixedCostValue;
  const profitValue = totalProductCost * (profitMarginPercent / 100);
  const finalSalePrice = totalProductCost + profitValue;

  // --- Funções de Manipulação ---
  const handleSaveProduct = async () => {
    if (!productName) {
      alert("Por favor, dê um nome ao produto/serviço.");
      return;
    }
    setIsLoading(true);
    const productData = {
      name: productName,
      costRows,
      fixedCostPercent: Number(fixedCostPercent),
      profitMarginPercent: Number(profitMarginPercent),
      totalVariableCost,
      fixedCostValue,
      totalProductCost,
      profitValue,
      finalSalePrice,
    };

    try {
      if (productId) {
        await updateDoc(doc(db, "products", productId), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      navigate('/produtos');
    } catch (err) {
      console.error("Erro ao salvar produto: ", err);
      alert("Ocorreu um erro ao salvar o produto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowChange = (rowId, field, value) => setCostRows(costRows.map(row => row.id === rowId ? { ...row, [field]: value } : row));
  const handleAddRow = () => setCostRows([...costRows, { id: Date.now(), materialId: '', quantity: 1 }]);
  const handleRemoveRow = (rowId) => setCostRows(costRows.filter(row => row.id !== rowId));
  const handleRemoveAllRows = () => {
    if (window.confirm("Tem a certeza que deseja remover todos os custos variáveis?")) {
      setCostRows([{ id: Date.now(), materialId: '', quantity: 1 }]);
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div>
      <h1>{productId ? "Editar Produto/Serviço" : "Criar Novo Produto/Serviço"}</h1>
      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="product-name">Nome do Produto/Serviço</label>
          <input id="product-name" type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
        </div>
        
        <h2>Custos Variáveis</h2>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Item de Custo</th>
                <th>Preço/Unid.</th>
                <th>Quantidade</th>
                <th>Subtotal</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {costRows.map(row => {
                const selectedMaterial = availableMaterials.find(m => m.id === row.materialId);
                const subtotal = selectedMaterial ? selectedMaterial.price * parseFloat(row.quantity || 0) : 0;
                const isTimeBased = selectedMaterial && selectedMaterial.unit === 'hora';
                const hours = isTimeBased ? Math.floor(row.quantity) : 0;
                const minutes = isTimeBased ? Math.round((row.quantity - hours) * 60) : 0;

                return (
                  <tr key={row.id}>
                    <td>
                      <select value={row.materialId} onChange={(e) => handleRowChange(row.id, 'materialId', e.target.value)} required>
                        <option value="" disabled>Selecione um item</option>
                        {availableMaterials.map(material => (
                          <option key={material.id} value={material.id}>{material.name} ({material.unit})</option>
                        ))}
                      </select>
                    </td>
                    <td>R$ {selectedMaterial ? selectedMaterial.price.toFixed(2) : '0.00'}</td>
                    <td>
                      {isTimeBased ? (
                        <div className={styles.timeInputGroup}>
                          <input type="number" value={hours} onChange={(e) => {
                            const newDecimal = (parseInt(e.target.value) || 0) + (minutes / 60);
                            handleRowChange(row.id, 'quantity', newDecimal);
                          }} className={styles.timeInput} placeholder="H"/>
                          <span>:</span>
                          <input type="number" value={minutes} onChange={(e) => {
                            const newDecimal = hours + ((parseInt(e.target.value) || 0) / 60);
                            handleRowChange(row.id, 'quantity', newDecimal);
                          }} className={styles.timeInput} placeholder="M" step="5"/>
                        </div>
                      ) : (
                        <input type="number" value={row.quantity} onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)} className={styles.quantityInput} placeholder="0" step="0.01"/>
                      )}
                    </td>
                    <td>R$ {subtotal.toFixed(2)}</td>
                    <td><button type="button" onClick={() => handleRemoveRow(row.id)} className={styles.deleteBtn}>Remover</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" onClick={handleAddRow}>Adicionar Item de Custo</button>
          <button type="button" onClick={handleRemoveAllRows} className={styles.removeAllBtn}>Remover Tudo</button>
        </div>

        <h2>Cálculo de Preço Final</h2>
        <div className={styles.inputGroup}>
          <label htmlFor="custo-fixo">Taxa de Custo Fixo (%)</label>
          <input type="number" id="custo-fixo" value={fixedCostPercent} onChange={(e) => setFixedCostPercent(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="margem-lucro">Margem de Lucro (%)</label>
          <input type="number" id="margem-lucro" value={profitMarginPercent} onChange={(e) => setProfitMarginPercent(e.target.value)} />
        </div>
        
        <div className={styles.summaryBox}>
          <h3>Resumo do Produto</h3>
          <p><span>Custo Variável Total:</span> <span>R$ {totalVariableCost.toFixed(2)}</span></p>
          <p><span>+ Custo Fixo ({fixedCostPercent}%):</span> <span>R$ {fixedCostValue.toFixed(2)}</span></p>
          <p className={styles.summaryTotal}><span>CUSTO TOTAL DO PRODUTO:</span> <span>R$ {totalProductCost.toFixed(2)}</span></p>
          <p><span>+ Lucro ({profitMarginPercent}%):</span> <span>R$ {profitValue.toFixed(2)}</span></p>
          <p className={styles.finalPrice}><span>PREÇO FINAL DE VENDA:</span> <span>R$ {finalSalePrice.toFixed(2)}</span></p>
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" onClick={handleSaveProduct} disabled={isLoading}>{isLoading ? 'Salvando...' : (productId ? 'Atualizar Produto' : 'Salvar Produto')}</button>
          <button type="button" onClick={() => navigate('/produtos')} className={styles.cancelBtn}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;