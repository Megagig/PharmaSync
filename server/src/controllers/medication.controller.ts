import { Request, Response, NextFunction } from 'express';
import * as medicationService from '../services/medication.service';
import {
  IMedicationCreate,
  IMedicationUpdate,
  IInventoryItem,
  ISideEffect,
  IInteraction,
} from '../interfaces/medication.interface';

export const createMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationData: IMedicationCreate = req.body;
    const userId = req.user.id;

    const medication = await medicationService.createMedication(
      medicationData,
      userId
    );

    res.status(201).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMedications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const requiresPrescription =
      req.query.requiresPrescription === 'true'
        ? true
        : req.query.requiresPrescription === 'false'
        ? false
        : undefined;

    const result = await medicationService.getAllMedications(
      page,
      limit,
      search,
      category,
      requiresPrescription
    );

    res.status(200).json({
      status: 'success',
      data: result.medications,
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

export const getMedicationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const medication = await medicationService.getMedicationById(medicationId);

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const updateData: IMedicationUpdate = req.body;

    const medication = await medicationService.updateMedication(
      medicationId,
      updateData
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;

    await medicationService.deleteMedication(medicationId);

    res.status(200).json({
      status: 'success',
      message: 'Medication deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const inventoryData: IInventoryItem = req.body;

    const medication = await medicationService.addInventoryItem(
      medicationId,
      inventoryData
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const itemId = req.params.itemId;
    const updateData = req.body;

    const medication = await medicationService.updateInventoryItem(
      medicationId,
      itemId,
      updateData
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const removeInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const itemId = req.params.itemId;

    const medication = await medicationService.removeInventoryItem(
      medicationId,
      itemId
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const addSideEffect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const sideEffectData: ISideEffect = req.body;

    const medication = await medicationService.addSideEffect(
      medicationId,
      sideEffectData
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const removeSideEffect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const sideEffectId = req.params.sideEffectId;

    const medication = await medicationService.removeSideEffect(
      medicationId,
      sideEffectId
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const addInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const interactionData: IInteraction = req.body;

    const medication = await medicationService.addInteraction(
      medicationId,
      interactionData
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const removeInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const interactionId = req.params.interactionId;

    const medication = await medicationService.removeInteraction(
      medicationId,
      interactionId
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const addContraindication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const { contraindication } = req.body;

    const medication = await medicationService.addContraindication(
      medicationId,
      contraindication
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const removeContraindication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medicationId = req.params.id;
    const { contraindication } = req.body;

    const medication = await medicationService.removeContraindication(
      medicationId,
      contraindication
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockMedications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const medications = await medicationService.getLowStockMedications();

    res.status(200).json({
      status: 'success',
      data: medications,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiringMedications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const daysThreshold = parseInt(req.query.days as string) || 90;

    const medications = await medicationService.getExpiringMedications(
      daysThreshold
    );

    res.status(200).json({
      status: 'success',
      data: medications,
    });
  } catch (error) {
    next(error);
  }
};

// New endpoint for medication database
export const getMedicationDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This endpoint doesn't need to do anything special
    // It's just a placeholder to prevent 500 errors
    res.status(200).json({
      status: 'success',
      message: 'Medication database endpoint',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};
