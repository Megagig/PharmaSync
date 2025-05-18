import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import InsuranceProvider from '../models/insuranceProvider.model';
import InsurancePlan from '../models/insurancePlan.model';
import CustomerInsurance from '../models/customerInsurance.model';
import InsuranceClaim from '../models/insuranceClaim.model';
import InsuranceEligibilityCheck from '../models/insuranceEligibilityCheck.model';
import Customer from '../models/customer.model';
import PosTransaction from '../models/posTransaction.model';
import { ClaimStatus, ClaimType } from '../interfaces/insurance.interface';
import logger from '../utils/logger';
import axios from 'axios';
import { formatDate } from '../utils/formatters';

/**
 * Get all insurance providers with filtering and pagination
 */
export const getInsuranceProviders = async ({
  page = 1,
  limit = 10,
  search,
  status,
  sortBy = 'name',
  sortOrder = 'asc',
}) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const providers = await InsuranceProvider.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await InsuranceProvider.countDocuments(query);

    return {
      providers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getInsuranceProviders:', error);
    throw error;
  }
};

/**
 * Get insurance provider by ID
 */
export const getInsuranceProviderById = async (id: string) => {
  try {
    const provider = await InsuranceProvider.findById(id);

    if (!provider) {
      throw new AppError(`Insurance provider not found with ID: ${id}`, 404);
    }

    return provider;
  } catch (error) {
    logger.error(`Error in getInsuranceProviderById: ${error}`);
    throw error;
  }
};

/**
 * Create a new insurance provider
 */
export const createInsuranceProvider = async (providerData: any, userId: string) => {
  try {
    // Check if provider with same name or code already exists
    const existingProvider = await InsuranceProvider.findOne({
      $or: [
        { name: providerData.name },
        { code: providerData.code },
      ],
    });

    if (existingProvider) {
      throw new AppError(
        `Insurance provider with name '${providerData.name}' or code '${providerData.code}' already exists`,
        400
      );
    }

    // Create provider
    const provider = new InsuranceProvider({
      ...providerData,
      createdBy: userId,
    });

    await provider.save();

    return provider;
  } catch (error) {
    logger.error('Error in createInsuranceProvider:', error);
    throw error;
  }
};

/**
 * Update an insurance provider
 */
export const updateInsuranceProvider = async (id: string, updateData: any, userId: string) => {
  try {
    // Find provider
    const provider = await InsuranceProvider.findById(id);

    if (!provider) {
      throw new AppError(`Insurance provider not found with ID: ${id}`, 404);
    }

    // Check if name or code is being updated and if it already exists
    if ((updateData.name && updateData.name !== provider.name) ||
        (updateData.code && updateData.code !== provider.code)) {
      const existingProvider = await InsuranceProvider.findOne({
        _id: { $ne: id },
        $or: [
          { name: updateData.name || provider.name },
          { code: updateData.code || provider.code },
        ],
      });

      if (existingProvider) {
        throw new AppError(
          `Insurance provider with name '${updateData.name || provider.name}' or code '${updateData.code || provider.code}' already exists`,
          400
        );
      }
    }

    // Update provider
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        provider[key] = updateData[key];
      }
    });

    provider.updatedBy = userId;

    await provider.save();

    return provider;
  } catch (error) {
    logger.error(`Error in updateInsuranceProvider: ${error}`);
    throw error;
  }
};

/**
 * Delete an insurance provider
 */
