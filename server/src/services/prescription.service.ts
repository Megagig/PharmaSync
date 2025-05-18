import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import Prescription from '../models/prescription.model';
import Customer from '../models/customer.model';
import Product from '../models/product.model';
import PosTransaction from '../models/posTransaction.model';
import { PrescriptionStatus } from '../interfaces/prescription.interface';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';
import { sendEmail } from './email.service';
import { formatDate } from '../utils/formatters';

/**
 * Get prescriptions with filtering and pagination
 */
export const getPrescriptions = async ({
  page = 1,
  limit = 10,
  customer,
  doctor,
  status,
  startDate,
  endDate,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (customer) {
      query.patient = new mongoose.Types.ObjectId(customer);
    }

    if (doctor) {
      query.prescriber = new mongoose.Types.ObjectId(doctor);
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.prescriptionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.prescriptionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.prescriptionDate = { $lte: new Date(endDate) };
    }

    if (search) {
      query.$or = [
        { prescriptionNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('prescriber', 'firstName lastName')
      .populate('items.medication', 'name genericName brandName strength dosageForm')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Prescription.countDocuments(query);

    return {
      prescriptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getPrescriptions:', error);
    throw error;
  }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (id: string) => {
  try {
    const prescription = await Prescription.findById(id)
      .populate('patient', 'firstName lastName email phone')
      .populate('prescriber', 'firstName lastName')
      .populate('items.medication', 'name genericName brandName strength dosageForm');

    if (!prescription) {
      throw new AppError(`Prescription not found with ID: ${id}`, 404);
    }

    return prescription;
  } catch (error) {
    logger.error(`Error in getPrescriptionById: ${error}`);
    throw error;
  }
};

/**
 * Create a new prescription
 */
export const createPrescription = async (prescriptionData: any, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate patient
    const patient = await mongoose.model('Patient').findById(prescriptionData.patient).session(session);
    if (!patient) {
      throw new AppError(`Patient not found with ID: ${prescriptionData.patient}`, 404);
    }

    // Validate prescriber
    const prescriber = await mongoose.model('User').findById(prescriptionData.prescriber).session(session);
    if (!prescriber) {
      throw new AppError(`Prescriber not found with ID: ${prescriptionData.prescriber}`, 404);
    }

    // Validate medications in items
    for (const item of prescriptionData.items) {
      const medication = await mongoose.model('Medication').findById(item.medication).session(session);
      if (!medication) {
        throw new AppError(`Medication not found with ID: ${item.medication}`, 404);
      }

      // Check if medication requires prescription
      if (!medication.requiresPrescription) {
        throw new AppError(`Medication ${medication.name} does not require a prescription`, 400);
      }
    }

    // Generate prescription number
    const prescriptionCount = await Prescription.countDocuments().session(session);
    const prescriptionNumber = `RX-${(prescriptionCount + 1).toString().padStart(6, '0')}`;

    // Create prescription
    const prescription = new Prescription({
      ...prescriptionData,
      prescriptionNumber,
      status: 'active',
      createdBy: userId,
    });

    await prescription.save({ session });

    // Send notification to patient if email is available
    if (patient.email) {
      try {
        await sendPrescriptionNotification(prescription, patient);
      } catch (emailError) {
        logger.error('Error sending prescription notification:', emailError);
        // Continue even if email fails
      }
    }

    await session.commitTransaction();

    // Populate references
    await prescription.populate('patient', 'firstName lastName email phone');
    await prescription.populate('prescriber', 'firstName lastName');
    await prescription.populate('items.medication', 'name genericName brandName strength dosageForm');

    return prescription;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in createPrescription:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update a prescription
 */
export const updatePrescription = async (id: string, updateData: any, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find prescription
    const prescription = await Prescription.findById(id).session(session);
    if (!prescription) {
      throw new AppError(`Prescription not found with ID: ${id}`, 404);
    }

    // Check if prescription is already completed or cancelled
    if (prescription.status === PrescriptionStatus.COMPLETED || prescription.status === PrescriptionStatus.CANCELLED) {
      throw new AppError(`Cannot update a ${prescription.status} prescription`, 400);
    }

    // Update prescription
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'prescriptionNumber' && key !== 'createdBy' && key !== 'createdAt') {
        prescription[key] = updateData[key];
      }
    });

    // No updatedBy field in the schema, so we'll skip this
    // prescription.updatedBy = userId;

    await prescription.save({ session });

    // If status changed to cancelled, update patient
    if (updateData.status === PrescriptionStatus.CANCELLED && prescription.status !== updateData.status) {
      const patient = await mongoose.model('Patient').findById(prescription.patient).session(session);
      if (patient && patient.email) {
        try {
          await sendPrescriptionStatusUpdate(prescription, patient, 'cancelled');
        } catch (emailError) {
          logger.error('Error sending prescription status update:', emailError);
          // Continue even if email fails
        }
      }
    }

    await session.commitTransaction();

    // Populate references
    await prescription.populate('patient', 'firstName lastName email phone');
    await prescription.populate('prescriber', 'firstName lastName');
    await prescription.populate('items.medication', 'name genericName brandName strength dosageForm');

    return prescription;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in updatePrescription: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Process a prescription refill
 */
export const processPrescriptionRefill = async (
  prescriptionId: string,
  transactionId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find prescription
    const prescription = await Prescription.findById(prescriptionId).session(session);
    if (!prescription) {
      throw new AppError(`Prescription not found with ID: ${prescriptionId}`, 404);
    }

    // Check if prescription is active
    if (prescription.status !== PrescriptionStatus.ACTIVE) {
      throw new AppError(`Cannot refill a ${prescription.status} prescription`, 400);
    }

    // Check if any items have refills available
    const hasRefillsAvailable = prescription.items.some(item => item.refillsRemaining > 0);
    if (!hasRefillsAvailable) {
      throw new AppError('No refills remaining for this prescription', 400);
    }

    // Find transaction
    const transaction = await PosTransaction.findById(transactionId).session(session);
    if (!transaction) {
      throw new AppError(`Transaction not found with ID: ${transactionId}`, 404);
    }

    // Add refill record to dispensing history
    prescription.dispensingHistory.push({
      date: new Date(),
      quantity: 1, // Default quantity
      batchNumber: transaction._id.toString().substring(0, 8), // Use part of transaction ID as batch number
      dispensedBy: new mongoose.Types.ObjectId(userId),
      notes: `Refill processed via transaction ${transactionId}`
    });

    // Update refills remaining for all items
    prescription.items.forEach(item => {
      if (item.refillsRemaining > 0) {
        item.refillsRemaining -= 1;
      }
    });

    // If no items have refills remaining, update status to completed
    const allRefillsUsed = prescription.items.every(item => item.refillsRemaining <= 0);
    if (allRefillsUsed) {
      prescription.status = PrescriptionStatus.COMPLETED;
    }

    // We don't have a lastRefillDate field in the schema, so we'll skip this
    // prescription.lastRefillDate = new Date();

    // Update transaction with prescription reference
    transaction.prescription = new mongoose.Types.ObjectId(prescriptionId);
    await transaction.save({ session });

    // Save prescription
    await prescription.save({ session });

    // Notify patient if email is available
    const patient = await mongoose.model('Patient').findById(prescription.patient).session(session);
    if (patient && patient.email) {
      try {
        await sendRefillConfirmation(prescription, patient, transaction);
      } catch (emailError) {
        logger.error('Error sending refill confirmation:', emailError);
        // Continue even if email fails
      }
    }

    await session.commitTransaction();

    // Populate references
    await prescription.populate('customer', 'firstName lastName customerNumber email phone');
    await prescription.populate('doctor', 'firstName lastName specialization');
    await prescription.populate('medications.product', 'name sku barcode sellingPrice');
    await prescription.populate('refills.transaction', 'saleNumber saleDate total');

    return prescription;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in processPrescriptionRefill: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get prescriptions due for refill
 */
export const getPrescriptionsDueForRefill = async (daysThreshold = 7) => {
  try {
    // Calculate date threshold
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    // Find active prescriptions with items that have refills remaining
    const prescriptions = await Prescription.find({
      status: PrescriptionStatus.ACTIVE,
      'items.refillsRemaining': { $gt: 0 },
      expiryDate: { $gte: today }, // Not expired
    })
      .populate('patient', 'firstName lastName email phone')
      .populate('prescriber', 'firstName lastName')
      .populate('items.medication', 'name genericName brandName strength dosageForm');

    // Filter prescriptions due for refill based on prescription date
    const dueForRefill = prescriptions.filter(prescription => {
      // Use prescription date as the base date
      const lastRefillDate = prescription.prescriptionDate;

      // Calculate next refill date based on a standard 30-day interval
      const nextRefillDate = new Date(lastRefillDate);
      nextRefillDate.setDate(nextRefillDate.getDate() + 30); // Using standard 30-day interval

      // Check if next refill date is within threshold
      return nextRefillDate <= thresholdDate;
    });

    return dueForRefill;
  } catch (error) {
    logger.error('Error in getPrescriptionsDueForRefill:', error);
    throw error;
  }
};

/**
 * Send prescription notification to customer
 */
const sendPrescriptionNotification = async (prescription: any, customer: any) => {
  try {
    const subject = `New Prescription - ${prescription.prescriptionNumber}`;

    // Generate prescription HTML
    const prescriptionHtml = `
      <h2>New Prescription</h2>
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      <p>A new prescription has been created for you.</p>
      <hr>
      <h3>Prescription Details</h3>
      <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
      <p><strong>Issue Date:</strong> ${formatDate(prescription.issueDate)}</p>
      <p><strong>Doctor:</strong> Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}</p>
      <p><strong>Refills Allowed:</strong> ${prescription.refillsAllowed}</p>
      <p><strong>Expiry Date:</strong> ${formatDate(prescription.expiryDate)}</p>
      <hr>
      <h3>Medications</h3>
      <ul>
        ${prescription.medications.map(med => `
          <li>
            <strong>${med.product.name}</strong> -
            ${med.dosage} -
            ${med.frequency} -
            ${med.duration}
          </li>
        `).join('')}
      </ul>
      <hr>
      <p>Please visit our pharmacy to fill this prescription.</p>
      <p>Thank you for choosing PharmaSync!</p>
    `;

    // Send email
    return await sendEmail({
      to: customer.email,
      subject,
      text: `New prescription ${prescription.prescriptionNumber} has been created for you.`,
      html: prescriptionHtml,
    });
  } catch (error) {
    logger.error('Error sending prescription notification:', error);
    throw error;
  }
};

/**
 * Send prescription status update to customer
 */
const sendPrescriptionStatusUpdate = async (prescription: any, customer: any, status: string) => {
  try {
    const subject = `Prescription Update - ${prescription.prescriptionNumber}`;

    // Generate status update HTML
    const statusUpdateHtml = `
      <h2>Prescription Status Update</h2>
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      <p>Your prescription status has been updated to: <strong>${status}</strong>.</p>
      <hr>
      <h3>Prescription Details</h3>
      <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
      <p><strong>Issue Date:</strong> ${formatDate(prescription.issueDate)}</p>
      <hr>
      <p>If you have any questions, please contact our pharmacy.</p>
      <p>Thank you for choosing PharmaSync!</p>
    `;

    // Send email
    return await sendEmail({
      to: customer.email,
      subject,
      text: `Your prescription ${prescription.prescriptionNumber} status has been updated to: ${status}.`,
      html: statusUpdateHtml,
    });
  } catch (error) {
    logger.error('Error sending prescription status update:', error);
    throw error;
  }
};

/**
 * Send refill confirmation to customer
 */
const sendRefillConfirmation = async (prescription: any, customer: any, transaction: any) => {
  try {
    const subject = `Prescription Refill - ${prescription.prescriptionNumber}`;

    // Generate refill confirmation HTML
    const refillConfirmationHtml = `
      <h2>Prescription Refill Confirmation</h2>
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      <p>Your prescription has been refilled.</p>
      <hr>
      <h3>Prescription Details</h3>
      <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
      <p><strong>Refill Date:</strong> ${formatDate(new Date())}</p>
      <p><strong>Refills Remaining:</strong> ${prescription.refillsRemaining}</p>
      <p><strong>Transaction Number:</strong> ${transaction.saleNumber}</p>
      <hr>
      <h3>Medications</h3>
      <ul>
        ${prescription.medications.map(med => `
          <li>
            <strong>${med.product.name}</strong> -
            ${med.dosage} -
            ${med.frequency} -
            ${med.duration}
          </li>
        `).join('')}
      </ul>
      <hr>
      <p>Thank you for choosing PharmaSync!</p>
    `;

    // Send email
    return await sendEmail({
      to: customer.email,
      subject,
      text: `Your prescription ${prescription.prescriptionNumber} has been refilled.`,
      html: refillConfirmationHtml,
    });
  } catch (error) {
    logger.error('Error sending refill confirmation:', error);
    throw error;
  }
};

/**
 * Send refill reminder to customer
 */
export const sendRefillReminder = async (prescription: any) => {
  try {
    // Get customer
    const customer = await Customer.findById(prescription.customer);
    if (!customer || !customer.email) {
      throw new AppError('Customer email not available', 400);
    }

    const subject = `Prescription Refill Reminder - ${prescription.prescriptionNumber}`;

    // Generate refill reminder HTML
    const refillReminderHtml = `
      <h2>Prescription Refill Reminder</h2>
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      <p>This is a friendly reminder that your prescription is due for refill.</p>
      <hr>
      <h3>Prescription Details</h3>
      <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
      <p><strong>Issue Date:</strong> ${formatDate(prescription.issueDate)}</p>
      <p><strong>Refills Remaining:</strong> ${prescription.refillsRemaining}</p>
      <p><strong>Expiry Date:</strong> ${formatDate(prescription.expiryDate)}</p>
      <hr>
      <h3>Medications</h3>
      <ul>
        ${prescription.medications.map(med => `
          <li>
            <strong>${med.product.name}</strong> -
            ${med.dosage} -
            ${med.frequency} -
            ${med.duration}
          </li>
        `).join('')}
      </ul>
      <hr>
      <p>Please visit our pharmacy to refill your prescription.</p>
      <p>Thank you for choosing PharmaSync!</p>
    `;

    // Send email
    return await sendEmail({
      to: customer.email,
      subject,
      text: `Your prescription ${prescription.prescriptionNumber} is due for refill.`,
      html: refillReminderHtml,
    });
  } catch (error) {
    logger.error('Error sending refill reminder:', error);
    throw error;
  }
};

/**
 * Send refill reminders for prescriptions due for refill
 */
export const sendRefillReminders = async () => {
  try {
    // Get prescriptions due for refill
    const prescriptionsDueForRefill = await getPrescriptionsDueForRefill();

    // Send reminders
    const results = await Promise.all(
      prescriptionsDueForRefill.map(async (prescription) => {
        try {
          await sendRefillReminder(prescription);
          return {
            prescriptionId: prescription._id,
            success: true,
          };
        } catch (error) {
          return {
            prescriptionId: prescription._id,
            success: false,
            error: error.message,
          };
        }
      })
    );

    return {
      total: prescriptionsDueForRefill.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results,
    };
  } catch (error) {
    logger.error('Error sending refill reminders:', error);
    throw error;
  }
};
