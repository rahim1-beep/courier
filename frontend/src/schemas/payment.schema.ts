import { z } from 'zod';
// Sync with: src/accounting/dto/index.ts

export const createPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceId: z.string().optional(),
  amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be positive')),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE']),
  referenceNumber: z.string().optional(),
  branchId: z.string().min(1, 'Branch is required'),
  receivedAt: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;

export const createCreditNoteSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceId: z.string().min(1, 'Invoice is required'),
  reason: z.string().min(1, 'Reason is required'),
  amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be positive')),
});

export type CreateCreditNoteFormData = z.infer<typeof createCreditNoteSchema>;
