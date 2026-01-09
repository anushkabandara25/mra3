
import React, { useState, useMemo } from 'react';
import { Product, User } from '../types';
import { CATEGORIES, UNITS } from '../constants';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  ShoppingCart, 
  PackagePlus,
  AlertCircle,
  X,
  ScanLine,
  Barcode
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface InventoryProps {
  products: Product[];
  user: User;
  onSave: (p: Product) => void;
  onDelete: (id: string) => void;
  onTransaction: (id: string, type: 'add' | 'sell', qty: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onSave, onDelete, onTransaction }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ id: string, name: string, type: 'add' | 'sell' } | null>(null);
  const [actionQty, setActionQty] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<'lookup' | 'register'>('lookup');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const searchLower = search.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                            p.brand.toLowerCase().includes(searchLower) ||
                            (p.barcode && p.barcode.toLowerCase().includes(searchLower));
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      brand: formData.get('brand') as string,
      unit: formData.get('unit') as string,
      barcode: formData.get('barcode') as string,
      costPrice: Number(formData.get('costPrice')),
      sellingPrice: Number(formData.get('sellingPrice')),
      currentStock: editingProduct ? editingProduct.currentStock : Number(formData.get('currentStock')),
      minStock: Number(formData.get('minStock')),
      updatedAt: new Date().toISOString()
    };
    onSave(newProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAction) {
      onTransaction(activeAction.id, activeAction.type, actionQty);
      setIsActionModalOpen(false);
      setActiveAction(null);
      setActionQty(1);
    }
  };

  const handleBarcodeScan = (code: string) => {
    if (scannerPurpose === 'lookup') {
      const found = products.find(p => p.barcode === code);
      if (found) {
        setActiveAction({ id: found.id, name: found.name, type: 'sell' });
        setIsActionModalOpen(true);
      } else {
        if (confirm(`No product found with barcode "${code}". Create new product?`)) {
          setEditingProduct({
            id: '',
            name: '',
            category: 'Bulbs',
            brand: '',
            unit: 'pcs',
            costPrice: 0,
            sellingPrice: 0,
            currentStock: 0,
            minStock: 0,
            updatedAt: new Date().toISOString(),
            barcode: code
          });
          setIsModalOpen(true);
        }
      }
    }
    setIsScannerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Inventory</h2>
          <p className="text-slate-500">Add, update, and manage your electrical shop stock.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setScannerPurpose('lookup'); setIsScannerOpen(true); }}
            className="flex items-center justify-center space-x-2 bg-slate-800 text-white px-5 py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg active:scale-95"
          >
            <ScanLine size={20} />
            <span className="font-bold">Scan Barcode</span>
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            <span className="font-bold">Add Item</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search items by name, brand, or barcode..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 min-w-[220px]">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Product Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Pricing</th>
                <th className="px-8 py-5">Stock Level</th>
                <th className="px-8 py-5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-800 text-lg">{p.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{p.brand}</span>
                      {p.barcode && <span className="flex items-center gap-1 text-slate-400"><Barcode size={12}/> {p.barcode}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-800 text-lg">Rs. {p.sellingPrice.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Cost: Rs. {p.costPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xl font-black ${p.currentStock <= p.minStock ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.currentStock}
                        <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase">{p.unit}</span>
                      </span>
                      {p.currentStock <= p.minStock && (
                        <div className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold animate-pulse">LOW</div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Min Level: {p.minStock}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center space-x-1">
                      <button 
                        title="Quick Sale"
                        onClick={() => { setActiveAction({ id: p.id, name: p.name, type: 'sell' }); setIsActionModalOpen(true); }}
                        className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                      >
                        <ShoppingCart size={20} />
                      </button>
                      <button 
                        title="Add Stock"
                        onClick={() => { setActiveAction({ id: p.id, name: p.name, type: 'add' }); setIsActionModalOpen(true); }}
                        className="p-3 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                      >
                        <PackagePlus size={20} />
                      </button>
                      <div className="w-px h-6 bg-slate-200 mx-2"></div>
                      <button 
                        title="Edit Item"
                        onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                        className="p-3 text-slate-400 hover:bg-slate-200 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        title="Delete Item"
                        onClick={() => { if(confirm(`Permanently delete "${p.name}"?`)) onDelete(p.id); }}
                        className="p-3 text-red-400 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{editingProduct ? 'Edit Details' : 'New Product'}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">M.R.A Inventory System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white shadow rounded-full text-slate-400 hover:text-slate-600 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Item Full Name</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="e.g. Bosch 12V High Output Horn" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Barcode Identifier</label>
                  <div className="relative">
                    <input name="barcode" defaultValue={editingProduct?.barcode} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-14 font-mono" placeholder="Scan or enter ID" />
                    <button 
                      type="button"
                      onClick={() => { setScannerPurpose('register'); setIsScannerOpen(true); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 bg-white shadow-sm border border-slate-100 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      <ScanLine size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Category</label>
                  <select name="category" defaultValue={editingProduct?.category} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Brand Name</label>
                  <input name="brand" defaultValue={editingProduct?.brand} required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Unit Type</label>
                  <select name="unit" defaultValue={editingProduct?.unit} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Min Alert Level</label>
                  <input type="number" name="minStock" defaultValue={editingProduct?.minStock} required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Cost Price (Rs.)</label>
                  <input type="number" name="costPrice" defaultValue={editingProduct?.costPrice} required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-emerald-600" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Sale Price (Rs.)</label>
                  <input type="number" name="sellingPrice" defaultValue={editingProduct?.sellingPrice} required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-blue-600" />
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Discard</button>
                <button type="submit" className="flex-2 px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal (Add/Sell) */}
      {isActionModalOpen && activeAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg ${activeAction.type === 'sell' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {activeAction.type === 'sell' ? <ShoppingCart size={32} /> : <PackagePlus size={32} />}
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center leading-tight">
              {activeAction.type === 'sell' ? 'Process Sale' : 'Add Stock'}
            </h3>
            <p className="text-slate-400 text-[10px] text-center uppercase tracking-widest font-black mt-2 mb-8">{activeAction.name}</p>
            
            <form onSubmit={handleActionSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 text-center uppercase mb-4">Quantity to Process</label>
                <div className="flex items-center justify-center gap-4">
                   <button type="button" onClick={() => setActionQty(Math.max(1, actionQty-1))} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 hover:bg-slate-200">-</button>
                   <input 
                    type="number" 
                    autoFocus
                    min="1"
                    className="w-24 px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-3xl font-black text-center focus:border-blue-500 outline-none"
                    value={actionQty}
                    onChange={(e) => setActionQty(parseInt(e.target.value) || 0)}
                  />
                   <button type="button" onClick={() => setActionQty(actionQty+1)} className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 hover:bg-slate-200">+</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  type="submit"
                  className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 ${activeAction.type === 'sell' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
                >
                  Confirm Transaction
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsActionModalOpen(false)}
                  className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onScan={handleBarcodeScan} 
          onClose={() => setIsScannerOpen(false)}
          title={scannerPurpose === 'lookup' ? 'Scan Code to Lookup' : 'Register New Code'}
        />
      )}
    </div>
  );
};

export default Inventory;
