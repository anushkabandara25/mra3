
import React, { useState, useEffect } from 'react';
import { User, Product, Transaction, View } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import HistoryLogs from './components/HistoryLogs';
import Reports from './components/Reports';

// Default user identity for transaction logs since login is removed
const SYSTEM_USER: User = { 
  id: 'system', 
  username: 'admin', 
  role: 'admin', 
  name: 'Shop Manager' 
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mra_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error("Failed to parse products from localStorage", e);
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('mra_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse transactions from localStorage", e);
      return [];
    }
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem('mra_products', JSON.stringify(products));
    localStorage.setItem('mra_transactions', JSON.stringify(transactions));
  }, [products, transactions]);

  const addTransaction = (productId: string, type: 'add' | 'sell', quantity: number, note?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      productName: product.name,
      type,
      quantity,
      timestamp: new Date().toISOString(),
      userId: SYSTEM_USER.id,
      userName: SYSTEM_USER.name,
      note
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = type === 'add' ? p.currentStock + quantity : p.currentStock - quantity;
        return { ...p, currentStock: Math.max(0, newStock), updatedAt: new Date().toISOString() };
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.filter(t => t.productId !== id));
  };

  const saveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [product, ...prev];
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} transactions={transactions} onNavigate={setCurrentView} />;
      case 'inventory':
        return (
          <Inventory 
            products={products} 
            user={SYSTEM_USER} 
            onSave={saveProduct} 
            onDelete={deleteProduct} 
            onTransaction={addTransaction}
          />
        );
      case 'history':
        return <HistoryLogs transactions={transactions} products={products} />;
      case 'reports':
        return <Reports products={products} transactions={transactions} />;
      default:
        return <Dashboard products={products} transactions={transactions} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
    >
      {renderView()}
    </Layout>
  );
};

export default App;
