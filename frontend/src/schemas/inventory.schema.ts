import { z } from 'zod';
// Sync with: src/inventory/dto/inventory.dto.ts

export const createInventoryItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  weight: z.preprocess((val) => Number(val), z.number().positive('Weight must be positive')),
  quantity: z.preprocess((val) => parseInt(String(val), 10), z.number().int().positive().default(1)),
  trackingId: z.string().optional(),
});

export const createInventorySchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  notes: z.string().optional(),
  items: z.array(createInventoryItemSchema).min(1, 'At least one item is required'),
});

export type CreateInventoryFormData = z.infer<typeof createInventorySchema>;
export type CreateInventoryItemFormData = z.infer<typeof createInventoryItemSchema>;
