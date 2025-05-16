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

interface SupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface SupplierContact {
  name: string;
  position: string;
  phone: string;
  email: string;
}

interface Supplier {
  _id: string;
  name: string;
  code: string;
  type: string;
  contactPerson: string;
  address?: SupplierAddress;
  phone?: string;
  email?: string;
  website?: string;
  contacts?: SupplierContact[];
  paymentTerms?: string;
  creditLimit?: number;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  isPreferred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  WHOLESALER = 'wholesaler',
  IMPORTER = 'importer',
  OTHER = 'other',
}

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  type: z.nativeEnum(SupplierType),
  contactPerson: z.string().min(1, 'Contact person is required'),
  address: z
    .object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().default('Nigeria'),
    })
    .optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  paymentTerms: z.string().optional(),
  creditLimit: z
    .number()
    .nonnegative('Credit limit must be non-negative')
    .optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  isPreferred: z.boolean().default(false),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const SuppliersList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      type: SupplierType.DISTRIBUTOR,
      contactPerson: '',
      isActive: true,
      isPreferred: false,
    },
  });

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/suppliers');
      // Check if the response has the expected structure
      if (response.data && response.data.data && response.data.data.suppliers) {
        setSuppliers(response.data.data.suppliers);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where API returns array directly
        setSuppliers(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Handle case where API returns data property as array
        setSuppliers(response.data.data);
      } else {
        // If we can't find suppliers in the response, set to empty array
        console.error('Unexpected API response format:', response.data);
        setSuppliers([]);
        showToast('Unexpected API response format', 'error');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showToast('Error fetching suppliers', 'error');
      setSuppliers([]); // Ensure suppliers is always an array
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Make sure suppliers is defined before filtering
  const filteredSuppliers = suppliers
    ? suppliers.filter((supplier) => {
        const matchesSearch =
          searchTerm === '' ||
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.code &&
            supplier.code.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = typeFilter === '' || supplier.type === typeFilter;

        return matchesSearch && matchesType;
      })
    : [];

  const onSubmit = async (data: SupplierFormData) => {
    try {
      // Make sure address is included
      if (!data.address) {
        data.address = {
          street: 'Default Street',
          city: 'Default City',
          state: 'Default State',
          postalCode: '00000',
          country: 'Nigeria',
        };
      }

      if (editingSupplierId) {
        await api.patch(`/suppliers/${editingSupplierId}`, data);
        showToast('Supplier updated successfully', 'success');
      } else {
        await api.post('/suppliers', data);
        showToast('Supplier created successfully', 'success');
      }
      fetchSuppliers();
      cancelAddEdit();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showToast('Error saving supplier', 'error');
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplierId(supplier._id);
    reset({
      name: supplier.name,
      code: supplier.code,
      type: supplier.type as SupplierType,
      contactPerson: supplier.contactPerson || '',
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      website: supplier.website,
      paymentTerms: supplier.paymentTerms,
      creditLimit: supplier.creditLimit,
      taxId: supplier.taxId,
      notes: supplier.notes,
      isActive: supplier.isActive,
      isPreferred: supplier.isPreferred,
    });
    setIsAddingSupplier(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        showToast('Supplier deleted successfully', 'success');
        fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        showToast('Error deleting supplier', 'error');
      }
    }
  };

  const handleSetPreferred = async (id: string) => {
    try {
      await api.patch(`/suppliers/${id}/set-preferred`);
      showToast('Preferred supplier updated successfully', 'success');
      fetchSuppliers();
    } catch (error) {
      console.error('Error setting preferred supplier:', error);
      showToast('Error setting preferred supplier', 'error');
    }
  };

  const cancelAddEdit = () => {
    setIsAddingSupplier(false);
    setEditingSupplierId(null);
    reset();
  };

  const getSupplierTypeLabel = (type: string) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const hasAddress = watch('address');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        <div className="flex space-x-3">
          {!isAddingSupplier && (
            <Button variant="primary" onClick={() => setIsAddingSupplier(true)}>
              Add New Supplier
            </Button>
          )}
        </div>
      </div>

      {isAddingSupplier && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingSupplierId ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Code"
                        placeholder="Enter supplier code (leave blank for auto-generation)"
                        error={errors.code?.message}
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
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Supplier Type"
                        options={Object.values(SupplierType).map((type) => ({
                          value: type,
                          label: getSupplierTypeLabel(type),
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
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Website"
                        placeholder="Enter website URL"
                        error={errors.website?.message}
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
                      <Input
                        label="Payment Terms"
                        placeholder="e.g., Net 30, COD"
                        error={errors.paymentTerms?.message}
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
                    name="isPreferred"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Preferred Supplier"
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
                  {editingSupplierId ? 'Update Supplier' : 'Create Supplier'}
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
                placeholder="Search by name or code"
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
                  ...Object.values(SupplierType).map((type) => ({
                    value: type,
                    label: getSupplierTypeLabel(type),
                  })),
                ]}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Supplier
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
                      Payment Terms
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
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier._id}
                      className={!supplier.isActive ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.name}
                          </div>
                          {supplier.isPreferred && (
                            <Badge color="blue" className="ml-2">
                              Preferred
                            </Badge>
                          )}
                        </div>
                        {supplier.code && (
                          <div className="text-sm text-gray-500">
                            {supplier.code}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSupplierTypeLabel(supplier.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.phone || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {supplier.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.paymentTerms || 'N/A'}
                        </div>
                        {supplier.creditLimit && (
                          <div className="text-sm text-gray-500">
                            Credit: ₦{supplier.creditLimit.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {supplier.isActive ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!supplier.isPreferred && (
                            <Button
                              variant="text"
                              onClick={() => handleSetPreferred(supplier._id)}
                            >
                              Set Preferred
                            </Button>
                          )}
                          <Button
                            variant="text"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            color="danger"
                            onClick={() => handleDeleteSupplier(supplier._id)}
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
                No suppliers found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || typeFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first supplier to get started.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuppliersList;
