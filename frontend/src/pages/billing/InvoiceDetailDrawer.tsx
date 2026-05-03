import React from 'react';
import { Printer, Download, Mail, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';

interface InvoiceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceDetailDrawer: React.FC<InvoiceDetailDrawerProps> = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      width="600px"
    >
      <div className="space-y-8 pb-10 print:p-0 print:bg-white print:text-black">
        {/* HEADER SECTION (HIDDEN ON SCREEN, VISIBLE ON PRINT) */}
        <div className="hidden print:block mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">SwiftShip Logistics</h1>
              <p className="text-sm text-gray-500">123 Logistics Way, Suite 100<br/>New York, NY 10001</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-400">Invoice</h2>
              <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* STATUS & ACTIONS */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-canvas border border-default print:hidden">
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status} />
            <span className="text-[13px] text-secondary">
              Due on {formatDate(invoice.dueDate)}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 rounded-lg bg-surface border border-default hover:bg-elevated transition-colors text-primary"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg bg-surface border border-default hover:bg-elevated transition-colors text-primary"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg bg-surface border border-default hover:bg-elevated transition-colors text-primary"
              title="Email to Customer"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold mb-3">Billed To</h4>
            <div className="space-y-1">
              <p className="font-semibold text-primary">{invoice.customer?.user?.name}</p>
              <p className="text-[13px] text-secondary">{invoice.customer?.companyName || 'Individual'}</p>
              <p className="text-[13px] text-secondary whitespace-pre-wrap">{invoice.customer?.address}</p>
              <p className="text-[13px] text-secondary">{invoice.customer?.user?.email}</p>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold mb-3">Shipment Details</h4>
            <div className="space-y-1">
              <p className="text-[13px] text-primary font-medium">Tracking ID: <span className="font-mono">{invoice.shipment?.trackingId}</span></p>
              <p className="text-[13px] text-secondary">Service: {invoice.shipment?.service?.name}</p>
              <p className="text-[13px] text-secondary">Weight: {invoice.shipment?.weight} Kg</p>
              <p className="text-[13px] text-secondary">Date: {formatDate(invoice.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Line Items</h4>
          <div className="border border-subtle rounded-2xl overflow-hidden bg-surface/30">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-canvas/50 border-b border-subtle">
                <tr>
                  <th className="px-4 py-3 font-semibold text-secondary">Description</th>
                  <th className="px-4 py-3 font-semibold text-secondary text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="px-4 py-3 text-primary">{item.description}</td>
                    <td className="px-4 py-3 text-primary text-right font-mono">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                {/* Default Shipment Cost if no items */}
                {(!invoice.items || invoice.items.length === 0) && (
                  <tr>
                    <td className="px-4 py-3 text-primary">Shipment Fee ({invoice.shipment?.service?.name})</td>
                    <td className="px-4 py-3 text-primary text-right font-mono">{formatCurrency(invoice.totalAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end pt-4 border-t border-subtle">
          <div className="w-full sm:w-64 space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-secondary">Subtotal</span>
              <span className="text-primary font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-secondary">Tax (VAT 0%)</span>
              <span className="text-primary font-mono">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-strong">
              <span className="font-bold text-primary">Total Amount</span>
              <span className="text-xl font-bold text-indigo-500 font-mono">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            {Number(invoice.amountPaid) > 0 && (
              <div className="flex justify-between text-[13px] text-emerald-500 font-medium">
                <span>Amount Paid</span>
                <span className="font-mono">-{formatCurrency(invoice.amountPaid)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 text-[14px]">
              <span className="font-semibold text-primary">Balance Due</span>
              <span className="font-bold text-primary font-mono">
                {formatCurrency(Number(invoice.totalAmount) - Number(invoice.amountPaid))}
              </span>
            </div>
          </div>
        </div>

        {/* PRINT FOOTER (HIDDEN ON SCREEN) */}
        <div className="hidden print:block mt-20 pt-10 border-t border-gray-200">
          <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest">
            <p>Authorized Signature</p>
            <p>Thank you for your business</p>
          </div>
        </div>
      </div>
    </SlideDrawer>
  );
};
