import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { useToast } from '@/hooks/useToast';
import { ProductType, ProductCategory } from '@/types/product';
import api from '@/services/api';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(Object.values(ProductType) as [string, ...string[]]),
  category: z
    .enum(Object.values(ProductCategory) as [string, ...string[]])
    .or(z.string()),
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  costPrice: z.number().min(0, 'Cost price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  wholesalePrice: z
    .number()
    .min(0, 'Wholesale price must be non-negative')
    .optional(),
  retailPrice: z
    .number()
    .min(0, 'Retail price must be non-negative')
    .optional(),
  defaultPrice: z.number().min(0, 'Price must be non-negative'),
  minimumStockLevel: z
    .number()
    .int()
    .min(0, 'Minimum stock level must be non-negative'),
  maximumStockLevel: z
    .number()
    .int()
    .min(0, 'Maximum stock level must be non-negative')
    .optional(),
  reorderPoint: z.number().int().min(0, 'Reorder point must be non-negative'),
  reorderQuantity: z
    .number()
    .int()
    .min(0, 'Reorder quantity must be non-negative')
    .optional(),
  isActive: z.boolean().default(true),
  isTaxable: z.boolean().default(true),
  taxRate: z
    .number()
    .min(0, 'Tax rate must be non-negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .optional(),
  notes: z.string().optional(),
  medicationId: z.string().optional(),
  customType: z.string().optional(),
  customCategory: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [showCustomType, setShowCustomType] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Get the returnTo parameter from the URL query string
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      type: ProductType.MEDICATION,
      category: ProductCategory.ANALGESIC,
      requiresPrescription: false,
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      retailPrice: 0,
      defaultPrice: 0,
      minimumStockLevel: 10,
      reorderPoint: 5,
      isActive: true,
      isTaxable: true,
      customType: '',
      customCategory: '',
    },
  });

  const productType = watch('type');

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await api.get('/medications');
        setMedications(response.data.data);
      } catch (error) {
        console.error('Error fetching medications:', error);
        showToast('Error fetching medications', 'error');
      }
    };

    fetchMedications();
  }, [showToast]);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/products/${id}`);
          reset(response.data.data);
        } catch (error) {
          console.error('Error fetching product:', error);
          showToast('Error fetching product details', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, reset, showToast]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Handle custom type and category
      const formData = { ...data };

      if (showCustomType && formData.customType) {
        formData.type = formData.customType;
      }

      if (showCustomCategory && formData.customCategory) {
        formData.category = formData.customCategory;
      }

      // Remove custom fields before sending to API
      delete formData.customType;
      delete formData.customCategory;

      let createdProduct;

      if (id) {
        await api.patch(`/products/${id}`, formData);
        showToast('Product updated successfully', 'success');
      } else {
        const response = await api.post('/products', formData);
        createdProduct = response.data.data;
        showToast('Product created successfully', 'success');
      }

      // If returnTo is specified, navigate back to that page, otherwise go to products list
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/inventory/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Error saving product', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Product Name"
                    placeholder="Enter product name"
                    error={errors.name?.message}
                    required
                    {...field}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SKU"
                    placeholder="Enter SKU (leave blank for auto-generation)"
                    error={errors.sku?.message}
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
                    label="Product Type"
                    options={[
                      ...Object.values(ProductType).map((type) => ({
                        value: type,
                        label: type
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      })),
                      { value: 'custom', label: 'Add Custom Type' },
                    ]}
                    error={errors.type?.message}
                    required
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value === 'custom') {
                        // Show custom type input
                        setShowCustomType(true);
                      } else {
                        setShowCustomType(false);
                      }
                    }}
                  />
                )}
              />
            </div>

            {watch('type') === 'custom' && (
              <div>
                <Controller
                  name="customType"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Custom Product Type"
                      placeholder="Enter custom product type"
                      error={errors.customType?.message}
                      required
                      {...field}
                    />
                  )}
                />
              </div>
            )}

            <div>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Category"
                    options={[
                      ...Object.values(ProductCategory).map((category) => ({
                        value: category,
                        label: category
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      })),
                      { value: 'custom', label: 'Add Custom Category' },
                    ]}
                    error={errors.category?.message}
                    required
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value === 'custom') {
                        // Show custom category input
                        setShowCustomCategory(true);
                      } else {
                        setShowCustomCategory(false);
                      }
                    }}
                  />
                )}
              />
            </div>

            {watch('category') === 'custom' && (
              <div>
                <Controller
                  name="customCategory"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Custom Category"
                      placeholder="Enter custom category"
                      error={errors.customCategory?.message}
                      required
                      {...field}
                    />
                  )}
                />
              </div>
            )}

            <div>
              <Controller
                name="barcode"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Barcode"
                    placeholder="Enter barcode"
                    error={errors.barcode?.message}
                    {...field}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Brand"
                    placeholder="Enter brand name"
                    error={errors.brand?.message}
                    {...field}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="manufacturer"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Manufacturer"
                    placeholder="Enter manufacturer"
                    error={errors.manufacturer?.message}
                    {...field}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="costPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Cost Price (₦)"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter cost price"
                    error={errors.costPrice?.message}
                    required
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="sellingPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Selling Price (₦)"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter selling price"
                    error={errors.sellingPrice?.message}
                    required
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="wholesalePrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Wholesale Price (₦)"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter wholesale price (optional)"
                    error={errors.wholesalePrice?.message}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="retailPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Retail Price (₦)"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter retail price (optional)"
                    error={errors.retailPrice?.message}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="defaultPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Default Price (₦)"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter default price"
                    error={errors.defaultPrice?.message}
                    required
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="minimumStockLevel"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Minimum Stock Level"
                    type="number"
                    min={0}
                    placeholder="Enter minimum stock level"
                    error={errors.minimumStockLevel?.message}
                    required
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="reorderPoint"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Reorder Point"
                    type="number"
                    min={0}
                    placeholder="Enter reorder point"
                    error={errors.reorderPoint?.message}
                    required
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="reorderQuantity"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Reorder Quantity"
                    type="number"
                    min={0}
                    placeholder="Enter reorder quantity"
                    error={errors.reorderQuantity?.message}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="maximumStockLevel"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Maximum Stock Level"
                    type="number"
                    min={0}
                    placeholder="Enter maximum stock level"
                    error={errors.maximumStockLevel?.message}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>

            {productType === ProductType.MEDICATION && (
              <div>
                <Controller
                  name="medicationId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Link to Medication"
                      options={[
                        { value: '', label: 'None' },
                        ...medications.map((med) => ({
                          value: med._id,
                          label: `${med.name} ${med.strength || ''} ${
                            med.dosageForm || ''
                          }`.trim(),
                        })),
                      ]}
                      error={errors.medicationId?.message}
                      {...field}
                    />
                  )}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Description"
                    placeholder="Enter product description"
                    rows={3}
                    error={errors.description?.message}
                    {...field}
                  />
                )}
              />
            </div>

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
                name="requiresPrescription"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Requires Prescription"
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

            <div>
              <Controller
                name="isTaxable"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Taxable"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {watch('isTaxable') && (
              <div>
                <Controller
                  name="taxRate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Tax Rate (%)"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      placeholder="Enter tax rate"
                      error={errors.taxRate?.message}
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
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/inventory/products')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {id ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm;
