
import React, { useState } from 'react';
import { Employee } from '../types';
import api from '../services/api';
import { Lock, UserCircle } from 'lucide-react';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (user: Employee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ employees, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const localUser = employees.find(emp => emp.id === Number(selectedUserId));
    if (!localUser) return;
    // try server login by id to validate
    api.login({ id: localUser.id }).then((u: any) => {
      onLogin({ id: u.id, name: u.name, role: u.role } as Employee);
    }).catch(() => {
      // fallback to local user if server login fails
      onLogin(localUser);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Christo Car</h1>
          <p className="text-slate-500">Sistema de Gestão Integrado</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Selecione o Usuário</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select 
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="" disabled>Quem está acessando?</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!selectedUserId}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Acessar Sistema
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <p>© 2025 Auto Center Christo Car</p>
          <p>Acesso restrito a funcionários autorizados</p>
        </div>
      </div>
    </div>
  );
};