export const deleteInsuranceProvider = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find provider
    const provider = await InsuranceProvider.findById(id).session(session);

    if (!provider) {
      throw new AppError(`Insurance provider not found with ID: ${id}`, 404);
    }

    // Check if provider is being used in plans
    const plansUsingProvider = await InsurancePlan.countDocuments({
      provider: id,
    }).session(session);

    if (plansUsingProvider > 0) {
      throw new AppError(
        `Cannot delete provider as it is being used by ${plansUsingProvider} plans`,
        400
      );
    }

    // Check if provider is being used in customer insurances
    const customerInsurancesUsingProvider = await CustomerInsurance.countDocuments({
      provider: id,
    }).session(session);

    if (customerInsurancesUsingProvider > 0) {
      throw new AppError(
        `Cannot delete provider as it is being used by ${customerInsurancesUsingProvider} customer insurances`,
        400
      );
    }

    // Delete provider
    await InsuranceProvider.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in deleteInsuranceProvider: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get all insurance plans with filtering and pagination
 */
export const getInsurancePlans = async ({
  page = 1,
  limit = 10,
  search,
  provider,
  status,
  sortBy = 'name',
  sortOrder = 'asc',
}) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (provider) {
      query.provider = new mongoose.Types.ObjectId(provider);
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const plans = await InsurancePlan.find(query)
      .populate('provider', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await InsurancePlan.countDocuments(query);

    return {
      plans,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getInsurancePlans:', error);
    throw error;
  }
};

/**
 * Get insurance plan by ID
 */
export const getInsurancePlanById = async (id: string) => {
  try {
    const plan = await InsurancePlan.findById(id)
      .populate('provider', 'name code');

    if (!plan) {
      throw new AppError(`Insurance plan not found with ID: ${id}`, 404);
    }

    return plan;
  } catch (error) {
    logger.error(`Error in getInsurancePlanById: ${error}`);
    throw error;
  }
};

/**
 * Create a new insurance plan
 */
export const createInsurancePlan = async (planData: any, userId: string) => {
  try {
    // Check if provider exists
    const provider = await InsuranceProvider.findById(planData.provider);

    if (!provider) {
      throw new AppError(`Insurance provider not found with ID: ${planData.provider}`, 404);
    }

    // Check if plan with same code already exists for this provider
    const existingPlan = await InsurancePlan.findOne({
      provider: planData.provider,
      code: planData.code,
    });

    if (existingPlan) {
      throw new AppError(
        `Insurance plan with code '${planData.code}' already exists for this provider`,
        400
      );
    }

    // Create plan
    const plan = new InsurancePlan({
      ...planData,
      createdBy: userId,
    });

    await plan.save();

    // Populate provider
    await plan.populate('provider', 'name code');

    return plan;
  } catch (error) {
    logger.error('Error in createInsurancePlan:', error);
    throw error;
  }
};

/**
 * Update an insurance plan
 */
export const updateInsurancePlan = async (id: string, updateData: any, userId: string) => {
  try {
    // Find plan
    const plan = await InsurancePlan.findById(id);

    if (!plan) {
      throw new AppError(`Insurance plan not found with ID: ${id}`, 404);
    }

    // Check if code is being updated and if it already exists for this provider
    if (updateData.code && updateData.code !== plan.code) {
      const existingPlan = await InsurancePlan.findOne({
        provider: updateData.provider || plan.provider,
        code: updateData.code,
        _id: { $ne: id },
      });

      if (existingPlan) {
        throw new AppError(
          `Insurance plan with code '${updateData.code}' already exists for this provider`,
          400
        );
      }
    }

    // Update plan
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        plan[key] = updateData[key];
      }
    });

    plan.updatedBy = userId;

    await plan.save();

    // Populate provider
    await plan.populate('provider', 'name code');

    return plan;
  } catch (error) {
    logger.error(`Error in updateInsurancePlan: ${error}`);
    throw error;
  }
};

/**
 * Delete an insurance plan
 */
export const deleteInsurancePlan = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find plan
    const plan = await InsurancePlan.findById(id).session(session);

    if (!plan) {
      throw new AppError(`Insurance plan not found with ID: ${id}`, 404);
    }

    // Check if plan is being used in customer insurances
    const customerInsurancesUsingPlan = await CustomerInsurance.countDocuments({
      plan: id,
    }).session(session);

    if (customerInsurancesUsingPlan > 0) {
      throw new AppError(
        `Cannot delete plan as it is being used by ${customerInsurancesUsingPlan} customer insurances`,
        400
      );
    }

    // Delete plan
    await InsurancePlan.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in deleteInsurancePlan: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get customer insurances
 */
