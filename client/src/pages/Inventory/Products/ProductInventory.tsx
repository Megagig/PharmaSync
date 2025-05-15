import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Spinner from '@/components/common/Spinner/Spinner';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { Product, ProductInventoryItem } from '@/types/product';
import api from '@/services/api';

const inventoryItemSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  location: z.string().min(1, 'Location is required'),
  costPrice: z.number().min(0, 'Cost price must be non-negative'),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

const ProductInventory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      batchNumber: '',
      expiryDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      location: '',
      costPrice: 0,
    },
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        setLocations(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        showToast('Error fetching locations', 'error');
      }
    };

    fetchLocations();
  }, [showToast]);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/products/${id}`);
          setProduct(response.data.data);
        } catch (error) {
          console.error('Error fetching product:', error);
          showToast('Error fetching product details', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, showToast]);

  const onSubmit = async (data: InventoryItemFormData) => {
    try {
      if (isEditingItem) {
        // Update existing inventory item
        await api.patch(`/products/${id}/inventory/${isEditingItem}`, data);
        showToast('Inventory item updated successfully', 'success');
      } else {
        // Add new inventory item
        await api.post(`/products/${id}/inventory`, data);
        showToast('Inventory item added successfully', 'success');
      }
      
      // Refresh product data
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
      
      // Reset form and state
      reset();
      setIsAddingItem(false);
      setIsEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      showToast('Error saving inventory item', 'error');
    }
  };

  const handleEditItem = (item: ProductInventoryItem) => {
    setIsEditingItem(item._id || null);
    reset({
      batchNumber: item.batchNumber,
      expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],
      quantity: item.quantity,
      location: item.location,
      costPrice: item.costPrice,
    });
    setIsAddingItem(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await api.delete(`/products/${id}/inventory/${itemId}`);
        showToast('Inventory item deleted successfully', 'success');
        
        // Refresh product data
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        showToast('Error deleting inventory item', 'error');
      }
    }
  };

  const handleAdjustInventory = async (itemId: string, adjustment: number) => {
    if (!product) return;
    
    const item = product.inventory.find(i => i._id === itemId);
    if (!item) return;
    
    const reason = prompt('Enter reason for adjustment:');
    if (reason === null) return; // User cancelled
    
    try {
      await api.post('/inventory/adjust', {
        productId: id,
        batchNumber: item.batchNumber,
        quantity: adjustment,
        reason,
        location: item.location,
      });
      
      showToast('Inventory adjusted successfully', 'success');
      
      // Refresh product data
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      showToast('Error adjusting inventory', 'error');
    }
  };

  const cancelAddEdit = () => {
    setIsAddingItem(false);
    setIsEditingItem(null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/products')}
          >
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Inventory: {product.name}
        </h1>
        <div className="flex space-x-3">
          {!isAddingItem && (
            <Button
              variant="primary"
              onClick={() => setIsAddingItem(true)}
            >
              Add Inventory
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/products')}
          >
            Back to Products
          </Button>
        </div>
      </div>

      {isAddingItem && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isEditingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    name="batchNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Batch Number"
                        placeholder="Enter batch number"
                        error={errors.batchNumber?.message}
                        required
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="expiryDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Expiry Date"
                        type="date"
                        error={errors.expiryDate?.message}
                        required
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Quantity"
                        type="number"
                        min={0}
                        placeholder="Enter quantity"
                        error={errors.quantity?.message}
                        required
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Location"
                        options={locations.map(loc => ({
                          value: loc._id,
                          label: loc.name,
                        }))}
                        error={errors.location?.message}
                        required
                        {...field}
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
                  {isEditingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Current Inventory
          </h2>
          
          {product.inventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Price
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
                  {product.inventory.map((item) => {
                    const expiryDate = new Date(item.expiryDate);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isExpired = daysUntilExpiry <= 0;
                    const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 90;
                    
                    const locationName = locations.find(loc => loc._id === item.location)?.name || item.location;
                    
                    return (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.batchNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                          {isExpired ? (
                            <Badge color="red">Expired</Badge>
                          ) : isExpiringSoon ? (
                            <Badge color="yellow">Expires in {daysUntilExpiry} days</Badge>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{locationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₦{item.costPrice.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.quantity <= 0 ? (
                            <Badge color="red">Out of Stock</Badge>
                          ) : item.quantity <= product.reorderPoint ? (
                            <Badge color="yellow">Low Stock</Badge>
                          ) : (
                            <Badge color="green">In Stock</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="text"
                              onClick={() => handleAdjustInventory(item._id || '', 1)}
                              title="Increase by 1"
                            >
                              +1
                            </Button>
                            <Button
                              variant="text"
                              onClick={() => handleAdjustInventory(item._id || '', -1)}
                              title="Decrease by 1"
                              disabled={item.quantity <= 0}
                            >
                              -1
                            </Button>
                            <Button
                              variant="text"
                              onClick={() => handleEditItem(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="text"
                              color="danger"
                              onClick={() => handleDeleteItem(item._id || '')}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No inventory items found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add inventory items to track stock levels and expiry dates.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProductInventory;
