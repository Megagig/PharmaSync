import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchReportConfigurations,
  deleteReportConfigurationById,
  generateReportFromConfig,
} from '@/store/slices/reportSlice';
import { ReportFormat, ReportType } from '@/types/report.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import Modal from '@/components/common/Modal/Modal';

const ReportConfigurations: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { configurations, isLoading, error, totalPages, currentPage, totalConfigurations } = useSelector(
    (state: RootState) => state.report
  );
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>(ReportFormat.PDF);
  
  useEffect(() => {
    loadConfigurations();
  }, [dispatch, currentPage]);
  
  const loadConfigurations = (page = 1) => {
    dispatch(fetchReportConfigurations({ page, limit: 10 }));
  };
  
  const handlePageChange = (page: number) => {
    loadConfigurations(page);
  };
  
  const handleDelete = () => {
    if (selectedConfigId) {
      dispatch(deleteReportConfigurationById(selectedConfigId))
        .unwrap()
        .then(() => {
          setShowDeleteModal(false);
          setSelectedConfigId(null);
        })
        .catch((error) => {
          console.error('Failed to delete report configuration:', error);
        });
    }
  };
  
  const handleGenerate = () => {
    if (selectedConfigId) {
      dispatch(generateReportFromConfig({ id: selectedConfigId, format: selectedFormat }))
        .unwrap()
        .then(() => {
          setShowGenerateModal(false);
          setSelectedConfigId(null);
          navigate('/reports/view');
        })
        .catch((error) => {
          console.error('Failed to generate report:', error);
        });
    }
  };
  
  const confirmDelete = (id: string) => {
    setSelectedConfigId(id);
    setShowDeleteModal(true);
  };
  
  const confirmGenerate = (id: string) => {
    setSelectedConfigId(id);
    setShowGenerateModal(true);
  };
  
  const getReportTypeLabel = (type: ReportType): string => {
    switch (type) {
      case ReportType.SALES:
        return 'Sales Report';
      case ReportType.INVENTORY:
        return 'Inventory Report';
      case ReportType.PRESCRIPTION:
        return 'Prescription Report';
      case ReportType.PATIENT:
        return 'Patient Report';
      case ReportType.MEDICATION:
        return 'Medication Report';
      case ReportType.STAFF:
        return 'Staff Report';
      case ReportType.CUSTOM:
        return 'Custom Report';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Saved Reports</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/reports/new')}
          >
            Create New Report
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Report Configurations</h2>
        </div>
        <div className="p-4">
          {isLoading && configurations.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500 text-center">
                <svg
                  className="h-12 w-12 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="mt-2">{error}</p>
              </div>
            </div>
          ) : configurations.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2">No saved reports found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/reports/new')}
                >
                  Create Your First Report
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Public
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {configurations.map((config) => (
                      <tr key={config.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{config.name}</div>
                          {config.description && (
                            <div className="text-sm text-gray-500">{config.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getReportTypeLabel(config.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof config.createdBy === 'string'
                            ? config.createdBy
                            : `${config.createdBy.firstName} ${config.createdBy.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(config.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {config.isPublic ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => confirmGenerate(config.id)}
                            className="mr-2"
                          >
                            Generate
                          </Button>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => navigate(`/reports/edit/${config.id}`)}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => confirmDelete(config.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Report Configuration"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this report configuration? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Report"
      >
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="reportFormat" className="block text-sm font-medium text-gray-700 mb-2">
              Report Format
            </label>
            <select
              id="reportFormat"
              className="form-select block w-full"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
            >
              <option value={ReportFormat.JSON}>Web View</option>
              <option value={ReportFormat.PDF}>PDF</option>
              <option value={ReportFormat.CSV}>CSV</option>
              <option value={ReportFormat.EXCEL}>Excel</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerate} isLoading={isLoading}>
              Generate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportConfigurations;
