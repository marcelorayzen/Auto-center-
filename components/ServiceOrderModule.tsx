
import React, { useState } from 'react';
import api from '../services/api';
import { ServiceOrder, OSStatus, Client, Vehicle, Employee, PartItem, ServiceStatus, ServiceItem } from '../types';
import { Plus, ArrowLeft, Trash2, Users, Car, Wrench, ClipboardList, Edit, Phone, User, CheckSquare, Square, Save } from 'lucide-react';

interface ServiceOrderModuleProps {
  orders: ServiceOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  parts: PartItem[];
  setParts: React.Dispatch<React.SetStateAction<PartItem[]>>;
  currentUser: Employee;
}

type Tab = 'orders' | 'clients' | 'vehicles' | 'employees';

export const ServiceOrderModule: React.FC<ServiceOrderModuleProps> = ({ 
  orders, setOrders, 
  clients, setClients, 
  vehicles, setVehicles,
  employees, setEmployees,
  parts, setParts,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Permissions Check
  const isRestrictedUser = ['Mecânico', 'Lavador'].includes(currentUser.role);

  // --- OS Form State ---
  const [osFormData, setOsFormData] = useState<Partial<ServiceOrder>>({
    status: OSStatus.AN,
    services: [],
    parts: [],
    total: 0
  });

  // --- Client Form State ---
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  
  // --- Vehicle Form State ---
  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({});

  // --- Employee Form State ---
  const [employeeForm, setEmployeeForm] = useState<Partial<Employee>>({});

  // Helper to Reset Forms
  const resetForms = () => {
    setOsFormData({ status: OSStatus.AN, services: [], parts: [], total: 0 });
    setClientForm({});
    setVehicleForm({});
    setEmployeeForm({});
    setEditingId(null);
    setView('list');
  };

  // === HANDLERS FOR OS ===
  const handleNewOS = () => {
    resetForms();
    setOsFormData({
      number: `OS-${new Date().getFullYear()}-${orders.length + 101}`,
      date: new Date().toISOString().split('T')[0],
      status: OSStatus.AN,
      services: [],
      parts: [],
      total: 0
    });
    setView('form');
  };

  const handleEditOS = (os: ServiceOrder) => {
    setEditingId(os.id);
    setOsFormData(JSON.parse(JSON.stringify(os))); // Deep copy to avoid reference issues
    setView('form');
  };

  const calculateTotal = (services: ServiceItem[], parts: PartItem[]) => {
    const sTotal = services.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const pTotal = parts.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return sTotal + pTotal;
  };

  const addServiceItem = () => {
    const newService: ServiceItem = {
      id: Date.now(),
      description: 'Novo Serviço',
      price: 0, // Default price, will be hidden for restricted users
      quantity: 1,
      status: ServiceStatus.PENDING
    };
    const updatedServices = [...(osFormData.services || []), newService];
    setOsFormData({
      ...osFormData,
      services: updatedServices,
      total: calculateTotal(updatedServices, osFormData.parts || [])
    });
  };

  const toggleServiceStatus = (index: number) => {
    const newServices = [...(osFormData.services || [])];
    const currentStatus = newServices[index].status;
    newServices[index].status = currentStatus === ServiceStatus.DONE ? ServiceStatus.PENDING : ServiceStatus.DONE;
    setOsFormData({...osFormData, services: newServices});
  };
  
  const addPartItem = (part: PartItem) => {
      const newPart = {
          id: Date.now(),
          code: part.code,
          name: part.name,
          price: part.price,
          quantity: 1
      };
      const updatedParts = [...(osFormData.parts || []), newPart];
      setOsFormData({
          ...osFormData,
          parts: updatedParts,
          total: calculateTotal(osFormData.services || [], updatedParts)
      });
  };

  const saveOS = async () => {
    if (!osFormData.clientId || !osFormData.vehicleId) {
      alert("Selecione o Cliente e o Veículo.");
      return;
    }

    // If editing locally, just update local state (server update not implemented)
    if (editingId) {
      setOrders(orders.map(o => o.id === editingId ? osFormData as ServiceOrder : o));
      resetForms();
      return;
    }

    // Create on server and then merge returned fields into local state
    try {
      const payload = {
        title: osFormData.number || `OS - ${new Date().toISOString()}`,
        description: osFormData.observations || osFormData.description || '',
        price: osFormData.total || 0,
        vehicleId: osFormData.vehicleId
      };

      const created = await api.createServiceOrder(payload);

      // Merge server response with richer local form data so UI shows services/parts
      const newOs: ServiceOrder = {
        ...(osFormData as ServiceOrder),
        id: created.id || Date.now(),
        number: osFormData.number || `OS-${created.id || Date.now()}`,
        status: created.status || osFormData.status || OSStatus.AN,
        total: created.price ?? osFormData.total ?? 0,
        date: osFormData.date || new Date().toISOString().split('T')[0]
      };

      setOrders(prev => [...prev, newOs]);
      resetForms();
    } catch (err) {
      console.error('Erro ao salvar OS:', err);
      alert('Erro ao salvar OS no servidor. Verifique a conexão.');
    }
  };

  // === HANDLERS FOR CLIENTS ===
  const saveClient = () => {
    if (!clientForm.name) return;
    if (editingId) {
        setClients(clients.map(c => c.id === editingId ? clientForm as Client : c));
    } else {
        setClients([...clients, { ...clientForm, id: Date.now() } as Client]);
    }
    resetForms();
  };
  const deleteClient = (id: number) => {
    if(confirm("Excluir cliente?")) setClients(clients.filter(c => c.id !== id));
  };

  // === HANDLERS FOR VEHICLES ===
  const saveVehicle = () => {
    if (!vehicleForm.plate || !vehicleForm.clientId) return;
    if (editingId) {
        setVehicles(vehicles.map(v => v.id === editingId ? vehicleForm as Vehicle : v));
    } else {
        setVehicles([...vehicles, { ...vehicleForm, id: Date.now() } as Vehicle]);
    }
    resetForms();
  };
  const deleteVehicle = (id: number) => {
    if(confirm("Excluir veículo?")) setVehicles(vehicles.filter(v => v.id !== id));
  };

  // === HANDLERS FOR EMPLOYEES ===
  const saveEmployee = () => {
    if (!employeeForm.name) return;
    if (editingId) {
        setEmployees(employees.map(e => e.id === editingId ? employeeForm as Employee : e));
    } else {
        setEmployees([...employees, { ...employeeForm, id: Date.now() } as Employee]);
    }
    resetForms();
  };
  const deleteEmployee = (id: number) => {
    if(confirm("Excluir funcionário?")) setEmployees(employees.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button 
              onClick={() => { setActiveTab('orders'); resetForms(); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
               <ClipboardList size={16} /> Ordens de Serviço
            </button>
            <button 
              onClick={() => { setActiveTab('clients'); resetForms(); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
               <Users size={16} /> Clientes
            </button>
            <button 
              onClick={() => { setActiveTab('vehicles'); resetForms(); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'vehicles' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
               <Car size={16} /> Veículos
            </button>
            <button 
              onClick={() => { setActiveTab('employees'); resetForms(); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
               <Wrench size={16} /> Funcionários
            </button>
        </div>
      </div>

      {/* ================== OS TAB ================== */}
      {activeTab === 'orders' && (
        <>
            {view === 'list' ? (
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <h2 className="text-2xl font-bold text-slate-800">Ordens de Serviço</h2>
                        <button onClick={handleNewOS} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={18} /> Nova OS
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="p-4">Número</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Veículo</th>
                            <th className="p-4">Status</th>
                            {/* HIDE PRICE IF RESTRICTED */}
                            {!isRestrictedUser && <th className="p-4 text-right">Valor Total</th>}
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {orders.map(os => {
                            const client = clients.find(c => c.id === os.clientId);
                            const vehicle = vehicles.find(v => v.id === os.vehicleId);
                            return (
                            <tr key={os.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">{os.number}</td>
                                <td className="p-4">{client?.name || 'N/A'}</td>
                                <td className="p-4">{vehicle?.plate || 'N/A'}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{os.status}</span></td>
                                {/* HIDE PRICE IF RESTRICTED */}
                                {!isRestrictedUser && <td className="p-4 text-right font-bold">R$ {os.total.toFixed(2)}</td>}
                                <td className="p-4 flex justify-center gap-2">
                                <button onClick={() => handleEditOS(os)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title={isRestrictedUser ? "Abrir/Editar OS" : "Editar"}>
                                  {isRestrictedUser ? <ClipboardList size={16} /> : <Edit size={16}/>}
                                </button>
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* OS Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="font-semibold text-lg">Dados da OS</h3>
                                <button onClick={() => setView('list')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"><ArrowLeft size={14} /> Voltar</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                                    <select className="w-full p-2 border rounded-lg" value={osFormData.clientId} onChange={(e) => setOsFormData({...osFormData, clientId: Number(e.target.value)})}>
                                        <option value="">Selecione...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                                    <select className="w-full p-2 border rounded-lg" value={osFormData.vehicleId} onChange={(e) => setOsFormData({...osFormData, vehicleId: Number(e.target.value)})}>
                                        <option value="">Selecione...</option>
                                        {vehicles.filter(v => !osFormData.clientId || v.clientId === osFormData.clientId).map(v => (
                                            <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select className="w-full p-2 border rounded-lg" value={osFormData.status} onChange={(e) => setOsFormData({...osFormData, status: e.target.value as OSStatus})}>
                                        {Object.values(OSStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                                    <input type="date" className="w-full p-2 border rounded-lg" value={osFormData.date} onChange={(e) => setOsFormData({...osFormData, date: e.target.value})}/>
                                </div>
                            </div>
                        </div>

                        {/* Services & Parts */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Serviços</h3>
                                <button onClick={addServiceItem} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold">+ Add Serviço</button>
                            </div>
                            {osFormData.services?.map((srv, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-center">
                                    <button onClick={() => toggleServiceStatus(idx)} className={`p-1 ${srv.status === ServiceStatus.DONE ? 'text-green-600' : 'text-slate-300'}`} title="Marcar como realizado">
                                      {srv.status === ServiceStatus.DONE ? <CheckSquare size={20}/> : <Square size={20}/>}
                                    </button>
                                    <input value={srv.description} placeholder="Descrição do serviço" className="flex-1 border p-1 rounded" onChange={(e) => {
                                        const newSrvs = [...(osFormData.services || [])]; newSrvs[idx].description = e.target.value; setOsFormData({...osFormData, services: newSrvs});
                                    }} />
                                    
                                    {!isRestrictedUser ? (
                                      <input type="number" placeholder="Preço" value={srv.price} className="w-24 border p-1 rounded" onChange={(e) => {
                                          const newSrvs = [...(osFormData.services || [])]; newSrvs[idx].price = Number(e.target.value); setOsFormData({...osFormData, services: newSrvs, total: calculateTotal(newSrvs, osFormData.parts || [])});
                                      }} />
                                    ) : (
                                      <div className="w-24 border p-1 rounded bg-slate-100 text-center text-slate-400">---</div>
                                    )}

                                    <button onClick={() => {
                                        const newSrvs = osFormData.services?.filter((_, i) => i !== idx) || [];
                                        setOsFormData({...osFormData, services: newSrvs, total: calculateTotal(newSrvs, osFormData.parts || [])});
                                    }} className="text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            
                            <div className="flex justify-between items-center mb-4 mt-6 border-t pt-4">
                                <h3 className="font-semibold">Peças</h3>
                                <div className="flex gap-2">
                                    <select id="partSelect" className="text-xs border rounded p-1 max-w-[150px]">
                                        <option value="">Selecionar Peça...</option>
                                        {parts.map(p => <option key={p.id} value={p.id}>{p.name} {!isRestrictedUser && `- R$${p.price}`}</option>)}
                                    </select>
                                    <button onClick={() => {
                                        const select = document.getElementById('partSelect') as HTMLSelectElement;
                                        const partId = Number(select.value);
                                        const part = parts.find(p => p.id === partId);
                                        if(part) addPartItem(part);
                                    }} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 font-bold">+ Add Peça</button>
                                </div>
                            </div>
                            {osFormData.parts?.map((prt, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-center text-sm">
                                    <span className="flex-1 font-medium">{prt.name}</span>
                                    
                                    {!isRestrictedUser ? (
                                      <div className="w-24 text-right">R$ {prt.price.toFixed(2)}</div>
                                    ) : (
                                      <div className="w-24 text-right text-slate-400">---</div>
                                    )}

                                    <div className="w-16 flex items-center gap-1">
                                        <span className="text-xs text-gray-500">x</span>
                                        <input type="number" value={prt.quantity} className="w-full border p-1 rounded" onChange={(e) => {
                                            const newParts = [...(osFormData.parts || [])]; newParts[idx].quantity = Number(e.target.value); setOsFormData({...osFormData, parts: newParts, total: calculateTotal(osFormData.services || [], newParts)});
                                        }} />
                                    </div>
                                    <button onClick={() => {
                                        const newParts = osFormData.parts?.filter((_, i) => i !== idx) || [];
                                        setOsFormData({...osFormData, parts: newParts, total: calculateTotal(osFormData.services || [], newParts)});
                                    }} className="text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-semibold text-lg mb-4">Resumo da OS</h3>
                            
                            {!isRestrictedUser && (
                              <>
                                <div className="flex justify-between py-2 border-b"><span>Serviços</span><span>R$ {osFormData.services?.reduce((a,b)=>a+b.price*b.quantity,0).toFixed(2)}</span></div>
                                <div className="flex justify-between py-2 border-b"><span>Peças</span><span>R$ {osFormData.parts?.reduce((a,b)=>a+b.price*b.quantity,0).toFixed(2)}</span></div>
                                <div className="flex justify-between py-4 font-bold text-xl"><span>Total</span><span>R$ {osFormData.total?.toFixed(2)}</span></div>
                              </>
                            )}
                            {/* Removed explicit message for restricted users */}

                            <div className="mt-4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Observações / Defeito</label>
                              <textarea 
                                className="w-full border rounded p-2 text-sm" 
                                rows={3}
                                value={osFormData.observations || ''}
                                onChange={(e) => setOsFormData({...osFormData, observations: e.target.value})}
                              ></textarea>
                            </div>

                            <button onClick={saveOS} className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 font-bold"><Save size={18}/> Salvar OS</button>
                         </div>
                    </div>
                </div>
            )}
        </>
      )}

      {/* ================== CLIENTS TAB ================== */}
      {activeTab === 'clients' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-semibold text-lg mb-4">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <div className="space-y-4">
                    <div><label className="text-sm font-medium">Nome</label><input className="w-full border p-2 rounded" value={clientForm.name || ''} onChange={e => setClientForm({...clientForm, name: e.target.value})} /></div>
                    <div><label className="text-sm font-medium">CPF/CNPJ</label><input className="w-full border p-2 rounded" value={clientForm.cpf_cnpj || ''} onChange={e => setClientForm({...clientForm, cpf_cnpj: e.target.value})} /></div>
                    <div><label className="text-sm font-medium">Telefone</label><input className="w-full border p-2 rounded" value={clientForm.phone || ''} onChange={e => setClientForm({...clientForm, phone: e.target.value})} /></div>
                    <div className="flex gap-2">
                         {editingId && <button onClick={resetForms} className="flex-1 border p-2 rounded hover:bg-gray-50">Cancelar</button>}
                         <button onClick={saveClient} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Salvar</button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium"><tr><th className="p-4">Nome</th><th className="p-4">Contato</th><th className="p-4 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y">
                        {clients.map(c => (
                            <tr key={c.id}>
                                <td className="p-4 font-medium">{c.name}<div className="text-xs text-gray-400">{c.cpf_cnpj}</div></td>
                                <td className="p-4"><div className="flex items-center gap-1"><Phone size={12}/> {c.phone}</div></td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button onClick={() => { setEditingId(c.id); setClientForm(c); }} className="text-blue-600 bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                                    <button onClick={() => deleteClient(c.id)} className="text-red-600 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
         </div>
      )}

      {/* ================== VEHICLES TAB ================== */}
      {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
              <h3 className="font-semibold text-lg mb-4">{editingId ? 'Editar Veículo' : 'Novo Veículo'}</h3>
              <div className="space-y-4">
                  <div><label className="text-sm font-medium">Placa</label><input className="w-full border p-2 rounded uppercase" value={vehicleForm.plate || ''} onChange={e => setVehicleForm({...vehicleForm, plate: e.target.value.toUpperCase()})} /></div>
                  <div><label className="text-sm font-medium">Modelo</label><input className="w-full border p-2 rounded" value={vehicleForm.model || ''} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} /></div>
                  <div><label className="text-sm font-medium">Marca</label><input className="w-full border p-2 rounded" value={vehicleForm.brand || ''} onChange={e => setVehicleForm({...vehicleForm, brand: e.target.value})} /></div>
                  <div>
                      <label className="text-sm font-medium">Proprietário</label>
                      <select className="w-full border p-2 rounded" value={vehicleForm.clientId || ''} onChange={e => setVehicleForm({...vehicleForm, clientId: Number(e.target.value)})}>
                          <option value="">Selecione...</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </div>
                  <div className="flex gap-2">
                       {editingId && <button onClick={resetForms} className="flex-1 border p-2 rounded hover:bg-gray-50">Cancelar</button>}
                       <button onClick={saveVehicle} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Salvar</button>
                  </div>
              </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium"><tr><th className="p-4">Veículo</th><th className="p-4">Proprietário</th><th className="p-4 text-right">Ações</th></tr></thead>
                  <tbody className="divide-y">
                      {vehicles.map(v => (
                          <tr key={v.id}>
                              <td className="p-4 font-medium">{v.plate}<div className="text-xs text-gray-500">{v.brand} {v.model}</div></td>
                              <td className="p-4">{clients.find(c => c.id === v.clientId)?.name || '---'}</td>
                              <td className="p-4 flex justify-end gap-2">
                                  <button onClick={() => { setEditingId(v.id); setVehicleForm(v); }} className="text-blue-600 bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                                  <button onClick={() => deleteVehicle(v.id)} className="text-red-600 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
               </table>
          </div>
       </div>
      )}

      {/* ================== EMPLOYEES TAB ================== */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-semibold text-lg mb-4">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
                <div className="space-y-4">
                    <div><label className="text-sm font-medium">Nome</label><input className="w-full border p-2 rounded" value={employeeForm.name || ''} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} /></div>
                    <div>
                        <label className="text-sm font-medium">Cargo / Função</label>
                        <select className="w-full border p-2 rounded" value={employeeForm.role || ''} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})}>
                            <option value="">Selecione...</option>
                            <option value="Mecânico">Mecânico</option>
                            <option value="Lavador">Lavador</option>
                            <option value="Caixa">Caixa</option>
                            <option value="Gerente">Gerente</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                         {editingId && <button onClick={resetForms} className="flex-1 border p-2 rounded hover:bg-gray-50">Cancelar</button>}
                         <button onClick={saveEmployee} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Salvar</button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium"><tr><th className="p-4">Nome</th><th className="p-4">Cargo</th><th className="p-4 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y">
                        {employees.map(e => (
                            <tr key={e.id}>
                                <td className="p-4 font-medium flex items-center gap-2"><div className="bg-slate-200 p-2 rounded-full"><User size={14}/></div>{e.name}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{e.role}</span></td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button onClick={() => { setEditingId(e.id); setEmployeeForm(e); }} className="text-blue-600 bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                                    <button onClick={() => deleteEmployee(e.id)} className="text-red-600 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
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