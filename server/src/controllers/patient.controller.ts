import { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patient.service';
import {
  IPatientCreate,
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

export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientData: IPatientCreate = req.body;
    const userId = req.user.id;

    const patient = await patientService.createPatient(patientData, userId);

    res.status(201).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Extract filter parameters
    const filters: any = {};

    // Demographic filters
    if (req.query.gender) filters.gender = req.query.gender;
    if (req.query.bloodGroup) filters.bloodGroup = req.query.bloodGroup;
    if (req.query.genotype) filters.genotype = req.query.genotype;
    if (req.query.maritalStatus)
      filters.maritalStatus = req.query.maritalStatus;

    // Age range filters
    if (req.query.minAge) filters.minAge = parseInt(req.query.minAge as string);
    if (req.query.maxAge) filters.maxAge = parseInt(req.query.maxAge as string);

    // Record existence filters
    if (req.query.hasAllergies !== undefined) {
      filters.hasAllergies = req.query.hasAllergies === 'true';
    }

    if (req.query.hasMedicalConditions !== undefined) {
      filters.hasMedicalConditions = req.query.hasMedicalConditions === 'true';
    }

    if (req.query.hasMedicationHistory !== undefined) {
      filters.hasMedicationHistory = req.query.hasMedicationHistory === 'true';
    }

    if (req.query.hasClinicalAssessments !== undefined) {
      filters.hasClinicalAssessments =
        req.query.hasClinicalAssessments === 'true';
    }

    if (req.query.hasLaboratoryFindings !== undefined) {
      filters.hasLaboratoryFindings =
        req.query.hasLaboratoryFindings === 'true';
    }

    if (req.query.hasDrugTherapyProblems !== undefined) {
      filters.hasDrugTherapyProblems =
        req.query.hasDrugTherapyProblems === 'true';
    }

    if (req.query.hasCarePlans !== undefined) {
      filters.hasCarePlans = req.query.hasCarePlans === 'true';
    }

    if (req.query.hasSoapNotes !== undefined) {
      filters.hasSoapNotes = req.query.hasSoapNotes === 'true';
    }

    const result = await patientService.getAllPatients(
      page,
      limit,
      search,
      filters
    );

    res.status(200).json({
      status: 'success',
      data: result.patients,
      meta: {
        total: result.total,
        pages: result.pages,
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const patient = await patientService.getPatientById(patientId);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const updateData: IPatientUpdate = req.body;

    const patient = await patientService.updatePatient(patientId, updateData);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;

    await patientService.deletePatient(patientId);

    res.status(200).json({
      status: 'success',
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addAllergy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const allergyData: IAllergy = req.body;

    const patient = await patientService.addAllergy(patientId, allergyData);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAllergy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const allergyId = req.params.allergyId;
    const allergyData: IAllergy = req.body;

    const patient = await patientService.updateAllergy(
      patientId,
      allergyId,
      allergyData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeAllergy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const allergyId = req.params.allergyId;

    const patient = await patientService.removeAllergy(patientId, allergyId);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const addMedicalCondition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const conditionData: IMedicalCondition = req.body;

    const patient = await patientService.addMedicalCondition(
      patientId,
      conditionData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicalCondition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const conditionId = req.params.conditionId;
    const conditionData: IMedicalCondition = req.body;

    const patient = await patientService.updateMedicalCondition(
      patientId,
      conditionId,
      conditionData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMedicalCondition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const conditionId = req.params.conditionId;

    const patient = await patientService.removeMedicalCondition(
      patientId,
      conditionId
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const addMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const { medicationId } = req.body;

    const patient = await patientService.addMedication(patientId, medicationId);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const medicationId = req.params.medicationId;

    const patient = await patientService.removeMedication(
      patientId,
      medicationId
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Medication History Controllers
export const addMedicationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const medicationData: IMedicationHistory = req.body;

    const patient = await patientService.addMedicationHistory(
      patientId,
      medicationData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const medicationId = req.params.medicationId;
    const medicationData: IMedicationHistory = req.body;

    const patient = await patientService.updateMedicationHistory(
      patientId,
      medicationId,
      medicationData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMedicationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const medicationId = req.params.medicationId;

    const patient = await patientService.removeMedicationHistory(
      patientId,
      medicationId
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Clinical Assessment Controllers
export const addClinicalAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const assessmentData: IClinicalAssessment = req.body;

    const patient = await patientService.addClinicalAssessment(
      patientId,
      assessmentData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinicalAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const assessmentId = req.params.assessmentId;
    const assessmentData: IClinicalAssessment = req.body;

    const patient = await patientService.updateClinicalAssessment(
      patientId,
      assessmentId,
      assessmentData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeClinicalAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const assessmentId = req.params.assessmentId;

    const patient = await patientService.removeClinicalAssessment(
      patientId,
      assessmentId
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Laboratory Finding Controllers
export const addLaboratoryFinding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const findingData: ILaboratoryFinding = req.body;

    const patient = await patientService.addLaboratoryFinding(
      patientId,
      findingData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLaboratoryFinding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const findingId = req.params.findingId;
    const findingData: ILaboratoryFinding = req.body;

    const patient = await patientService.updateLaboratoryFinding(
      patientId,
      findingId,
      findingData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeLaboratoryFinding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const findingId = req.params.findingId;

    const patient = await patientService.removeLaboratoryFinding(
      patientId,
      findingId
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Drug Therapy Problem Controllers
export const addDrugTherapyProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const problemData: IDrugTherapyProblem = req.body;

    const patient = await patientService.addDrugTherapyProblem(
      patientId,
      problemData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDrugTherapyProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const problemId = req.params.problemId;
    const problemData: IDrugTherapyProblem = req.body;

    const patient = await patientService.updateDrugTherapyProblem(
      patientId,
      problemId,
      problemData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeDrugTherapyProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const problemId = req.params.problemId;

    const patient = await patientService.removeDrugTherapyProblem(
      patientId,
      problemId
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// Care Plan Controllers
export const addCarePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const planData: ICarePlan = req.body;

    const patient = await patientService.addCarePlan(patientId, planData);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCarePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const planId = req.params.planId;
    const planData: ICarePlan = req.body;

    const patient = await patientService.updateCarePlan(
      patientId,
      planId,
      planData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCarePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const planId = req.params.planId;

    const patient = await patientService.removeCarePlan(patientId, planId);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// SOAP Note Controllers
export const addSoapNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const noteData: ISoapNote = req.body;

    const patient = await patientService.addSoapNote(patientId, noteData);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSoapNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const noteId = req.params.noteId;
    const noteData: ISoapNote = req.body;

    const patient = await patientService.updateSoapNote(
      patientId,
      noteId,
      noteData
    );

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const removeSoapNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.id;
    const noteId = req.params.noteId;

    const patient = await patientService.removeSoapNote(patientId, noteId);

    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};
