import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PatientFormData,
  Gender,
  BloodGroup,
  MaritalStatus,
  Genotype,
} from '@/types/patient.types';
import Button from '@/components/common/Button/Button';

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
  isLoading: boolean;
}

const PatientForm = ({
  initialData,
  onSubmit,
  isLoading,
}: PatientFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    defaultValues: initialData || {
      gender: Gender.MALE,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            className={`form-input ${errors.firstName ? 'border-red-300' : ''}`}
            {...register('firstName', { required: 'First name is required' })}
          />
          {errors.firstName && (
            <p className="form-error">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            className={`form-input ${errors.lastName ? 'border-red-300' : ''}`}
            {...register('lastName', { required: 'Last name is required' })}
          />
          {errors.lastName && (
            <p className="form-error">{errors.lastName.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="form-label">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            className={`form-input ${
              errors.dateOfBirth ? 'border-red-300' : ''
            }`}
            {...register('dateOfBirth', {
              required: 'Date of birth is required',
            })}
          />
          {errors.dateOfBirth && (
            <p className="form-error">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="form-label">
            Gender
          </label>
          <select
            id="gender"
            className={`form-input ${errors.gender ? 'border-red-300' : ''}`}
            {...register('gender', { required: 'Gender is required' })}
          >
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
            <option value={Gender.OTHER}>Other</option>
          </select>
          {errors.gender && (
            <p className="form-error">{errors.gender.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            className={`form-input ${
              errors.phoneNumber ? 'border-red-300' : ''
            }`}
            {...register('phoneNumber', {
              required: 'Phone number is required',
            })}
          />
          {errors.phoneNumber && (
            <p className="form-error">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className={`form-input ${errors.email ? 'border-red-300' : ''}`}
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <input
            type="text"
            id="address"
            className="form-input"
            {...register('address')}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            id="city"
            className="form-input"
            {...register('city')}
          />
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="form-label">
            State
          </label>
          <input
            type="text"
            id="state"
            className="form-input"
            {...register('state')}
          />
        </div>

        {/* Blood Group */}
        <div>
          <label htmlFor="bloodGroup" className="form-label">
            Blood Group
          </label>
          <select
            id="bloodGroup"
            className="form-input"
            {...register('bloodGroup')}
          >
            <option value="">Select Blood Group</option>
            <option value={BloodGroup.A_POSITIVE}>A+</option>
            <option value={BloodGroup.A_NEGATIVE}>A-</option>
            <option value={BloodGroup.B_POSITIVE}>B+</option>
            <option value={BloodGroup.B_NEGATIVE}>B-</option>
            <option value={BloodGroup.AB_POSITIVE}>AB+</option>
            <option value={BloodGroup.AB_NEGATIVE}>AB-</option>
            <option value={BloodGroup.O_POSITIVE}>O+</option>
            <option value={BloodGroup.O_NEGATIVE}>O-</option>
          </select>
        </div>

        {/* Genotype */}
        <div>
          <label htmlFor="genotype" className="form-label">
            Genotype
          </label>
          <select
            id="genotype"
            className="form-input"
            {...register('genotype')}
          >
            <option value="">Select Genotype</option>
            <option value={Genotype.AA}>AA</option>
            <option value={Genotype.AS}>AS</option>
            <option value={Genotype.SS}>SS</option>
            <option value={Genotype.AC}>AC</option>
            <option value={Genotype.SC}>SC</option>
            <option value={Genotype.CC}>CC</option>
          </select>
        </div>

        {/* Marital Status */}
        <div>
          <label htmlFor="maritalStatus" className="form-label">
            Marital Status
          </label>
          <select
            id="maritalStatus"
            className="form-input"
            {...register('maritalStatus')}
          >
            <option value="">Select Marital Status</option>
            <option value={MaritalStatus.SINGLE}>Single</option>
            <option value={MaritalStatus.MARRIED}>Married</option>
            <option value={MaritalStatus.DIVORCED}>Divorced</option>
            <option value={MaritalStatus.WIDOWED}>Widowed</option>
          </select>
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="form-label">
            Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            step="0.1"
            min="0"
            className="form-input"
            {...register('weight', {
              valueAsNumber: true,
              validate: (value) =>
                !value || value > 0 || 'Weight must be greater than 0',
            })}
          />
          {errors.weight && (
            <p className="form-error">{errors.weight.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="form-label">
            Notes
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
        <Button
          variant="outline"
          type="button"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
