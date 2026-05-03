import React from 'react';
import { formatCurrency, formatDate, displayValue } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

interface PrintableInvoiceProps {
  data: any; // PDF data from GET /invoices/:id/pdf-data
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ data }) => {
  if (!data) return null;

  const { invoice, shipment, customer, items } = data;

  return (
    <div className="hidden print:block print:bg-white print:text-black p-8 max-w-4xl mx-auto text-sm" id="printable-invoice">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{APP_NAME} Logistics</h1>
          <p className="text-slate-500 mt-1">Global Courier & Supply Chain Solutions</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-blue-600">INVOICE</h2>
          <p className="font-mono text-lg mt-1">{invoice?.invoiceNumber}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
          <p className="font-bold text-base">{customer?.companyName || customer?.name}</p>
          {customer?.companyName && <p>{customer?.name}</p>}
          <p className="text-slate-600 mt-1 whitespace-pre-line">{customer?.address}</p>
          <p className="text-slate-600 mt-1">{customer?.country}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Date</h3>
            <p className="font-medium">{formatDate(invoice?.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</h3>
            <p className="font-medium">{formatDate(invoice?.dueDate)}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tracking ID</h3>
            <p className="font-medium font-mono">{shipment?.trackingId}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</h3>
            <p className="font-medium">{invoice?.status?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Shipment Details if available */}
      {shipment?.detail && (
        <div className="bg-slate-50 p-4 rounded-lg mb-8 grid grid-cols-2 gap-6 border border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</h3>
            <p className="font-medium">{shipment.detail.senderName}</p>
            <p className="text-slate-600">{shipment.detail.senderAddress}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</h3>
            <p className="font-medium">{shipment.detail.receiverName}</p>
            <p className="text-slate-600">{shipment.detail.receiverAddress}</p>
          </div>
        </div>
      )}

      {/* Line Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-slate-200 text-left">
            <th className="py-3 font-semibold text-slate-700">Description</th>
            <th className="py-3 font-semibold text-slate-700 text-right w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item: any, i: number) => (
            <tr key={item.id || i} className="border-b border-slate-100">
              <td className="py-4 text-slate-800">{item.description}</td>
              <td className="py-4 text-slate-800 text-right font-medium">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {!items?.length && (
            <tr className="border-b border-slate-100">
              <td className="py-4 text-slate-800">Shipment Weight Charge ({shipment?.weight} kg)</td>
              <td className="py-4 text-slate-800 text-right font-medium">{formatCurrency(invoice?.subtotal)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-72">
          <div className="flex justify-between py-2 text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice?.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 text-slate-600">
            <span>Tax</span>
            <span>{formatCurrency(invoice?.taxAmount)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-slate-800 font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(invoice?.totalAmount)}</span>
          </div>
          {Number(invoice?.amountPaid) > 0 && (
            <div className="flex justify-between py-2 text-green-600 font-medium">
              <span>Amount Paid</span>
              <span>-{formatCurrency(invoice?.amountPaid)}</span>
            </div>
          )}
          {Number(invoice?.amountPaid) > 0 && (
            <div className="flex justify-between py-3 border-t border-slate-200 font-bold">
              <span>Balance Due</span>
              <span>{formatCurrency(Number(invoice?.totalAmount) - Number(invoice?.amountPaid))}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-slate-500 text-xs text-center">
        <p>Please include the invoice number on your check or bank transfer reference.</p>
        <p className="mt-1">Thank you for your business!</p>
      </div>
    </div>
  );
};
