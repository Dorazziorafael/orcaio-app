// src/components/BudgetCreator/BudgetCreator.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { db, Timestamp } from '@/firebaseConfig.js';
import { collection, getDocs, addDoc } from "firebase/firestore"; 
import styles from './BudgetCreator.module.css';

function BudgetCreator() {
  // Estados para buscar dados
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Estados do orçamento atual
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [budgetItems, setBudgetItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [discount, setDiscount] = useState(''); // Estado para o desconto
  
  const [isLoading, setIsLoading] = useState(false);

  // Busca clientes e produtos quando a página carrega
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const customersSnapshot = await getDocs(collection(db, "customers"));
        setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const productsSnapshot = await getDocs(collection(db, "products"));
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Erro ao buscar dados iniciais: ", err);
        alert("Não foi possível carregar os dados de clientes ou produtos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Função para adicionar um produto do catálogo ao orçamento
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const productToAdd = products.find(p => p.id === selectedProductId);
    if (productToAdd && !budgetItems.find(item => item.productId === productToAdd.id)) {
      const newItem = {
        lineId: Date.now(), 
        productId: productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.finalSalePrice,
        quantity: 1,
      };
      setBudgetItems([...budgetItems, newItem]);
    }
  };
  
  // Função para atualizar a quantidade de um item no orçamento
  const handleQuantityChange = (lineId, newQuantity) => {
    setBudgetItems(budgetItems.map(item => 
      item.lineId === lineId ? { ...item, quantity: parseInt(newQuantity) >= 1 ? parseInt(newQuantity) : 1 } : item
    ));
  };

  // Função para remover um item do orçamento
  const handleRemoveItem = (lineId) => {
    setBudgetItems(budgetItems.filter(item => item.lineId !== lineId));
  };

  // Calcula o total do orçamento, incluindo frete e subtraindo o desconto
  const grandTotal = useMemo(() => {
    const itemsTotal = budgetItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalWithShipping = itemsTotal + (parseFloat(shippingCost) || 0);
    const finalTotal = totalWithShipping - (parseFloat(discount) || 0);
    return finalTotal < 0 ? 0 : finalTotal; // Garante que o total não seja negativo
  }, [budgetItems, shippingCost, discount]);

  // Função para salvar o orçamento final
  const handleSaveBudget = async () => {
    if (!selectedCustomerId) return alert("Por favor, selecione um cliente.");
    if (budgetItems.length === 0) return alert("Adicione pelo menos um produto ao orçamento.");

    setIsLoading(true);
    const customer = customers.find(c => c.id === selectedCustomerId);
    const budgetData = {
      customer: { id: customer.id, name: customer.name },
      items: budgetItems,
      shippingCost: parseFloat(shippingCost) || 0,
      discount: parseFloat(discount) || 0,
      total: grandTotal,
      createdAt: Timestamp.now(),
      status: 'Pendente',
    };

    try {
      await addDoc(collection(db, "budgets"), budgetData);
      alert("Orçamento salvo com sucesso!");
      // Limpar o formulário
      setSelectedCustomerId('');
      setBudgetItems([]);
      setShippingCost('');
      setDiscount('');
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o orçamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Criar Novo Orçamento</h1>
      
      <div className={styles.section}>
        <h2>1. Cliente</h2>
        <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required>
          <option value="" disabled>Selecione um cliente</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.cnpj ? `- ${c.cnpj}` : ''}</option>)}
        </select>
      </div>

      <div className={styles.section}>
        <h2>2. Adicionar Produtos/Serviços</h2>
        <div className={styles.addItemForm}>
          <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
            <option value="" disabled>Selecione um item do catálogo</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.finalSalePrice.toFixed(2)}</option>)}
          </select>
          <button onClick={handleAddItem}>Adicionar ao Orçamento</button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>3. Itens do Orçamento</h2>
        <table>
          <thead>
            <tr>
              <th>Produto/Serviço</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Subtotal</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {budgetItems.map(item => (
              <tr key={item.lineId}>
                <td>{item.name}</td>
                <td><input type="number" min="1" value={item.quantity} onChange={e => handleQuantityChange(item.lineId, e.target.value)} className={styles.quantityInput} /></td>
                <td>R$ {item.price.toFixed(2)}</td>
                <td>R$ {(item.price * item.quantity).toFixed(2)}</td>
                <td><button onClick={() => handleRemoveItem(item.lineId)} className={styles.deleteBtn}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
         {budgetItems.length === 0 && <p>Nenhum produto adicionado ao orçamento.</p>}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryLine}>
          <label htmlFor="shipping">Custo do Frete (R$):</label>
          <input 
            type="number" 
            id="shipping" 
            value={shippingCost} 
            onChange={e => setShippingCost(e.target.value)} 
            className={styles.summaryInput}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className={styles.summaryLine}>
          <label htmlFor="discount">Desconto (R$):</label>
          <input 
            type="number" 
            id="discount"
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            className={styles.summaryInput}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className={styles.grandTotal}>Total do Orçamento: R$ {grandTotal.toFixed(2)}</div>
        <button onClick={handleSaveBudget} disabled={isLoading || !selectedCustomerId || budgetItems.length === 0}>
          {isLoading ? 'Salvando...' : 'Salvar Orçamento'}
        </button>
      </div>
    </div>
  );
}

export default BudgetCreator;