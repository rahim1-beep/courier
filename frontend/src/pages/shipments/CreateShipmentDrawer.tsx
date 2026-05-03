import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { shipmentsApi } from '../../api/shipments.api';
import { queryKeys } from '../../api/queryKeys';
import { apiClient } from '../../api/axios';

const shipmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceId: z.string().min(1, 'Service is required'),
  
  // Sender
  shipperName: z.string().min(2, 'Shipper name is required'),
  shipperPhone: z.string().min(10, 'Shipper phone is required'),
  originCity: z.string().min(2, 'Origin city is required'),
  shipperAddress: z.string().min(5, 'Shipper address is required'),

  // Receiver
  receiverName: z.string().min(2, 'Receiver name is required'),
  receiverPhone: z.string().min(10, 'Receiver phone is required'),
  destinationCountry: z.string().min(2, 'Destination country is required'),
  destinationCity: z.string().min(2, 'Destination city is required'),
  receiverAddress: z.string().min(5, 'Receiver address is required'),

  // Details
  packageType: z.string().min(2, 'Package type is required'),
  weight: z.coerce.number().min(0.1, 'Weight is required'),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  declaredValue: z.coerce.number().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

interface CreateShipmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateShipmentDrawer: React.FC<CreateShipmentDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/services');
      return data;
    },
    enabled: isOpen,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/customers?limit=100');
      return data;
    },
    enabled: isOpen,
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(shipmentSchema) as any,
    defaultValues: {
      customerId: '',
      serviceId: '',
      shipperName: '',
      shipperPhone: '',
      originCity: '',
      shipperAddress: '',
      receiverName: '',
      receiverPhone: '',
      destinationCountry: '',
      destinationCity: '',
      receiverAddress: '',
      packageType: 'Document',
      weight: 1,
    }
  });

  const { mutate: createShipment, isPending } = useMutation({
    mutationFn: (data: any) => shipmentsApi.create(data),
    onSuccess: () => {
      toast.success('Shipment created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create shipment');
    }
  });

  const onSubmit = (data: ShipmentFormValues) => {
    createShipment(data);
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Shipment"
      width="600px"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending}
      submitLabel="Create Shipment"
    >
      <form id="shipment-form" className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        
        {/* SENDER INFO */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Sender Info</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Customer Profile</label>
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
            <div>
              <label className="block text-label mb-1">Service Level</label>
              <select 
                {...register('serviceId')} 
                className="v2-input appearance-none"
              >
                <option value="">Select Service...</option>
                {servicesData?.data?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.serviceId?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.serviceId.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Shipper Name</label>
              <input {...register('shipperName')} className="v2-input" placeholder="e.g. John Doe" />
              {errors.shipperName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.shipperName.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Shipper Phone</label>
              <input {...register('shipperPhone')} className="v2-input font-mono text-[13px]" placeholder="+1..." />
              {errors.shipperPhone?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.shipperPhone.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Origin City</label>
              <input {...register('originCity')} className="v2-input" placeholder="e.g. Lahore" />
              {errors.originCity?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.originCity.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Shipper Address</label>
              <input {...register('shipperAddress')} className="v2-input" placeholder="Full address" />
              {errors.shipperAddress?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.shipperAddress.message)}</p>}
            </div>
          </div>
        </div>

        {/* RECEIVER INFO */}
        <div className="space-y-4 pt-4 border-t border-subtle">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Receiver Info</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Receiver Name</label>
              <input {...register('receiverName')} className="v2-input" placeholder="e.g. Jane Smith" />
              {errors.receiverName?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.receiverName.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Receiver Phone</label>
              <input {...register('receiverPhone')} className="v2-input font-mono text-[13px]" placeholder="+1..." />
              {errors.receiverPhone?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.receiverPhone.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Destination Country</label>
              <input {...register('destinationCountry')} className="v2-input uppercase" placeholder="e.g. US" />
              {errors.destinationCountry?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.destinationCountry.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Destination City</label>
              <input {...register('destinationCity')} className="v2-input" placeholder="e.g. New York" />
              {errors.destinationCity?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.destinationCity.message)}</p>}
            </div>
          </div>

          <div>
            <label className="block text-label mb-1">Receiver Address</label>
            <input {...register('receiverAddress')} className="v2-input" placeholder="Full address" />
            {errors.receiverAddress?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.receiverAddress.message)}</p>}
          </div>
        </div>

        {/* SHIPMENT DETAILS */}
        <div className="space-y-4 pt-4 border-t border-subtle">
          <h4 className="text-[11px] uppercase tracking-wider text-muted font-bold">Package Details</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label mb-1">Package Type</label>
              <select {...register('packageType')} className="v2-input appearance-none">
                <option value="Document">Document</option>
                <option value="Parcel">Parcel</option>
                <option value="Box">Box</option>
                <option value="Pallet">Pallet</option>
              </select>
              {errors.packageType?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.packageType.message)}</p>}
            </div>
            <div>
              <label className="block text-label mb-1">Weight (Kg)</label>
              <input type="number" step="0.1" {...register('weight')} className="v2-input font-mono" />
              {errors.weight?.message && <p className="text-rose-500 text-xs mt-1">{String(errors.weight.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-label mb-1">Length (cm)</label>
              <input type="number" {...register('length')} className="v2-input font-mono" />
            </div>
            <div>
              <label className="block text-label mb-1">Width (cm)</label>
              <input type="number" {...register('width')} className="v2-input font-mono" />
            </div>
            <div>
              <label className="block text-label mb-1">Height (cm)</label>
              <input type="number" {...register('height')} className="v2-input font-mono" />
            </div>
          </div>
          
          <div>
            <label className="block text-label mb-1">Declared Value (Optional)</label>
            <input type="number" {...register('declaredValue')} className="v2-input font-mono" placeholder="e.g. 5000" />
          </div>
        </div>

      </form>
    </SlideDrawer>
  );
};
