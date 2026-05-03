import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { tariffsApi } from '../../api/tariffs.api';
import { queryKeys } from '../../api/queryKeys';
import { apiClient } from '../../api/axios';

const tariffSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  countryCode: z.string().min(2, 'Country Code is required').max(3),
  countryName: z.string().min(2, 'Country Name is required'),
  pricePerKg: z.coerce.number().min(0, 'Price must be positive'),
  basePrice: z.coerce.number().min(0, 'Base price must be positive'),
  minWeight: z.coerce.number().min(0, 'Min weight must be positive'),
  maxWeight: z.coerce.number().min(0, 'Max weight must be positive'),
  effectiveFrom: z.string().min(1, 'Effective From is required'),
  effectiveTo: z.string().optional(),
});

type TariffFormValues = z.infer<typeof tariffSchema>;

interface CreateTariffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTariffDrawer: React.FC<CreateTariffDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  // Fetch services for dropdown
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/services');
      return data;
    },
    enabled: isOpen,
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(tariffSchema) as any,
    defaultValues: {
      serviceId: '',
      countryCode: '',
      countryName: '',
      pricePerKg: 0,
      basePrice: 0,
      minWeight: 0,
      maxWeight: 9999,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
    }
  });

  const { mutate: createTariff, isPending } = useMutation({
    mutationFn: (data: any) => tariffsApi.createTariff(data),
    onSuccess: () => {
      toast.success('Tariff created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tariffs.list() });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create tariff');
    }
  });

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      effectiveFrom: new Date(data.effectiveFrom).toISOString(),
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo).toISOString() : undefined,
    };
    createTariff(payload);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Tariff"
      width="480px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Create Tariff"
    >
      <form id="tariff-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        
        {/* SERVICE */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Service</h4>
          <div>
            <label className="block text-label mb-1">Service Level</label>
            <select 
              {...register('serviceId')} 
              className="v2-input appearance-none"
            >
              <option value="">Select a service...</option>
              {servicesData?.data?.map((service: any) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            {errors.serviceId?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.serviceId.message)}</p>}
          </div>
        </div>

        {/* DESTINATION */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Destination</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Country Code</label>
              <input 
                {...register('countryCode')} 
                className="v2-input font-mono uppercase" 
                placeholder="e.g. US" 
                maxLength={3}
              />
              {errors.countryCode?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.countryCode.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Country Name</label>
              <input 
                {...register('countryName')} 
                className="v2-input" 
                placeholder="e.g. United States" 
              />
              {errors.countryName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.countryName.message)}</p>}
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Pricing</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Base Price (PKR)</label>
              <input 
                type="number"
                step="0.01"
                {...register('basePrice')} 
                className="v2-input font-mono" 
              />
              {errors.basePrice?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.basePrice.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Price Per Kg (PKR)</label>
              <input 
                type="number"
                step="0.01"
                {...register('pricePerKg')} 
                className="v2-input font-mono" 
              />
              {errors.pricePerKg?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.pricePerKg.message)}</p>}
            </div>
          </div>
        </div>

        {/* WEIGHT LIMITS */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Weight Limits (Kg)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Min Weight</label>
              <input 
                type="number"
                step="0.1"
                {...register('minWeight')} 
                className="v2-input font-mono" 
              />
              {errors.minWeight?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.minWeight.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Max Weight</label>
              <input 
                type="number"
                step="0.1"
                {...register('maxWeight')} 
                className="v2-input font-mono" 
              />
              {errors.maxWeight?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.maxWeight.message)}</p>}
            </div>
          </div>
        </div>

        {/* VALIDITY */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Validity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Effective From</label>
              <input 
                type="date"
                {...register('effectiveFrom')} 
                className="v2-input" 
              />
              {errors.effectiveFrom?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.effectiveFrom.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Effective To (Optional)</label>
              <input 
                type="date"
                {...register('effectiveTo')} 
                className="v2-input" 
              />
              {errors.effectiveTo?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.effectiveTo.message)}</p>}
            </div>
          </div>
        </div>
      </form>
    </SlideDrawer>
  );
};
