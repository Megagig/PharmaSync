import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientById, updateCarePlan, setError } from '@/store/slices/patientSlice';
import { CarePlan, CarePlanFormData } from '@/types/patient.types';
import Card from '@/components/common/Card/Card';
import CarePlanForm from '@/components/domain/Patients/CarePlanForm';
import { formatDateToISO } from '@/utils/date.utils';

const EditCarePlan = () => {
  const { id, planId } = useParams<{ id: string; planId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPatient, isLoading, error } = useSelector((state: RootState) => state.patients);
  const [plan, setPlan] = useState<CarePlan | null>(null);

  useEffect(() => {
    if (id && !currentPatient) {
      dispatch(fetchPatientById(id));
    } else if (currentPatient && planId) {
      const foundPlan = currentPatient.carePlans.find(
        (p) => p._id === planId
      );
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        navigate(`/patients/${id}`);
      }
    }
    
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id, planId, currentPatient, navigate]);

  const handleSubmit = async (data: CarePlanFormData) => {
    if (id && planId) {
      try {
        const resultAction = await dispatch(
          updateCarePlan({
            patientId: id,
            planId,
            planData: data,
          })
        );
        if (updateCarePlan.fulfilled.match(resultAction)) {
          navigate(`/patients/${id}`);
        }
      } catch (error) {
        console.error('Failed to update care plan:', error);
      }
    }
  };

  if (isLoading || !currentPatient || !plan) {
    return (
      <div className="flex justify-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-primary-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  const initialData: CarePlanFormData = {
    date: formatDateToISO(new Date(plan.date)),
    goals: plan.goals,
    objectives: plan.objectives,
    followUpDate: formatDateToISO(new Date(plan.followUpDate)),
    drugTherapyProblemResolved: plan.drugTherapyProblemResolved,
    needsReview: plan.needsReview,
    notes: plan.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Care Plan</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CarePlanForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </Card>
    </div>
  );
};

export default EditCarePlan;
