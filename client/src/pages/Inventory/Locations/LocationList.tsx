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

enum LocationType {
  MAIN_STORE = 'main_store',
  DISPENSING_AREA = 'dispensing_area',
  REFRIGERATED = 'refrigerated',
  CONTROLLED_SUBSTANCES = 'controlled_substances',
  BRANCH = 'branch',
  WAREHOUSE = 'warehouse',
  OTHER = 'other',
}

interface LocationAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Location {
  _id: string;
  name: string;
  code: string;
  type: LocationType;
  address?: LocationAddress;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  parentLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  type: z.nativeEnum(LocationType),
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
  manager: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  notes: z.string().optional(),
  parentLocation: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

const LocationList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null
  );
  const [parentLocations, setParentLocations] = useState<Location[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: LocationType.MAIN_STORE,
      isActive: true,
      isDefault: false,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
      },
    },
  });

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/locations');

      // Check if the response has the expected structure
      if (response.data.data && Array.isArray(response.data.data.locations)) {
        setLocations(response.data.data.locations);

        // Set parent locations (all active locations)
        const activeLocations = response.data.data.locations.filter(
          (loc: Location) => loc.isActive
        );
        setParentLocations(activeLocations);
      } else {
        console.error('Unexpected API response format:', response.data);
        showToast('Error processing location data', 'error');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast('Error fetching locations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      searchTerm === '' ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === '' || location.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (editingLocationId) {
        await api.patch(`/locations/${editingLocationId}`, data);
        showToast('Location updated successfully', 'success');
      } else {
        await api.post('/locations', data);
        showToast('Location created successfully', 'success');
      }
      fetchLocations();
      cancelAddEdit();
    } catch (error) {
      console.error('Error saving location:', error);
      showToast('Error saving location', 'error');
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocationId(location._id);
    reset({
      name: location.name,
      code: location.code,
      type: location.type,
      address: location.address,
      phone: location.phone,
      email: location.email,
      manager: location.manager,
      isActive: location.isActive,
      isDefault: location.isDefault,
      notes: location.notes,
      parentLocation: location.parentLocation,
    });
    setIsAddingLocation(true);
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await api.delete(`/locations/${id}`);
        showToast('Location deleted successfully', 'success');
        fetchLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
        showToast('Error deleting location', 'error');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/locations/${id}/set-default`);
      showToast('Default location updated successfully', 'success');
      fetchLocations();
    } catch (error) {
      console.error('Error setting default location:', error);
      showToast('Error setting default location', 'error');
    }
  };

  const cancelAddEdit = () => {
    setIsAddingLocation(false);
    setEditingLocationId(null);
    reset();
  };

  const getLocationTypeLabel = (type: LocationType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getParentLocationName = (parentId?: string) => {
    if (!parentId) return 'None';
    const parent = locations.find((loc) => loc._id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const hasAddress = watch('address');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Inventory Locations
        </h1>
        <div className="flex space-x-3">
          {!isAddingLocation && (
            <Button variant="primary" onClick={() => setIsAddingLocation(true)}>
              Add New Location
            </Button>
          )}
        </div>
      </div>

      {isAddingLocation && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingLocationId ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Location Name"
                        placeholder="Enter location name"
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
                        placeholder="Enter location code (leave blank for auto-generation)"
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
                        label="Location Type"
                        options={Object.values(LocationType).map((type) => ({
                          value: type,
                          label: getLocationTypeLabel(type),
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
                    name="parentLocation"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Parent Location"
                        options={[
                          { value: '', label: 'None' },
                          ...parentLocations
                            .filter((loc) => loc._id !== editingLocationId)
                            .map((loc) => ({
                              value: loc._id,
                              label: loc.name,
                            })),
                        ]}
                        error={errors.parentLocation?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="manager"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Manager"
                        placeholder="Enter location manager"
                        error={errors.manager?.message}
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
                    name="isDefault"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Set as Default Location"
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
                  {editingLocationId ? 'Update Location' : 'Create Location'}
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
                  ...Object.values(LocationType).map((type) => ({
                    value: type,
                    label: getLocationTypeLabel(type),
                  })),
                ]}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredLocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Code
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
                      Parent
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Manager
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
                  {filteredLocations.map((location) => (
                    <tr
                      key={location._id}
                      className={!location.isActive ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {location.name}
                          </div>
                          {location.isDefault && (
                            <Badge color="blue" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {location.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getLocationTypeLabel(location.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getParentLocationName(location.parentLocation)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {location.manager || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {location.isActive ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!location.isDefault && (
                            <Button
                              variant="text"
                              onClick={() => handleSetDefault(location._id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="text"
                            onClick={() => handleEditLocation(location)}
                          >
                            Edit
                          </Button>
                          {!location.isDefault && (
                            <Button
                              variant="text"
                              color="danger"
                              onClick={() => handleDeleteLocation(location._id)}
                            >
                              Delete
                            </Button>
                          )}
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
                No locations found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || typeFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Create your first location to get started.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LocationList;
