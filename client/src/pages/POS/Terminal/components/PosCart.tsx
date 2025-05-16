import { useState } from 'react';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import { formatCurrency } from '@/utils/formatters';

interface PosCartProps {
  items: any[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: string, value: any) => void;
}

const PosCart = ({ items, onRemoveItem, onUpdateItem }: PosCartProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editUnitPrice, setEditUnitPrice] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);

  const handleEdit = (index: number) => {
    const item = items[index];
    setEditQuantity(item.quantity);
    setEditUnitPrice(item.unitPrice);
    setEditDiscount(item.discount);
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      onUpdateItem(editingIndex, 'quantity', editQuantity);
      onUpdateItem(editingIndex, 'unitPrice', editUnitPrice);
      onUpdateItem(editingIndex, 'discount', editDiscount);
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Cart Items</h2>
        <span className="text-sm text-gray-600">{items.length} items</span>
      </div>
      
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p>Cart is empty</p>
            <p className="text-sm mt-1">Add products to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="border rounded-md p-3 bg-gray-50 relative"
              >
                {editingIndex === index ? (
                  <div className="space-y-2">
                    <div className="font-medium">
                      {item.productDetails?.name || 'Product'}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        label="Quantity"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Number(e.target.value))}
                        min="0.01"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Unit Price (₦)"
                        value={editUnitPrice}
                        onChange={(e) => setEditUnitPrice(Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Discount (₦)"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      onClick={() => onRemoveItem(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="pr-6">
                      <div className="font-medium">
                        {item.productDetails?.name || 'Product'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                        {item.discount > 0 && ` - ${formatCurrency(item.discount)} discount`}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </Button>
                        <span className="font-medium">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PosCart;
