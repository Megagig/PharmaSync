import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import Prescription from '../models/prescription.model';
import Customer from '../models/customer.model';
import Product from '../models/product.model';
import PosTransaction from '../models/posTransaction.model';
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
      query.customer = new mongoose.Types.ObjectId(customer);
    }
    
    if (doctor) {
      query.doctor = new mongoose.Types.ObjectId(doctor);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.issueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.issueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.issueDate = { $lte: new Date(endDate) };
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
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('medications.product', 'name sku barcode')
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
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('medications.product', 'name sku barcode sellingPrice')
      .populate('refills.transaction', 'saleNumber saleDate total');
    
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
    // Validate customer
    const customer = await Customer.findById(prescriptionData.customer).session(session);
    if (!customer) {
      throw new AppError(`Customer not found with ID: ${prescriptionData.customer}`, 404);
    }
    
    // Validate doctor
    const doctor = await mongoose.model('Doctor').findById(prescriptionData.doctor).session(session);
    if (!doctor) {
      throw new AppError(`Doctor not found with ID: ${prescriptionData.doctor}`, 404);
    }
    
    // Validate medications
    for (const medication of prescriptionData.medications) {
      const product = await Product.findById(medication.product).session(session);
      if (!product) {
        throw new AppError(`Product not found with ID: ${medication.product}`, 404);
      }
      
      // Check if product is a medication
      if (product.category.toString() !== prescriptionData.medicationCategoryId) {
        throw new AppError(`Product ${product.name} is not a medication`, 400);
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
    
    // Send notification to customer if email is available
    if (customer.email) {
      try {
        await sendPrescriptionNotification(prescription, customer);
      } catch (emailError) {
        logger.error('Error sending prescription notification:', emailError);
        // Continue even if email fails
      }
    }
    
    await session.commitTransaction();
    
    // Populate references
    await prescription.populate('customer', 'firstName lastName customerNumber email phone');
    await prescription.populate('doctor', 'firstName lastName specialization');
    await prescription.populate('medications.product', 'name sku barcode sellingPrice');
    
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
    if (prescription.status === 'completed' || prescription.status === 'cancelled') {
      throw new AppError(`Cannot update a ${prescription.status} prescription`, 400);
    }
    
    // Update prescription
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'prescriptionNumber' && key !== 'createdBy' && key !== 'createdAt') {
        prescription[key] = updateData[key];
      }
    });
    
    prescription.updatedBy = userId;
    
    await prescription.save({ session });
    
    // If status changed to cancelled, update customer
    if (updateData.status === 'cancelled' && prescription.status !== 'cancelled') {
      const customer = await Customer.findById(prescription.customer).session(session);
      if (customer && customer.email) {
        try {
          await sendPrescriptionStatusUpdate(prescription, customer, 'cancelled');
        } catch (emailError) {
          logger.error('Error sending prescription status update:', emailError);
          // Continue even if email fails
        }
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
    if (prescription.status !== 'active') {
      throw new AppError(`Cannot refill a ${prescription.status} prescription`, 400);
    }
    
    // Check if refills are available
    if (prescription.refillsRemaining <= 0) {
      throw new AppError('No refills remaining for this prescription', 400);
    }
    
    // Find transaction
    const transaction = await PosTransaction.findById(transactionId).session(session);
    if (!transaction) {
      throw new AppError(`Transaction not found with ID: ${transactionId}`, 404);
    }
    
    // Add refill record
    prescription.refills.push({
      date: new Date(),
      transaction: transactionId,
      processedBy: userId,
    });
    
    // Update refills remaining
    prescription.refillsRemaining -= 1;
    
    // If no refills remaining, update status to completed
    if (prescription.refillsRemaining <= 0) {
      prescription.status = 'completed';
    }
    
    // Update last refill date
    prescription.lastRefillDate = new Date();
    
    // Update transaction with prescription reference
    transaction.prescription = prescriptionId;
    await transaction.save({ session });
    
    // Save prescription
    await prescription.save({ session });
    
    // Notify customer if email is available
    const customer = await Customer.findById(prescription.customer).session(session);
    if (customer && customer.email) {
      try {
        await sendRefillConfirmation(prescription, customer, transaction);
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
    
    // Find active prescriptions with refills remaining
    const prescriptions = await Prescription.find({
      status: 'active',
      refillsRemaining: { $gt: 0 },
      expiryDate: { $gte: today }, // Not expired
    })
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('medications.product', 'name sku barcode');
    
    // Filter prescriptions due for refill based on last refill date and refill interval
    const dueForRefill = prescriptions.filter(prescription => {
      // If no last refill date, use issue date
      const lastRefillDate = prescription.lastRefillDate || prescription.issueDate;
      
      // Calculate next refill date based on refill interval (in days)
      const nextRefillDate = new Date(lastRefillDate);
      nextRefillDate.setDate(nextRefillDate.getDate() + prescription.refillInterval);
      
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
