import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { accountingApi } from '../../api/accounting.api';
import { queryKeys } from '../../api/queryKeys';
import { apiClient } from '../../api/axios';
import { PaymentMethod } from '../../types';

const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  method: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  note: z.string().optional(),
  receivedAt: z.string().min(1, 'Date is required'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordPaymentDrawer: React.FC<RecordPaymentDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/customers?limit=100');
      return data;
    },
    enabled: isOpen,
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      customerId: '',
      amount: 0,
      method: PaymentMethod.CASH,
      referenceNumber: '',
      note: '',
      receivedAt: new Date().toISOString().split('T')[0],
    }
  });

  const { mutate: recordPayment, isPending } = useMutation({
    mutationFn: (data: any) => accountingApi.recordPayment(data),
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.accounting.all });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    }
  });

  const onSubmit = (data: PaymentFormValues) => {
    recordPayment(data);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Payment"
      width="480px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Record Payment"
    >
      <form id="payment-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="space-y-4">
          <p className="text-[13px] text-secondary leading-relaxed">
            Record a payment received from a customer. This will update their balance and create a credit entry in the ledger.
          </p>
          
          <div>
            <label className="block text-label mb-1">Customer</label>
            <select 
              {...register('customerId')} 
              className="v2-input appearance-none"
            >
              <option value="">Select a customer...</option>
              {customersData?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.user?.firstName} {c.user?.lastName} {c.companyName ? `(${c.companyName})` : ''}
                </option>
              ))}
            </select>
            {errors.customerId?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.customerId.message)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Amount</label>
              <input 
                type="number"
                {...register('amount')} 
                className="v2-input font-mono" 
                placeholder="0.00" 
              />
              {errors.amount?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.amount.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Payment Date</label>
              <input 
                type="date"
                {...register('receivedAt')} 
                className="v2-input" 
              />
              {errors.receivedAt?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.receivedAt.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Method</label>
              <select 
                {...register('method')} 
                className="v2-input appearance-none"
              >
                {Object.values(PaymentMethod).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.method?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.method.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Ref # / Check #</label>
              <input 
                {...register('referenceNumber')} 
                className="v2-input" 
                placeholder="Optional" 
              />
            </div>
          </div>

          <div>
            <label className="block text-label mb-1">Notes / Description</label>
            <textarea 
              {...register('note')} 
              className="v2-input resize-none h-24" 
              placeholder="e.g. Monthly payment for March shipments"
            />
          </div>
        </div>
      </form>
    </SlideDrawer>
  );
};
