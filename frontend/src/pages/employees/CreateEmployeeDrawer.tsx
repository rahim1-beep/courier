import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { employeesApi } from '../../api/employees.api';
import { queryKeys } from '../../api/queryKeys';
import { apiClient } from '../../api/axios';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branchId: z.string().min(1, 'Branch is required'),
  position: z.string().min(2, 'Position is required'),
  contactNumber: z.string().min(10, 'Contact number is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive').optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface CreateEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEmployeeDrawer: React.FC<CreateEmployeeDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  // Fetch branches for dropdown
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/branches');
      return data;
    },
    enabled: isOpen,
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      branchId: '',
      position: '',
      contactNumber: '',
      salary: undefined,
    }
  });

  const { mutate: createEmployee, isPending } = useMutation({
    mutationFn: (data: any) => employeesApi.create(data),
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create employee');
    }
  });

  const onSubmit = (data: EmployeeFormValues) => {
    createEmployee(data);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Employee"
      width="480px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Create Employee"
    >
      <form id="employee-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        
        {/* PERSONAL DETAILS */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Personal Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">First Name</label>
              <input 
                {...register('firstName')} 
                className="v2-input" 
                placeholder="e.g. John" 
              />
              {errors.firstName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.firstName.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Last Name</label>
              <input 
                {...register('lastName')} 
                className="v2-input" 
                placeholder="e.g. Doe" 
              />
              {errors.lastName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.lastName.message)}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Email Address</label>
              <input 
                type="email"
                {...register('email')} 
                className="v2-input" 
                placeholder="john@courier.com" 
              />
              {errors.email?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.email.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Initial Password</label>
              <input 
                type="password"
                {...register('password')} 
                className="v2-input font-mono" 
                placeholder="••••••••" 
              />
              {errors.password?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.password.message)}</p>}
            </div>
          </div>
        </div>

        {/* ROLE & BRANCH */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Role & Branch</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Branch</label>
              <select 
                {...register('branchId')} 
                className="v2-input appearance-none"
              >
                <option value="">Select a branch...</option>
                {branchesData?.data?.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              {errors.branchId?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.branchId.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Position / Designation</label>
              <input 
                {...register('position')} 
                className="v2-input" 
                placeholder="e.g. Branch Manager" 
              />
              {errors.position?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.position.message)}</p>}
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Contact & Compensation</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Phone Number</label>
              <input 
                {...register('contactNumber')} 
                className="v2-input" 
                placeholder="+1 234 567 8900" 
              />
              {errors.contactNumber?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.contactNumber.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Salary (Optional)</label>
              <input 
                type="number"
                {...register('salary')} 
                className="v2-input font-mono" 
                placeholder="e.g. 50000" 
              />
              {errors.salary?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.salary.message)}</p>}
            </div>
          </div>
        </div>
      </form>
    </SlideDrawer>
  );
};
