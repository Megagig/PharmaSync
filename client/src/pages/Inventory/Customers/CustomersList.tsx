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
  name: string;
  code: string;
  type: string;
  address?: CustomerAddress;
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
  INDIVIDUAL = 'individual',
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  PHARMACY = 'pharmacy',
  CORPORATE = 'corporate',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

interface PriceLevel {
  _id: string;
  name: string;
  code: string;
}

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  type: z.nativeEnum(CustomerType),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('Nigeria'),
  }).optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPerson: z.string().optional(),
  priceLevel: z.string().optional(),
  creditLimit: z.number().nonnegative('Credit limit must be non-negative').optional(),
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
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      type: CustomerType.INDIVIDUAL,
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
      const response = await api.get('/price-levels');
      setPriceLevels(response.data.data.priceLevels);
    } catch (error) {
      console.error('Error fetching price levels:', error);
      showToast('Error fetching price levels', 'error');
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchPriceLevels();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.code && customer.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm));
    
    const matchesType = typeFilter === '' || customer.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (editingCustomerId) {
        await api.patch(`/customers/${editingCustomerId}`, data);
        showToast('Customer updated successfully', 'success');
      } else {
        await api.post('/customers', data);
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
    reset({
      name: customer.name,
      code: customer.code,
      type: customer.type as CustomerType,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      contactPerson: customer.contactPerson,
      priceLevel: customer.priceLevel,
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
    reset();
  };

  const getCustomerTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriceLevelName = (id?: string) => {
    if (!id) return 'Default';
    const priceLevel = priceLevels.find(level => level._id === id);
    return priceLevel ? priceLevel.name : 'Unknown';
  };

  const hasAddress = watch('address');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <div className="flex space-x-3">
          {!isAddingCustomer && (
            <Button
              variant="primary"
              onClick={() => setIsAddingCustomer(true)}
            >
              Add New Customer
            </Button>
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
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Customer Name"
                        placeholder="Enter customer name"
                        error={errors.name?.message}
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
                        label="Code"
                        placeholder="Enter customer code (leave blank for auto-generation)"
                        error={errors.code?.message}
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
                        options={Object.values(CustomerType).map(type => ({
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
                        options={[
                          { value: '', label: 'Default' },
                          ...priceLevels.map(level => ({
                            value: level._id,
                            label: level.name,
                          })),
                        ]}
                        error={errors.priceLevel?.message}
                        {...field}
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
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                              postalCode: '',
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
                  ...Object.values(CustomerType).map(type => ({
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className={!customer.isActive ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          {customer.isVIP && (
                            <Badge color="purple" className="ml-2">VIP</Badge>
                          )}
                        </div>
                        {customer.code && (
                          <div className="text-sm text-gray-500">{customer.code}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getCustomerTypeLabel(customer.type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{customer.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getPriceLevelName(customer.priceLevel)}</div>
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
              <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || typeFilter ? 'Try adjusting your search criteria.' : 'Add your first customer to get started.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomersList;
