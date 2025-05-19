import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types/product';
import Input from '@/components/common/Input/Input';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface ProductSearchProps {
  onSelect?: (product: Product) => void;
  onChange?: (product: Product) => void;
  value?: Product | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ProductSearch = ({
  onSelect,
  onChange,
  value,
  placeholder = 'Search products by name, SKU, or barcode',
  className = '',
  disabled = false,
}: ProductSearchProps) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch products instead of medications
        const response = await api.get('/products');
        console.log('ProductSearch - API response:', response.data);

        let productsArray: Product[] = [];

        if (response.data && response.data.data && response.data.data.products) {
          // Handle the products array nested in data.products
          productsArray = response.data.data.products;
        } else if (response.data && response.data.data) {
          productsArray = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          productsArray = response.data;
        } else {
          console.warn('Unexpected API response structure:', response.data);
        }

        // Process products to ensure they have required fields
        const processedProducts = productsArray.map((product) => ({
          ...product,
          _id: product._id || '',
          name: product.name || 'Unknown Product',
          sku: product.sku || 'No SKU',
          defaultPrice: product.defaultPrice || 0,
          costPrice: product.costPrice || 0,
          totalStock: product.totalStock || 0,
        }));

        console.log('ProductSearch - Processed products:', processedProducts);
        setProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        showToast('Error loading products', 'error');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    // Make sure products is an array before filtering
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      setFilteredProducts([]);
      return;
    }

    try {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product &&
          ((product.name && product.name.toLowerCase().includes(term)) ||
            (product.sku && product.sku.toLowerCase().includes(term)) ||
            (product.barcode && product.barcode.toLowerCase().includes(term)))
      );
      setFilteredProducts(filtered);
      console.log('Filtered products:', filtered.length);

      // If no products found, show a message
      if (filtered.length === 0) {
        console.log('No products found matching:', term);
      }
    } catch (error) {
      console.error('Error filtering products:', error);
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectProduct = (product: Product) => {
    console.log('ProductSearch - Selected product:', product);

    // Ensure the product has all required fields
    const processedProduct = {
      ...product,
      _id: product._id || '',
      name: product.name || 'Unknown Product',
      sku: product.sku || 'No SKU',
      defaultPrice: product.defaultPrice || 0,
      costPrice: product.costPrice || product.defaultPrice || 0,
      totalStock: product.totalStock || 0,
    };

    // Call the appropriate callback
    if (onChange) {
      onChange(processedProduct);
    } else if (onSelect) {
      onSelect(processedProduct);
    }

    // Show success message
    showToast(`Product ${processedProduct.name} selected`, 'success');

    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => setShowDropdown(true)}
        disabled={disabled}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
        </div>
      )}
      {showDropdown && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        >
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-500">
                SKU: {product.sku} | Stock: {product.totalStock} | Price: ₦{product.costPrice || product.defaultPrice}
              </div>
            </div>
          ))}
        </div>
      )}
      {showDropdown && searchTerm && filteredProducts.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center text-gray-500">
          No products found
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
