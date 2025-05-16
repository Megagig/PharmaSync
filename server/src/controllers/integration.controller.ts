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

    try {
      const medications =
        await drugDatabaseIntegrationService.searchMedications(query as string);

      res.status(200).json({
        status: 'success',
        data: medications,
      });
    } catch (error: any) {
      // If there's an error with MongoDB, we can still search RxNav directly
      if (error.message && error.message.includes('MongoDB')) {
        try {
          // Search medications directly from RxNav
          const rxnavService =
            require('../services/integration/rxnav.service').default;
          const medications = await rxnavService.searchMedicationsByName(
            query as string
          );

          // Transform the results to match our expected format
          const transformedMedications = medications.map((med: any) => ({
            id: med.rxcui,
            name: med.name,
            type: med.tty,
            externalId: med.rxcui,
          }));

          res.status(200).json({
            status: 'success',
            data: transformedMedications,
          });
        } catch (rxnavError) {
          next(rxnavError);
        }
      } else {
        next(error);
      }
    }
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
 * @desc    Get medication details from drug database
 * @route   GET /api/integrations/drug-database/medications/:id
 * @access  Private
 */
export const getMedicationDetails = async (
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

    if (!id) {
      return next(new AppError('Medication ID is required', 400));
    }

    try {
      const medication =
        await drugDatabaseIntegrationService.getMedicationDetails(id);

      res.status(200).json({
        status: 'success',
        data: medication,
      });
    } catch (error: any) {
      // If there's an error with MongoDB, we can still return the RxNav data directly
      if (error.message && error.message.includes('MongoDB')) {
        try {
          // Get medication details directly from RxNav
          const rxnavService =
            require('../services/integration/rxnav.service').default;

          // Get basic medication info
          const medicationInfo = await rxnavService.getMedicationByRxcui(id);

          // Get medication properties
          const properties = await rxnavService.getMedicationProperties(id);

          // Get drug class information
          const drugClass = await rxnavService.getDrugClass(id);

          // Get side effects
          const sideEffects = await rxnavService.getMedicationSideEffects(id);

          // Get contraindications
          const contraindications =
            await rxnavService.getMedicationContraindications(id);

          // Get dosage information
          const dosage = await rxnavService.getMedicationDosage(id);

          // Combine all the information
          const medication = {
            id,
            name: medicationInfo.name,
            rxcui: id,
            properties,
            drugClass,
            sideEffects,
            contraindications,
            dosage,
          };

          res.status(200).json({
            status: 'success',
            data: medication,
          });
        } catch (rxnavError) {
          next(rxnavError);
        }
      } else {
        next(error);
      }
    }
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

    const { medications } = req.body;

    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      return next(new AppError('Medication IDs are required', 400));
    }

    try {
      const interactions =
        await drugDatabaseIntegrationService.checkDrugInteractions(medications);

      res.status(200).json({
        status: 'success',
        data: interactions,
      });
    } catch (error: any) {
      // If there's an error with MongoDB, we can still check interactions directly with RxNav
      if (error.message && error.message.includes('MongoDB')) {
        try {
          // Check interactions directly from RxNav
          const rxnavService =
            require('../services/integration/rxnav.service').default;
          const interactions = await rxnavService.getDrugInteractions(
            medications
          );

          // Transform the interactions to a more usable format
          const transformedInteractions = interactions.map(
            (interaction: any) => {
              const interactionPair = interaction.interactionPair[0];
              return {
                drug1: {
                  rxcui:
                    interactionPair.interactionConcept[0].minConceptItem.rxcui,
                  name: interactionPair.interactionConcept[0].minConceptItem
                    .name,
                },
                drug2: {
                  rxcui:
                    interactionPair.interactionConcept[1].minConceptItem.rxcui,
                  name: interactionPair.interactionConcept[1].minConceptItem
                    .name,
                },
                description: interactionPair.description,
                severity: mapInteractionSeverity(interactionPair.severity),
              };
            }
          );

          res.status(200).json({
            status: 'success',
            data: transformedInteractions,
          });
        } catch (rxnavError) {
          next(rxnavError);
        }
      } else {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Helper function to map RxNav interaction severity to our system's severity levels
const mapInteractionSeverity = (
  rxnavSeverity: string
): 'minor' | 'moderate' | 'major' | 'contraindicated' => {
  // RxNav uses different severity levels, so we need to map them
  switch (rxnavSeverity?.toLowerCase()) {
    case 'high':
      return 'major';
    case 'n/a':
    case 'low':
      return 'minor';
    case 'medium':
      return 'moderate';
    default:
      return 'moderate';
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
