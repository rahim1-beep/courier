import { z } from 'zod';
// Sync with: src/tariffs/dto/tariff.dto.ts

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true),
  countries: z.array(z.object({
    countryCode: z.string().min(2, 'Country code must be at least 2 characters'),
    countryName: z.string().min(1, 'Country name is required'),
    isRestricted: z.boolean().default(false),
  })).min(1, 'At least one country is required'),
});

export type CreateServiceFormData = z.infer<typeof createServiceSchema>;

export const createTariffSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  pricePerKg: z.preprocess((val) => Number(val), z.number().positive('Price per kg must be positive')),
  basePrice: z.preprocess((val) => Number(val), z.number().nonnegative('Base price must be non-negative')),
  minWeight: z.preprocess((val) => Number(val), z.number().nonnegative().default(0)),
  maxWeight: z.preprocess((val) => val ? Number(val) : undefined, z.number().positive().optional()),
});

export type CreateTariffFormData = z.infer<typeof createTariffSchema>;
