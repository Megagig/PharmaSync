import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchBudgetById,
  updateBudget,
  deleteBudget,
  activateBudget,
  closeBudget,
  updateBudgetActuals,
} from '@/store/slices/budgetSlice';
import { BudgetStatus } from '@/types/budget.types';
import { ExpenseCategory } from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import Table from '@/components/common/Table/Table';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentBudget, isLoading, error } = useSelector(
    (state: RootState) => state.budgets
  );

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBudgetById(id));
    }
  }, [dispatch, id]);

  const handleDelete = () => {
    if (id) {
      dispatch(deleteBudget(id))
        .unwrap()
        .then(() => {
          showToast('Budget deleted successfully', 'success');
          navigate('/budgets');
        })
        .catch((err) => {
          showToast(err || 'Failed to delete budget', 'error');
        });
    }
  };

  const handleActivate = () => {
    if (id) {
      dispatch(activateBudget(id))
        .unwrap()
        .then(() => {
          showToast('Budget activated successfully', 'success');
          setIsActivateModalOpen(false);
        })
        .catch((err) => {
          showToast(err || 'Failed to activate budget', 'error');
        });
    }
  };

  const handleClose = () => {
    if (id) {
      dispatch(closeBudget(id))
        .unwrap()
        .then(() => {
          showToast('Budget closed successfully', 'success');
          setIsCloseModalOpen(false);
        })
        .catch((err) => {
          showToast(err || 'Failed to close budget', 'error');
        });
    }
  };

  const handleUpdateActuals = () => {
    if (id) {
      dispatch(updateBudgetActuals(id))
        .unwrap()
        .then(() => {
          showToast('Budget actuals updated successfully', 'success');
        })
        .catch((err) => {
          showToast(err || 'Failed to update budget actuals', 'error');
        });
    }
  };

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.DRAFT:
        return <Badge color="gray" text="Draft" />;
      case BudgetStatus.ACTIVE:
        return <Badge color="green" text="Active" />;
      case BudgetStatus.CLOSED:
        return <Badge color="blue" text="Closed" />;
      case BudgetStatus.ARCHIVED:
        return <Badge color="yellow" text="Archived" />;
      default:
        return <Badge color="gray" text={status} />;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) {
      return 'text-red-600'; // Over budget
    } else if (variance < 0) {
      return 'text-green-600'; // Under budget
    }
    return 'text-gray-600'; // On budget
  };

  const budgetItemsColumns = [
    {
      header: 'Category',
      accessor: 'category',
      cell: (row: any) => (
        <span className="capitalize">
          {row.category.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      header: 'Subcategory',
      accessor: 'subcategory',
      cell: (row: any) => row.subcategory || 'N/A',
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row: any) => formatCurrency(row.amount),
    },
    {
      header: 'Notes',
      accessor: 'notes',
      cell: (row: any) => row.notes || 'N/A',
    },
  ];

  const budgetActualsColumns = [
    {
      header: 'Category',
      accessor: 'category',
      cell: (row: any) => (
        <span className="capitalize">
          {row.category.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      header: 'Subcategory',
      accessor: 'subcategory',
      cell: (row: any) => row.subcategory || 'N/A',
    },
    {
      header: 'Budgeted',
      accessor: 'budgeted',
      cell: (row: any) => {
        const budgetItem = currentBudget?.items.find(
          (item) =>
            item.category === row.category &&
            (item.subcategory || '') === (row.subcategory || '')
        );
        return formatCurrency(budgetItem?.amount || 0);
      },
    },
    {
      header: 'Actual',
      accessor: 'amount',
      cell: (row: any) => formatCurrency(row.amount),
    },
    {
      header: 'Variance',
      accessor: 'variance',
      cell: (row: any) => (
        <span className={getVarianceColor(row.variance)}>
          {formatCurrency(row.variance)}
        </span>
      ),
    },
    {
      header: 'Variance %',
      accessor: 'variancePercentage',
      cell: (row: any) => (
        <span className={getVarianceColor(row.variance)}>
          {formatPercentage(row.variancePercentage)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-4 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !currentBudget) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="mt-2">{error || 'Failed to load budget details'}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/budgets')}
            >
              Back to Budgets
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Budget: {currentBudget.budgetNumber}
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/budgets')}
          >
            Back to List
          </Button>
          {currentBudget.status === BudgetStatus.DRAFT && (
            <>
              <Button
                variant="primary"
                onClick={() => setIsActivateModalOpen(true)}
              >
                Activate
              </Button>
              <Button
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
          {currentBudget.status === BudgetStatus.ACTIVE && (
            <>
              <Button
                variant="primary"
                onClick={handleUpdateActuals}
              >
                Update Actuals
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCloseModalOpen(true)}
              >
                Close Budget
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{currentBudget.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div>{getStatusBadge(currentBudget.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium capitalize">
                  {currentBudget.period.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Range</p>
                <p className="font-medium">
                  {formatDate(currentBudget.startDate)} to{' '}
                  {formatDate(currentBudget.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {typeof currentBudget.location === 'object' &&
                  currentBudget.location
                    ? currentBudget.location.name
                    : 'All Locations'}
                </p>
              </div>
              {currentBudget.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{currentBudget.description}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="font-medium text-lg">
                  {formatCurrency(currentBudget.totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Actual</p>
                <p className="font-medium text-lg">
                  {formatCurrency(currentBudget.totalActual)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Variance</p>
                <p
                  className={`font-medium text-lg ${getVarianceColor(
                    currentBudget.totalVariance
                  )}`}
                >
                  {formatCurrency(currentBudget.totalVariance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Variance Percentage</p>
                <p
                  className={`font-medium text-lg ${getVarianceColor(
                    currentBudget.totalVariance
                  )}`}
                >
                  {formatPercentage(
                    (currentBudget.totalVariance / currentBudget.totalBudget) *
                      100
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Budget Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">
                  {typeof currentBudget.createdBy === 'object' &&
                  currentBudget.createdBy
                    ? `${currentBudget.createdBy.firstName} ${currentBudget.createdBy.lastName}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {formatDate(currentBudget.createdAt)}
                </p>
              </div>
              {currentBudget.approvedBy && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-medium">
                      {typeof currentBudget.approvedBy === 'object'
                        ? `${currentBudget.approvedBy.firstName} ${currentBudget.approvedBy.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved At</p>
                    <p className="font-medium">
                      {currentBudget.approvedAt
                        ? formatDate(currentBudget.approvedAt)
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
              {currentBudget.closedBy && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Closed By</p>
                    <p className="font-medium">
                      {typeof currentBudget.closedBy === 'object'
                        ? `${currentBudget.closedBy.firstName} ${currentBudget.closedBy.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Closed At</p>
                    <p className="font-medium">
                      {currentBudget.closedAt
                        ? formatDate(currentBudget.closedAt)
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Budget Items</h2>
            <Table
              columns={budgetItemsColumns}
              data={currentBudget.items}
              isLoading={false}
              error={null}
            />
          </div>
        </Card>

        {currentBudget.actuals && currentBudget.actuals.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Budget Actuals</h2>
              <Table
                columns={budgetActualsColumns}
                data={currentBudget.actuals}
                isLoading={false}
                error={null}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Budget"
      >
        <div className="p-6">
          <p>Are you sure you want to delete this budget?</p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activate Modal */}
      <Modal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        title="Activate Budget"
      >
        <div className="p-6">
          <p>Are you sure you want to activate this budget?</p>
          <p className="text-sm text-gray-500 mt-2">
            Once activated, the budget will be used for expense tracking and
            reporting.
          </p>
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsActivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleActivate}>
              Activate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Budget"
      >
        <div className="p-6">
          <p>Are you sure you want to close this budget?</p>
          <p className="text-sm text-gray-500 mt-2">
            Closing the budget will finalize all actuals and prevent further
            updates.
          </p>
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsCloseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Close Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetDetail;
