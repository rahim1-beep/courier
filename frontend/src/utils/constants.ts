export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SwiftShip';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const STATUS_COLORS: Record<string, string> = {
  // Shipments
  CREATED: 'bg-gray-500',
  PICKED_UP: 'bg-blue-500',
  IN_TRANSIT: 'bg-cyan-500',
  OUT_FOR_DELIVERY: 'bg-amber-500',
  DELIVERED: 'bg-green-500',
  ON_HOLD: 'bg-amber-500',
  RETURNED: 'bg-red-500',
  CANCELLED: 'bg-red-500',
  
  // Invoices
  DRAFT: 'bg-gray-500',
  ISSUED: 'bg-blue-500',
  PARTIALLY_PAID: 'bg-amber-500',
  PAID: 'bg-green-500',
  VOID: 'bg-red-500 line-through text-red-500',
  
  // Attendance
  PRESENT: 'bg-green-500',
  ABSENT: 'bg-red-500',
  INVALID_IP: 'bg-red-500',
};

export const NAVIGATION = [
  {
    group: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['SUPER_ADMIN', 'EMPLOYEE'] }
    ]
  },
  {
    group: 'OPERATIONS',
    items: [
      { name: 'Shipments', path: '/shipments', icon: 'Package', roles: ['SUPER_ADMIN', 'EMPLOYEE', 'CUSTOMER'] },
      { name: 'Manifests', path: '/manifests', icon: 'FileText', roles: ['SUPER_ADMIN', 'EMPLOYEE'] },
      { name: 'Inventory', path: '/inventory', icon: 'Archive', roles: ['SUPER_ADMIN', 'EMPLOYEE'] }
    ]
  },
  {
    group: 'PEOPLE',
    items: [
      { name: 'Customers', path: '/customers', icon: 'Users', roles: ['SUPER_ADMIN', 'EMPLOYEE'] },
      { name: 'Employees', path: '/employees', icon: 'Briefcase', roles: ['SUPER_ADMIN'] },
      { name: 'Attendance', path: '/attendance', icon: 'Clock', roles: ['SUPER_ADMIN', 'EMPLOYEE'] }
    ]
  },
  {
    group: 'NETWORK',
    items: [
      { name: 'Branches', path: '/branches', icon: 'MapPin', roles: ['SUPER_ADMIN'] },
      { name: 'Services & Tariffs', path: '/tariffs', icon: 'Globe', roles: ['SUPER_ADMIN'] }
    ]
  },
  {
    group: 'FINANCE',
    items: [
      { name: 'Billing & Invoices', path: '/billing', icon: 'CreditCard', roles: ['SUPER_ADMIN', 'EMPLOYEE'] },
      { name: 'Accounting', path: '/accounting', icon: 'Calculator', roles: ['SUPER_ADMIN'] }
    ]
  },
  {
    group: 'SYSTEM',
    items: [
      { name: 'Audit Logs', path: '/audit-logs', icon: 'Activity', roles: ['SUPER_ADMIN'] }
    ]
  }
];
