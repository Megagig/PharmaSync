import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  fetchReminderById, 
  updateReminder, 
  deleteReminder, 
  sendReminder 
} from '@/store/slices/remindersSlice';
import { ReminderStatus, ReminderType } from '@/types/reminder.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';

const ReminderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentReminder, isLoading, error } = useSelector((state: RootState) => state.reminders);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<ReminderStatus>(ReminderStatus.PENDING);
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchReminderById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentReminder) {
      setSubject(currentReminder.subject);
      setMessage(currentReminder.message);
      setStatus(currentReminder.status);
      setScheduledDate(currentReminder.scheduledDate.split('T')[0]);
    }
  }, [currentReminder]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values
    if (currentReminder) {
      setSubject(currentReminder.subject);
      setMessage(currentReminder.message);
      setStatus(currentReminder.status);
      setScheduledDate(currentReminder.scheduledDate.split('T')[0]);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await dispatch(
        updateReminder({
          id,
          updateData: {
            subject,
            message,
            status,
            scheduledDate,
          },
        }) as any
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await dispatch(deleteReminder(id) as any);
      navigate('/reminders');
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleSend = async () => {
    if (!id) return;

    try {
      await dispatch(sendReminder(id) as any);
      setShowSendModal(false);
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const getTypeBadge = (type: ReminderType) => {
    switch (type) {
      case ReminderType.INVOICE_DUE:
        return <Badge color="info">Invoice Due</Badge>;
      case ReminderType.INVOICE_OVERDUE:
        return <Badge color="danger">Invoice Overdue</Badge>;
      case ReminderType.PAYMENT_THANK_YOU:
        return <Badge color="success">Payment Thank You</Badge>;
      case ReminderType.CUSTOM:
        return <Badge color="secondary">Custom</Badge>;
      default:
        return <Badge color="default">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case ReminderStatus.SENT:
        return <Badge color="success">Sent</Badge>;
      case ReminderStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case ReminderStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
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

  if (!currentReminder) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Reminder not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Reminder: {currentReminder.subject}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/reminders')}>
            Back to Reminders
          </Button>
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
              <Button variant="primary" onClick={handleEdit}>
                Edit
              </Button>
              {currentReminder.status === ReminderStatus.PENDING && (
                <Button variant="success" onClick={() => setShowSendModal(true)}>
                  Send Now
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Reminder Details</h2>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  ></textarea>
                </div>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReminderStatus)}
                  options={[
                    { value: ReminderStatus.PENDING, label: 'Pending' },
                    { value: ReminderStatus.SENT, label: 'Sent' },
                    { value: ReminderStatus.CANCELLED, label: 'Cancelled' },
                  ]}
                />
                <DatePicker
                  label="Scheduled Date"
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  required
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Type
                  </span>
                  <span className="block mt-1">
                    {getTypeBadge(currentReminder.type)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <span className="block mt-1">
                    {getStatusBadge(currentReminder.status)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Subject
                  </span>
                  <span className="block mt-1">{currentReminder.subject}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Message
                  </span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                    {currentReminder.message}
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Scheduled Date
                  </span>
                  <span className="block mt-1">
                    {formatDate(currentReminder.scheduledDate)}
                  </span>
                </div>
                {currentReminder.sentDate && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Sent Date
                    </span>
                    <span className="block mt-1">
                      {formatDate(currentReminder.sentDate)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Created By
                  </span>
                  <span className="block mt-1">
                    {typeof currentReminder.createdBy === 'object'
                      ? `${currentReminder.createdBy.firstName} ${currentReminder.createdBy.lastName}`
                      : 'Unknown User'}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Created At
                  </span>
                  <span className="block mt-1">
                    {formatDate(currentReminder.createdAt, true)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Related Information</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Customer
                </span>
                <span className="block mt-1">
                  {typeof currentReminder.customer === 'object'
                    ? `${currentReminder.customer.firstName} ${currentReminder.customer.lastName} (${currentReminder.customer.customerNumber})`
                    : 'Unknown Customer'}
                </span>
                {typeof currentReminder.customer === 'object' && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/customers/${currentReminder.customer._id}`)}
                    >
                      View Customer
                    </Button>
                  </div>
                )}
              </div>

              {currentReminder.invoice && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Related Invoice
                  </span>
                  <div className="mt-1">
                    {typeof currentReminder.invoice === 'object' ? (
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Invoice Number:</span>{' '}
                          {currentReminder.invoice.invoiceNumber}
                        </div>
                        <div>
                          <span className="font-medium">Invoice Date:</span>{' '}
                          {formatDate(currentReminder.invoice.invoiceDate)}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span>{' '}
                          {formatDate(currentReminder.invoice.dueDate)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span>{' '}
                          {formatCurrency(currentReminder.invoice.total)}
                        </div>
                        <div>
                          <span className="font-medium">Balance:</span>{' '}
                          {formatCurrency(currentReminder.invoice.balance)}
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/invoices/${currentReminder.invoice._id}`)}
                          >
                            View Invoice
                          </Button>
                        </div>
                      </div>
                    ) : (
                      'Unknown Invoice'
                    )}
                  </div>
                </div>
              )}

              {currentReminder.payment && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Related Payment
                  </span>
                  <div className="mt-1">
                    {typeof currentReminder.payment === 'object' ? (
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Payment Number:</span>{' '}
                          {currentReminder.payment.paymentNumber}
                        </div>
                        <div>
                          <span className="font-medium">Payment Date:</span>{' '}
                          {formatDate(currentReminder.payment.paymentDate)}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>{' '}
                          {formatCurrency(currentReminder.payment.amount)}
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/payments/${currentReminder.payment._id}`)}
                          >
                            View Payment
                          </Button>
                        </div>
                      </div>
                    ) : (
                      'Unknown Payment'
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Reminder"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this reminder?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Confirmation Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Reminder"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to send this reminder now?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSend}>
              Send Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReminderDetail;
