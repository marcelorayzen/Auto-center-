
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServiceOrderModule } from './components/ServiceOrderModule';
import { CarWashModule } from './components/CarWashModule';
import { InventoryModule } from './components/InventoryModule';
import { FinanceModule } from './components/FinanceModule';
import { NfeModule } from './components/NfeModule';
import { AdminModule } from './components/AdminModule';
import { AiAssistant } from './components/AiAssistant';
import { LoginScreen } from './components/LoginScreen';
import { Menu } from 'lucide-react';
import { 
  OSStatus, ServiceOrder, Client, Vehicle, WashRecord, Employee, WashService, PartItem, 
  Transaction, TransactionType, PaymentMethod, Invoice, InvoiceStatus,
  ServiceStatus, SystemLog, AppConfig, CashRegisterSession
} from './types';

// Initial Mock Data
const INITIAL_CLIENTS: Client[] = [
  { id: 1, name: 'João Silva', cpf_cnpj: '123.456.789-00', phone: '(11) 99999-0001' },
  { id: 2, name: 'Maria Santos', cpf_cnpj: '987.654.321-99', phone: '(11) 98888-0002' },
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 1, clientId: 1, plate: 'ABC-1234', model: 'Civic 2.0', brand: 'Honda' },
  { id: 2, clientId: 2, plate: 'XYZ-9876', model: 'HB20 1.6', brand: 'Hyundai' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Carlos Souza', role: 'Mecânico' },
  { id: 2, name: 'Marcos Oliveira', role: 'Lavador' },
  { id: 3, name: 'Ana Pereira', role: 'Caixa' },
  { id: 4, name: 'Roberto Christo', role: 'Gerente' },
];

const INITIAL_WASH_SERVICES: WashService[] = [
  { id: 1, name: 'Simples', price: 30 },
  { id: 2, name: 'Completa', price: 50 },
  { id: 3, name: 'Polimento', price: 150 },
  { id: 4, name: 'Higienização Interna', price: 120 },
];

const INITIAL_PARTS: PartItem[] = [
    { id: 1, code: 'OLEO5W30', name: 'Óleo 5W30', price: 45, quantity: 20 },
    { id: 2, code: 'FILTROAR', name: 'Filtro de Ar', price: 30, quantity: 15 },
    { id: 3, code: 'PASTILHA', name: 'Pastilha de Freio', price: 120, quantity: 8 },
];

const INITIAL_ORDERS: ServiceOrder[] = [
  { 
    id: 1, 
    number: 'OS-2025-101', 
    clientId: 1, 
    vehicleId: 1, 
    date: '2025-06-01', 
    status: OSStatus.FI, 
    services: [{id:1, description: 'Troca de Óleo', price: 150, quantity: 1, status: ServiceStatus.DONE}], 
    parts: [{id:1, code: 'OLEO5W30', name: 'Óleo 5w30', price: 50, quantity: 4}], 
    total: 350 
  },
];

const INITIAL_WASHES: WashRecord[] = [
  { 
    id: 1, 
    plate: 'DEF-5678', 
    washServiceId: 1, 
    washServiceName: 'Simples', 
    employeeId: 2, 
    employeeName: 'Marcos Oliveira', 
    value: 30, 
    date: new Date().toISOString() 
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, description: 'Pagamento OS-2025-101', type: TransactionType.IN, amount: 350, category: 'Serviços Oficina', date: '2025-06-01', paymentMethod: PaymentMethod.CREDIT },
  { id: 2, description: 'Compra de Óleo (Fornecedor X)', type: TransactionType.OUT, amount: 500, category: 'Fornecedores', date: '2025-06-02', paymentMethod: PaymentMethod.BOLETO },
  { id: 3, description: 'Lavagem DEF-5678', type: TransactionType.IN, amount: 30, category: 'Lava-Rápido', date: new Date().toISOString(), paymentMethod: PaymentMethod.PIX },
];

const INITIAL_INVOICES: Invoice[] = [
    { id: 101, serviceOrderId: 999, clientName: 'Cliente Antigo', amount: 200, status: InvoiceStatus.AUTHORIZED, accessKey: '35240600000000000001550010000001011000000001', issuedAt: '2025-05-20T10:00:00' }
];

