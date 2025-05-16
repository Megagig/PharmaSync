import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createPosSession } from '@/store/slices/posSlice';
import { PosSessionFormData } from '@/types/pos.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import TextArea from '@/components/common/TextArea/TextArea';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

const CreatePosSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.pos);
  const { showToast } = useToast();

  const [locations, setLocations] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [formData, setFormData] = useState<PosSessionFormData>({
    openingBalance: 0, // Start with a valid number
    location: '',
    register: 'Main Register', // Provide a default register name
    notes: '',
  });

  useEffect(() => {
    // Fetch locations
    const fetchLocations = async () => {
      try {
        // Use the active locations endpoint directly
        const response = await api.get('/locations/active');
        console.log('Locations API response:', response.data);

        if (Array.isArray(response.data.data)) {
          console.log('Setting locations array:', response.data.data);
          setLocations(response.data.data);

          if (response.data.data.length > 0) {
            console.log('Setting default location:', response.data.data[0]._id);
            setFormData((prev) => ({
              ...prev,
              location: response.data.data[0]._id,
            }));
          } else {
            console.log('No locations found in the response data array');
          }
        } else {
          console.error('Unexpected API response format:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'openingBalance') {
      // Handle numeric input with validation
      const numValue = value === '' ? 0 : parseFloat(value);

      // Only update if it's a valid number
      if (!isNaN(numValue)) {
        setFormData((prev) => ({
          ...prev,
          [name]: numValue,
        }));
      }
    } else {
      // Handle other inputs normally
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.location) {
      showToast('Please select a location', 'error');
      return;
    }

    if (!formData.register) {
      showToast('Please enter a register name', 'error');
      return;
    }

    // Validate opening balance is a valid number
    if (isNaN(formData.openingBalance)) {
      showToast('Please enter a valid opening balance', 'error');
      return;
    }

    // Create a clean copy of the form data with validated values
    const validatedFormData = {
      ...formData,
      openingBalance: formData.openingBalance || 0, // Ensure it's at least 0
      register: formData.register.trim(), // Trim whitespace
    };

    console.log('Submitting POS session data:', validatedFormData);

    try {
      const resultAction = await dispatch(
        createPosSession(validatedFormData) as any
      );
      if (createPosSession.fulfilled.match(resultAction)) {
        showToast('POS session created successfully', 'success');
        navigate(`/pos/terminal?session=${resultAction.payload._id}`);
      } else if (resultAction.error) {
        const errorMessage =
          resultAction.error.message || 'Failed to create POS session';
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Failed to create POS session:', error);
      showToast(error.message || 'Failed to create POS session', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create POS Session</h1>
        <Button variant="outline" onClick={() => navigate('/pos/sessions')}>
          Back to Sessions
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Location</option>
                {Array.isArray(locations) && locations.length > 0 ? (
                  locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No locations available
                  </option>
                )}
              </Select>
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-1">
                Locations count:{' '}
                {Array.isArray(locations) ? locations.length : 0}
              </div>

              <Input
                type="text"
                label="Register Name"
                name="register"
                value={formData.register}
                onChange={handleInputChange}
                placeholder="e.g., Register 1, Main Counter"
                required
              />

              <Input
                type="number"
                label="Opening Balance (₦)"
                name="openingBalance"
                value={
                  isNaN(formData.openingBalance) ? '' : formData.openingBalance
                }
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                onBlur={() => {
                  // Ensure the value is at least 0 when the field loses focus
                  if (isNaN(formData.openingBalance)) {
                    setFormData((prev) => ({
                      ...prev,
                      openingBalance: 0,
                    }));
                  }
                }}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this session"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/pos/sessions')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Create Session & Open Terminal
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreatePosSession;
