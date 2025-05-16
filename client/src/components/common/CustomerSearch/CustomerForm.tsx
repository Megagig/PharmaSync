import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Button from '@/components/common/Button/Button';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';

// Define the customer types enum
enum CustomerType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  PATIENT = 'patient',
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
  CORPORATE = 'corporate',
  OTHER = 'other',
}

// Define the address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Nigeria'),
  isDefault: z.boolean().optional(),
});

// Define the customer schema
const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  type: z.nativeEnum(CustomerType),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  priceLevel: z.string().min(1, 'Price level is required'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CustomerForm = ({ onSubmit, onCancel }: CustomerFormProps) => {
  const { showToast } = useToast();
  const [priceLevels, setPriceLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      type: CustomerType.RETAIL,
      phone: '',
      email: '',
      priceLevel: 'retail',
    },
  });

  // Fetch price levels
  useEffect(() => {
    const fetchPriceLevels = async () => {
      try {
        console.log('Fetching price levels...');
        const response = await api.get('/price-levels');
        console.log('Price levels response:', response.data);

        let priceLevelsData: any[] = [];

        if (
          response.data &&
          response.data.data &&
          response.data.data.priceLevels
        ) {
          console.log(
            'Setting price levels from response.data.data.priceLevels'
          );
          priceLevelsData = response.data.data.priceLevels;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          console.log('Setting price levels from response.data.data array');
          priceLevelsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('Setting price levels from response.data array');
          priceLevelsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Try to find an array in the response object
          const possibleArrays = Object.values(response.data).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            priceLevelsData = possibleArrays[0] as any[];
            console.log('Found price levels array in response object');
          } else {
            console.error(
              'No price level arrays found in response object:',
              response.data
            );
          }
        } else {
          console.error(
            'Unexpected price levels response format:',
            response.data
          );
        }

        // Ensure we have a valid array
        if (!Array.isArray(priceLevelsData)) {
          console.warn(
            'Price levels data is not an array, defaulting to empty array'
          );
          priceLevelsData = [];
        }

        // If we still have no price levels, add a default one
        if (priceLevelsData.length === 0) {
          priceLevelsData = [
            { _id: 'retail', name: 'Retail', isDefault: true },
          ];
        }

        setPriceLevels(priceLevelsData);
      } catch (error) {
        console.error('Error fetching price levels:', error);
        setPriceLevels([{ _id: 'retail', name: 'Retail', isDefault: true }]);
        showToast('Error loading price levels. Using default.', 'warning');
      }
    };

    fetchPriceLevels();
  }, [showToast]);

  const handleFormSubmit = (data: CustomerFormData) => {
    setIsLoading(true);

    // Generate a customer number
    const generateCustomerNumber = () => {
      const typePrefix = data.type.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      return `${typePrefix}-${randomNum}`;
    };

    // Prepare the data for API submission
    const customerData = {
      ...data,
      customerNumber: generateCustomerNumber(),
      // Add a default address to satisfy validation
      addresses: [
        {
          street: 'Default Street',
          city: 'Default City',
          state: 'Default State',
          postalCode: '00000',
          country: 'Nigeria',
          isDefault: true,
        },
      ],
    };

    onSubmit(customerData);
    setIsLoading(false);
  };

  const getCustomerTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName?.message}
                required
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Customer Type"
                options={Object.values(CustomerType).map((type) => ({
                  value: type,
                  label: getCustomerTypeLabel(type),
                }))}
                error={errors.type?.message}
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
                {...field}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="priceLevel"
            control={control}
            render={({ field }) => (
              <Select
                label="Price Level"
                options={
                  priceLevels.length > 0
                    ? priceLevels.map((level) => ({
                        value: level._id,
                        label: level.name,
                      }))
                    : [{ value: 'retail', label: 'Retail' }]
                }
                error={errors.priceLevel?.message}
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
          Create Customer
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
