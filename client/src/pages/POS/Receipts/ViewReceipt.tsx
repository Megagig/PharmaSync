import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader/PageHeader';
import { ReceiptViewer } from '@/components/POS/Receipt';

const ViewReceipt: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  if (!transactionId) {
    return (
      <div className="view-receipt-page">
        <PageHeader
          title="View Receipt"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'POS', path: '/pos' },
            { label: 'View Receipt', path: '/pos/receipts' },
          ]}
        />
        
        <div className="mt-4">
          <p>No transaction ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-receipt-page">
      <PageHeader
        title="View Receipt"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'POS', path: '/pos' },
          { label: 'View Receipt', path: '/pos/receipts' },
        ]}
      />
      
      <div className="mt-4">
        <ReceiptViewer
          transactionId={transactionId}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default ViewReceipt;
