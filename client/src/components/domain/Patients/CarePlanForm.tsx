import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CarePlanFormData } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface CarePlanFormProps {
  initialData?: Partial<CarePlanFormData>;
  onSubmit: (data: CarePlanFormData) => void;
  isLoading: boolean;
}

const CarePlanForm = ({
  initialData,
  onSubmit,
  isLoading,
}: CarePlanFormProps) => {
  const [goals, setGoals] = useState<string[]>(initialData?.goals || ['']);
  const [objectives, setObjectives] = useState<string[]>(initialData?.objectives || ['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<CarePlanFormData, 'goals' | 'objectives'>>({
    defaultValues: {
      date: initialData?.date || formatDateToISO(new Date()),
      followUpDate: initialData?.followUpDate || '',
      drugTherapyProblemResolved: initialData?.drugTherapyProblemResolved || false,
      needsReview: initialData?.needsReview || true,
      notes: initialData?.notes || '',
    },
  });

  const handleAddGoal = () => {
    setGoals([...goals, '']);
  };

  const handleRemoveGoal = (index: number) => {
    if (goals.length > 1) {
      const updatedGoals = [...goals];
      updatedGoals.splice(index, 1);
      setGoals(updatedGoals);
    }
  };

  const handleGoalChange = (index: number, value: string) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = value;
    setGoals(updatedGoals);
  };

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    if (objectives.length > 1) {
      const updatedObjectives = [...objectives];
      updatedObjectives.splice(index, 1);
      setObjectives(updatedObjectives);
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index] = value;
    setObjectives(updatedObjectives);
  };

  const processFormData = (data: Omit<CarePlanFormData, 'goals' | 'objectives'>) => {
    // Filter out empty goals and objectives
    const filteredGoals = goals.filter(goal => goal.trim() !== '');
    const filteredObjectives = objectives.filter(objective => objective.trim() !== '');

    // Submit the form data with goals and objectives
    onSubmit({
      ...data,
      goals: filteredGoals,
      objectives: filteredObjectives,
    } as CarePlanFormData);
  };

  return (
    <form onSubmit={handleSubmit(processFormData)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Date */}
        <div>
          <label htmlFor="date" className="form-label">
            Plan Date
          </label>
          <input
            type="date"
            id="date"
            className={`form-input ${errors.date ? 'border-red-300' : ''}`}
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        {/* Follow-up Date */}
        <div>
          <label htmlFor="followUpDate" className="form-label">
            Follow-up Date
          </label>
          <input
            type="date"
            id="followUpDate"
            className={`form-input ${errors.followUpDate ? 'border-red-300' : ''}`}
            {...register('followUpDate', { required: 'Follow-up date is required' })}
          />
          {errors.followUpDate && <p className="form-error">{errors.followUpDate.message}</p>}
        </div>

        {/* Goals */}
        <div className="sm:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label">Goals</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddGoal}
            >
              Add Goal
            </Button>
          </div>

          {goals.map((goal, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder={`Goal ${index + 1}`}
                className="form-input flex-grow"
                value={goal}
                onChange={(e) => handleGoalChange(index, e.target.value)}
              />
              {goals.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveGoal(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Objectives */}
        <div className="sm:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label">Objectives</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddObjective}
            >
              Add Objective
            </Button>
          </div>

          {objectives.map((objective, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder={`Objective ${index + 1}`}
                className="form-input flex-grow"
                value={objective}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
              />
              {objectives.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveObjective(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Drug Therapy Problem Resolved */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="drugTherapyProblemResolved"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('drugTherapyProblemResolved')}
          />
          <label htmlFor="drugTherapyProblemResolved" className="ml-2 block text-sm text-gray-700">
            Drug Therapy Problem Resolved
          </label>
        </div>

        {/* Needs Review */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="needsReview"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('needsReview')}
          />
          <label htmlFor="needsReview" className="ml-2 block text-sm text-gray-700">
            Care Plan Needs Review
          </label>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="form-label">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="form-input"
            {...register('notes')}
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default CarePlanForm;
