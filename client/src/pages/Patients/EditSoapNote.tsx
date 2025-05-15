import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientById, updateSoapNote, setError } from '@/store/slices/patientSlice';
import { SoapNote, SoapNoteFormData } from '@/types/patient.types';
import Card from '@/components/common/Card/Card';
import SoapNoteForm from '@/components/domain/Patients/SoapNoteForm';
import { formatDateToISO } from '@/utils/date.utils';

const EditSoapNote = () => {
  const { id, noteId } = useParams<{ id: string; noteId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPatient, isLoading, error } = useSelector((state: RootState) => state.patients);
  const [note, setNote] = useState<SoapNote | null>(null);

  useEffect(() => {
    if (id && !currentPatient) {
      dispatch(fetchPatientById(id));
    } else if (currentPatient && noteId) {
      const foundNote = currentPatient.soapNotes.find(
        (n) => n._id === noteId
      );
      if (foundNote) {
        setNote(foundNote);
      } else {
        navigate(`/patients/${id}`);
      }
    }
    
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id, noteId, currentPatient, navigate]);

  const handleSubmit = async (data: SoapNoteFormData) => {
    if (id && noteId) {
      try {
        const resultAction = await dispatch(
          updateSoapNote({
            patientId: id,
            noteId,
            noteData: data,
          })
        );
        if (updateSoapNote.fulfilled.match(resultAction)) {
          navigate(`/patients/${id}`);
        }
      } catch (error) {
        console.error('Failed to update SOAP note:', error);
      }
    }
  };

  if (isLoading || !currentPatient || !note) {
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

  const initialData: SoapNoteFormData = {
    date: formatDateToISO(new Date(note.date)),
    subjective: note.subjective,
    objective: note.objective,
    assessment: note.assessment,
    plan: note.plan,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit SOAP Note</h1>
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
        <SoapNoteForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </Card>
    </div>
  );
};

export default EditSoapNote;
