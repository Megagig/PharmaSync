import { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patient.service';
import { IPatientCreate, IPatientUpdate, IAllergy, IMedicalCondition } from '../interfaces/patient.interface';

export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientData: IPatientCreate = req.body;
    const userId = req.user._id;
    
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
    
    const result = await patientService.getAllPatients(page, limit, search);
    
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
    
    const patient = await patientService.updateAllergy(patientId, allergyId, allergyData);
    
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
    
    const patient = await patientService.addMedicalCondition(patientId, conditionData);
    
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
    
    const patient = await patientService.removeMedicalCondition(patientId, conditionId);
    
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
    
    const patient = await patientService.removeMedication(patientId, medicationId);
    
    res.status(200).json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};
