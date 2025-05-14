import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchDispensings } from '@/store/slices/dispensingSlice';
import { DispensingStatus } from '@/types/dispensing.types';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import Pagination from '@/components/common/Pagination/Pagination';

const DispensingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dispensings, isLoading, error, totalDispensings, totalPages, currentPage } = useSelector(
    (state: RootState) => state.dispensings
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    dispatch(fetchDispensings({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(
      fetchDispensings({
        page: 1,
        limit: 10,
        search,
        status: status || undefined,
        startDate,
        endDate,
      })
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(
      fetchDispensings({
        page,
        limit: 10,
        search,
        status: status || undefined,
        startDate,
        endDate,
      })
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    dispatch(fetchDispensings({ page: 1, limit: 10 }));
  };

  const getStatusBadgeClass = (status: DispensingStatus) => {
    switch (status) {
      case DispensingStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case DispensingStatus.RETURNED:
        return 'bg-yellow-100 text-yellow-800';
      case DispensingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dispensing Records</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/dispensing/new')}
          leftIcon={
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          New Dispensing
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="form-input"
                placeholder="Dispensing number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.values(DispensingStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-center">Loading dispensing records...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : dispensings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispensing #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dispensings.map((dispensing) => (
                  <tr key={dispensing.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dispensing.dispensingNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof dispensing.patient === 'object'
                        ? `${dispensing.patient.firstName} ${dispensing.patient.lastName}`
                        : dispensing.patient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(dispensing.dispensingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dispensing.items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${dispensing.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          dispensing.status
                        )}`}
                      >
                        {dispensing.status.charAt(0).toUpperCase() + dispensing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        to={`/dispensing/${dispensing.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </Link>
                      {dispensing.status === DispensingStatus.COMPLETED && !dispensing.receiptGenerated && (
                        <Link
                          to={`/dispensing/${dispensing.id}/receipt`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Receipt
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">No dispensing records found.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{dispensings.length}</span> of{' '}
                <span className="font-medium">{totalDispensings}</span> dispensing records
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DispensingList;
