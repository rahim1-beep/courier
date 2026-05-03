import { z } from 'zod';
// Sync with: src/branches/dto/branch.dto.ts

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  allowedIPs: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type CreateBranchFormData = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = createBranchSchema.partial();
export type UpdateBranchFormData = z.infer<typeof updateBranchSchema>;
