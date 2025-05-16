import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchTaxConfigurationById, deleteTaxConfiguration } from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const TaxConfigurationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentTaxConfiguration, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTaxConfigurationById(id) as any);
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteTaxConfiguration(id!) as any);
      showToast('Tax configuration deleted successfully', 'success');
      navigate('/accounting/taxes');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const formatTaxType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading && !currentTaxConfiguration) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error && !currentTaxConfiguration) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentTaxConfiguration) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Tax configuration not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tax Configuration Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/accounting/taxes')}
          >
            Back to Tax Configurations
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/accounting/taxes/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{currentTaxConfiguration.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">
                  {formatTaxType(currentTaxConfiguration.type)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="font-medium">{currentTaxConfiguration.rate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">
                  {currentTaxConfiguration.description || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {currentTaxConfiguration.isActive ? (
                  <Badge color="green">Active</Badge>
                ) : (
                  <Badge color="gray">Inactive</Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Default</p>
                {currentTaxConfiguration.isDefault ? (
                  <Badge color="blue">Default</Badge>
                ) : (
                  <span>No</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tax Account</p>
                <p className="font-medium">
                  {typeof currentTaxConfiguration.accountId === 'object' && currentTaxConfiguration.accountId
                    ? `${currentTaxConfiguration.accountId.accountNumber} - ${currentTaxConfiguration.accountId.name}`
                    : 'Not Assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">
                  {typeof currentTaxConfiguration.createdBy === 'object'
                    ? `${currentTaxConfiguration.createdBy.firstName} ${currentTaxConfiguration.createdBy.lastName}`
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {formatDate(currentTaxConfiguration.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {formatDate(currentTaxConfiguration.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tax Configuration"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete this tax configuration? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaxConfigurationDetail;
