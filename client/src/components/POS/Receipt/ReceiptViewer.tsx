import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';
import ReceiptService from '@/services/receipt.service';
import { FaPrint, FaEnvelope, FaCalendarAlt, FaDownload } from 'react-icons/fa';

interface ReceiptViewerProps {
  transactionId: string;
  onClose?: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ transactionId, onClose }) => {
  const [receiptHtml, setReceiptHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [schedulingReminder, setSchedulingReminder] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (transactionId) {
      fetchReceiptHtml();
    }
  }, [transactionId]);

  const fetchReceiptHtml = async () => {
    try {
      setLoading(true);
      const html = await ReceiptService.getReceiptHtml(transactionId);
      setReceiptHtml(html);
    } catch (error) {
      console.error('Error fetching receipt HTML:', error);
      showToast('Failed to fetch receipt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      showToast('Please allow pop-ups to print receipts', 'error');
    }
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      const result = await ReceiptService.sendReceiptEmail(transactionId);
      showToast(result.message || 'Receipt sent successfully', 'success');
    } catch (error) {
      console.error('Error sending receipt email:', error);
      showToast('Failed to send receipt email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleScheduleReminder = async () => {
    try {
      setSchedulingReminder(true);
      
      // Calculate default reminder date (30 days from now)
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 30);
      
      // Prompt user for reminder date
      const userDate = window.prompt(
        'Enter reminder date (YYYY-MM-DD):',
        reminderDate.toISOString().split('T')[0]
      );
      
      if (!userDate) {
        setSchedulingReminder(false);
        return;
      }
      
      const result = await ReceiptService.scheduleRefillReminder(
        transactionId,
        new Date(userDate)
      );
      
      showToast(result.message || 'Refill reminder scheduled', 'success');
    } catch (error) {
      console.error('Error scheduling refill reminder:', error);
      showToast('Failed to schedule refill reminder', 'error');
    } finally {
      setSchedulingReminder(false);
    }
  };

  const handleDownloadPdf = () => {
    // This is a placeholder for PDF generation
    // In a real implementation, you would call a backend endpoint to generate a PDF
    showToast('PDF download functionality not implemented yet', 'info');
  };

  return (
    <Card className="receipt-viewer">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Receipt</h2>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handlePrint}
              disabled={loading}
              title="Print Receipt"
            >
              <FaPrint className="mr-1" /> Print
            </Button>
            <Button
              variant="secondary"
              onClick={handleSendEmail}
              disabled={loading || sendingEmail}
              title="Email Receipt"
            >
              <FaEnvelope className="mr-1" /> Email
            </Button>
            <Button
              variant="secondary"
              onClick={handleScheduleReminder}
              disabled={loading || schedulingReminder}
              title="Schedule Refill Reminder"
            >
              <FaCalendarAlt className="mr-1" /> Reminder
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadPdf}
              disabled={loading}
              title="Download PDF"
            >
              <FaDownload className="mr-1" /> PDF
            </Button>
            {onClose && (
              <Button
                variant="danger"
                onClick={onClose}
                title="Close"
              >
                Close
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <p>Loading receipt...</p>
          </div>
        ) : (
          <div className="receipt-container border rounded-lg overflow-hidden">
            <iframe
              srcDoc={receiptHtml}
              title="Receipt"
              className="w-full h-[600px] border-0"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReceiptViewer;
