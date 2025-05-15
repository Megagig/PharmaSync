import { Request, Response, NextFunction } from 'express';
import integrationManagerService from '../services/integration/integrationManager.service';
import ehrIntegrationService from '../services/integration/ehrIntegration.service';
import pharmacySystemIntegrationService from '../services/integration/pharmacySystemIntegration.service';
import drugDatabaseIntegrationService from '../services/integration/drugDatabaseIntegration.service';
import { AppError } from '../utils/error';

/**
 * @desc    Get integration status
 * @route   GET /api/integrations/status
 * @access  Private/Admin
 */
export const getIntegrationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status = integrationManagerService.getIntegrationStatus();

    res.status(200).json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search patients in EHR
 * @route   GET /api/integrations/ehr/patients/search
 * @access  Private
 */
export const searchEHRPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ehrIntegrationService.isIntegrationEnabled()) {
      return next(new AppError('EHR integration is not enabled', 400));
    }

    const { query } = req.query;

    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    const patients = await ehrIntegrationService.searchPatients(
      query as string
    );

    res.status(200).json({
      status: 'success',
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Import patient from EHR
 * @route   POST /api/integrations/ehr/patients/import
 * @access  Private
 */
export const importEHRPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ehrIntegrationService.isIntegrationEnabled()) {
      return next(new AppError('EHR integration is not enabled', 400));
    }

    const { ehrPatientId } = req.body;

    if (!ehrPatientId) {
      return next(new AppError('EHR patient ID is required', 400));
    }

    const result = await integrationManagerService.importPatientWithRelatedData(
      ehrPatientId
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search medications in drug database
 * @route   GET /api/integrations/drug-database/medications/search
 * @access  Private
 */
export const searchDrugDatabaseMedications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!drugDatabaseIntegrationService.isIntegrationEnabled()) {
      return next(
        new AppError('Drug database integration is not enabled', 400)
      );
    }

    const { query } = req.query;

    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    const medications = await drugDatabaseIntegrationService.searchMedications(
      query as string
    );

    res.status(200).json({
      status: 'success',
      data: medications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Import medication from drug database
 * @route   POST /api/integrations/drug-database/medications/import
 * @access  Private
 */
export const importDrugDatabaseMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!drugDatabaseIntegrationService.isIntegrationEnabled()) {
      return next(
        new AppError('Drug database integration is not enabled', 400)
      );
    }

    const { externalMedicationId } = req.body;

    if (!externalMedicationId) {
      return next(new AppError('External medication ID is required', 400));
    }

    const medication = await drugDatabaseIntegrationService.importMedication(
      externalMedicationId
    );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check drug interactions
 * @route   POST /api/integrations/drug-database/interactions/check
 * @access  Private
 */
export const checkDrugInteractions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!drugDatabaseIntegrationService.isIntegrationEnabled()) {
      return next(
        new AppError('Drug database integration is not enabled', 400)
      );
    }

    const { medicationIds } = req.body;

    if (
      !medicationIds ||
      !Array.isArray(medicationIds) ||
      medicationIds.length === 0
    ) {
      return next(new AppError('Medication IDs are required', 400));
    }

    const interactions =
      await drugDatabaseIntegrationService.checkDrugInteractions(medicationIds);

    res.status(200).json({
      status: 'success',
      data: interactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sync inventory with pharmacy system
 * @route   POST /api/integrations/pharmacy-system/inventory/sync
 * @access  Private/Admin
 */
export const syncPharmacyInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!pharmacySystemIntegrationService.isIntegrationEnabled()) {
      return next(
        new AppError('Pharmacy system integration is not enabled', 400)
      );
    }

    const inventory = await integrationManagerService.syncInventory();

    res.status(200).json({
      status: 'success',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send prescription to pharmacy system
 * @route   POST /api/integrations/pharmacy-system/prescriptions/send
 * @access  Private
 */
export const sendPrescriptionToPharmacy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!pharmacySystemIntegrationService.isIntegrationEnabled()) {
      return next(
        new AppError('Pharmacy system integration is not enabled', 400)
      );
    }

    const { prescriptionId } = req.body;

    if (!prescriptionId) {
      return next(new AppError('Prescription ID is required', 400));
    }

    // In a real implementation, you would fetch the prescription from the database
    // For this example, we'll use a mock prescription
    const mockPrescription = {
      _id: prescriptionId,
      patient: {
        _id: '123456789',
        firstName: 'John',
        lastName: 'Doe',
      },
      prescribedBy: {
        name: 'Dr. Smith',
      },
      prescriptionDate: new Date(),
      medications: [
        {
          medication: {
            _id: '987654321',
            name: 'Amoxicillin',
          },
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
          route: 'Oral',
          instructions: 'Take with food',
          quantity: 21,
        },
      ],
      notes: 'Patient has penicillin allergy',
    };

    const result = await integrationManagerService.sendPrescriptionToPharmacy(
      mockPrescription
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medication with additional information
 * @route   GET /api/integrations/medications/:id/details
 * @access  Private
 */
export const getMedicationWithAdditionalInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!drugDatabaseIntegrationService.isIntegrationEnabled()) {
      return next(
        new AppError('Drug database integration is not enabled', 400)
      );
    }

    const { id } = req.params;
    const { externalId } = req.query;

    if (!id || !externalId) {
      return next(
        new AppError('Medication ID and external ID are required', 400)
      );
    }

    const medication =
      await integrationManagerService.getMedicationWithAdditionalInfo(
        id,
        externalId as string
      );

    res.status(200).json({
      status: 'success',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};
