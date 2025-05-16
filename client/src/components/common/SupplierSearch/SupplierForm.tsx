import { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';

// Define the address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Nigeria'),
});

// Define the supplier schema
const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: addressSchema,
  paymentTerms: z
    .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
    .optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const SupplierForm = ({ onSubmit, onCancel }: SupplierFormProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
      },
      paymentTerms: 'net30',
    },
  });

  const handleFormSubmit = (data: SupplierFormData) => {
    setIsLoading(true);

    try {
      // Generate a supplier code
      const generateSupplierCode = () => {
        const prefix = 'SUP';
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}-${randomNum}`;
      };

      // Prepare the data for API submission
      const supplierData = {
        ...data,
        supplierCode: generateSupplierCode(),
      };

      console.log('Submitting supplier data:', supplierData);
      onSubmit(supplierData);
    } catch (error) {
      console.error('Error preparing supplier data:', error);
      showToast('Error preparing supplier data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                label="Supplier Name"
                placeholder="Enter supplier name"
                error={errors.name?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="contactPerson"
            control={control}
            render={({ field }) => (
              <Input
                label="Contact Person"
                placeholder="Enter contact person name"
                error={errors.contactPerson?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                label="Phone"
                placeholder="Enter phone number"
                error={errors.phone?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="Enter email address"
                error={errors.email?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="paymentTerms"
            control={control}
            render={({ field }) => (
              <Select
                label="Payment Terms"
                options={[
                  { value: 'prepaid', label: 'Prepaid' },
                  { value: 'net15', label: 'Net 15 Days' },
                  { value: 'net30', label: 'Net 30 Days' },
                  { value: 'net60', label: 'Net 60 Days' },
                  { value: 'cod', label: 'Cash on Delivery' },
                ]}
                error={errors.paymentTerms?.message}
                {...field}
              />
            )}
          />
        </div>
      </div>

      <h3 className="text-md font-medium mt-4">Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Controller
            name="address.street"
            control={control}
            render={({ field }) => (
              <Input
                label="Street"
                placeholder="Enter street address"
                error={errors.address?.street?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="address.city"
            control={control}
            render={({ field }) => (
              <Input
                label="City"
                placeholder="Enter city"
                error={errors.address?.city?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="address.state"
            control={control}
            render={({ field }) => (
              <Input
                label="State"
                placeholder="Enter state"
                error={errors.address?.state?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="address.postalCode"
            control={control}
            render={({ field }) => (
              <Input
                label="Postal Code"
                placeholder="Enter postal code"
                error={errors.address?.postalCode?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="address.country"
            control={control}
            render={({ field }) => (
              <Input
                label="Country"
                placeholder="Enter country"
                error={errors.address?.country?.message}
                required
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create Supplier
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
