import { useState, useEffect, useRef } from 'react';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import api from '@/services/api';
import SupplierForm from './SupplierForm';
import { useToast } from '@/hooks/useToast';

interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  supplierCode?: string;
}

interface SupplierSearchProps {
  onSelect: (supplier: Supplier) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SupplierSearch = ({
  onSelect,
  placeholder = 'Search suppliers by name, code, or contact person',
  className = '',
  disabled = false,
}: SupplierSearchProps) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching suppliers...');
        const response = await api.get('/suppliers');
        console.log('Supplier API response:', response.data);

        let suppliersData: Supplier[] = [];

        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          console.log(
            'Setting suppliers from response.data.data:',
            response.data.data.length
          );
          suppliersData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          console.log(
            'Setting suppliers from response.data array:',
            response.data.length
          );
          suppliersData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where API returns an object with suppliers
          const possibleArrays = Object.values(response.data).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            // Use the first array found
            suppliersData = possibleArrays[0] as Supplier[];
            console.log(
              'Found suppliers array in response object:',
              suppliersData.length
            );
          } else {
            console.warn(
              'No supplier arrays found in response object:',
              response.data
            );
          }
        } else {
          console.warn('Unexpected API response structure:', response.data);
        }

        // Ensure we have a valid array of suppliers
        if (!Array.isArray(suppliersData)) {
          console.warn(
            'Suppliers data is not an array, defaulting to empty array'
          );
          suppliersData = [];
        }

        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setSuppliers([]);
        showToast('Error loading suppliers', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [showToast]);

  // Filter suppliers based on search term
  useEffect(() => {
    if (!Array.isArray(suppliers)) {
      console.error('Suppliers is not an array:', suppliers);
      setFilteredSuppliers([]);
      return;
    }

    try {
      // If search term is empty, show all suppliers (limited to first 20 for performance)
      if (!searchTerm.trim()) {
        setFilteredSuppliers(suppliers.slice(0, 20));
        return;
      }

      // Otherwise filter by search term
      const term = searchTerm.toLowerCase();
      const filtered = suppliers.filter(
        (supplier) =>
          supplier &&
          ((supplier.name && supplier.name.toLowerCase().includes(term)) ||
            (supplier.contactPerson &&
              supplier.contactPerson.toLowerCase().includes(term)) ||
            (supplier.supplierCode &&
              supplier.supplierCode.toLowerCase().includes(term)) ||
            (supplier.phone && supplier.phone.toLowerCase().includes(term)) ||
            (supplier.email && supplier.email.toLowerCase().includes(term)))
      );
      setFilteredSuppliers(filtered);
    } catch (error) {
      console.error('Error filtering suppliers:', error);
      setFilteredSuppliers([]);
    }
  }, [searchTerm, suppliers]);

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

    // Log for debugging
    console.log('Suppliers:', suppliers.length);
    console.log('Filtered suppliers:', filteredSuppliers.length);
  };

  const handleSelectSupplier = (supplier: Supplier) => {
    console.log('Supplier selected from dropdown:', supplier);

    // Make sure the supplier object has all required fields
    const formattedSupplier = {
      _id: supplier._id,
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      supplierCode: supplier.supplierCode || '',
      // Add any other fields that might be needed
    };

    // Call the onSelect callback with the formatted supplier
    onSelect(formattedSupplier);

    // Update UI state
    setSearchTerm('');
    setShowDropdown(false);

    // Show a success message
    showToast(`Supplier ${formattedSupplier.name} selected`, 'success');
  };

  const handleCreateSupplier = async (supplierData: any) => {
    try {
      const response = await api.post('/suppliers', supplierData);
      console.log('Create supplier response:', response.data);

      let newSupplier;

      if (response.data && response.data.data) {
        newSupplier = response.data.data;
      } else if (response.data && response.data._id) {
        // Direct supplier object in response
        newSupplier = response.data;
      } else {
        throw new Error('Invalid response format from API');
      }

      // Add the new supplier to the list
      setSuppliers((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, newSupplier];
        } else {
          // Handle case where prev is not an array
          console.warn('Previous suppliers state is not an array:', prev);
          return [newSupplier];
        }
      });

      // Make sure the supplier object has all required fields
      const formattedSupplier = {
        _id: newSupplier._id,
        name: newSupplier.name || '',
        contactPerson: newSupplier.contactPerson || '',
        phone: newSupplier.phone || '',
        email: newSupplier.email || '',
        supplierCode: newSupplier.supplierCode || '',
        // Add any other fields that might be needed
      };

      console.log('Selecting newly created supplier:', formattedSupplier);

      // Select the newly created supplier
      onSelect(formattedSupplier);

      // Show success message
      showToast('Supplier created successfully', 'success');

      // Close the modal
      setShowCreateModal(false);
      setSearchTerm('');
    } catch (error: any) {
      console.error('Error creating supplier:', error);

      // Extract the specific error message if available
      let errorMessage = 'Failed to create supplier. Please try again.';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 'error' && error.message) {
        errorMessage = error.message;
      }

      // Show the specific error message
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        <div className="flex-1 relative">
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
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowCreateModal(true)}
          disabled={disabled}
        >
          New
        </Button>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        >
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier) => (
              <div
                key={supplier._id}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                onClick={() => handleSelectSupplier(supplier)}
              >
                <div className="font-medium">{supplier.name}</div>
                <div className="text-sm text-gray-500">
                  Contact: {supplier.contactPerson} |{' '}
                  {supplier.phone || 'No phone'}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">
              {searchTerm ? 'No suppliers found' : 'Loading suppliers...'}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Supplier"
        size="lg"
      >
        <SupplierForm
          onSubmit={handleCreateSupplier}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default SupplierSearch;
