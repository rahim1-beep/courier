import { z } from 'zod';
// Sync with: src/manifests/dto/manifest.dto.ts

export const createManifestSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  notes: z.string().optional(),
  shipmentIds: z.array(z.string()).min(1, 'At least one shipment is required'),
});

export type CreateManifestFormData = z.infer<typeof createManifestSchema>;
