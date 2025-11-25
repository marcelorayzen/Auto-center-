
import React, { useState } from 'react';
import api from '../services/api';
import { PartItem } from '../types';
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';

interface InventoryModuleProps {
  parts: PartItem[];
  setParts: React.Dispatch<React.SetStateAction<PartItem[]>>;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ parts, setParts }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPart, setCurrentPart] = useState<Partial<PartItem>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = async () => {
    if (!currentPart.name || !currentPart.price) return;

    try {
      if (currentPart.id) {
        // local update for edits (no server update endpoint implemented)
        setParts(parts.map(p => p.id === currentPart.id ? currentPart as PartItem : p));
      } else {
        const payload = {
          name: currentPart.name,
          sku: currentPart.code || null,
          quantity: currentPart.quantity || 0,
          unitPrice: currentPart.price
        };
        const created = await api.createInventoryItem(payload);
        // server returns created item with id; merge and add to state
        setParts(prev => [...prev, { ...(currentPart as PartItem), id: created.id }]);
      }
      setIsEditing(false);
      setCurrentPart({});
    } catch (err) {
      console.error('Erro ao salvar peça:', err);
      alert('Erro ao salvar peça no servidor. Verifique a conexão.');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      setParts(parts.filter(p => p.id !== id));
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Estoque / Peças</h2>
        <button 
          onClick={() => { setCurrentPart({ quantity: 0 }); setIsEditing(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Nova Peça
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">
            {currentPart.id ? 'Editar Peça' : 'Nova Peça'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg"
                value={currentPart.code || ''}
                onChange={e => setCurrentPart({...currentPart, code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Peça</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg"
                value={currentPart.name || ''}
                onChange={e => setCurrentPart({...currentPart, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Unit. (R$)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg"
                value={currentPart.price || ''}
                onChange={e => setCurrentPart({...currentPart, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade em Estoque</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg"
                value={currentPart.quantity || 0}
                onChange={e => setCurrentPart({...currentPart, quantity: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18} /> Salvar
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
             <div className="relative max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Buscar peças..." 
                 className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Preço Unit.</th>
                <th className="p-4">Em Estoque</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredParts.map(part => (
                <tr key={part.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono">{part.code}</td>
                  <td className="p-4 font-medium">{part.name}</td>
                  <td className="p-4">R$ {part.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${part.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {part.quantity} unid.
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => { setCurrentPart(part); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(part.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredParts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma peça encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
