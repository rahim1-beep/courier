import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { tariffsApi } from '../../api/tariffs.api';
import { queryKeys } from '../../api/queryKeys';

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  code: z.string().min(2, 'Service code is required').toUpperCase(),
  description: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface CreateServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateServiceDrawer: React.FC<CreateServiceDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    }
  });

  const { mutate: createService, isPending } = useMutation({
    mutationFn: (data: ServiceFormValues) => tariffsApi.createService(data as any),
    onSuccess: () => {
      toast.success('Service level created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tariffs.services });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create service');
    }
  });

  const onSubmit = (data: ServiceFormValues) => {
    createService(data);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Service Level"
      width="480px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Create Service"
    >
      <form id="service-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <p className="text-[13px] text-secondary leading-relaxed">
            Define a new shipping service category (e.g., DHL Express, FedEx Ground). 
            Once created, you can define specific weight-based tariffs for this service.
          </p>
          
          <div>
            <label className="block text-label mb-1">Service Name</label>
            <input 
              {...register('name')} 
              className="v2-input" 
              placeholder="e.g. DHL Express Worldwide" 
            />
            {errors.name?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.name.message)}</p>}
          </div>

          <div>
            <label className="block text-label mb-1">Service Code</label>
            <input 
              {...register('code')} 
              className="v2-input font-mono uppercase" 
              placeholder="e.g. DHL-EX" 
            />
            <p className="text-[11px] text-muted mt-1">Short unique identifier for this service level.</p>
            {errors.code?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.code.message)}</p>}
          </div>

          <div>
            <label className="block text-label mb-1">Description (Optional)</label>
            <textarea 
              {...register('description')} 
              className="v2-input resize-none h-24" 
              placeholder="Optional notes about delivery times, restrictions, etc."
            />
          </div>
        </div>
      </form>
    </SlideDrawer>
  );
};
