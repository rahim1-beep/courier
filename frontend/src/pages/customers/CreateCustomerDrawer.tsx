import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { customersApi } from '../../api/customers.api';
import { queryKeys } from '../../api/queryKeys';

const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CreateCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCustomerDrawer: React.FC<CreateCustomerDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
    }
  });

  const { mutate: createCustomer, isPending } = useMutation({
    mutationFn: (data: any) => customersApi.create(data),
    onSuccess: () => {
      toast.success('Customer created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create customer');
    }
  });

  const onSubmit = (data: CustomerFormValues) => {
    createCustomer(data);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Customer"
      width="480px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Create Customer"
    >
      <form id="customer-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        
        {/* BASIC INFO */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Basic Info</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Full Name</label>
              <input 
                {...register('fullName')} 
                className="v2-input" 
                placeholder="e.g. Jane Doe" 
              />
              {errors.fullName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.fullName.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Company (Optional)</label>
              <input 
                {...register('companyName')} 
                className="v2-input" 
                placeholder="e.g. Acme Corp" 
              />
              {errors.companyName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.companyName.message)}</p>}
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Email Address</label>
              <input 
                type="email"
                {...register('email')} 
                className="v2-input" 
                placeholder="jane@example.com" 
              />
              {errors.email?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.email.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Phone Number</label>
              <input 
                {...register('phone')} 
                className="v2-input font-mono text-[13px]" 
                placeholder="+1 234 567 8900" 
              />
              {errors.phone?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.phone.message)}</p>}
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Address</h4>
          <div>
            <label className="block text-label mb-1">Full Address</label>
            <textarea 
              {...register('address')} 
              className="v2-input resize-none h-24" 
              placeholder="Enter complete shipping address..."
            />
            {errors.address?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.address.message)}</p>}
          </div>
        </div>

      </form>
    </SlideDrawer>
  );
};
