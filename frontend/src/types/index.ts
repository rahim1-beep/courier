// ======================== ENUMS (as union types) ========================
export type Role = 'SUPER_ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  CUSTOMER: 'CUSTOMER',
} as const;

export type ShipmentStatus = 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'ON_HOLD' | 'RETURNED' | 'CANCELLED';

export const ShipmentStatus = {
  CREATED: 'CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  ON_HOLD: 'ON_HOLD',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  VOID: 'VOID',
} as const;

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'INVALID_IP';

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  INVALID_IP: 'INVALID_IP',
} as const;

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHEQUE: 'CHEQUE',
  ONLINE: 'ONLINE',
} as const;

export type LedgerReferenceType = 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'ADJUSTMENT' | 'REFUND';

export const LedgerReferenceType = {
  INVOICE: 'INVOICE',
  PAYMENT: 'PAYMENT',
  CREDIT_NOTE: 'CREDIT_NOTE',
  ADJUSTMENT: 'ADJUSTMENT',
  REFUND: 'REFUND',
} as const;

// ======================== COMMON TYPES ========================
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ======================== MODELS ========================
// We export types matching the Prisma schema to ensure type safety across the frontend.

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  allowedIPs: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  branchId: string;
  name: string;
  contact: string;
  position: string;
  branch?: Branch;
  user?: User;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  companyName?: string | null;
  address: string;
  contact: string;
  postalCode?: string | null;
  country: string;
  customPricing: boolean;
  user?: User;
}

export interface ShipmentPiece {
  id: string;
  pieceNumber: number;
  weight: number | string;
  description?: string;
}

export interface ShipmentDetail {
  id: string;
  senderName: string;
  senderAddress: string;
  senderContact: string;
  senderPostalCode?: string;
  senderCountry: string;
  receiverName: string;
  receiverAddress: string;
  receiverContact: string;
  receiverPostalCode?: string;
  receiverCountry: string;
}

export interface ShipmentStatusLog {
  id: string;
  status: ShipmentStatus;
  note?: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  customerId: string;
  employeeId: string;
  branchId: string;
  serviceId: string;
  weight: number | string;
  cost: number | string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  
  customer?: Customer;
  employee?: Employee;
  branch?: Branch;
  service?: Service;
  detail?: ShipmentDetail;
  pieces?: ShipmentPiece[];
  statusLogs?: ShipmentStatusLog[];
}

export interface Service {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Tariff {
  id: string;
  serviceId: string;
  countryCode: string;
  pricePerKg: number | string;
  basePrice: number | string;
  minWeight: number | string;
  maxWeight?: number | string;
  service?: Service;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number | string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  shipmentId: string;
  customerId: string;
  subtotal: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  amountPaid: number | string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  customer?: Customer;
  shipment?: Shipment;
  items?: InvoiceItem[];
}

export interface LedgerEntry {
  id: string;
  entryNumber: string;
  referenceType: LedgerReferenceType;
  referenceId: string;
  customerId?: string;
  branchId: string;
  description: string;
  debit: number | string;
  credit: number | string;
  runningBalance: number | string;
  currency: string;
  note?: string;
  isVoid: boolean;
  createdAt: string;
  customer?: Customer;
  branch?: Branch;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  invoiceId?: string;
  amount: number | string;
  method: PaymentMethod;
  referenceNumber?: string;
  receivedAt: string;
  createdAt: string;
  customer?: Customer;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  description: string;
  weight: number | string;
  quantity: number;
  trackingId?: string;
}

export interface Inventory {
  id: string;
  inventoryCode: string;
  branchId: string;
  uploadedById: string;
  notes?: string;
  createdAt: string;
  items?: InventoryItem[];
}

export interface Manifest {
  id: string;
  referenceNumber: string;
  createdById: string;
  branchId: string;
  notes?: string;
  createdAt: string;
}
