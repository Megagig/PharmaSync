import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Textarea from '@/components/common/Textarea/Textarea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import Spinner from '@/components/common/Spinner/Spinner';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

interface PriceLevel {
  _id: string;
  name: string;
  code: string;
  description?: string;
  markupPercentage?: number;
  markdownPercentage?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const priceLevelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  markupPercentage: z
    .number()
    .min(0, 'Markup percentage must be non-negative')
    .max(1000, 'Markup percentage cannot exceed 1000%')
    .optional(),
  markdownPercentage: z
    .number()
    .min(0, 'Markdown percentage must be non-negative')
    .max(100, 'Markdown percentage cannot exceed 100%')
    .optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type PriceLevelFormData = z.infer<typeof priceLevelSchema>;

const PriceManagementList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([]);
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PriceLevelFormData>({
    resolver: zodResolver(priceLevelSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      markupPercentage: undefined,
      markdownPercentage: undefined,
      isDefault: false,
      isActive: true,
    },
  });

  const fetchPriceLevels = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/price-levels');
      setPriceLevels(response.data.data.priceLevels);
    } catch (error) {
      console.error('Error fetching price levels:', error);
      showToast('Error fetching price levels', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLevels();
  }, []);

  const onSubmit = async (data: PriceLevelFormData) => {
    try {
      if (editingLevelId) {
        await api.patch(`/price-levels/${editingLevelId}`, data);
        showToast('Price level updated successfully', 'success');
      } else {
        await api.post('/price-levels', data);
        showToast('Price level created successfully', 'success');
      }
      fetchPriceLevels();
      cancelAddEdit();
    } catch (error) {
      console.error('Error saving price level:', error);
      showToast('Error saving price level', 'error');
    }
  };

  const handleEditLevel = (level: PriceLevel) => {
    setEditingLevelId(level._id);
    reset({
      name: level.name,
      code: level.code,
      description: level.description,
      markupPercentage: level.markupPercentage,
      markdownPercentage: level.markdownPercentage,
      isDefault: level.isDefault,
      isActive: level.isActive,
    });
    setIsAddingLevel(true);
  };

  const handleDeleteLevel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this price level?')) {
      try {
        await api.delete(`/price-levels/${id}`);
        showToast('Price level deleted successfully', 'success');
        fetchPriceLevels();
      } catch (error) {
        console.error('Error deleting price level:', error);
        showToast('Error deleting price level', 'error');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/price-levels/${id}/set-default`);
      showToast('Default price level updated successfully', 'success');
      fetchPriceLevels();
    } catch (error) {
      console.error('Error setting default price level:', error);
      showToast('Error setting default price level', 'error');
    }
  };

  const cancelAddEdit = () => {
    setIsAddingLevel(false);
    setEditingLevelId(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Price Management
        </h1>
        <div className="flex space-x-3">
          {!isAddingLevel && (
            <Button variant="primary" onClick={() => setIsAddingLevel(true)}>
              Create Price Level
            </Button>
          )}
        </div>
      </div>

      {isAddingLevel && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingLevelId ? 'Edit Price Level' : 'Create Price Level'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Name"
                        placeholder="e.g., Retail, Wholesale, VIP"
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
                        placeholder="e.g., RET, WHL, VIP (leave blank for auto-generation)"
                        error={errors.code?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="markupPercentage"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Markup Percentage (%)"
                        type="number"
                        min={0}
                        max={1000}
                        step={0.01}
                        placeholder="Enter markup percentage"
                        error={errors.markupPercentage?.message}
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
                    name="markdownPercentage"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Markdown Percentage (%)"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        placeholder="Enter markdown percentage"
                        error={errors.markdownPercentage?.message}
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
                <div className="md:col-span-2">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label="Description"
                        placeholder="Enter description"
                        rows={3}
                        error={errors.description?.message}
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
                        label="Set as Default Price Level"
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
                  {editingLevelId ? 'Update Price Level' : 'Create Price Level'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Price Levels
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : priceLevels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
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
                      Markup/Markdown
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
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
                  {priceLevels.map((level) => (
                    <tr
                      key={level._id}
                      className={!level.isActive ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {level.name}
                          </div>
                          {level.isDefault && (
                            <Badge color="blue" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {level.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {level.markupPercentage
                            ? `+${level.markupPercentage}%`
                            : ''}
                          {level.markupPercentage && level.markdownPercentage
                            ? ' / '
                            : ''}
                          {level.markdownPercentage
                            ? `-${level.markdownPercentage}%`
                            : ''}
                          {!level.markupPercentage && !level.markdownPercentage
                            ? 'None'
                            : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {level.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {level.isActive ? (
                          <Badge color="green">Active</Badge>
                        ) : (
                          <Badge color="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!level.isDefault && (
                            <Button
                              variant="text"
                              onClick={() => handleSetDefault(level._id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="text"
                            onClick={() => handleEditLevel(level)}
                          >
                            Edit
                          </Button>
                          {!level.isDefault && (
                            <Button
                              variant="text"
                              color="danger"
                              onClick={() => handleDeleteLevel(level._id)}
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
                No price levels found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Create price levels to set different pricing for different
                customer types.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PriceManagementList;
