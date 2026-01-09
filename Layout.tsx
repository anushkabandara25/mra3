
import React from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { Menu, X, Zap } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-400" />
          <h1 className="font-bold text-lg">M.R.A AUTO</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-blue-900 text-white z-40 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-700 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="font-bold text-xl leading-tight">M.R.A AUTO</h1>
          </div>
          <p className="text-blue-300 text-[10px] uppercase tracking-[0.2em] font-bold">Inventory Management</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as View);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${currentView === item.id 
                  ? 'bg-white text-blue-900 shadow-lg shadow-blue-950/20 font-bold' 
                  : 'text-blue-100 hover:bg-blue-800/50 hover:pl-6'}
              `}
            >
              <span className={currentView === item.id ? 'text-blue-600' : 'text-blue-300'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-blue-800/50">
          <div className="bg-blue-950/50 rounded-xl p-4 text-center">
            <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Shop Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">System Active</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
