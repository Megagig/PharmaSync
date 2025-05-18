import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/error';
import * as insuranceService from '../services/insurance.service';

/**
 * Get all insurance providers
 * @route GET /api/insurance/providers
 * @access Private
 */
export const getInsuranceProviders = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    } = req.query;
    
    const result = await insuranceService.getInsuranceProviders({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      status: status as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result.providers,
      pagination: result.pagination,
    });
  }
);

/**
 * Get insurance provider by ID
 * @route GET /api/insurance/providers/:id
 * @access Private
 */
export const getInsuranceProviderById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const provider = await insuranceService.getInsuranceProviderById(id);
    
    res.status(200).json({
      status: 'success',
      data: provider,
    });
  }
);

/**
 * Create a new insurance provider
 * @route POST /api/insurance/providers
 * @access Private
 */
export const createInsuranceProvider = asyncHandler(
  async (req: Request, res: Response) => {
    const providerData = req.body;
    
    const provider = await insuranceService.createInsuranceProvider(
      providerData,
      req.user._id
    );
    
    res.status(201).json({
      status: 'success',
      data: provider,
    });
  }
);

/**
 * Update an insurance provider
 * @route PUT /api/insurance/providers/:id
 * @access Private
 */
export const updateInsuranceProvider = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const provider = await insuranceService.updateInsuranceProvider(
      id,
      updateData,
      req.user._id
    );
    
    res.status(200).json({
      status: 'success',
      data: provider,
    });
  }
);

/**
 * Delete an insurance provider
 * @route DELETE /api/insurance/providers/:id
 * @access Private
 */
export const deleteInsuranceProvider = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await insuranceService.deleteInsuranceProvider(id);
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get all insurance plans
 * @route GET /api/insurance/plans
 * @access Private
 */
export const getInsurancePlans = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page,
      limit,
      search,
      provider,
      status,
      sortBy,
      sortOrder,
    } = req.query;
    
    const result = await insuranceService.getInsurancePlans({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      provider: provider as string,
      status: status as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result.plans,
      pagination: result.pagination,
    });
  }
);

/**
 * Get insurance plan by ID
 * @route GET /api/insurance/plans/:id
 * @access Private
 */
export const getInsurancePlanById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const plan = await insuranceService.getInsurancePlanById(id);
    
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  }
);

/**
 * Create a new insurance plan
 * @route POST /api/insurance/plans
 * @access Private
 */
export const createInsurancePlan = asyncHandler(
  async (req: Request, res: Response) => {
    const planData = req.body;
    
    const plan = await insuranceService.createInsurancePlan(
      planData,
      req.user._id
    );
    
    res.status(201).json({
      status: 'success',
      data: plan,
    });
  }
);

/**
 * Update an insurance plan
 * @route PUT /api/insurance/plans/:id
 * @access Private
 */
export const updateInsurancePlan = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const plan = await insuranceService.updateInsurancePlan(
      id,
      updateData,
      req.user._id
    );
    
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  }
);

/**
 * Delete an insurance plan
 * @route DELETE /api/insurance/plans/:id
 * @access Private
 */
export const deleteInsurancePlan = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await insuranceService.deleteInsurancePlan(id);
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get customer insurances
 * @route GET /api/insurance/customer-insurances
 * @access Private
 */
export const getCustomerInsurances = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page,
      limit,
      customer,
      provider,
      isActive,
      isPrimary,
      search,
      sortBy,
      sortOrder,
    } = req.query;
    
    const result = await insuranceService.getCustomerInsurances({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      customer: customer as string,
      provider: provider as string,
      isActive: isActive as string,
      isPrimary: isPrimary as string,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result.customerInsurances,
      pagination: result.pagination,
    });
  }
);

/**
 * Get customer insurance by ID
 * @route GET /api/insurance/customer-insurances/:id
 * @access Private
 */
export const getCustomerInsuranceById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const customerInsurance = await insuranceService.getCustomerInsuranceById(id);
    
    res.status(200).json({
      status: 'success',
      data: customerInsurance,
    });
  }
);

/**
 * Create a new customer insurance
 * @route POST /api/insurance/customer-insurances
 * @access Private
 */
export const createCustomerInsurance = asyncHandler(
  async (req: Request, res: Response) => {
    const insuranceData = req.body;
    
    const customerInsurance = await insuranceService.createCustomerInsurance(
      insuranceData,
      req.user._id
    );
    
    res.status(201).json({
      status: 'success',
      data: customerInsurance,
    });
  }
);

/**
 * Update a customer insurance
 * @route PUT /api/insurance/customer-insurances/:id
 * @access Private
 */
export const updateCustomerInsurance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const customerInsurance = await insuranceService.updateCustomerInsurance(
      id,
      updateData,
      req.user._id
    );
    
    res.status(200).json({
      status: 'success',
      data: customerInsurance,
    });
  }
);

/**
 * Delete a customer insurance
 * @route DELETE /api/insurance/customer-insurances/:id
 * @access Private
 */
export const deleteCustomerInsurance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await insuranceService.deleteCustomerInsurance(id);
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Check insurance eligibility
 * @route POST /api/insurance/check-eligibility
 * @access Private
 */
export const checkInsuranceEligibility = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerInsuranceId } = req.body;
    
    if (!customerInsuranceId) {
      throw new AppError('Customer insurance ID is required', 400);
    }
    
    const result = await insuranceService.checkInsuranceEligibility(
      customerInsuranceId,
      req.user._id
    );
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Create an insurance claim
 * @route POST /api/insurance/claims
 * @access Private
 */
export const createInsuranceClaim = asyncHandler(
  async (req: Request, res: Response) => {
    const claimData = req.body;
    
    const claim = await insuranceService.createInsuranceClaim(
      claimData,
      req.user._id
    );
    
    res.status(201).json({
      status: 'success',
      data: claim,
    });
  }
);

/**
 * Get insurance claims
 * @route GET /api/insurance/claims
 * @access Private
 */
export const getInsuranceClaims = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page,
      limit,
      customer,
      provider,
      status,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
    } = req.query;
    
    const result = await insuranceService.getInsuranceClaims({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      customer: customer as string,
      provider: provider as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result.claims,
      pagination: result.pagination,
    });
  }
);

/**
 * Get insurance claim by ID
 * @route GET /api/insurance/claims/:id
 * @access Private
 */
export const getInsuranceClaimById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const claim = await insuranceService.getInsuranceClaimById(id);
    
    res.status(200).json({
      status: 'success',
      data: claim,
    });
  }
);

/**
 * Update insurance claim status
 * @route PATCH /api/insurance/claims/:id/status
 * @access Private
 */
export const updateInsuranceClaimStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!updateData.claimStatus) {
      throw new AppError('Claim status is required', 400);
    }
    
    const claim = await insuranceService.updateInsuranceClaimStatus(
      id,
      updateData,
      req.user._id
    );
    
    res.status(200).json({
      status: 'success',
      data: claim,
    });
  }
);
