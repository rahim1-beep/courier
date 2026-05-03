import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SlideDrawer } from '../../components/common/SlideDrawer';
import { FileUploadZone } from '../../components/common/FileUploadZone';
import { inventoryApi } from '../../api/inventory.api';
import { customersApi } from '../../api/customers.api';
import { branchesApi } from '../../api/branches.api';
import { queryKeys } from '../../api/queryKeys';
import { toast } from 'sonner';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customerId: '',
    branchId: '',
    description: '',
    weight: 0,
    quantity: 1,
    trackingId: '',
    notes: '',
  });

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers.list({ limit: 100 }),
    queryFn: () => customersApi.findAll({ limit: 100 }),
  });

  const { data: branches } = useQuery({
    queryKey: queryKeys.branches.list({ limit: 100 }),
    queryFn: () => branchesApi.findAll({ limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => inventoryApi.create(payload),
    onSuccess: () => {
      toast.success('Inventory item added successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add item');
    },
  });

  const handleSubmit = () => {
    if (!formData.customerId || !formData.branchId || !formData.description || formData.weight <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    mutation.mutate({
      customerId: formData.customerId,
      branchId: formData.branchId,
      notes: formData.notes,
      items: [{
        description: formData.description,
        weight: formData.weight,
        quantity: formData.quantity,
        trackingId: formData.trackingId,
      }],
    });
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Inventory Item"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Customer</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full v2-input"
            >
              <option value="">Select Customer</option>
              {customers?.data.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Branch</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full v2-input"
            >
              <option value="">Select Branch</option>
              {branches?.data.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Cardboard Boxes (Large)"
            className="w-full v2-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Weight (Kg)</label>
            <input
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              className="w-full v2-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full v2-input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Tracking ID (Optional)</label>
          <input
            type="text"
            value={formData.trackingId}
            onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
            placeholder="Carrier Tracking #"
            className="w-full v2-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full v2-input resize-none"
          />
        </div>
      </div>
    </SlideDrawer>
  );
};

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers.list({ limit: 100 }),
    queryFn: () => customersApi.findAll({ limit: 100 }),
  });

  const { data: branches } = useQuery({
    queryKey: queryKeys.branches.list({ limit: 100 }),
    queryFn: () => branchesApi.findAll({ limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: ({ file, branchId, customerId }: any) => 
      inventoryApi.bulkUpload(file, branchId, customerId),
    onSuccess: (data: any) => {
      toast.success(`Successfully imported ${data.success} items`);
      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} rows had errors and were skipped`);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to import inventory');
    },
  });

  const handleUpload = () => {
    if (!file || !branchId || !customerId) {
      toast.error('Please select a file, branch, and customer');
      return;
    }
    mutation.mutate({ file, branchId, customerId });
  };

  return (
    <SlideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Inventory"
      onSubmit={handleUpload}
      isSubmitting={mutation.isPending}
      submitLabel="Upload & Import"
    >
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
          <p className="text-sm text-blue-200 leading-relaxed">
            Upload a CSV file with the following headers: 
            <code className="bg-black/30 px-1.5 py-0.5 rounded mx-1 text-blue-400 font-mono">description</code>, 
            <code className="bg-black/30 px-1.5 py-0.5 rounded mx-1 text-blue-400 font-mono">weight</code>, 
            <code className="bg-black/30 px-1.5 py-0.5 rounded mx-1 text-blue-400 font-mono">quantity</code>, 
            <code className="bg-black/30 px-1.5 py-0.5 rounded mx-1 text-blue-400 font-mono">trackingId</code>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full v2-input"
            >
              <option value="">Select Customer</option>
              {customers?.data.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full v2-input"
            >
              <option value="">Select Branch</option>
              {branches?.data.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <FileUploadZone
          onFileSelect={setFile}
          acceptedTypes={['text/csv', 'application/vnd.ms-excel']}
          maxSizeMB={5}
        />
      </div>
    </SlideDrawer>
  );
};
