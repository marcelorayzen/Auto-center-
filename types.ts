
// Enums
export enum OSStatus {
  AN = 'Em Análise',
  EX = 'Em Execução',
  FI = 'Finalizada',
  EN = 'Entregue',
  CA = 'Cancelada'
}

export enum ServiceStatus {
  PENDING = 'Pendente',
  DONE = 'Realizado'
}

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
  CASH = 'Dinheiro',
  BOLETO = 'Boleto',
  INSURANCE = 'Seguradora'
}

export enum WashType {
  SIM = 'Simples',
  COM = 'Completa',
  POL = 'Polimento',
  INT = 'Higienização Interna'
}

export enum TransactionType {
  IN = 'Receita',
  OUT = 'Despesa'
}

export enum InvoiceStatus {
  PENDING = 'Pendente',
  AUTHORIZED = 'Autorizada',
  CANCELED = 'Cancelada',
  ERROR = 'Erro'
}

// Interfaces
export interface Client {
  id: number;
  name: string;
  cpf_cnpj: string;
  phone: string;
}

export interface Vehicle {
  id: number;
  clientId: number;
  plate: string;
  model: string;
  brand: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string; // 'Mecânico', 'Lavador', 'Caixa', 'Gerente'
  password?: string; // Mock password
}

export interface ServiceItem {
  id: number;
  description: string;
  price: number;
  quantity: number;
  mechanic?: string;
  status: ServiceStatus;
}

export interface PartItem {
  id: number;
  code: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ServiceOrder {
  id: number;
  number: string;
  clientId: number;
  vehicleId: number;
  date: string;
  status: OSStatus;
  services: ServiceItem[];
  parts: PartItem[];
  total: number;
  observations?: string;
}

export interface WashService {
  id: number;
  name: string;
  price: number;
}

export interface WashRecord {
  id: number;
  plate: string;
  washServiceId: number; // Link to WashService
  washServiceName: string; // Snapshot name
  employeeId: number;
  employeeName: string;
  value: number;
  date: string;
  finalized?: boolean;
}

export interface Transaction {
  id: number;
  description: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  referenceId?: number; // OS ID or Wash ID
  referenceType?: 'OS' | 'WASH';
}

export interface Invoice {
  id: number;
  serviceOrderId: number;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  accessKey?: string;
  issuedAt?: string;
}

export interface CashRegisterSession {
  id: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  openingBalance: number;
  closingBalance?: number;
}

export interface DashboardStats {
  dailyRevenue: number;
  activeOS: number;
  completedWashes: number;
  monthlyRevenue: number;
}

export interface SystemLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface AppConfig {
  companyName: string;
  themeColor: string;
  maintenanceMode: boolean;
}