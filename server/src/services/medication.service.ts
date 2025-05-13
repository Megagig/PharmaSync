import {
  IMedication,
  IMedicationCreate,
  IMedicationResponse,
  IMedicationUpdate,
  IInventoryItem,
  ISideEffect,
  IInteraction,
} from '../interfaces/medication.interface';
import Medication from '../models/medication.model';
import { NotFoundError, BadRequestError } from '../utils/error';
import { isDatePast } from '../utils/helpers';

export const createMedication = async (
  medicationData: IMedicationCreate,
  userId: string
): Promise<IMedicationResponse> => {
  // Create new medication
  const medication = await Medication.create({
    ...medicationData,
    createdBy: userId,
  });

  return formatMedicationResponse(medication);
};

export const getAllMedications = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
  requiresPrescription?: boolean
): Promise<{ medications: IMedicationResponse[]; total: number; pages: number }> => {
  const query: any = {};

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { brandName: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by prescription requirement
  if (requiresPrescription !== undefined) {
    query.requiresPrescription = requiresPrescription;
  }

  const total = await Medication.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const medications = await Medication.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  return {
    medications: medications.map(formatMedicationResponse),
    total,
    pages,
  };
};

export const getMedicationById = async (id: string): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(id);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  return formatMedicationResponse(medication);
};

export const updateMedication = async (
  id: string,
  updateData: IMedicationUpdate
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(id);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  // Update medication fields
  Object.assign(medication, updateData);

  // Save updated medication
  await medication.save();

  return formatMedicationResponse(medication);
};

export const deleteMedication = async (id: string): Promise<void> => {
  const medication = await Medication.findById(id);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  await medication.deleteOne();
};

export const addInventoryItem = async (
  medicationId: string,
  inventoryData: IInventoryItem
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  // Validate expiry date
  if (isDatePast(new Date(inventoryData.expiryDate))) {
    throw new BadRequestError('Expiry date cannot be in the past');
  }

  medication.inventory.push(inventoryData);
  await medication.save();

  return formatMedicationResponse(medication);
};

export const updateInventoryItem = async (
  medicationId: string,
  itemId: string,
  updateData: Partial<IInventoryItem>
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  const itemIndex = medication.inventory.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    throw new NotFoundError('Inventory item not found');
  }

  // Update inventory item fields
  Object.assign(medication.inventory[itemIndex], updateData);

  await medication.save();

  return formatMedicationResponse(medication);
};

export const removeInventoryItem = async (
  medicationId: string,
  itemId: string
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.inventory = medication.inventory.filter(
    (item) => item._id.toString() !== itemId
  );

  await medication.save();

  return formatMedicationResponse(medication);
};

export const addSideEffect = async (
  medicationId: string,
  sideEffectData: ISideEffect
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.sideEffects.push(sideEffectData);
  await medication.save();

  return formatMedicationResponse(medication);
};

export const removeSideEffect = async (
  medicationId: string,
  sideEffectId: string
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.sideEffects = medication.sideEffects.filter(
    (effect) => effect._id.toString() !== sideEffectId
  );

  await medication.save();

  return formatMedicationResponse(medication);
};

export const addInteraction = async (
  medicationId: string,
  interactionData: IInteraction
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.interactions.push(interactionData);
  await medication.save();

  return formatMedicationResponse(medication);
};

export const removeInteraction = async (
  medicationId: string,
  interactionId: string
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.interactions = medication.interactions.filter(
    (interaction) => interaction._id.toString() !== interactionId
  );

  await medication.save();

  return formatMedicationResponse(medication);
};

export const addContraindication = async (
  medicationId: string,
  contraindication: string
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.contraindications.push(contraindication);
  await medication.save();

  return formatMedicationResponse(medication);
};

export const removeContraindication = async (
  medicationId: string,
  contraindication: string
): Promise<IMedicationResponse> => {
  const medication = await Medication.findById(medicationId);

  if (!medication) {
    throw new NotFoundError('Medication not found');
  }

  medication.contraindications = medication.contraindications.filter(
    (item) => item !== contraindication
  );

  await medication.save();

  return formatMedicationResponse(medication);
};

export const getLowStockMedications = async (): Promise<IMedicationResponse[]> => {
  const medications = await Medication.find({
    $expr: {
      $lt: [
        { $sum: '$inventory.quantity' },
        '$minimumStockLevel'
      ]
    }
  });

  return medications.map(formatMedicationResponse);
};

export const getExpiringMedications = async (
  daysThreshold: number = 90
): Promise<IMedicationResponse[]> => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  const medications = await Medication.find({
    'inventory.expiryDate': { $lte: thresholdDate, $gte: new Date() }
  });

  return medications.map(formatMedicationResponse);
};

// Helper function to format medication response
const formatMedicationResponse = (medication: IMedication): IMedicationResponse => {
  const totalStock = medication.inventory.reduce((total, item) => total + item.quantity, 0);

  return {
    id: medication._id,
    name: medication.name,
    genericName: medication.genericName,
    brandName: medication.brandName,
    description: medication.description,
    type: medication.type,
    category: medication.category,
    dosageForm: medication.dosageForm,
    strength: medication.strength,
    manufacturer: medication.manufacturer,
    nafdacNumber: medication.nafdacNumber,
    requiresPrescription: medication.requiresPrescription,
    standardDosage: medication.standardDosage,
    sideEffects: medication.sideEffects,
    interactions: medication.interactions,
    contraindications: medication.contraindications,
    storageConditions: medication.storageConditions,
    inventory: medication.inventory,
    minimumStockLevel: medication.minimumStockLevel,
    totalStock,
    createdAt: medication.createdAt,
    updatedAt: medication.updatedAt,
  };
};