export const getCustomerInsurances = async ({
  page = 1,
  limit = 10,
  customer,
  provider,
  isActive,
  isPrimary,
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

    if (provider) {
      query.provider = new mongoose.Types.ObjectId(provider);
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (isPrimary !== undefined) {
      query.isPrimary = isPrimary === 'true' || isPrimary === true;
    }

    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { groupNumber: { $regex: search, $options: 'i' } },
        { 'primaryCardHolder.firstName': { $regex: search, $options: 'i' } },
        { 'primaryCardHolder.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const customerInsurances = await CustomerInsurance.find(query)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('provider', 'name code')
      .populate('plan', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await CustomerInsurance.countDocuments(query);

    return {
      customerInsurances,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getCustomerInsurances:', error);
    throw error;
  }
};

/**
 * Get customer insurance by ID
 */
export const getCustomerInsuranceById = async (id: string) => {
  try {
    const customerInsurance = await CustomerInsurance.findById(id)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('provider', 'name code')
      .populate('plan', 'name code coveragePercentage deductible annualLimit');

    if (!customerInsurance) {
      throw new AppError(`Customer insurance not found with ID: ${id}`, 404);
    }

    return customerInsurance;
  } catch (error) {
    logger.error(`Error in getCustomerInsuranceById: ${error}`);
    throw error;
  }
};

/**
 * Create a new customer insurance
 */
export const createCustomerInsurance = async (insuranceData: any, userId: string) => {
  try {
    // Check if customer exists
    const customer = await Customer.findById(insuranceData.customer);

    if (!customer) {
      throw new AppError(`Customer not found with ID: ${insuranceData.customer}`, 404);
    }

    // Check if provider exists
    const provider = await InsuranceProvider.findById(insuranceData.provider);

    if (!provider) {
      throw new AppError(`Insurance provider not found with ID: ${insuranceData.provider}`, 404);
    }

    // Check if plan exists
    const plan = await InsurancePlan.findById(insuranceData.plan);

    if (!plan) {
      throw new AppError(`Insurance plan not found with ID: ${insuranceData.plan}`, 404);
    }

    // Check if policy number already exists for this provider
    const existingInsurance = await CustomerInsurance.findOne({
      customer: insuranceData.customer,
      provider: insuranceData.provider,
      policyNumber: insuranceData.policyNumber,
    });

    if (existingInsurance) {
      throw new AppError(
        `Insurance with policy number '${insuranceData.policyNumber}' already exists for this customer and provider`,
        400
      );
    }

    // Create customer insurance
    const customerInsurance = new CustomerInsurance({
      ...insuranceData,
      createdBy: userId,
    });

    await customerInsurance.save();

    // Populate references
    await customerInsurance.populate('customer', 'firstName lastName customerNumber email phone');
    await customerInsurance.populate('provider', 'name code');
    await customerInsurance.populate('plan', 'name code coveragePercentage deductible annualLimit');

    return customerInsurance;
  } catch (error) {
    logger.error('Error in createCustomerInsurance:', error);
    throw error;
  }
};

/**
 * Update a customer insurance
 */
export const updateCustomerInsurance = async (id: string, updateData: any, userId: string) => {
  try {
    // Find customer insurance
    const customerInsurance = await CustomerInsurance.findById(id);

    if (!customerInsurance) {
      throw new AppError(`Customer insurance not found with ID: ${id}`, 404);
    }

    // Check if policy number is being updated and if it already exists for this provider
    if (updateData.policyNumber && updateData.policyNumber !== customerInsurance.policyNumber) {
      const existingInsurance = await CustomerInsurance.findOne({
        customer: updateData.customer || customerInsurance.customer,
        provider: updateData.provider || customerInsurance.provider,
        policyNumber: updateData.policyNumber,
        _id: { $ne: id },
      });

      if (existingInsurance) {
        throw new AppError(
          `Insurance with policy number '${updateData.policyNumber}' already exists for this customer and provider`,
          400
        );
      }
    }

    // Update customer insurance
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        customerInsurance[key] = updateData[key];
      }
    });

    customerInsurance.updatedBy = userId;

    await customerInsurance.save();

    // Populate references
    await customerInsurance.populate('customer', 'firstName lastName customerNumber email phone');
    await customerInsurance.populate('provider', 'name code');
    await customerInsurance.populate('plan', 'name code coveragePercentage deductible annualLimit');

    return customerInsurance;
  } catch (error) {
    logger.error(`Error in updateCustomerInsurance: ${error}`);
    throw error;
  }
};

/**
 * Delete a customer insurance
 */
export const deleteCustomerInsurance = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find customer insurance
    const customerInsurance = await CustomerInsurance.findById(id).session(session);

    if (!customerInsurance) {
      throw new AppError(`Customer insurance not found with ID: ${id}`, 404);
    }

    // Check if insurance is being used in claims
    const claimsUsingInsurance = await InsuranceClaim.countDocuments({
      customerInsurance: id,
    }).session(session);

    if (claimsUsingInsurance > 0) {
      throw new AppError(
        `Cannot delete insurance as it is being used by ${claimsUsingInsurance} claims`,
        400
      );
    }

    // Delete customer insurance
    await CustomerInsurance.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in deleteCustomerInsurance: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Check insurance eligibility
 */
export const checkInsuranceEligibility = async (customerInsuranceId: string, userId: string) => {
  try {
    // Find customer insurance
    const customerInsurance = await CustomerInsurance.findById(customerInsuranceId)
      .populate('customer', 'firstName lastName dateOfBirth')
      .populate('provider', 'name code apiEndpoint apiKey apiSecret')
      .populate('plan', 'name code');

    if (!customerInsurance) {
      throw new AppError(`Customer insurance not found with ID: ${customerInsuranceId}`, 404);
    }

    // Check if insurance is active
    if (!customerInsurance.isActive) {
      throw new AppError('Insurance is not active', 400);
    }

    // Check if insurance has expired
    if (customerInsurance.endDate && new Date(customerInsurance.endDate) < new Date()) {
      throw new AppError('Insurance has expired', 400);
    }

    let isEligible = true;
    let coverageDetails = customerInsurance.coverageDetails || {};
    let responseDetails = null;

    // If provider has API integration, check eligibility with provider
    if (customerInsurance.provider.apiEndpoint &&
        customerInsurance.provider.apiKey &&
        customerInsurance.provider.apiSecret) {
      try {
        // This is a mock API call - in a real implementation, this would call the provider's API
        const response = await mockEligibilityCheck(customerInsurance);

        isEligible = response.isEligible;
        coverageDetails = response.coverageDetails;
        responseDetails = response.responseDetails;
      } catch (apiError) {
        logger.error('Error checking eligibility with provider API:', apiError);
        // Continue with local eligibility check
      }
    }

    // Create eligibility check record
    const eligibilityCheck = new InsuranceEligibilityCheck({
      customer: customerInsurance.customer._id,
      customerInsurance: customerInsuranceId,
      provider: customerInsurance.provider._id,
      plan: customerInsurance.plan._id,
      checkDate: new Date(),
      isEligible,
      coverageDetails,
      responseDetails,
      createdBy: userId,
    });

    await eligibilityCheck.save();

    // Update customer insurance with latest coverage details
    if (isEligible) {
      customerInsurance.coverageDetails = coverageDetails;
      await customerInsurance.save();
    }

    return {
      isEligible,
      coverageDetails,
      responseDetails,
      checkId: eligibilityCheck._id,
    };
  } catch (error) {
    logger.error(`Error in checkInsuranceEligibility: ${error}`);
    throw error;
  }
};

/**
 * Create an insurance claim
 */
export const createInsuranceClaim = async (claimData: any, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if customer insurance exists
    const customerInsurance = await CustomerInsurance.findById(claimData.customerInsurance)
      .session(session);

    if (!customerInsurance) {
      throw new AppError(`Customer insurance not found with ID: ${claimData.customerInsurance}`, 404);
    }

    // Check if transaction exists
    const transaction = await PosTransaction.findById(claimData.transaction)
      .populate('items.product')
      .session(session);

    if (!transaction) {
      throw new AppError(`Transaction not found with ID: ${claimData.transaction}`, 404);
    }

    // Prepare claim items
    const claimItems = [];
    let totalClaimAmount = 0;
    let totalPatientAmount = 0;

    for (const item of claimData.items) {
      const transactionItem = transaction.items.find(
        ti => ti.product._id.toString() === item.product.toString()
      );

      if (!transactionItem) {
        throw new AppError(`Product ${item.product} not found in transaction`, 400);
      }

      if (item.quantity > transactionItem.quantity) {
        throw new AppError(
          `Claim quantity (${item.quantity}) exceeds transaction quantity (${transactionItem.quantity}) for product ${transactionItem.product.name}`,
          400
        );
      }

      const totalPrice = transactionItem.unitPrice * item.quantity;
      const coveredAmount = (totalPrice * item.coveragePercentage) / 100;
      const patientAmount = totalPrice - coveredAmount;

      claimItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: transactionItem.unitPrice,
        totalPrice,
        coveragePercentage: item.coveragePercentage,
        coveredAmount,
        patientAmount,
      });

      totalClaimAmount += coveredAmount;
      totalPatientAmount += patientAmount;
    }

    // Create claim
    const claim = new InsuranceClaim({
      customer: customerInsurance.customer,
      customerInsurance: customerInsurance._id,
      provider: customerInsurance.provider,
      plan: customerInsurance.plan,
      transaction: transaction._id,
      prescription: claimData.prescription,
      claimDate: new Date(),
      claimType: claimData.claimType || ClaimType.PRESCRIPTION,
      claimStatus: ClaimStatus.PENDING,
      claimAmount: totalClaimAmount,
      items: claimItems,
      totalClaimAmount,
      totalPatientAmount,
      notes: claimData.notes,
      attachments: claimData.attachments,
      createdBy: userId,
    });

    await claim.save({ session });

    await session.commitTransaction();

    // Populate references
    await claim.populate('customer', 'firstName lastName customerNumber');
    await claim.populate('provider', 'name code');
    await claim.populate('plan', 'name code');
    await claim.populate('items.product', 'name sku');

    return claim;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error in createInsuranceClaim: ${error}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get insurance claims
 */
