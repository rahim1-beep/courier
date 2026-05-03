import { z } from 'zod';
// Sync with: src/shipments/dto/shipment.dto.ts

export const createShipmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  branchId: z.string().min(1, 'Branch is required'),
  serviceId: z.string().min(1, 'Service is required'),
  weight: z.preprocess((val) => Number(val), z.number().positive('Weight must be positive')),
  senderName: z.string().min(1, 'Sender name is required'),
  senderAddress: z.string().min(1, 'Sender address is required'),
  senderContact: z.string().min(1, 'Sender contact is required'),
  senderCountry: z.string().min(1, 'Sender country is required'),
  receiverName: z.string().min(1, 'Receiver name is required'),
  receiverAddress: z.string().min(1, 'Receiver address is required'),
  receiverContact: z.string().min(1, 'Receiver contact is required'),
  receiverCountry: z.string().min(1, 'Receiver country is required'),
  pieces: z.array(z.object({
    pieceNumber: z.number().int().positive(),
    weight: z.preprocess((val) => Number(val), z.number().positive('Weight must be positive')),
    description: z.string().optional(),
  })).optional(),
});

export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;
