
import React, { useState } from 'react';
import { Invoice, InvoiceStatus, ServiceOrder, OSStatus } from '../types';
import { FileText, Send, CheckCircle, AlertTriangle, Printer, Loader2 } from 'lucide-react';

interface NfeModuleProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  orders: ServiceOrder[];
  onInvoiceEmitted: (invoice: Invoice) => void;
}

export const NfeModule: React.FC<NfeModuleProps> = ({ invoices, setInvoices, orders, onInvoiceEmitted }) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Filter orders that are finished but don't have an invoice yet
  const pendingOrders = orders.filter(
    o => o.status === OSStatus.FI && !invoices.some(inv => inv.serviceOrderId === o.id)
  );

  const handleEmit = (order: ServiceOrder) => {
    setProcessingId(order.id);

    // Simulate API Call delay
    setTimeout(() => {
        const newInvoice: Invoice = {
            id: Date.now(),
            serviceOrderId: order.id,
            clientName: `Cliente ID ${order.clientId}`, // In real app, would fetch client name
            amount: order.total,
            status: InvoiceStatus.AUTHORIZED,
            accessKey: `${new Date().getFullYear()}00010000000${order.id}123456789`,
            issuedAt: new Date().toISOString()
        };
        setInvoices([newInvoice, ...invoices]);
        onInvoiceEmitted(newInvoice);
        setProcessingId(null);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <FileText size={28} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Emissão de NF-e</h2>
            <p className="text-slate-500 text-sm">Gerencie e emita notas fiscais de serviço eletrônicas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Pending Orders Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                <span className="font-bold text-amber-800 flex items-center gap-2">
                    <AlertTriangle size={18} /> Ordens Aguardando Emissão
                </span>
                <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                    {pendingOrders.length}
                </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 border-b bg-slate-50/50">
                        <tr>
                            <th className="p-4">OS #</th>
                            <th className="p-4">Data</th>
                            <th className="p-4 text-right">Valor Total</th>
                            <th className="p-4 text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {pendingOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50">
                                <td className="p-4 font-bold">{order.number}</td>
                                <td className="p-4 text-slate-500">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                <td className="p-4 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                                <td className="p-4 flex justify-center">
                                    <button 
                                        onClick={() => handleEmit(order)}
                                        disabled={processingId === order.id}
                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processingId === order.id ? (
                                            <><Loader2 className="animate-spin" size={14}/> Emitindo...</>
                                        ) : (
                                            <><Send size={14}/> Emitir Nota</>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pendingOrders.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma OS finalizada pendente.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Issued Invoices Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-500"/> Notas Emitidas
                </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 border-b bg-slate-50/50">
                        <tr>
                            <th className="p-4">OS Ref</th>
                            <th className="p-4">Chave de Acesso</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="p-4">OS-{inv.serviceOrderId}</td>
                                <td className="p-4 font-mono text-xs text-slate-500">
                                    {inv.accessKey || '---'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        inv.status === InvoiceStatus.AUTHORIZED ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                     <button className="text-slate-400 hover:text-blue-600">
                                        <Printer size={18} />
                                     </button>
                                </td>
                            </tr>
                        ))}
                         {invoices.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma nota emitida ainda.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};