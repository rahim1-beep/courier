// Factory pattern for all React Query keys to ensure cache invalidation consistency
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  shipments: {
    all: ['shipments'] as const,
    list: (filters?: Record<string, unknown>) => ['shipments', 'list', filters] as const,
    detail: (id: string) => ['shipments', 'detail', id] as const,
    tracking: (id: string) => ['shipments', 'tracking', id] as const,
    byCustomer: (customerId: string, filters?: Record<string, unknown>) => ['shipments', 'customer', customerId, filters] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (filters?: Record<string, unknown>) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    dashboard: (id: string) => ['customers', 'dashboard', id] as const,
  },
  billing: {
    all: ['invoices'] as const,
    list: (filters?: Record<string, unknown>) => ['invoices', 'list', filters] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    pdfData: (id: string) => ['invoices', 'pdf', id] as const,
    byCustomer: (customerId: string, filters?: Record<string, unknown>) => ['invoices', 'customer', customerId, filters] as const,
  },
  accounting: {
    all: ['accounting'] as const,
    ledger: (filters?: Record<string, unknown>) => ['accounting', 'ledger', filters] as const,
    customerBalance: (customerId: string, filters?: Record<string, unknown>) => ['accounting', 'balance', customerId, filters] as const,
    profitLoss: (filters?: Record<string, unknown>) => ['accounting', 'pl', filters] as const,
    salesSummary: (filters?: Record<string, unknown>) => ['accounting', 'sales', filters] as const,
    outstanding: (filters?: Record<string, unknown>) => ['accounting', 'outstanding', filters] as const,
  },
  branches: {
    all: ['branches'] as const,
    list: (filters?: Record<string, unknown>) => ['branches', 'list', filters] as const,
    detail: (id: string) => ['branches', 'detail', id] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (filters?: Record<string, unknown>) => ['employees', 'list', filters] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    my: (filters?: Record<string, unknown>) => ['attendance', 'my', filters] as const,
    list: (filters?: Record<string, unknown>) => ['attendance', 'list', filters] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (filters?: Record<string, unknown>) => ['inventory', 'list', filters] as const,
    detail: (id: string) => ['inventory', 'detail', id] as const,
  },
  manifests: {
    all: ['manifests'] as const,
    list: (filters?: Record<string, unknown>) => ['manifests', 'list', filters] as const,
    detail: (id: string) => ['manifests', 'detail', id] as const,
  },
  tariffs: {
    all: ['tariffs'] as const,
    services: ['services'] as const,
    list: (filters?: Record<string, unknown>) => ['tariffs', 'list', filters] as const,
  },
  audit: {
    list: (filters?: Record<string, unknown>) => ['audit', 'list', filters] as const,
  },
  dashboard: {
    // Custom aggregation keys if we query the shipments/accounting multiple times specifically for dashboard
    aggregation: ['dashboard'] as const,
  }
};
