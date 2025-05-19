import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Textarea from '@/components/common/Textarea/Textarea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import Spinner from '@/components/common/Spinner/Spinner';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Customer {
  _id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  name: string; // For backward compatibility
  code: string; // For backward compatibility
  type: string;
  addresses: CustomerAddress[];
  address?: CustomerAddress; // For backward compatibility
  phone?: string;
  email?: string;
  contactPerson?: string;
  priceLevel?: string;
  creditLimit?: number;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  isVIP: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum CustomerType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  PATIENT = 'patient',
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
  CORPORATE = 'corporate',
  OTHER = 'other',
}

interface PriceLevel {
  _id: string;
  name: string;
  code: string;
}

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Nigeria'),
  isDefault: z.boolean().optional(),
});

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  code: z.string().optional(), // Used for customerNumber if provided
  customerNumber: z.string().optional(), // Will be generated if not provided
  type: z.nativeEnum(CustomerType),
  address: addressSchema.optional(), // For form handling
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPerson: z.string().optional(),
  priceLevel: z.string().min(1, 'Price level is required').default('retail'),
  creditLimit: z
    .number()
    .nonnegative('Credit limit must be non-negative')
    .optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  isVIP: z.boolean().default(false),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const CustomersList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      type: CustomerType.RETAIL, // Updated to match server-side enum
      priceLevel: '', // Will be set after price levels are loaded
      phone: '',
      isActive: true,
      isVIP: false,
    },
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('Error fetching customers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPriceLevels = async () => {
    try {
      // Try to fetch active price levels first
      const response = await api.get('/price-levels/active');
      console.log('Price levels response:', response.data);

      let priceLevelsData = [];

      // Handle different response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        priceLevelsData = response.data.data;
      } else if (response.data.data && response.data.data.priceLevels && Array.isArray(response.data.data.priceLevels)) {
        priceLevelsData = response.data.data.priceLevels;
      } else if (Array.isArray(response.data)) {
        priceLevelsData = response.data;
      } else {
        console.error(
          'Unexpected price levels response format:',
          response.data
        );
      }

      // If no price levels found, add default ones
      if (priceLevelsData.length === 0) {
        priceLevelsData = [
          { _id: 'retail', name: 'Retail', code: 'RET', isDefault: true },
          { _id: 'wholesale', name: 'Wholesale', code: 'WHL', isDefault: false },
          { _id: 'special', name: 'Special', code: 'SPC', isDefault: false }
        ];
      }

      console.log('Setting price levels:', priceLevelsData);
      setPriceLevels(priceLevelsData);
    } catch (error) {
      console.error('Error fetching price levels:', error);
      // If API call fails, set default price levels
      const defaultPriceLevels = [
        { _id: 'retail', name: 'Retail', code: 'RET', isDefault: true },
        { _id: 'wholesale', name: 'Wholesale', code: 'WHL', isDefault: false },
        { _id: 'special', name: 'Special', code: 'SPC', isDefault: false }
      ];
      setPriceLevels(defaultPriceLevels);
      showToast('Using default price levels', 'info');
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchPriceLevels();
  }, []);

  // Set default price level when price levels are loaded
  useEffect(() => {
    if (priceLevels.length > 0 && !editingCustomerId) {
      // Find the default price level or use the first one
      const defaultPriceLevel =
        priceLevels.find((level) => level.isDefault) || priceLevels[0];
      console.log('Setting default price level:', defaultPriceLevel);

      // Update the form with the default price level
      setValue('priceLevel', defaultPriceLevel._id);
    }
  }, [priceLevels, setValue, editingCustomerId]);

  const filteredCustomers = customers.filter((customer) => {
    // Get the full name from firstName and lastName or use the name field
    const fullName =
      customer.firstName && customer.lastName
        ? `${customer.firstName} ${customer.lastName}`
        : customer.name;

    const customerCode = customer.customerNumber || customer.code;

    const matchesSearch =
      searchTerm === '' ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customerCode &&
        customerCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm));

    const matchesType = typeFilter === '' || customer.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      // Get the default price level ID if none is selected
      const defaultPriceLevelId =
        priceLevels.length > 0
          ? (priceLevels.find((level) => level.isDefault) || priceLevels[0])._id
          : 'retail';

      // Make sure priceLevel is set
      if (!data.priceLevel) {
        data.priceLevel = defaultPriceLevelId;
      }

      // Generate a customer number if not provided
      const generateCustomerNumber = () => {
        // Format: CT-XXXXX (where CT is customer type prefix and XXXXX is a random number)
        const typePrefix = (data.type || CustomerType.RETAIL)
          .substring(0, 2)
          .toUpperCase();
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        return `${typePrefix}-${randomNum}`;
      };

      // Prepare the data for API submission
      const customerData = {
        ...data,
        // Ensure required fields are present
        customerNumber: data.code || generateCustomerNumber(), // Use code as customerNumber or generate one
        type: data.type || CustomerType.RETAIL, // Updated to match server-side enum
        priceLevel: data.priceLevel, // Already ensured above
        // If address is provided, include it, otherwise send an empty array
        addresses: data.address ? [data.address] : [],
      };

      // Log the data being sent to the API for debugging
      console.log('Submitting customer data:', customerData);

      if (editingCustomerId) {
        // For updates, we don't need to include the customerNumber as it's already set
        const updateData = { ...customerData };
        if (!updateData.customerNumber) {
          delete updateData.customerNumber; // Remove if not explicitly set to avoid validation issues
        }

        await api.patch(`/customers/${editingCustomerId}`, updateData);
        showToast('Customer updated successfully', 'success');
      } else {
        // For new customers, ensure customerNumber is included
        const response = await api.post('/customers', customerData);
        console.log('API response:', response.data);
        showToast('Customer created successfully', 'success');
      }
      fetchCustomers();
      cancelAddEdit();
    } catch (error) {
      console.error('Error saving customer:', error);
      showToast('Error saving customer', 'error');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer._id);

    // Use firstName and lastName if available, otherwise split the name
    let firstName = customer.firstName;
    let lastName = customer.lastName;

    if (!firstName || !lastName) {
      const nameParts = customer.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Get the first address if available
    const address =
      customer.addresses && customer.addresses.length > 0
        ? customer.addresses[0]
        : customer.address;

    reset({
      firstName,
      lastName,
      code: customer.code || '', // Keep original code if available
      customerNumber: customer.customerNumber || customer.code || '', // Set customerNumber from either field
      type: customer.type as CustomerType,
      address: address,
      phone: customer.phone,
      email: customer.email,
      contactPerson: customer.contactPerson,
      priceLevel: customer.priceLevel || 'retail',
      creditLimit: customer.creditLimit,
      taxId: customer.taxId,
      notes: customer.notes,
      isActive: customer.isActive,
      isVIP: customer.isVIP,
    });
    setIsAddingCustomer(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        showToast('Customer deleted successfully', 'success');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        showToast('Error deleting customer', 'error');
      }
    }
  };

  const handleSetVIP = async (id: string) => {
    try {
      await api.patch(`/customers/${id}/set-vip`);
      showToast('VIP status updated successfully', 'success');
      fetchCustomers();
    } catch (error) {
      console.error('Error setting VIP status:', error);
      showToast('Error setting VIP status', 'error');
    }
  };

  const cancelAddEdit = () => {
    setIsAddingCustomer(false);
    setEditingCustomerId(null);

    // Get the default price level ID
    const defaultPriceLevelId =
      priceLevels.length > 0
        ? (priceLevels.find((level) => level.isDefault) || priceLevels[0])._id
        : 'retail';

    reset({
      firstName: '',
      lastName: '',
      code: '',
      customerNumber: '',
      type: CustomerType.RETAIL, // Updated to match server-side enum
      priceLevel: defaultPriceLevelId, // Use the default price level
      phone: '',
      isActive: true,
      isVIP: false,
    });
  };

  const getCustomerTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPriceLevelName = (id?: string) => {
    if (!id) return 'Default';
    const priceLevel = priceLevels.find((level) => level._id === id);
    return priceLevel ? priceLevel.name : 'Unknown';
  };

  const hasAddress = watch('address');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <div className="flex space-x-3">
          {!isAddingCustomer && (
            <>
              <Button variant="outline" onClick={() => navigate('/sales')}>
                View Sales
              </Button>
              <Button variant="outline" onClick={() => navigate('/invoices')}>
                View Invoices
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsAddingCustomer(true)}
              >
                Add New Customer
              </Button>
            </>
          )}
        </div>
      </div>

      {isAddingCustomer && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingCustomerId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Customer Code"
                        placeholder="Enter customer code (leave blank for auto-generation)"
                        error={errors.code?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                {/* Hidden field for customerNumber */}
                <Controller
                  name="customerNumber"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />
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
                    name="contactPerson"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Contact Person"
                        placeholder="Enter contact person name"
                        error={errors.contactPerson?.message}
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
                        value={
                          field.value ||
                          (priceLevels.length > 0
                            ? priceLevels[0]._id
                            : 'retail')
                        }
                        onChange={(e) => {
                          console.log('Selected price level:', e.target.value);
                          field.onChange(
                            e.target.value ||
                              (priceLevels.length > 0
                                ? priceLevels[0]._id
                                : 'retail')
                          );
                        }}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="creditLimit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Credit Limit (₦)"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter credit limit"
                        error={errors.creditLimit?.message}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="taxId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Tax ID"
                        placeholder="Enter tax ID"
                        error={errors.taxId?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Checkbox
                      checked={!!hasAddress}
                      onChange={(e) => {
                        if (e.target.checked) {
                          reset({
                            ...watch(),
                            address: {
                              street: '',
                              city: '',
                              state: '',
                              country: 'Nigeria',
                            },
                          });
                        } else {
                          reset({
                            ...watch(),
                            address: undefined,
                          });
                        }
                      }}
                      label="Add Address"
                    />
                  </div>
                </div>
                {hasAddress && (
                  <>
                    <div>
                      <Controller
                        name="address.street"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Street"
                            placeholder="Enter street address"
                            error={errors.address?.street?.message}
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
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label="Notes"
                        placeholder="Enter any additional notes"
                        rows={3}
                        error={errors.notes?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="isVIP"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="VIP Customer"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Active"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={cancelAddEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  {editingCustomerId ? 'Update Customer' : 'Create Customer'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, code, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="All Types"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...Object.values(CustomerType).map((type) => ({
                    value: type,
                    label: getCustomerTypeLabel(type),
                  })),
                ]}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price Level
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id}
                      className={!customer.isActive ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName && customer.lastName
                              ? `${customer.firstName} ${customer.lastName}`
                              : customer.name}
                          </div>
                          {customer.isVIP && (
                            <Badge color="purple" className="ml-2">
                              VIP
                            </Badge>
                          )}
                        </div>
                        {(customer.customerNumber || customer.code) && (
                          <div className="text-sm text-gray-500">
                            {customer.customerNumber || customer.code}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCustomerTypeLabel(customer.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.phone || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getPriceLevelName(customer.priceLevel)}
                        </div>
                        {customer.creditLimit && (
                          <div className="text-sm text-gray-500">
                            Credit: ₦{customer.creditLimit.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.isActive ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!customer.isVIP && (
                            <Button
                              variant="text"
                              onClick={() => handleSetVIP(customer._id)}
                            >
                              Set VIP
                            </Button>
                          )}
                          <Button
                            variant="text"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            color="danger"
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">
                No customers found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || typeFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first customer to get started.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomersList;
