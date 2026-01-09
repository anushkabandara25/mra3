
import React, { useState } from 'react';
import { Transaction, Product } from '../types';
import { Search, Calendar, User, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface HistoryLogsProps {
  transactions: Transaction[];
  products: Product[];
}

const HistoryLogs: React.FC<HistoryLogsProps> = ({ transactions }) => {
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t => 
    t.productName.toLowerCase().includes(search.toLowerCase()) ||
    t.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Stock History & Logs</h2>
        <p className="text-slate-500">Every transaction and update is recorded here.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by product or staff name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Staff Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{t.productName}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center space-x-1.5 ${t.type === 'sell' ? 'text-red-600' : 'text-green-600'} font-medium`}>
                      {t.type === 'sell' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                      <span>{t.type === 'sell' ? 'Stock Out (Sale)' : 'Stock In (Add)'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${t.type === 'sell' ? 'text-red-600' : 'text-green-600'}`}>
                      {t.type === 'sell' ? '-' : '+'}{t.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2 text-slate-600">
                    <User size={14} />
                    {t.userName}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No matching logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryLogs;
