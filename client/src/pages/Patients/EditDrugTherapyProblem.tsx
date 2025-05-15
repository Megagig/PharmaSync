import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientById, updateDrugTherapyProblem, setError } from '@/store/slices/patientSlice';
import { DrugTherapyProblem, DrugTherapyProblemFormData } from '@/types/patient.types';
import Card from '@/components/common/Card/Card';
import DrugTherapyProblemForm from '@/components/domain/Patients/DrugTherapyProblemForm';
import { formatDateToISO } from '@/utils/date.utils';

const EditDrugTherapyProblem = () => {
  const { id, problemId } = useParams<{ id: string; problemId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPatient, isLoading, error } = useSelector((state: RootState) => state.patients);
  const [problem, setProblem] = useState<DrugTherapyProblem | null>(null);

  useEffect(() => {
    if (id && !currentPatient) {
      dispatch(fetchPatientById(id));
    } else if (currentPatient && problemId) {
      const foundProblem = currentPatient.drugTherapyProblems.find(
        (p) => p._id === problemId
      );
      if (foundProblem) {
        setProblem(foundProblem);
      } else {
        navigate(`/patients/${id}`);
      }
    }
    
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id, problemId, currentPatient, navigate]);

  const handleSubmit = async (data: DrugTherapyProblemFormData) => {
    if (id && problemId) {
      try {
        const resultAction = await dispatch(
          updateDrugTherapyProblem({
            patientId: id,
            problemId,
            problemData: data,
          })
        );
        if (updateDrugTherapyProblem.fulfilled.match(resultAction)) {
          navigate(`/patients/${id}`);
        }
      } catch (error) {
        console.error('Failed to update drug therapy problem:', error);
      }
    }
  };

  if (isLoading || !currentPatient || !problem) {
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

  const initialData: DrugTherapyProblemFormData = {
    date: formatDateToISO(new Date(problem.date)),
    type: problem.type,
    description: problem.description,
    resolution: problem.resolution,
    isResolved: problem.isResolved,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Drug Therapy Problem</h1>
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
        <DrugTherapyProblemForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </Card>
    </div>
  );
};

export default EditDrugTherapyProblem;
