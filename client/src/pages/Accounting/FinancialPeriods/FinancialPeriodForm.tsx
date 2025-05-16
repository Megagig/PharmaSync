import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchFinancialPeriodById,
  createFinancialPeriod,
  updateFinancialPeriod,
} from '@/store/slices/accountingSlice';
import {
  FinancialPeriodStatus,
  FinancialPeriodFormData,
} from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import TextArea from '@/components/common/TextArea/TextArea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { useToast } from '@/hooks/useToast';

const FinancialPeriodForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentFinancialPeriod, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FinancialPeriodFormData>({
    name: '',
    startDate: '',
    endDate: '',
    isFiscalYear: false,
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchFinancialPeriodById(id) as any);
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentFinancialPeriod) {
      setFormData({
        name: currentFinancialPeriod.name,
        startDate: new Date(currentFinancialPeriod.startDate).toISOString().split('T')[0],
        endDate: new Date(currentFinancialPeriod.endDate).toISOString().split('T')[0],
        isFiscalYear: currentFinancialPeriod.isFiscalYear,
        notes: currentFinancialPeriod.notes || '',
      });
    }
  }, [currentFinancialPeriod, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate > endDate) {
      showToast('Start date must be before end date', 'error');
      return;
    }

    try {
      if (isEditMode) {
        await dispatch(
          updateFinancialPeriod({ id: id!, updateData: formData }) as any
        );
        showToast('Financial period updated successfully', 'success');
      } else {
        await dispatch(createFinancialPeriod(formData) as any);
        showToast('Financial period created successfully', 'success');
      }
      navigate('/accounting/financial-periods');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  // Generate quarter name based on dates
  const generateQuarterName = () => {
    if (!formData.startDate || !formData.endDate) return '';

    const startDate = new Date(formData.startDate);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    
    // Determine quarter
    let quarter = '';
    if (startMonth >= 0 && startMonth <= 2) {
      quarter = 'Q1';
    } else if (startMonth >= 3 && startMonth <= 5) {
      quarter = 'Q2';
    } else if (startMonth >= 6 && startMonth <= 8) {
      quarter = 'Q3';
    } else {
      quarter = 'Q4';
    }
    
    return `${quarter} ${startYear}`;
  };

  // Generate fiscal year name
  const generateFiscalYearName = () => {
    if (!formData.startDate || !formData.endDate) return '';

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    return startYear === endYear 
      ? `Fiscal Year ${startYear}` 
      : `Fiscal Year ${startYear}-${endYear}`;
  };

  // Handle auto-generate name
  const handleAutoGenerateName = () => {
    if (formData.isFiscalYear) {
      setFormData((prev) => ({ ...prev, name: generateFiscalYearName() }));
    } else {
      setFormData((prev) => ({ ...prev, name: generateQuarterName() }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Financial Period' : 'Create Financial Period'}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/accounting/financial-periods')}
        >
          Back to Financial Periods
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Period Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <div className="mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoGenerateName}
                  >
                    Auto-generate Name
                  </Button>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Checkbox
                  id="isFiscalYear"
                  name="isFiscalYear"
                  checked={formData.isFiscalYear}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isFiscalYear" className="ml-2 text-sm text-gray-700">
                  This is a fiscal year
                </label>
              </div>
              <Input
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mt-6">
              <TextArea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/accounting/financial-periods')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditMode ? 'Update Financial Period' : 'Create Financial Period'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FinancialPeriodForm;
