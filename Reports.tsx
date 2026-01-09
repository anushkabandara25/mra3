
import React from 'react';
import { Product, Transaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Download, FileText } from 'lucide-react';

interface ReportsProps {
  products: Product[];
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ products, transactions }) => {
  // Most sold items data
  const soldData = transactions
    .filter(t => t.type === 'sell')
    .reduce((acc: any, t) => {
      acc[t.productName] = (acc[t.productName] || 0) + t.quantity;
      return acc;
    }, {});

  const barData = Object.entries(soldData)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  // Category distribution data
  const catDataMap = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.currentStock;
    return acc;
  }, {});

  const pieData = Object.entries(catDataMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  const handleExport = () => {
    alert("Exporting report to Excel...");
    // Logical export implementation would go here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500">Visualizing your shop performance.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <Download size={18} />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Sold Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart size={20} className="text-blue-500" />
            Most Sold Items (Units)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-green-500" />
            Stock by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2 text-xs text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <FileText size={120} />
        </div>
        <h3 className="font-bold text-slate-800 mb-6">Financial Summary (Est.)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Stock Value (Cost)</p>
            <p className="text-xl font-bold text-slate-800">
              Rs. {products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Expected Revenue (Full Stock)</p>
            <p className="text-xl font-bold text-blue-600">
              Rs. {products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Potential Margin</p>
            <p className="text-xl font-bold text-green-600">
              {Math.round((products.reduce((acc, p) => acc + (p.currentStock * (p.sellingPrice - p.costPrice)), 0) / products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0) || 0) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