const INITIAL_LOGS: SystemLog[] = [
  { id: 1, timestamp: new Date().toISOString(), user: 'Roberto Christo', action: 'LOGIN', details: 'Acesso ao sistema' },
  { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Ana Pereira', action: 'VENDA', details: 'Fechamento de Caixa' }
];

const INITIAL_CONFIG: AppConfig = {
  companyName: 'Auto Center Christo Car',
  themeColor: '#0f172a',
  maintenanceMode: false
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Global State
  const [orders, setOrders] = useState<ServiceOrder[]>(INITIAL_ORDERS);
  const [washes, setWashes] = useState<WashRecord[]>(INITIAL_WASHES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [washServices, setWashServices] = useState<WashService[]>(INITIAL_WASH_SERVICES);
  const [parts, setParts] = useState<PartItem[]>(INITIAL_PARTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);

  // Load data from backend when available
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await import('./services/api');
        const [remoteOrders, remoteInventory, remoteCustomers, remoteVehicles] = await Promise.all([
          api.api.getServiceOrders().catch(() => INITIAL_ORDERS),
          api.api.getInventory().catch(() => INITIAL_PARTS),
          api.api.getCustomers().catch(() => INITIAL_CLIENTS),
          api.api.getVehicles().catch(() => INITIAL_VEHICLES),
        ]);

        if (!mounted) return;

        // Normalize remote orders: prisma returns numbers for ids — adapt shape if necessary
        if (Array.isArray(remoteOrders) && remoteOrders.length) {
          // Normalize orders from backend (Prisma) to the frontend ServiceOrder shape
          const normalized = (remoteOrders as any[]).map(o => ({
            id: o.id,
            number: o.title || `OS-${o.id}`,
            clientId: o.vehicle?.customer?.id || o.vehicle?.customerId || null,
            vehicleId: o.vehicleId || o.vehicle?.id || null,
            date: o.createdAt ? (new Date(o.createdAt)).toISOString().split('T')[0] : (o.date || new Date().toISOString().split('T')[0]),
            status: o.status || 'open',
            services: o.services || [],
            parts: o.parts || [],
            total: o.price ?? 0,
            observations: o.description || ''
          })) as ServiceOrder[];
          setOrders(normalized);
        }
        if (Array.isArray(remoteInventory) && remoteInventory.length) {
          const normalizedParts = (remoteInventory as any[]).map(p => ({
            id: p.id,
            code: p.sku || p.code || '',
            name: p.name,
            price: p.unitPrice ?? p.price ?? 0,
            quantity: p.quantity ?? 0
          })) as PartItem[];
          setParts(normalizedParts);
        }
        if (Array.isArray(remoteCustomers) && remoteCustomers.length) setClients(remoteCustomers as Client[]);
        if (Array.isArray(remoteVehicles) && remoteVehicles.length) setVehicles(remoteVehicles as Vehicle[]);
      } catch (err) {
        console.warn('Could not load remote data:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cash Register Session
  const [cashSession, setCashSession] = useState<CashRegisterSession | null>(null);

  // Derived Stats
  const stats = {
    dailyRevenue: washes.reduce((acc, w) => acc + w.value, 0),
    activeOS: orders.filter(o => o.status === OSStatus.EX || o.status === OSStatus.AN).length,
    completedWashes: washes.length,
    monthlyRevenue: transactions.filter(t => t.type === TransactionType.IN).reduce((acc, t) => acc + t.amount, 0)
  };

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    // Determine default tab based on role
    if (user.role === 'Mecânico') setActiveTab('workshop');
    else if (user.role === 'Lavador') setActiveTab('carwash');
    else if (user.role === 'Caixa') setActiveTab('finance');
    else setActiveTab('dashboard');

    // Add log
    setLogs(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user.name,
      action: 'LOGIN',
      details: 'Usuário realizou login'
    }, ...prev]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleInvoiceEmit = (invoice: Invoice) => {
      // Automatically add a revenue transaction when invoice is emitted
      const newTransaction: Transaction = {
          id: Date.now(),
          description: `Receita NF-e ${invoice.id} - OS #${invoice.serviceOrderId}`,
          type: TransactionType.IN,
          amount: invoice.amount,
          category: 'Nota Fiscal',
          date: new Date().toISOString(),
          paymentMethod: PaymentMethod.BOLETO, // Default assumption, user can edit later
          referenceId: invoice.id,
          referenceType: 'OS'
      };
      setTransactions(prev => [newTransaction, ...prev]);
  };

  if (!currentUser) {
    return <LoginScreen employees={employees} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'workshop':
        return (
          <ServiceOrderModule 
            orders={orders} setOrders={setOrders} 
            clients={clients} setClients={setClients}
            vehicles={vehicles} setVehicles={setVehicles}
            employees={employees} setEmployees={setEmployees}
            parts={parts} setParts={setParts}
            currentUser={currentUser}
          />
        );
      case 'carwash':
        return (
          <CarWashModule 
            records={washes} setRecords={setWashes} 
            services={washServices} setServices={setWashServices}
            employees={employees}
            currentUser={currentUser!}
          />
        );
      case 'inventory':
        return <InventoryModule parts={parts} setParts={setParts} />;
      case 'finance':
        return (
            <FinanceModule 
                transactions={transactions} 
                setTransactions={setTransactions} 
                cashSession={cashSession}
                setCashSession={setCashSession}
                currentUser={currentUser}
            />
        );
      case 'nfe':
        return (
            <NfeModule 
                invoices={invoices} 
                setInvoices={setInvoices} 
                orders={orders} 
                onInvoiceEmitted={handleInvoiceEmit}
            />
        );
      case 'admin':
        return <AdminModule logs={logs} config={config} setConfig={setConfig} employees={employees} />;
      default:
        return <div className="p-6"><h2 className="text-2xl font-bold">Em construção</h2></div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between z-10">
           <div className="font-bold text-lg">{config.companyName}</div>
           <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600">
             <Menu />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto">
           {renderContent()}
        </div>
      </main>
      
      <AiAssistant 
        stats={stats} 
        recentOS={orders.slice(0, 5)} 
        recentWashes={washes.slice(0, 5)}
      />
    </div>
  );
};

export default App;