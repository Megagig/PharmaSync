import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchCustomerById } from '@/store/slices/customersSlice';
import CreditSummary from '@/components/domain/Credit/CreditSummary';
import CreditTransactions from '@/components/domain/Credit/CreditTransactions';
import Button from '@/components/common/Button/Button';

const CustomerCredit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCustomer, isLoading, error } = useSelector((state: RootState) => state.customers);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id) as any);
    }
  }, [dispatch, id]);

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
          Credit Management: {currentCustomer.firstName} {currentCustomer.lastName}
        </h1>
        <Button variant="outline" onClick={() => navigate(`/customers/${id}`)}>
          Back to Customer
        </Button>
      </div>

      <div className="space-y-6">
        <CreditSummary customerId={id!} />
        <CreditTransactions customerId={id!} />
      </div>
    </div>
  );
};

export default CustomerCredit;
