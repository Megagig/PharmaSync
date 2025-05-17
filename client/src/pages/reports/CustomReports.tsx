import React, { useState } from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatDate } from '@/utils/date.utils';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface ReportField {
  id: string;
  name: string;
  category: string;
  selected: boolean;
}

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const CustomReports: React.FC = () => {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [selectedDataSource, setSelectedDataSource] = useState('patients');
  const [availableFields, setAvailableFields] = useState<ReportField[]>([
    // Patient fields
    { id: 'patient_id', name: 'Patient ID', category: 'patients', selected: false },
    { id: 'patient_name', name: 'Patient Name', category: 'patients', selected: false },
    { id: 'patient_dob', name: 'Date of Birth', category: 'patients', selected: false },
    { id: 'patient_gender', name: 'Gender', category: 'patients', selected: false },
    { id: 'patient_phone', name: 'Phone Number', category: 'patients', selected: false },
    { id: 'patient_email', name: 'Email', category: 'patients', selected: false },
    
    // Medication fields
    { id: 'medication_id', name: 'Medication ID', category: 'medications', selected: false },
    { id: 'medication_name', name: 'Medication Name', category: 'medications', selected: false },
    { id: 'medication_strength', name: 'Strength', category: 'medications', selected: false },
    { id: 'medication_dosage_form', name: 'Dosage Form', category: 'medications', selected: false },
    { id: 'medication_manufacturer', name: 'Manufacturer', category: 'medications', selected: false },
    
    // Prescription fields
    { id: 'prescription_id', name: 'Prescription ID', category: 'prescriptions', selected: false },
    { id: 'prescription_date', name: 'Prescription Date', category: 'prescriptions', selected: false },
    { id: 'prescription_status', name: 'Status', category: 'prescriptions', selected: false },
    { id: 'prescription_doctor', name: 'Prescribing Doctor', category: 'prescriptions', selected: false },
    
    // Inventory fields
    { id: 'inventory_id', name: 'Inventory ID', category: 'inventory', selected: false },
    { id: 'inventory_quantity', name: 'Quantity', category: 'inventory', selected: false },
    { id: 'inventory_batch', name: 'Batch Number', category: 'inventory', selected: false },
    { id: 'inventory_expiry', name: 'Expiry Date', category: 'inventory', selected: false },
    { id: 'inventory_cost', name: 'Cost Price', category: 'inventory', selected: false },
    { id: 'inventory_selling', name: 'Selling Price', category: 'inventory', selected: false },
  ]);
  
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([
    { id: '1', field: '', operator: 'equals', value: '' },
  ]);
  
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataSource(e.target.value);
  };

  const handleFieldToggle = (fieldId: string) => {
    setAvailableFields(fields => 
      fields.map(field => 
        field.id === fieldId 
          ? { ...field, selected: !field.selected } 
          : field
      )
    );
  };

  const handleAddFilterCondition = () => {
    const newId = (filterConditions.length + 1).toString();
    setFilterConditions([...filterConditions, { id: newId, field: '', operator: 'equals', value: '' }]);
  };

  const handleRemoveFilterCondition = (id: string) => {
    setFilterConditions(filterConditions.filter(condition => condition.id !== id));
  };

  const handleFilterFieldChange = (id: string, field: string) => {
    setFilterConditions(conditions => 
      conditions.map(condition => 
        condition.id === id 
          ? { ...condition, field } 
          : condition
      )
    );
  };

  const handleFilterOperatorChange = (id: string, operator: string) => {
    setFilterConditions(conditions => 
      conditions.map(condition => 
        condition.id === id 
          ? { ...condition, operator } 
          : condition
      )
    );
  };

  const handleFilterValueChange = (id: string, value: string) => {
    setFilterConditions(conditions => 
      conditions.map(condition => 
        condition.id === id 
          ? { ...condition, value } 
          : condition
      )
    );
  };

  const handleGenerateReport = () => {
    // In a real app, this would call an API to generate the report
    // For now, we'll just simulate a report with some dummy data
    
    const selectedFields = availableFields.filter(field => field.selected);
    
    if (selectedFields.length === 0) {
      alert('Please select at least one field for the report.');
      return;
    }
    
    const reportData = {
      name: reportName || 'Untitled Report',
      description: reportDescription || 'Custom report',
      dataSource: selectedDataSource,
      fields: selectedFields,
      dateRange: {
        startDate: dateRange.startDate ? formatDate(dateRange.startDate) : null,
        endDate: dateRange.endDate ? formatDate(dateRange.endDate) : null,
      },
      filters: filterConditions,
      sort: {
        field: sortField,
        order: sortOrder,
      },
      generatedAt: new Date().toISOString(),
      data: generateDummyData(selectedFields),
    };
    
    setGeneratedReport(reportData);
  };

  const generateDummyData = (fields: ReportField[]) => {
    // Generate some dummy data based on the selected fields
    const data = [];
    
    for (let i = 0; i < 10; i++) {
      const row: Record<string, any> = {};
      
      fields.forEach(field => {
        if (field.id.includes('id')) {
          row[field.id] = `ID${Math.floor(Math.random() * 10000)}`;
        } else if (field.id.includes('name')) {
          row[field.id] = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown'][Math.floor(Math.random() * 5)];
        } else if (field.id.includes('date') || field.id.includes('dob') || field.id.includes('expiry')) {
          const randomDate = new Date();
          randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
          row[field.id] = formatDate(randomDate);
        } else if (field.id.includes('gender')) {
          row[field.id] = ['Male', 'Female'][Math.floor(Math.random() * 2)];
        } else if (field.id.includes('status')) {
          row[field.id] = ['Active', 'Completed', 'Pending', 'Cancelled'][Math.floor(Math.random() * 4)];
        } else if (field.id.includes('quantity') || field.id.includes('cost') || field.id.includes('price') || field.id.includes('selling')) {
          row[field.id] = Math.floor(Math.random() * 1000);
        } else {
          row[field.id] = `Value ${i + 1}`;
        }
      });
      
      data.push(row);
    }
    
    return data;
  };

  const handleSaveReport = () => {
    // In a real app, this would save the report configuration to the database
    alert('Report configuration saved!');
  };

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // In a real app, this would trigger a download of the report in the specified format
    alert(`Exporting report in ${format} format...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Custom Reports</h1>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
                Report Name
              </label>
              <input
                type="text"
                id="reportName"
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            
            <div>
              <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="reportDescription"
                className="form-textarea block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter report description"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <Select
                id="dataSource"
                value={selectedDataSource}
                onChange={handleDataSourceChange}
                className="w-full"
              >
                <option value="patients">Patients</option>
                <option value="medications">Medications</option>
                <option value="prescriptions">Prescriptions</option>
                <option value="inventory">Inventory</option>
                <option value="sales">Sales</option>
                <option value="expenses">Expenses</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={handleDateRangeChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fields to Include
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableFields
                  .filter(field => field.category === selectedDataSource || field.category === 'common')
                  .map(field => (
                    <div key={field.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`field-${field.id}`}
                        checked={field.selected}
                        onChange={() => handleFieldToggle(field.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`field-${field.id}`} className="ml-2 block text-sm text-gray-900">
                        {field.name}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Conditions
              </label>
              {filterConditions.map(condition => (
                <div key={condition.id} className="flex items-center space-x-2 mb-2">
                  <Select
                    value={condition.field}
                    onChange={(e) => handleFilterFieldChange(condition.id, e.target.value)}
                    className="w-1/3"
                  >
                    <option value="">Select Field</option>
                    {availableFields
                      .filter(field => field.category === selectedDataSource || field.category === 'common')
                      .map(field => (
                        <option key={field.id} value={field.id}>
                          {field.name}
                        </option>
                      ))}
                  </Select>
                  <Select
                    value={condition.operator}
                    onChange={(e) => handleFilterOperatorChange(condition.id, e.target.value)}
                    className="w-1/4"
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="between">Between</option>
                  </Select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => handleFilterValueChange(condition.id, e.target.value)}
                    className="form-input w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFilterCondition(condition.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddFilterCondition}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                + Add Filter
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sortField" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <Select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full"
                >
                  <option value="">None</option>
                  {availableFields
                    .filter(field => field.category === selectedDataSource || field.category === 'common')
                    .map(field => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                </Select>
              </div>
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <Select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full"
                  disabled={!sortField}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </Select>
              </div>
            </div>
            
            <div className="pt-4 flex space-x-2">
              <Button 
                variant="primary" 
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveReport}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {generatedReport && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Generated Report: {generatedReport.name}</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                  Export as PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
                  Export as CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                  Export as Excel
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-500">
                  Data Source: <span className="font-medium text-gray-900">{generatedReport.dataSource.charAt(0).toUpperCase() + generatedReport.dataSource.slice(1)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Date Range: <span className="font-medium text-gray-900">
                    {generatedReport.dateRange.startDate} to {generatedReport.dateRange.endDate}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Fields: <span className="font-medium text-gray-900">
                    {generatedReport.fields.map((f: ReportField) => f.name).join(', ')}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Generated At: <span className="font-medium text-gray-900">
                    {new Date(generatedReport.generatedAt).toLocaleString()}
                  </span>
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {generatedReport.fields.map((field: ReportField) => (
                        <th 
                          key={field.id} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedReport.data.map((row: Record<string, any>, index: number) => (
                      <tr key={index}>
                        {generatedReport.fields.map((field: ReportField) => (
                          <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row[field.id]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomReports;
