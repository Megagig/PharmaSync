import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader/PageHeader';
import { ReturnForm } from '@/components/POS/Returns';
import { useToast } from '@/hooks/useToast';

const ProcessReturn: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleReturnComplete = (returnData: any) => {
    showToast('Return processed successfully', 'success');
    navigate(`/pos/transactions/${returnData._id}`);
  };

  return (
    <div className="process-return-page">
      <PageHeader
        title="Process Return"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'POS', path: '/pos' },
          { label: 'Process Return', path: '/pos/returns/process' },
        ]}
      />
      
      <div className="mt-4">
        <ReturnForm onComplete={handleReturnComplete} />
      </div>
    </div>
  );
};

export default ProcessReturn;
