import {
  IPatient,
  IPatientCreate,
  IPatientResponse,
  IPatientUpdate,
  IAllergy,
  IMedicalCondition,
  IMedicationHistory,
  IClinicalAssessment,
  ILaboratoryFinding,
  IDrugTherapyProblem,
  ICarePlan,
  ISoapNote,
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
  search?: string,
  filters: any = {}
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

  // Add demographic filters
  if (filters.gender) {
    query.gender = filters.gender;
  }

  if (filters.bloodGroup) {
    query.bloodGroup = filters.bloodGroup;
  }

  if (filters.genotype) {
    query.genotype = filters.genotype;
  }

  if (filters.maritalStatus) {
    query.maritalStatus = filters.maritalStatus;
  }

  // Add age range filters
  if (filters.minAge || filters.maxAge) {
    query.dateOfBirth = {};

    if (filters.minAge) {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - filters.minAge);
      query.dateOfBirth.$lte = maxDate;
    }

    if (filters.maxAge) {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - filters.maxAge - 1);
      query.dateOfBirth.$gte = minDate;
    }
  }

  // Add record existence filters
  if (filters.hasAllergies !== undefined) {
    if (filters.hasAllergies) {
      query['allergies.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { allergies: { $exists: false } },
        { allergies: { $size: 0 } }
      );
    }
  }

  if (filters.hasMedicalConditions !== undefined) {
    if (filters.hasMedicalConditions) {
      query['medicalConditions.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { medicalConditions: { $exists: false } },
        { medicalConditions: { $size: 0 } }
      );
    }
  }

  if (filters.hasMedicationHistory !== undefined) {
    if (filters.hasMedicationHistory) {
      query['medicationHistory.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { medicationHistory: { $exists: false } },
        { medicationHistory: { $size: 0 } }
      );
    }
  }

  if (filters.hasClinicalAssessments !== undefined) {
    if (filters.hasClinicalAssessments) {
      query['clinicalAssessments.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { clinicalAssessments: { $exists: false } },
        { clinicalAssessments: { $size: 0 } }
      );
    }
  }

  if (filters.hasLaboratoryFindings !== undefined) {
    if (filters.hasLaboratoryFindings) {
      query['laboratoryFindings.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { laboratoryFindings: { $exists: false } },
        { laboratoryFindings: { $size: 0 } }
      );
    }
  }

  if (filters.hasDrugTherapyProblems !== undefined) {
    if (filters.hasDrugTherapyProblems) {
      query['drugTherapyProblems.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { drugTherapyProblems: { $exists: false } },
        { drugTherapyProblems: { $size: 0 } }
      );
    }
  }

  if (filters.hasCarePlans !== undefined) {
    if (filters.hasCarePlans) {
      query['carePlans.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { carePlans: { $exists: false } },
        { carePlans: { $size: 0 } }
      );
    }
  }

  if (filters.hasSoapNotes !== undefined) {
    if (filters.hasSoapNotes) {
      query['soapNotes.0'] = { $exists: true };
    } else {
      query.$or = query.$or || [];
      query.$or.push(
        { soapNotes: { $exists: false } },
        { soapNotes: { $size: 0 } }
      );
    }
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

// Medication History Services
export const addMedicationHistory = async (
  patientId: string,
  medicationData: IMedicationHistory
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.medicationHistory) {
    patient.medicationHistory = [];
  }

  patient.medicationHistory.push(medicationData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateMedicationHistory = async (
  patientId: string,
  medicationId: string,
  medicationData: IMedicationHistory
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.medicationHistory) {
    throw new NotFoundError('Medication history not found');
  }

  const medicationIndex = patient.medicationHistory.findIndex(
    (medication) => medication._id && medication._id.toString() === medicationId
  );

  if (medicationIndex === -1) {
    throw new NotFoundError('Medication history entry not found');
  }

  const currentMedication = patient.medicationHistory[medicationIndex];
  const updatedMedication: IMedicationHistory = {
    ...medicationData,
    _id: currentMedication._id,
  };

  patient.medicationHistory[medicationIndex] = updatedMedication;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeMedicationHistory = async (
  patientId: string,
  medicationId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.medicationHistory) {
    throw new NotFoundError('Medication history not found');
  }

  patient.medicationHistory = patient.medicationHistory.filter(
    (medication) =>
      !medication._id || medication._id.toString() !== medicationId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

// Clinical Assessment Services
export const addClinicalAssessment = async (
  patientId: string,
  assessmentData: IClinicalAssessment
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.clinicalAssessments) {
    patient.clinicalAssessments = [];
  }

  patient.clinicalAssessments.push(assessmentData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateClinicalAssessment = async (
  patientId: string,
  assessmentId: string,
  assessmentData: IClinicalAssessment
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.clinicalAssessments) {
    throw new NotFoundError('Clinical assessments not found');
  }

  const assessmentIndex = patient.clinicalAssessments.findIndex(
    (assessment) => assessment._id && assessment._id.toString() === assessmentId
  );

  if (assessmentIndex === -1) {
    throw new NotFoundError('Clinical assessment not found');
  }

  const currentAssessment = patient.clinicalAssessments[assessmentIndex];
  const updatedAssessment: IClinicalAssessment = {
    ...assessmentData,
    _id: currentAssessment._id,
  };

  patient.clinicalAssessments[assessmentIndex] = updatedAssessment;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeClinicalAssessment = async (
  patientId: string,
  assessmentId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.clinicalAssessments) {
    throw new NotFoundError('Clinical assessments not found');
  }

  patient.clinicalAssessments = patient.clinicalAssessments.filter(
    (assessment) =>
      !assessment._id || assessment._id.toString() !== assessmentId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

// Laboratory Finding Services
export const addLaboratoryFinding = async (
  patientId: string,
  findingData: ILaboratoryFinding
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.laboratoryFindings) {
    patient.laboratoryFindings = [];
  }

  patient.laboratoryFindings.push(findingData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateLaboratoryFinding = async (
  patientId: string,
  findingId: string,
  findingData: ILaboratoryFinding
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.laboratoryFindings) {
    throw new NotFoundError('Laboratory findings not found');
  }

  const findingIndex = patient.laboratoryFindings.findIndex(
    (finding) => finding._id && finding._id.toString() === findingId
  );

  if (findingIndex === -1) {
    throw new NotFoundError('Laboratory finding not found');
  }

  const currentFinding = patient.laboratoryFindings[findingIndex];
  const updatedFinding: ILaboratoryFinding = {
    ...findingData,
    _id: currentFinding._id,
  };

  patient.laboratoryFindings[findingIndex] = updatedFinding;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeLaboratoryFinding = async (
  patientId: string,
  findingId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.laboratoryFindings) {
    throw new NotFoundError('Laboratory findings not found');
  }

  patient.laboratoryFindings = patient.laboratoryFindings.filter(
    (finding) => !finding._id || finding._id.toString() !== findingId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

// Drug Therapy Problem Services
export const addDrugTherapyProblem = async (
  patientId: string,
  problemData: IDrugTherapyProblem
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.drugTherapyProblems) {
    patient.drugTherapyProblems = [];
  }

  patient.drugTherapyProblems.push(problemData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateDrugTherapyProblem = async (
  patientId: string,
  problemId: string,
  problemData: IDrugTherapyProblem
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.drugTherapyProblems) {
    throw new NotFoundError('Drug therapy problems not found');
  }

  const problemIndex = patient.drugTherapyProblems.findIndex(
    (problem) => problem._id && problem._id.toString() === problemId
  );

  if (problemIndex === -1) {
    throw new NotFoundError('Drug therapy problem not found');
  }

  const currentProblem = patient.drugTherapyProblems[problemIndex];
  const updatedProblem: IDrugTherapyProblem = {
    ...problemData,
    _id: currentProblem._id,
  };

  patient.drugTherapyProblems[problemIndex] = updatedProblem;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeDrugTherapyProblem = async (
  patientId: string,
  problemId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.drugTherapyProblems) {
    throw new NotFoundError('Drug therapy problems not found');
  }

  patient.drugTherapyProblems = patient.drugTherapyProblems.filter(
    (problem) => !problem._id || problem._id.toString() !== problemId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

// Care Plan Services
export const addCarePlan = async (
  patientId: string,
  planData: ICarePlan
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.carePlans) {
    patient.carePlans = [];
  }

  patient.carePlans.push(planData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateCarePlan = async (
  patientId: string,
  planId: string,
  planData: ICarePlan
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.carePlans) {
    throw new NotFoundError('Care plans not found');
  }

  const planIndex = patient.carePlans.findIndex(
    (plan) => plan._id && plan._id.toString() === planId
  );

  if (planIndex === -1) {
    throw new NotFoundError('Care plan not found');
  }

  const currentPlan = patient.carePlans[planIndex];
  const updatedPlan: ICarePlan = {
    ...planData,
    _id: currentPlan._id,
  };

  patient.carePlans[planIndex] = updatedPlan;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeCarePlan = async (
  patientId: string,
  planId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.carePlans) {
    throw new NotFoundError('Care plans not found');
  }

  patient.carePlans = patient.carePlans.filter(
    (plan) => !plan._id || plan._id.toString() !== planId
  );

  await patient.save();

  return formatPatientResponse(patient);
};

// SOAP Note Services
export const addSoapNote = async (
  patientId: string,
  noteData: ISoapNote
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.soapNotes) {
    patient.soapNotes = [];
  }

  patient.soapNotes.push(noteData);
  await patient.save();

  return formatPatientResponse(patient);
};

export const updateSoapNote = async (
  patientId: string,
  noteId: string,
  noteData: ISoapNote
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.soapNotes) {
    throw new NotFoundError('SOAP notes not found');
  }

  const noteIndex = patient.soapNotes.findIndex(
    (note) => note._id && note._id.toString() === noteId
  );

  if (noteIndex === -1) {
    throw new NotFoundError('SOAP note not found');
  }

  const currentNote = patient.soapNotes[noteIndex];
  const updatedNote: ISoapNote = {
    ...noteData,
    _id: currentNote._id,
  };

  patient.soapNotes[noteIndex] = updatedNote;

  await patient.save();

  return formatPatientResponse(patient);
};

export const removeSoapNote = async (
  patientId: string,
  noteId: string
): Promise<IPatientResponse> => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (!patient.soapNotes) {
    throw new NotFoundError('SOAP notes not found');
  }

  patient.soapNotes = patient.soapNotes.filter(
    (note) => !note._id || note._id.toString() !== noteId
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
    age: patient.age,
    gender: patient.gender,
    phoneNumber: patient.phoneNumber,
    email: patient.email,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    bloodGroup: patient.bloodGroup,
    genotype: patient.genotype,
    maritalStatus: patient.maritalStatus,
    weight: patient.weight,
    allergies: patient.allergies,
    medicalConditions: patient.medicalConditions,
    medicationHistory: patient.medicationHistory || [],
    clinicalAssessments: patient.clinicalAssessments || [],
    laboratoryFindings: patient.laboratoryFindings || [],
    drugTherapyProblems: patient.drugTherapyProblems || [],
    carePlans: patient.carePlans || [],
    soapNotes: patient.soapNotes || [],
    medications: patient.medications.map((med) => med.toString()),
    notes: patient.notes,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};
