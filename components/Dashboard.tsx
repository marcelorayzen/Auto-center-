import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from '../types';
import { TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  // Mock Data for Charts
  const revenueData = [
    { name: 'Jan', value: 12000 },
    { name: 'Fev', value: 19000 },
    { name: 'Mar', value: 15000 },
    { name: 'Abr', value: 22000 },
    { name: 'Mai', value: 28000 },
    { name: 'Jun', value: stats.monthlyRevenue },
  ];

  const osStatusData = [
    { name: 'Em Execução', value: 5, color: '#f59e0b' },
    { name: 'Finalizada', value: 12, color: '#10b981' },
    { name: 'Em Análise', value: 3, color: '#3b82f6' },
    { name: 'Cancelada', value: 1, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Geral</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Faturamento (Jun)</p>
            <p className="text-2xl font-bold text-slate-900">R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">OS em Andamento</p>
            <p className="text-2xl font-bold text-slate-900">{stats.activeOS}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Lavagens Hoje</p>
            <p className="text-2xl font-bold text-slate-900">{stats.completedWashes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ticket Médio</p>
            <p className="text-2xl font-bold text-slate-900">R$ 350,00</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold mb-4">Faturamento Semestral</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OS Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold mb-4">Status das Ordens de Serviço</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={osStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {osStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
             {osStatusData.map((item) => (
               <div key={item.name} className="flex items-center gap-2 text-xs">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                 <span>{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};