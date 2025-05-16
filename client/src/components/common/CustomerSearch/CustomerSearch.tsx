import { useState, useEffect, useRef } from 'react';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import api from '@/services/api';
import { CustomerType } from '@/types/customer.types';
import CustomerForm from './CustomerForm';
import { useToast } from '@/hooks/useToast';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  customerNumber: string;
  phone?: string;
  email?: string;
}

interface CustomerSearchProps {
  onSelect?: (customer: Customer) => void;
  onChange?: (customer: Customer) => void;
  value?: Customer | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCreate?: boolean;
}

const CustomerSearch = ({
  onSelect,
  onChange,
  value,
  placeholder = 'Search customers by name, code, or phone',
  className = '',
  disabled = false,
  allowCreate = false,
}: CustomerSearchProps) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a default walk-in customer
  const walkInCustomer: Customer = {
    _id: 'walk-in-customer',
    firstName: 'Walk-in',
    lastName: 'Customer',
    customerNumber: 'WALK-IN',
    phone: '',
    email: '',
  };

  // Fetch all customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching customers...');
        const response = await api.get('/customers?isActive=true');
        console.log('Customer API response:', response.data);

        let customersData: Customer[] = [walkInCustomer]; // Add walk-in customer as the first option

        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          console.log(
            'Setting customers from response.data.data:',
            response.data.data.length
          );
          customersData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          console.log(
            'Setting customers from response.data array:',
            response.data.length
          );
          customersData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where API returns an object with customers
          if (
            response.data.data &&
            response.data.data.customers &&
            Array.isArray(response.data.data.customers)
          ) {
            // Handle the specific format: { status: 'success', data: { customers: [...], meta: {...} } }
            customersData = response.data.data.customers;
            console.log(
              'Found customers in response.data.data.customers:',
              customersData.length
            );
          } else {
            // Try to find any arrays in the response
            const possibleArrays = Object.values(response.data).filter((val) =>
              Array.isArray(val)
            );
            if (possibleArrays.length > 0) {
              // Use the first array found
              customersData = possibleArrays[0] as Customer[];
              console.log(
                'Found customers array in response object:',
                customersData.length
              );
            } else if (
              response.data.data &&
              typeof response.data.data === 'object'
            ) {
              // Look deeper in the data object
              const nestedArrays = Object.values(response.data.data).filter(
                (val) => Array.isArray(val)
              );
              if (nestedArrays.length > 0) {
                customersData = nestedArrays[0] as Customer[];
                console.log(
                  'Found customers array in nested data object:',
                  customersData.length
                );
              } else {
                console.warn(
                  'No customer arrays found in response object:',
                  response.data
                );
              }
            } else {
              console.warn(
                'No customer arrays found in response object:',
                response.data
              );
            }
          }
        } else {
          console.warn('Unexpected API response structure:', response.data);
        }

        // Ensure we have a valid array of customers
        if (!Array.isArray(customersData)) {
          console.warn(
            'Customers data is not an array, defaulting to empty array'
          );
          customersData = [];
        }

        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
        showToast('Error loading customers', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [showToast]);

  // Filter customers based on search term
  useEffect(() => {
    console.log('Filtering customers. Total customers:', customers?.length);

    if (!Array.isArray(customers)) {
      console.error('Customers is not an array:', customers);
      setFilteredCustomers([]);
      return;
    }

    try {
      // If search term is empty, show all customers (limited to first 20 for performance)
      if (!searchTerm.trim()) {
        const allCustomers = customers.slice(0, 20);
        console.log(
          'Showing all customers (limited to 20):',
          allCustomers.length
        );
        setFilteredCustomers(allCustomers);
        return;
      }

      // Otherwise filter by search term
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer &&
          ((customer.firstName &&
            customer.firstName.toLowerCase().includes(term)) ||
            (customer.lastName &&
              customer.lastName.toLowerCase().includes(term)) ||
            (customer.customerNumber &&
              customer.customerNumber.toLowerCase().includes(term)) ||
            (customer.phone && customer.phone.toLowerCase().includes(term)) ||
            (customer.email && customer.email.toLowerCase().includes(term)))
      );
      console.log('Filtered customers by search term:', filtered.length);
      setFilteredCustomers(filtered);
    } catch (error) {
      console.error('Error filtering customers:', error);
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

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
    console.log('Customers:', customers.length);
    console.log('Filtered customers:', filteredCustomers.length);
  };

  const handleSelectCustomer = (customer: Customer) => {
    console.log('Customer selected from dropdown:', customer);

    if (!customer || !customer._id) {
      console.error('Invalid customer object:', customer);
      showToast('Invalid customer data', 'error');
      return;
    }

    // Make sure the customer object has all required fields
    const formattedCustomer = {
      _id: customer._id,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      customerNumber: customer.customerNumber || '',
      phone: customer.phone || '',
      email: customer.email || '',
      // Add any other fields that might be needed
    };

    console.log('Formatted customer:', formattedCustomer);

    // Call the appropriate callback with the formatted customer
    if (onChange) {
      onChange(formattedCustomer);
    } else if (onSelect) {
      onSelect(formattedCustomer);
    }

    // Update UI state
    setSearchTerm('');
    setShowDropdown(false);

    // Show a success message
    showToast(
      `Customer ${formattedCustomer.firstName} ${formattedCustomer.lastName} selected`,
      'success'
    );
  };

  const handleCreateCustomer = async (customerData: any) => {
    try {
      const response = await api.post('/customers', customerData);
      console.log('Create customer response:', response.data);

      let newCustomer;

      if (response.data && response.data.data) {
        newCustomer = response.data.data;
      } else if (response.data && response.data._id) {
        // Direct customer object in response
        newCustomer = response.data;
      } else {
        throw new Error('Invalid response format from API');
      }

      // Add the new customer to the list
      setCustomers((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, newCustomer];
        } else {
          // Handle case where prev is not an array
          console.warn('Previous customers state is not an array:', prev);
          return [newCustomer];
        }
      });

      // Make sure the customer object has all required fields
      const formattedCustomer = {
        _id: newCustomer._id,
        firstName: newCustomer.firstName || '',
        lastName: newCustomer.lastName || '',
        customerNumber: newCustomer.customerNumber || '',
        phone: newCustomer.phone || '',
        email: newCustomer.email || '',
        // Add any other fields that might be needed
      };

      console.log('Selecting newly created customer:', formattedCustomer);

      // Call the appropriate callback with the formatted customer
      if (onChange) {
        onChange(formattedCustomer);
      } else if (onSelect) {
        onSelect(formattedCustomer);
      }

      // Show success message
      showToast('Customer created successfully', 'success');

      // Close the modal
      setShowCreateModal(false);
      setSearchTerm('');
    } catch (error: any) {
      console.error('Error creating customer:', error);

      // Extract the specific error message if available
      let errorMessage = 'Failed to create customer. Please try again.';

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
        {allowCreate && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCreateModal(true)}
            disabled={disabled}
          >
            New
          </Button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        >
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="font-medium">
                  {customer.firstName} {customer.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {customer.customerNumber} | {customer.phone || 'No phone'}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">
              {searchTerm ? 'No customers found' : 'Loading customers...'}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Customer"
        size="lg"
      >
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default CustomerSearch;
