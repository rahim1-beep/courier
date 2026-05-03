import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { branchesApi } from '../../api/branches.api';
import { queryKeys } from '../../api/queryKeys';

const branchSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Full address is required'),
  allowedIps: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface CreateBranchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBranchDrawer: React.FC<CreateBranchDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      city: '',
      address: '',
      allowedIps: '',
    }
  });

  const { mutate: createBranch, isPending } = useMutation({
    mutationFn: (data: any) => branchesApi.create(data),
    onSuccess: () => {
      toast.success('Branch created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create branch');
    }
  });

  const onSubmit = (data: BranchFormValues) => {
    // Convert allowedIps string to array if provided
    const payload = {
      ...data,
      allowedIps: data.allowedIps 
        ? data.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean)
        : []
    };
    createBranch(payload);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Branch"
      width="480px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Create Branch"
    >
      <form id="branch-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* BRANCH INFO */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Branch Info</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Name</label>
              <input 
                {...register('name')} 
                className="v2-input" 
                placeholder="e.g. North Hub" 
              />
              {errors.name?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.name.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">City</label>
              <input 
                {...register('city')} 
                className="v2-input" 
                placeholder="e.g. Islamabad" 
              />
              {errors.city?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.city.message)}</p>}
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
              className="v2-input resize-none h-20" 
              placeholder="Enter complete branch address..."
            />
            {errors.address?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.address.message)}</p>}
          </div>
        </div>

        {/* NETWORK */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Network</h4>
          <div>
            <label className="block text-label mb-1">Allowed IPs (Optional)</label>
            <input 
              {...register('allowedIps')} 
              className="v2-input font-mono text-[13px]" 
              placeholder="192.168.1.0/24, 10.0.0.5" 
            />
            <p className="text-[12px] text-muted mt-1.5">
              Comma-separated list of IP addresses or CIDR blocks allowed to access the system from this branch. Leave blank for no restriction.
            </p>
          </div>
        </div>
      </form>
    </SlideDrawer>
  );
};
