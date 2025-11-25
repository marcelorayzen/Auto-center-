
import React, { useState } from 'react';
import { Transaction, TransactionType, PaymentMethod, CashRegisterSession, Employee } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Plus, ArrowUpCircle, ArrowDownCircle, Save, X, Lock, Unlock } from 'lucide-react';

interface FinanceModuleProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  cashSession: CashRegisterSession | null;
  setCashSession: React.Dispatch<React.SetStateAction<CashRegisterSession | null>>;
  currentUser: Employee;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ 
  transactions, setTransactions, cashSession, setCashSession, currentUser 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashAction, setCashAction] = useState<'OPEN'|'CLOSE'>('OPEN');
  const [cashValue, setCashValue] = useState<number>(0);

  // Transaction Form State
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.IN,
    paymentMethod: PaymentMethod.PIX,
    date: new Date().toISOString().split('T')[0]
  });

  // Calculate Totals
  const totalIncome = transactions.filter(t => t.type === TransactionType.IN).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.OUT).reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    if (!cashSession || cashSession.status === 'CLOSED') {
      alert("O caixa precisa estar aberto para lançar movimentações.");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      description: formData.description,
      type: formData.type as TransactionType,
      amount: Number(formData.amount),
      category: formData.category || 'Geral',
      date: formData.date || new Date().toISOString(),
      paymentMethod: formData.paymentMethod as PaymentMethod,
    };

    setTransactions([newTransaction, ...transactions]);
    setShowForm(false);
    setFormData({
      type: TransactionType.IN,
      paymentMethod: PaymentMethod.PIX,
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: ''
    });
  };

  const handleCashAction = () => {
     if (cashAction === 'OPEN') {
         setCashSession({
             id: Date.now(),
             status: 'OPEN',
             openedAt: new Date().toISOString(),
             openedBy: currentUser.name,
             openingBalance: cashValue
         });
     } else {
         if(!cashSession) return;
         setCashSession({
             ...cashSession,
             status: 'CLOSED',
             closedAt: new Date().toISOString(),
             closedBy: currentUser.name,
             closingBalance: cashValue
         });
         // In a real app, you would save this session to a history list here
     }
     setShowCashModal(false);
     setCashValue(0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Cash Status */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-emerald-600" /> Controle Financeiro / Caixa
           </h2>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-sm text-slate-500">Status do Caixa:</span>
             {cashSession?.status === 'OPEN' ? (
                 <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                     <Unlock size={12}/> ABERTO
                 </span>
             ) : (
                 <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                     <Lock size={12}/> FECHADO
                 </span>
             )}
           </div>
        </div>
        
        <div className="flex gap-2">
            {cashSession?.status === 'OPEN' ? (
                <button 
                onClick={() => { setCashAction('CLOSE'); setShowCashModal(true); }}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 shadow-sm text-sm"
                >
                <Lock size={16} /> Fechar Caixa
                </button>
            ) : (
                <button 
                onClick={() => { setCashAction('OPEN'); setShowCashModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm text-sm"
                >
                <Unlock size={16} /> Abrir Caixa
                </button>
            )}

            <button 
            onClick={() => {
                if(!cashSession || cashSession.status === 'CLOSED') {
                    alert('Abra o caixa primeiro.');
                    return;
                }
                setShowForm(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 shadow-sm text-sm"
            >
            <Plus size={16} /> Novo Lançamento
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <TrendingUp size={24} />
            </div>
            <span className="text-slate-500 font-medium">Entradas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">R$ {totalIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <TrendingDown size={24} />
            </div>
            <span className="text-slate-500 font-medium">Saídas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">R$ {totalExpense.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-700 text-blue-400 rounded-full">
              <DollarSign size={24} />
            </div>
            <span className="text-slate-300 font-medium">Saldo Atual</span>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </p>
        </div>
      </div>

      {/* Cash Modal */}
      {showCashModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold mb-4">
                    {cashAction === 'OPEN' ? 'Abertura de Caixa' : 'Fechamento de Caixa'}
                </h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {cashAction === 'OPEN' ? 'Saldo Inicial (R$)' : 'Saldo em Mãos (R$)'}
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="w-full border rounded-lg p-2"
                        value={cashValue}
                        onChange={(e) => setCashValue(Number(e.target.value))}
                    />
                    {cashAction === 'CLOSE' && (
                        <div className="mt-2 text-xs text-slate-500">
                            Saldo esperado pelo sistema: R$ {(cashSession?.openingBalance || 0) + balance}.
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowCashModal(false)} className="flex-1 border p-2 rounded hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleCashAction} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">Confirmar</button>
                </div>
            </div>
          </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Adicionar Movimentação</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                  >
                    <option value={TransactionType.IN}>Entrada (Receita)</option>
                    <option value={TransactionType.OUT}>Saída (Despesa)</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Data</label>
                   <input 
                      type="date"
                      className="w-full border rounded-lg p-2"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input 
                  required
                  type="text" 
                  className="w-full border rounded-lg p-2"
                  placeholder="Ex: Pagamento Fornecedor X"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                   <input 
                      required
                      type="number" step="0.01"
                      className="w-full border rounded-lg p-2"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Serviços Oficina">Serviços Oficina</option>
                    <option value="Lava-Rápido">Lava-Rápido</option>
                    <option value="Peças">Venda de Peças</option>
                    <option value="Salários">Salários</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                <select 
                   className="w-full border rounded-lg p-2"
                   value={formData.paymentMethod}
                   onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                >
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2 mt-4">
                <Save size={18} /> Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-semibold text-slate-700">Histórico de Movimentações</div>
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 border-b">
             <tr>
               <th className="p-4">Data</th>
               <th className="p-4">Descrição</th>
               <th className="p-4">Categoria</th>
               <th className="p-4">Pagamento</th>
               <th className="p-4 text-right">Valor</th>
             </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                 <td className="p-4 text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                 <td className="p-4 flex items-center gap-2">
                    {t.type === TransactionType.IN ? (
                      <ArrowUpCircle size={16} className="text-emerald-500" />
                    ) : (
                      <ArrowDownCircle size={16} className="text-red-500" />
                    )}
                    <span className="font-medium">{t.description}</span>
                 </td>
                 <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{t.category}</span></td>
                 <td className="p-4 text-slate-500">{t.paymentMethod}</td>
                 <td className={`p-4 text-right font-bold ${t.type === TransactionType.IN ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.IN ? '+' : '-'} R$ {t.amount.toFixed(2)}
                 </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma movimentação registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};