
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  BarChart3
} from 'lucide-react';

export const CATEGORIES = [
  'Bulbs',
  'Switches',
  'Wires',
  'Alternators',
  'Starters',
  'Batteries',
  'Fuses',
  'Relays',
  'Horns',
  'Accessories'
];

export const UNITS = ['pcs', 'meters', 'sets', 'rolls'];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
  { id: 'history', label: 'Stock History', icon: <History size={20} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
];

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'H4 Headlight Bulb',
    category: 'Bulbs',
    brand: 'Philips',
    unit: 'pcs',
    costPrice: 450,
    sellingPrice: 650,
    currentStock: 45,
    minStock: 10,
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '12V 70Ah Battery',
    category: 'Batteries',
    brand: 'Exide',
    unit: 'pcs',
    costPrice: 8500,
    sellingPrice: 11000,
    currentStock: 4,
    minStock: 5,
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Auto Relays 5-Pin',
    category: 'Relays',
    brand: 'Bosch',
    unit: 'pcs',
    costPrice: 120,
    sellingPrice: 250,
    currentStock: 12,
    minStock: 20,
    updatedAt: new Date().toISOString()
  }
];
