import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchCustomerById,
  updateCustomer,
} from '@/store/slices/customersSlice';
import { CustomerType, CreditStatus } from '@/types/customer.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCustomer, isLoading, error } = useSelector(
    (state: RootState) => state.customers
  );

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [creditStatus, setCreditStatus] = useState<CreditStatus>(
    CreditStatus.ACTIVE
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentCustomer) {
      setFirstName(currentCustomer.firstName);
      setLastName(currentCustomer.lastName);
      setEmail(currentCustomer.email || '');
      setPhone(currentCustomer.phone);
      setNotes(currentCustomer.notes || '');
      setCreditStatus(currentCustomer.creditStatus || CreditStatus.ACTIVE);
    }
  }, [currentCustomer]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values
    if (currentCustomer) {
      setFirstName(currentCustomer.firstName);
      setLastName(currentCustomer.lastName);
      setEmail(currentCustomer.email || '');
      setPhone(currentCustomer.phone);
      setNotes(currentCustomer.notes || '');
      setCreditStatus(currentCustomer.creditStatus || CreditStatus.ACTIVE);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await dispatch(
        updateCustomer({
          id,
          updateData: {
            firstName,
            lastName,
            email,
            phone,
            notes,
            creditStatus,
          },
        }) as any
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleManageCredit = () => {
    navigate(`/customers/${id}/credit`);
  };

  const getCustomerTypeBadge = (type: CustomerType) => {
    switch (type) {
      case CustomerType.RETAIL:
        return <Badge color="primary">Retail</Badge>;
      case CustomerType.WHOLESALE:
        return <Badge color="secondary">Wholesale</Badge>;
      case CustomerType.PATIENT:
        return <Badge color="info">Patient</Badge>;
      case CustomerType.HEALTHCARE_PROFESSIONAL:
        return <Badge color="success">Healthcare Professional</Badge>;
      case CustomerType.CORPORATE:
        return <Badge color="warning">Corporate</Badge>;
      default:
        return <Badge color="default">{type}</Badge>;
    }
  };

  const getCreditStatusBadge = (status?: CreditStatus) => {
    switch (status) {
      case CreditStatus.ACTIVE:
        return <Badge color="success">Active</Badge>;
      case CreditStatus.SUSPENDED:
        return <Badge color="warning">Suspended</Badge>;
      case CreditStatus.BLOCKED:
        return <Badge color="danger">Blocked</Badge>;
      default:
        return <Badge color="default">Not Set</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Customer not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Customer: {currentCustomer.firstName} {currentCustomer.lastName}
        </h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
          {!isEditing ? (
            <>
              <Button variant="primary" onClick={handleEdit}>
                Edit Customer
              </Button>
              <Button variant="secondary" onClick={handleManageCredit}>
                Manage Credit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/reminders/new?customer=${id}&type=custom`)
                }
              >
                Send Reminder
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Customer Information</h2>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
                <Select
                  label="Credit Status"
                  value={creditStatus}
                  onChange={(e) =>
                    setCreditStatus(e.target.value as CreditStatus)
                  }
                >
                  <option value={CreditStatus.ACTIVE}>Active</option>
                  <option value={CreditStatus.SUSPENDED}>Suspended</option>
                  <option value={CreditStatus.BLOCKED}>Blocked</option>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Customer Number
                  </span>
                  <span className="block mt-1">
                    {currentCustomer.customerNumber}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Type
                  </span>
                  <span className="block mt-1">
                    {getCustomerTypeBadge(currentCustomer.type)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Full Name
                  </span>
                  <span className="block mt-1">
                    {currentCustomer.firstName} {currentCustomer.lastName}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Email
                  </span>
                  <span className="block mt-1">
                    {currentCustomer.email || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Phone
                  </span>
                  <span className="block mt-1">{currentCustomer.phone}</span>
                </div>
                {currentCustomer.notes && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Notes
                    </span>
                    <span className="block mt-1 whitespace-pre-line">
                      {currentCustomer.notes}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Credit Information</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Credit Status
                </span>
                <span className="block mt-1">
                  {getCreditStatusBadge(currentCustomer.creditStatus)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Credit Limit
                </span>
                <span className="block mt-1">
                  {formatCurrency(currentCustomer.creditLimit || 0)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Current Balance
                </span>
                <span className="block mt-1">
                  {formatCurrency(currentCustomer.currentBalance)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Available Credit
                </span>
                <span className="block mt-1">
                  {formatCurrency(
                    (currentCustomer.creditLimit || 0) -
                      currentCustomer.currentBalance
                  )}
                </span>
              </div>
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={handleManageCredit}
                  className="w-full"
                >
                  Manage Credit
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetail;
