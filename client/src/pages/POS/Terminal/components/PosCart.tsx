import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  batchNumber?: string;
}

interface PosCartProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: string, value: any) => void;
}

const PosCart: React.FC<PosCartProps> = ({
  items,
  onRemoveItem,
  onUpdateItem,
}) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.productId}-${index}`}
            className="bg-gray-50 rounded-lg p-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                {item.batchNumber && (
                  <p className="text-sm text-gray-500">
                    Batch: {item.batchNumber}
                  </p>
                )}
              </div>
              <Button
                variant="text"
                size="sm"
                onClick={() => onRemoveItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(index, 'quantity', Number(e.target.value))
                  }
                  min="0.01"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Price</label>
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    onUpdateItem(index, 'unitPrice', Number(e.target.value))
                  }
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Discount (%)</label>
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    onUpdateItem(index, 'discount', Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items in cart
          </div>
        )}
      </div>
    </div>
  );
};

export default PosCart;
