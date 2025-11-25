
import React, { useState } from 'react';
import { SystemLog, AppConfig, Employee } from '../types';
import { Settings, Shield, FileText, Save, RefreshCw, UserCheck } from 'lucide-react';

interface AdminModuleProps {
  logs: SystemLog[];
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  employees: Employee[];
}

export const AdminModule: React.FC<AdminModuleProps> = ({ logs, config, setConfig, employees }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'settings' | 'users'>('logs');
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  const handleSaveConfig = () => {
    setConfig(localConfig);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="bg-slate-700 p-2 rounded-lg text-white">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Administração do Sistema</h2>
          <p className="text-slate-500 text-sm">Logs, permissões e configurações gerais.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'logs' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}
        >
          <FileText size={16} /> Logs do Sistema
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}
        >
          <UserCheck size={16} /> Controle de Acesso
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}
        >
          <Shield size={16} /> Configurações
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
        
        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Registro de Atividades</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                <RefreshCw size={14} /> Atualizar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 border-b bg-white">
                  <tr>
                    <th className="p-4 w-32">Data/Hora</th>
                    <th className="p-4 w-40">Usuário</th>
                    <th className="p-4 w-40">Ação</th>
                    <th className="p-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4 whitespace-nowrap text-xs">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                      <td className="p-4 font-medium">{log.user}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200">{log.action}</span>
                      </td>
                      <td className="p-4 text-slate-500">{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum log registrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab (Read Only view of permissions) */}
        {activeTab === 'users' && (
          <div className="p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Permissões de Usuários Ativos</h3>
            <p className="text-sm text-slate-500 mb-6">Para adicionar ou remover usuários, utilize o módulo "Oficina / Funcionários".</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => (
                <div key={emp.id} className="border rounded-lg p-4 flex items-center justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800">{emp.name}</div>
                    <div className="text-xs text-slate-500 mt-1">ID: {emp.id}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    emp.role === 'Gerente' ? 'bg-purple-100 text-purple-700' :
                    emp.role === 'Mecânico' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {emp.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-2xl">
            <h3 className="font-semibold text-slate-700 mb-6">Configurações Gerais</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2"
                  value={localConfig.companyName}
                  onChange={(e) => setLocalConfig({...localConfig, companyName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Tema</label>
                <div className="flex gap-2">
                  {['#0f172a', '#1e40af', '#047857', '#b91c1c'].map(color => (
                    <button
                      key={color}
                      onClick={() => setLocalConfig({...localConfig, themeColor: color})}
                      className={`w-8 h-8 rounded-full border-2 ${localConfig.themeColor === color ? 'border-black scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                <input 
                  type="checkbox" 
                  id="maintenance"
                  className="w-5 h-5 text-blue-600 rounded"
                  checked={localConfig.maintenanceMode}
                  onChange={(e) => setLocalConfig({...localConfig, maintenanceMode: e.target.checked})}
                />
                <label htmlFor="maintenance" className="cursor-pointer">
                  <div className="font-medium text-slate-800">Modo de Manutenção</div>
                  <div className="text-xs text-slate-500">Impede novos logins de funcionários exceto Gerente</div>
                </label>
              </div>

              <button 
                onClick={handleSaveConfig}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={18} /> Salvar Alterações
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
