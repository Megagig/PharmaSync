import {
  IPatient,
  IPatientCreate,
  IPatientResponse,
  IPatientUpdate,
  IAllergy,
  IMedicalCondition,
} from '../interfaces/patient.interface';
import Patient from '../models/patient.model';
import { NotFoundError, BadRequestError } from '../utils/error';
import mongoose, { Types } from 'mongoose';

export const createPatient = async (
  patientData: IPatientCreate,
  userId: string
): Promise<IPatientResponse> => {
  // Create new patient
  const patient = await Patient.create({
    ...patientData,
    createdBy: userId,
  });

  return formatPatientResponse(patient);
};

export const getAllPatients = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ patients: IPatientResponse[]; total: number; pages: number }> => {
  const query: any = {};

  // Add search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Patient.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const patients = await Patient.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    patients: patients.map(formatPatientResponse),
    total,
    pages,
  };
};

export const getPatientById = async (id: string): Promise<IPatientResponse> => {
  const patient = await Patient.findById(id).populate('medications');

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  return formatPatientResponse(patient);
};

export const updatePatient = async (
  id: string,
  updateData: IPatientUpdate
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(id);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Update patient fields
  Object.assign(patient, updateData);

  // Save updated patient
  await patient.save();

  return formatPatientResponse(patient);
};

export const deletePatient = async (id: string): Promise<void> => {
  const patient = await Patient.findById(id);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  await patient.deleteOne();
};

export const addAllergy = async (
  patientId: string,
  allergyData: IAllergy
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  patient.allergies.push(allergyData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateAllergy = async (
  patientId: string,
  allergyId: string,
  allergyData: IAllergy
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const allergyIndex = patient.allergies.findIndex(
    (allergy) => allergy._id && allergy._id.toString() === allergyId
  );

  if (allergyIndex === -1) {
    throw new NotFoundError('Allergy not found');
  }

  const currentAllergy = patient.allergies[allergyIndex];
  const updatedAllergy: IAllergy = {
    ...allergyData,
    _id: currentAllergy._id,
  };

  patient.allergies[allergyIndex] = updatedAllergy;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeAllergy = async (
  patientId: string,
  allergyId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  patient.allergies = patient.allergies.filter(
    (allergy) => !allergy._id || allergy._id.toString() !== allergyId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

export const addMedicalCondition = async (
  patientId: string,
  conditionData: IMedicalCondition
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  patient.medicalConditions.push(conditionData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateMedicalCondition = async (
  patientId: string,
  conditionId: string,
  conditionData: IMedicalCondition
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const conditionIndex = patient.medicalConditions.findIndex(
    (condition) => condition._id && condition._id.toString() === conditionId
  );

  if (conditionIndex === -1) {
    throw new NotFoundError('Medical condition not found');
  }

  const currentCondition = patient.medicalConditions[conditionIndex];
  const updatedCondition: IMedicalCondition = {
    ...conditionData,
    _id: currentCondition._id,
  };

  patient.medicalConditions[conditionIndex] = updatedCondition;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeMedicalCondition = async (
  patientId: string,
  conditionId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  patient.medicalConditions = patient.medicalConditions.filter(
    (condition) => !condition._id || condition._id.toString() !== conditionId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

export const addMedication = async (
  patientId: string,
  medicationId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  const medId = new mongoose.Types.ObjectId(medicationId);
  if (!patient.medications.some((id) => id.equals(medId))) {
    patient.medications.push(medId);
    await patient.save();
  }

  return formatPatientResponse(patient);
};

export const removeMedication = async (
  patientId: string,
  medicationId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  patient.medications = patient.medications.filter(
    (id) => id.toString() !== medicationId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

// Helper function to format patient response
const formatPatientResponse = (patient: IPatient): IPatientResponse => {
  return {
    id: patient._id.toString(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    phoneNumber: patient.phoneNumber,
    email: patient.email,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    medicalConditions: patient.medicalConditions,
    medications: patient.medications.map((med) => med.toString()),
    notes: patient.notes,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};
