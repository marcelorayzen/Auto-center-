
import React from 'react';
import { Wrench, Car, Archive, DollarSign, FileText, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { Employee } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  currentUser: Employee | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, isMobileOpen, setIsMobileOpen, currentUser, onLogout 
}) => {
  const isAdminOrManager = currentUser?.role === 'Gerente' || currentUser?.role === 'Admin';
  const isFinanceRole = isAdminOrManager || currentUser?.role === 'Caixa';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'workshop', label: 'Oficina / OS', icon: <Wrench size={20} /> },
    { id: 'carwash', label: 'Lava-Rápido', icon: <Car size={20} /> },
    { id: 'inventory', label: 'Estoque', icon: <Archive size={20} /> },
    // Only show Finance and NFe to Managers, Admins, or Cashiers
    ...(isFinanceRole ? [
      { id: 'finance', label: 'Financeiro', icon: <DollarSign size={20} /> },
      { id: 'nfe', label: 'NF-e', icon: <FileText size={20} /> }
    ] : []),
    ...(isAdminOrManager ? [{ id: 'admin', label: 'Administração', icon: <Settings size={20} /> }] : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wrench className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Christo Car</h1>
            <p className="text-xs text-slate-400">Auto Center</p>
          </div>
        </div>

        <nav className="mt-6 px-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors text-sm font-medium
                ${activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-blue-400 border border-slate-600">
              {currentUser?.name.substring(0,2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-400">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-slate-800 py-2 rounded transition-colors"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};