import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Prescription from '../models/prescription.model';
import Patient from '../models/patient.model';
import Medication from '../models/medication.model';
import { PrescriptionStatus } from '../interfaces/prescription.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all prescriptions with pagination and filtering
 * @route   GET /api/prescriptions
 * @access  Private
 */
export const getAllPrescriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by patient
    if (req.query.patient) {
      filter.patient = req.query.patient;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.prescriptionDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Search by prescription number
    if (req.query.search) {
      filter.prescriptionNumber = { $regex: req.query.search, $options: 'i' };
    }

    // Execute query with pagination
    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'firstName lastName')
      .populate('prescriber', 'firstName lastName')
      .sort({ prescriptionDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Prescription.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: prescriptions,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get prescription by ID
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
export const getPrescriptionById = asyncHandler(
  async (req: Request, res: Response) => {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('prescriber', 'firstName lastName email licenseNumber')
      .populate({
        path: 'items.medication',
        select: 'name genericName brandName strength dosageForm type',
      })
      .populate({
        path: 'dispensingHistory.dispensedBy',
        select: 'firstName lastName',
      });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Create new prescription
 * @route   POST /api/prescriptions
 * @access  Private
 */
export const createPrescription = asyncHandler(
  async (req: Request, res: Response) => {
    const { patient, prescriptionDate, expiryDate, items, notes } = req.body;

    // Verify patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      throw new AppError('Patient not found', 404);
    }

    // Verify all medications exist and require prescription
    for (const item of items) {
      const medication = await Medication.findById(item.medication);
      if (!medication) {
        throw new AppError(
          `Medication with ID ${item.medication} not found`,
          404
        );
      }

      if (!medication.requiresPrescription) {
        throw new AppError(
          `Medication ${medication.name} does not require a prescription`,
          400
        );
      }
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient,
      prescriber: req.user.id, // From auth middleware
      prescriptionDate: prescriptionDate || new Date(),
      expiryDate,
      items,
      notes,
    });

    res.status(201).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Update prescription
 * @route   PATCH /api/prescriptions/:id
 * @access  Private
 */
export const updatePrescription = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, expiryDate, notes } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Update fields
    if (status) prescription.status = status;
    if (expiryDate) prescription.expiryDate = new Date(expiryDate);
    if (notes !== undefined) prescription.notes = notes;

    await prescription.save();

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Add item to prescription
 * @route   POST /api/prescriptions/:id/items
 * @access  Private
 */
export const addPrescriptionItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { medication, dosage, quantity, refills, startDate, endDate, notes } =
      req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Verify medication exists and requires prescription
    const medicationDoc = await Medication.findById(medication);
    if (!medicationDoc) {
      throw new AppError('Medication not found', 404);
    }

    if (!medicationDoc.requiresPrescription) {
      throw new AppError(
        `Medication ${medicationDoc.name} does not require a prescription`,
        400
      );
    }

    // Add item to prescription
    prescription.items.push({
      medication,
      dosage,
      quantity,
      refills,
      refillsRemaining: refills,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      dosageInstructions: {
        frequency: 'daily', // Default value, should be provided in the request
        duration: '30 days', // Default value, should be provided in the request
        instructions: 'Take as directed', // Default value, should be provided in the request
      },
      notes,
    });

    await prescription.save();

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Update prescription item
 * @route   PATCH /api/prescriptions/:id/items/:itemId
 * @access  Private
 */
export const updatePrescriptionItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { dosage, quantity, refills, refillsRemaining, endDate, notes } =
      req.body;
    const { id, itemId } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Find the item
    const item = prescription.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!item) {
      throw new AppError('Prescription item not found', 404);
    }

    // Update fields
    if (dosage) item.dosage = dosage;
    if (quantity) item.quantity = quantity;
    if (refills !== undefined) item.refills = refills;
    if (refillsRemaining !== undefined)
      item.refillsRemaining = refillsRemaining;
    if (endDate) item.endDate = new Date(endDate);
    if (notes !== undefined) item.notes = notes;

    await prescription.save();

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Remove prescription item
 * @route   DELETE /api/prescriptions/:id/items/:itemId
 * @access  Private
 */
export const removePrescriptionItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, itemId } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Find the item to remove
    const itemIndex = prescription.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex !== -1) {
      // Remove the item using splice
      prescription.items.splice(itemIndex, 1);
    }

    await prescription.save();

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Dispense medication
 * @route   POST /api/prescriptions/:id/dispense
 * @access  Private
 */
export const dispenseMedication = asyncHandler(
  async (req: Request, res: Response) => {
    const { items, notes } = req.body;
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Check if prescription is active
    if (prescription.status !== PrescriptionStatus.ACTIVE) {
      throw new AppError(
        `Cannot dispense medication for a prescription with status: ${prescription.status}`,
        400
      );
    }

    // Check if prescription has expired
    if (new Date() > prescription.expiryDate) {
      throw new AppError('Prescription has expired', 400);
    }

    // Process each item
    for (const dispensedItem of items) {
      const { itemId, quantity, batchNumber } = dispensedItem;

      // Find the prescription item
      const prescriptionItem = prescription.items.find(
        (item) => item._id.toString() === itemId
      );

      if (!prescriptionItem) {
        throw new AppError(
          `Prescription item with ID ${itemId} not found`,
          404
        );
      }

      // Check if there are refills remaining
      if (prescriptionItem.refillsRemaining <= 0) {
        throw new AppError(`No refills remaining for item ${itemId}`, 400);
      }

      // Update medication inventory
      const medication = await Medication.findById(prescriptionItem.medication);

      if (!medication) {
        throw new AppError('Medication not found', 404);
      }

      // Find the inventory item with the specified batch number
      const inventoryItem = medication.inventory.find(
        (item) => item.batchNumber === batchNumber
      );

      if (!inventoryItem) {
        throw new AppError(
          `Inventory item with batch number ${batchNumber} not found`,
          404
        );
      }

      // Check if there's enough quantity
      if (inventoryItem.quantity < quantity) {
        throw new AppError(
          `Insufficient quantity in inventory for batch ${batchNumber}`,
          400
        );
      }

      // Update inventory quantity
      inventoryItem.quantity -= quantity;

      await medication.save();

      // Decrement refills remaining
      prescriptionItem.refillsRemaining -= 1;
    }

    // Add dispensing record
    prescription.dispensingHistory.push({
      date: new Date(),
      quantity: items.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      ),
      batchNumber: items.map((item: any) => item.batchNumber).join(', '),
      dispensedBy: new mongoose.Types.ObjectId(req.user.id), // From auth middleware
      notes,
    });

    // Update prescription status if all items have been dispensed
    const allDispensed = prescription.items.every(
      (item) => item.refillsRemaining === 0
    );

    if (allDispensed) {
      prescription.status = PrescriptionStatus.COMPLETED;
    }

    await prescription.save();

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);

/**
 * @desc    Cancel prescription
 * @route   PATCH /api/prescriptions/:id/cancel
 * @access  Private
 */
export const cancelPrescription = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Update status to cancelled
    prescription.status = PrescriptionStatus.CANCELLED;

    await prescription.save();

    res.status(200).json({
      status: 'success',
      data: prescription,
    });
  }
);