export const getInsuranceClaims = async ({
  page = 1,
  limit = 10,
  customer,
  provider,
  status,
  startDate,
  endDate,
  search,
  sortBy = 'claimDate',
  sortOrder = 'desc',
}) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (customer) {
      query.customer = new mongoose.Types.ObjectId(customer);
    }

    if (provider) {
      query.provider = new mongoose.Types.ObjectId(provider);
    }

    if (status) {
      query.claimStatus = status;
    }

    if (startDate && endDate) {
      query.claimDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.claimDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.claimDate = { $lte: new Date(endDate) };
    }

    if (search) {
      query.$or = [
        { claimNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const claims = await InsuranceClaim.find(query)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('provider', 'name code')
      .populate('plan', 'name code')
      .populate('transaction', 'saleNumber saleDate')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await InsuranceClaim.countDocuments(query);

    return {
      claims,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getInsuranceClaims:', error);
    throw error;
  }
};

/**
 * Get insurance claim by ID
 */
export const getInsuranceClaimById = async (id: string) => {
  try {
    const claim = await InsuranceClaim.findById(id)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('customerInsurance', 'policyNumber groupNumber')
      .populate('provider', 'name code')
      .populate('plan', 'name code')
      .populate('transaction', 'saleNumber saleDate total')
      .populate('prescription', 'prescriptionNumber')
      .populate('items.product', 'name sku');

    if (!claim) {
      throw new AppError(`Insurance claim not found with ID: ${id}`, 404);
    }

    return claim;
  } catch (error) {
    logger.error(`Error in getInsuranceClaimById: ${error}`);
    throw error;
  }
};

/**
 * Update insurance claim status
 */
export const updateInsuranceClaimStatus = async (id: string, updateData: any, userId: string) => {
  try {
    // Find claim
    const claim = await InsuranceClaim.findById(id);

    if (!claim) {
      throw new AppError(`Insurance claim not found with ID: ${id}`, 404);
    }

    // Update claim status
    claim.claimStatus = updateData.claimStatus;

    // Update additional fields based on status
    if (updateData.claimStatus === ClaimStatus.SUBMITTED) {
      claim.submissionDate = new Date();
    } else if (updateData.claimStatus === ClaimStatus.APPROVED ||
               updateData.claimStatus === ClaimStatus.PARTIALLY_APPROVED) {
      claim.responseDate = new Date();
      claim.approvedAmount = updateData.approvedAmount || claim.claimAmount;
      claim.totalApprovedAmount = updateData.approvedAmount || claim.totalClaimAmount;
    } else if (updateData.claimStatus === ClaimStatus.REJECTED) {
      claim.responseDate = new Date();
      claim.rejectionReason = updateData.rejectionReason;
      claim.rejectionDetails = updateData.rejectionDetails;
    }

    // Update notes and response details if provided
    if (updateData.notes) {
      claim.notes = updateData.notes;
    }

    if (updateData.responseDetails) {
      claim.responseDetails = updateData.responseDetails;
    }

    claim.updatedBy = userId;

    await claim.save();

    // Populate references
    await claim.populate('customer', 'firstName lastName customerNumber email phone');
    await claim.populate('customerInsurance', 'policyNumber groupNumber');
    await claim.populate('provider', 'name code');
    await claim.populate('plan', 'name code');
    await claim.populate('transaction', 'saleNumber saleDate total');
    await claim.populate('prescription', 'prescriptionNumber');
    await claim.populate('items.product', 'name sku');

    return claim;
  } catch (error) {
    logger.error(`Error in updateInsuranceClaimStatus: ${error}`);
    throw error;
  }
};

/**
 * Mock eligibility check function (for demonstration purposes)
 */
const mockEligibilityCheck = async (customerInsurance: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock response
  return {
    isEligible: Math.random() > 0.1, // 90% chance of being eligible
    coverageDetails: {
      prescription: {
        coveragePercentage: Math.floor(Math.random() * 20 + 80), // 80-100%
        deductible: Math.floor(Math.random() * 500),
        deductibleMet: Math.random() > 0.3, // 70% chance of deductible being met
        annualLimit: 5000,
        usedAmount: Math.floor(Math.random() * 2000),
      },
      otc: {
        coveragePercentage: Math.floor(Math.random() * 50 + 50), // 50-100%
        deductible: Math.floor(Math.random() * 200),
        deductibleMet: Math.random() > 0.5, // 50% chance of deductible being met
        annualLimit: 1000,
        usedAmount: Math.floor(Math.random() * 500),
      },
    },
    responseDetails: {
      transactionId: `ELIG-${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString(),
      provider: customerInsurance.provider.name,
      plan: customerInsurance.plan.name,
      policyHolder: `${customerInsurance.primaryCardHolder.firstName} ${customerInsurance.primaryCardHolder.lastName}`,
      policyNumber: customerInsurance.policyNumber,
      groupNumber: customerInsurance.groupNumber,
    },
  };
};