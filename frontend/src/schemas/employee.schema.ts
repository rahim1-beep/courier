import { z } from 'zod';
// Sync with: src/employees/dto/employee.dto.ts

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  contact: z.string().min(1, 'Contact is required'),
  position: z.string().min(1, 'Position is required'),
  branchId: z.string().min(1, 'Branch is required'),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ email: true, password: true });
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
