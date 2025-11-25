
import React, { useState, useEffect } from 'react';
import { WashRecord, WashService, Employee } from '../types';
import api from '../services/api';
import { Save, Droplets, Plus, Trash2, Edit, Settings } from 'lucide-react';

interface CarWashProps {
    records: WashRecord[];
    setRecords: React.Dispatch<React.SetStateAction<WashRecord[]>>;
    services: WashService[];
    setServices: React.Dispatch<React.SetStateAction<WashService[]>>;
    employees: Employee[];
    currentUser: Employee | null;
}

export const CarWashModule: React.FC<CarWashProps> = ({ records, setRecords, services, setServices, employees, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'services'>('register');
  
  // Form for new Wash
  const [form, setForm] = useState({
    plate: '',
    washServiceId: 0,
    employeeId: 0,
  });

    useEffect(() => {
        // load washes from server if available
        (async () => {
            try {
                const remote = await api.getWashes();
                if (Array.isArray(remote)) setRecords(remote as WashRecord[]);
            } catch (err) {
                // ignore, will work offline
            }
        })();
    }, []);

  // Form for Wash Service Management
  const [serviceForm, setServiceForm] = useState<Partial<WashService>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmitWash = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === form.washServiceId);
    const employee = employees.find(em => em.id === form.employeeId);
    
    if(!service || !employee) {
        alert("Selecione serviço e funcionário.");
        return;
    }
        const payload = {
            plate: form.plate.toUpperCase(),
            washServiceId: service.id,
            washServiceName: service.name,
            employeeId: employee.id,
            employeeName: employee.name,
            value: service.price
        };

        (async () => {
            try {
                const created = await api.createWash(payload);
                setRecords([created as WashRecord, ...records]);
                setForm({ plate: '', washServiceId: 0, employeeId: 0 });
            } catch (err) {
                // fallback to local behavior if server not available
                const newRecord: WashRecord = {
                    id: Date.now(),
                    plate: payload.plate,
                    washServiceId: payload.washServiceId,
                    washServiceName: payload.washServiceName,
                    employeeId: payload.employeeId,
                    employeeName: payload.employeeName,
                    value: payload.value,
                    date: new Date().toISOString(),
                    finalized: false
                };
                setRecords([newRecord, ...records]);
                setForm({ plate: '', washServiceId: 0, employeeId: 0 });
            }
        })();
  };

  // Service CRUD
  const saveService = () => {
     if(!serviceForm.name || !serviceForm.price) return;
     if(editingId) {
         setServices(services.map(s => s.id === editingId ? serviceForm as WashService : s));
     } else {
         setServices([...services, { ...serviceForm, id: Date.now() } as WashService]);
     }
     setServiceForm({});
     setEditingId(null);
  };

  const deleteService = (id: number) => {
      if(confirm('Excluir este tipo de serviço?')) setServices(services.filter(s => s.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Droplets className="text-blue-500" /> Lava-Rápido
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'register' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-white border'}`}
            >
                Registro / Histórico
            </button>
            <button 
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'services' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-white border'}`}
            >
                <Settings size={16} /> Tipos de Lavagem
            </button>
        </div>
      </div>

      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Register Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Nova Lavagem</h3>
            <form onSubmit={handleSubmitWash} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placa do Veículo</label>
                <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono"
                    placeholder="ABC-1234"
                    value={form.plate}
                    onChange={(e) => setForm({...form, plate: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Lavagem</label>
                <select 
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg"
                    value={form.washServiceId}
                    onChange={(e) => setForm({...form, washServiceId: Number(e.target.value)})}
                >
                    <option value={0}>Selecione...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Funcionário</label>
                <select 
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg"
                    value={form.employeeId}
                    onChange={(e) => setForm({...form, employeeId: Number(e.target.value)})}
                >
                    <option value={0}>Selecione...</option>
                    {employees.filter(e => e.role === 'Lavador').map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 flex justify-center gap-2">
                <Save size={20} /> Registrar
                </button>
            </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                Atendimentos de Hoje
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-white border-b">
                <tr>
                    <th className="p-4">Hora</th>
                    <th className="p-4">Placa</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Funcionário</th>
                    <th className="p-4 text-right">Valor</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {records.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum registro hoje.</td></tr>
                ) : (
                    records.map(rec => (
                                                    <tr key={rec.id}>
                                                    <td className="p-4 text-slate-500">{new Date(rec.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</td>
                                                    <td className="p-4 font-mono font-bold">{rec.plate}</td>
                                                    <td className="p-4">{rec.washServiceName}</td>
                                                    <td className="p-4">{rec.employeeName}</td>
                                                    <td className="p-4 text-right font-medium text-emerald-600">R$ {rec.value.toFixed(2)}</td>
                                                    <td className="p-4 text-center">
                                                        {rec.finalized ? (
                                                            <span className="text-sm text-emerald-600 font-bold">Finalizada</span>
                                                        ) : (
                                                            <div className="flex gap-2 justify-center">
                                                                {/* Only show finalize button to the employee who did the wash or to managers */}
                                                                { (currentUser && (currentUser.id === rec.employeeId || currentUser.role === 'Gerente')) ? (
                                                                    <button onClick={async () => {
                                                                        try {
                                                                            await api.finalizeWash(rec.id);
                                                                            // update local state
                                                                            setRecords(records.map(r => r.id === rec.id ? { ...r, finalized: true } : r));
                                                                            alert('Lavagem finalizada e enviada ao caixa.');
                                                                        } catch (err) {
                                                                            alert('Falha ao finalizar lavagem.');
                                                                        }
                                                                    }} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Finalizar</button>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">Aguardando finalização</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                            </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>
      )}

      {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                   <h3 className="font-semibold text-lg mb-4">{editingId ? 'Editar Serviço' : 'Novo Tipo de Lavagem'}</h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-sm mb-1">Nome do Serviço</label>
                           <input className="w-full border p-2 rounded" value={serviceForm.name || ''} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
                       </div>
                       <div>
                           <label className="block text-sm mb-1">Preço (R$)</label>
                           <input type="number" className="w-full border p-2 rounded" value={serviceForm.price || ''} onChange={e => setServiceForm({...serviceForm, price: Number(e.target.value)})} />
                       </div>
                       <div className="flex gap-2">
                           {editingId && <button onClick={() => { setServiceForm({}); setEditingId(null); }} className="flex-1 border p-2 rounded hover:bg-gray-50">Cancelar</button>}
                           <button onClick={saveService} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Salvar</button>
                       </div>
                   </div>
               </div>
               <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Nome</th><th className="p-4">Preço</th><th className="p-4 text-right">Ações</th></tr></thead>
                       <tbody className="divide-y">
                           {services.map(s => (
                               <tr key={s.id}>
                                   <td className="p-4 font-medium">{s.name}</td>
                                   <td className="p-4">R$ {s.price.toFixed(2)}</td>
                                   <td className="p-4 flex justify-end gap-2">
                                       <button onClick={() => { setEditingId(s.id); setServiceForm(s); }} className="p-2 text-blue-600 bg-blue-50 rounded"><Edit size={16}/></button>
                                       <button onClick={() => deleteService(s.id)} className="p-2 text-red-600 bg-red-50 rounded"><Trash2 size={16}/></button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
          </div>
      )}
    </div>
  );
};
