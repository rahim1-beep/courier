import { z } from 'zod';
// Sync with: src/customers/dto/customer.dto.ts

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  companyName: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  contact: z.string().min(1, 'Contact is required'),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  customPricing: z.boolean().default(false),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial().omit({ email: true, password: true });
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
