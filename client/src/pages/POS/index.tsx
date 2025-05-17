import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart, processPayment } from '@/store/slices/pos.slice';
import { Product } from '@/types/product.types';
import { Button, Input, Table } from '@/components/common';
import PosService from '@/services/pos.service';

const POSPage = () => {
  const dispatch = useAppDispatch();
  const { cart, total } = useAppSelector((state) => state.pos);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await PosService.getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
  };

  const handlePayment = async () => {
    try {
      await dispatch(processPayment()).unwrap();
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="pos-container">
      <div className="product-search">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="product-list">
        {products
          .filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <Button onClick={() => handleAddToCart(product)}>
                Add to Cart
              </Button>
            </div>
          ))}
      </div>

      <div className="cart-section">
        <h2>Shopping Cart</h2>
        <Table
          columns={['Name', 'Price', 'Quantity']}
          data={cart.map((item) => [
            item.product.name,
            `$${item.product.price}`,
            item.quantity,
          ])}
        />
        <div className="total">Total: ${total}</div>
        <Button variant="primary" onClick={handlePayment}>
          Process Payment
        </Button>
      </div>
    </div>
  );
};

export default POSPage;
