
import React, { useState, useEffect } from 'react';
import { Product, Transaction, View } from '../types';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ArrowRight,
  ScanLine,
  Zap
} from 'lucide-react';
import { getInventoryInsights } from '../services/gemini';
import BarcodeScanner from './BarcodeScanner';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions, onNavigate }) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const totalProducts = products.length;
  const recentSales = transactions.filter(t => {
    const today = new Date().setHours(0,0,0,0);
    return t.type === 'sell' && new Date(t.timestamp).setHours(0,0,0,0) === today;
  }).length;
  
  const totalValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    const insights = await getInventoryInsights(products);
    setAiInsights(insights);
    setLoadingInsights(false);
  };

  const handleBarcodeScan = (code: string) => {
    setIsScannerOpen(false);
    const found = products.find(p => p.barcode === code);
    if (found) {
      alert(`Found product: ${found.name}. Navigating to Inventory.`);
      onNavigate('inventory');
    } else {
      alert(`No product found with barcode "${code}".`);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Splash Welcome Greeting Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative flex flex-col items-center">
            <div className="absolute -top-24 opacity-20">
              <Zap size={200} className="text-blue-500 blur-2xl animate-pulse" />
            </div>
            <div className="p-5 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/50 scale-125 mb-8 welcome-reveal">
              <Zap size={48} className="text-white fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white text-center tracking-tighter welcome-reveal" style={{ animationDelay: '0.2s' }}>
              M.R.A AUTO
              <span className="block text-blue-400 text-lg tracking-[0.3em] font-black mt-2 uppercase">Electricals</span>
            </h1>
            <div className="mt-12 flex flex-col items-center welcome-reveal" style={{ animationDelay: '0.4s' }}>
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2 animate-[progress_1.5s_ease-in-out_infinite]" style={{
                  width: '0%',
                  animation: 'grow 1.8s ease-out forwards'
                }}></div>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Initializing Shop Systems...</p>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes grow { from { width: 0%; } to { width: 100%; } }
          `}} />
        </div>
      )}

      {/* Main Dashboard UI */}
      <div className={`transition-all duration-1000 ${showWelcome ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div className="welcome-reveal">
            <h2 className="text-4xl font-black text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 animate-electric">
              Welcome to M.R.A
            </h2>
            <p className="text-slate-500 mt-1 font-medium">Powering your inventory management with precision.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-800 text-white px-5 py-3 rounded-xl hover:bg-slate-900 hover:shadow-xl transition-all active:scale-95"
            >
              <ScanLine size={18} />
              <span className="font-bold">Quick Scan</span>
            </button>
            <button 
              onClick={handleGetInsights}
              disabled={loadingInsights}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-xl hover:shadow-2xl shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              <Sparkles size={18} />
              <span className="font-bold">{loadingInsights ? 'Analyzing...' : 'AI Insights'}</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Package className="text-blue-600" />} 
            label="Total Items" 
            value={totalProducts.toString()} 
            color="blue"
          />
          <StatCard 
            icon={<AlertTriangle className="text-amber-600" />} 
            label="Low Stock Alerts" 
            value={lowStockCount.toString()} 
            color="amber"
            alert={lowStockCount > 0}
          />
          <StatCard 
            icon={<TrendingUp className="text-green-600" />} 
            label="Daily Sales" 
            value={recentSales.toString()} 
            color="green"
          />
          <StatCard 
            icon={<Clock className="text-indigo-600" />} 
            label="Stock Value" 
            value={`Rs. ${totalValue.toLocaleString()}`} 
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Low Stock Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Critical Low Stock
              </h3>
              <button 
                onClick={() => onNavigate('inventory')}
                className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center"
              >
                Full Inventory <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Current</th>
                    <th className="px-6 py-4">Requirement</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.filter(p => p.currentStock <= p.minStock).slice(0, 5).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                      <td className="px-6 py-4 font-medium">{p.currentStock} {p.unit}</td>
                      <td className="px-6 py-4 text-slate-500">Min {p.minStock}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                          Restock
                        </span>
                      </td>
                    </tr>
                  ))}
                  {lowStockCount === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                        All systems operational. No items need immediate restock.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles size={80} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              AI Smart Assistant
            </h3>
            {aiInsights ? (
              <div className="text-slate-600 text-sm space-y-4 leading-relaxed whitespace-pre-wrap welcome-reveal">
                {aiInsights}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 animate-pulse">
                  <Sparkles size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Analyze Stock Performance</p>
                  <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed">Let Gemini analyze your current inventory trends and suggest restock priorities.</p>
                </div>
                <button 
                  onClick={handleGetInsights}
                  className="px-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest"
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-8 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Recent Activity Log</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl shadow-sm ${t.type === 'sell' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {t.type === 'sell' ? <TrendingUp size={16} /> : <Package size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{t.productName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(t.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${t.type === 'sell' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {t.type === 'sell' ? '-' : '+'}{t.quantity}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Sync</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-sm font-medium">No transactions recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Overlay */}
      {isScannerOpen && (
        <BarcodeScanner 
          onScan={handleBarcodeScan} 
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, alert = false }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all duration-500 hover:shadow-md ${alert ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'}`}>
      <div className="flex items-center space-x-5">
        <div className={`p-4 rounded-2xl ${colors[color]} border`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
